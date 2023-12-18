/**
 *
 * @param {import('excalibur').Engine} engine
 */
export function hot(engine) {
  if (typeof window === "undefined") return

  interceptFn(engine, "addScene", (name, instance) => {
    hmrData.sceneConstructorArgs[name] = instance.__hot_constructorArgs
  })

  interceptFn(engine, "goToScene", (...args) => {
    hmrData.lastGoToScene = args
  })

  hmrData.engine = engine
}

export let hmrData = {
  engine: null,
  lastGoToScene: null,
  sceneConstructorArgs: {},
}

function interceptFn(context, name, interceptor) {
  const original = context[name].bind(context)

  context[name] = function (...args) {
    interceptor.call(context, ...args)
    return original(...args)
  }
}
