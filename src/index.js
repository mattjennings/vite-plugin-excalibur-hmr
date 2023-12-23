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

      // move real scene file to virtual scene
      // so we can replace it with a proxy scene
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
        // return actual scene (as a virtual file)
        if (isVirtualScene(id)) {
          return virtualSceneFiles.get(id)
        }
        // return proxy scene
        else {
          // get import path to scene
          const filePath = getVirtualSceneImportPath(id)

          return /* js */ `\
            import { hmrData } from 'vite-plugin-excalibur-hmr/hot' 
            import { default as Scene } from "${filePath}"
            
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
                if (!hmrData.engine) {
                  import.meta.hot.invalidate('[excalibur-hmr] Hot reload is not enabled. Did you forget to call hot() on the engine?')
                  return
                }

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
                      if (instance.constructor.__hot_id && instance.constructor.__hot_id === mod.default.__hot_id) {                          
                        engine.removeScene(name)
                        
                        const args = hmrData.sceneConstructorArgs[name] ?? []              
                        const newSceneInstance = new mod.default(...args)          
                        engine.addScene(name, newSceneInstance)                         
                      }
                    }
                    
                    const shouldReloadCurrentScene = currentScene?.constructor.__hot_id === mod.default.__hot_id                    
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
          ctx.server.moduleGraph.getModuleById(
            getVirtualSceneImportPath(ctx.file)
          ),
        ]
        return modules
      }
    },
  }
}

const isSceneFilepath = (id) => {
  return (
    (id.includes("/scenes") || id.includes(".scene")) && id.match(/\.(t|j)s$/)
  )
}

function isVirtualScene(id) {
  return id.includes(".__virtual__")
}

function getVirtualSceneImportPath(id) {
  return (
    id.split(".").slice(0, -1).join(".") +
    ".__virtual__." +
    id.split(".").slice(-1)
  )
}

function getVirtualSceneFilepath(id) {
  return id.replace(".__virtual__", "")
}
