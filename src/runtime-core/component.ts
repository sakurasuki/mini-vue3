import { PublicInstanceProxyHandlers } from './componentPublicInstance'
export const createComponentInstance = vnode => {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }
  return component
}

/**初始化组件 */
export const setupComponent = instance => {
  //TODO
  // initProps()
  // initSlots();
  setupStateFulComponent(instance)
}

/**初始化状态组件 */
const setupStateFulComponent = instance => {
  const Component = instance.type
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  const { setup } = Component
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}
/**
 *  处理setup结果
 * @param  setupResult
 
 */
const handleSetupResult = (instance, setupResult) => {
  /**
   * * setupResult = function 代表是个组件
   * setupResult = object 直接注入到上下文
   */
  //TODO typeof function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

/**完成组件初始化 */
const finishComponentSetup = instance => {
  const Component = instance.type
  instance.render = Component.render
}
