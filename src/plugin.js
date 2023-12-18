import MagicString from "magic-string"
import fs from "fs"

const virtualSceneFiles = new Map()

/**
 * @returns {import('vite').Plugin}
 */
export default function () {
  /**
   * @type {import('vite').ResolvedConfig}
   */
  let config

  return {
    name: "excalibur-hmr",
    configResolved(_config) {
      config = _config
    },
    resolveId(id) {
      if (config.mode === "production") return
      if (isVirtualScene(id)) {
        virtualSceneFiles.set(
          id,
          fs.readFileSync(getVirtualSceneFilepath(id), "utf-8")
        )
        return id
      }
    },
    load(id) {
      if (config.mode === "production") return

      if (isSceneFilepath(id)) {
        // return actual scene
        if (isVirtualScene(id)) {
          return virtualSceneFiles.get(id)
        }
        // return proxy scene
        else {
          // prepend .__virtual to the file extension
          const filePath = getSceneImportPath(id)

          return /* js */ `\
            import { hmrData } from 'vite-plugin-excalibur-hmr' 
            import { default as Scene } from "${filePath}"

            export const __hot_id = ${JSON.stringify(id)}
            
            class ProxyScene extends Scene {
              static __hot_id = ${JSON.stringify(id)}

              constructor(...args) {
                super(...args)
                this.__hot_constructorArgs = args
              }
            }
            
            export default ProxyScene
            export * from "${filePath}"
            
            if (import.meta.hot) {            
              import.meta.hot.accept((mod) => {
                const engine = hmrData.engine
                const [name, ...goToSceneArgs] = hmrData.lastGoToScene
                const sceneInstance = engine.scenes[name]
                const currentScene = engine.currentScene
                
                if (mod) {
                  if (!mod.default) {
                    import.meta.hot.invalidate('[excalibur-hmr] Scene must be the default export to support hot reload')
                    return
                  }
                  
                  try {
                    for (const [name, instance] of Object.entries(engine.scenes)) {
                      if (instance.constructor.__hot_id === mod.__hot_id) {                          
                        engine.removeScene(name)
                        
                        const args = hmrData.sceneConstructorArgs[name] ?? []              
                        const newSceneInstance = new mod.default(...args)          
                        engine.addScene(name, newSceneInstance) 
                      }
                    }
                    
                    const shouldReloadCurrentScene = currentScene?.constructor.__hot_id === mod.__hot_id                  
                    if (shouldReloadCurrentScene) {
                      engine.goToScene(name, ...goToSceneArgs)
                    }
                  } catch (error) {
                    import.meta.hot.invalidate('[excalibur-hmr] Encountered error while hot reloading, doing full reload\\n' + error)
                    return
                  }
                }
              })
            }
            `
        }
      }
    },
    handleHotUpdate(ctx) {
      // reload the virtual scene file with the proxy scene
      if (isSceneFilepath(ctx.file) && !isVirtualScene(ctx.file)) {
        const modules = [
          ...ctx.modules,
          ctx.server.moduleGraph.getModuleById(getSceneImportPath(ctx.file)),
        ]
        return modules
      }
    },
  }
}

const isSceneFilepath = (id) => {
  return (
    (id.includes("/scene") || id.includes(".scene")) && id.match(/\.(t|j)s$/)
  )
}

function isVirtualScene(id) {
  return id.includes(".__virtual__")
}

function getSceneImportPath(id) {
  return (
    id.split(".").slice(0, -1).join(".") +
    ".__virtual__." +
    id.split(".").slice(-1)
  )
}

function getVirtualSceneFilepath(id) {
  return id.replace(".__virtual__", "")
}
