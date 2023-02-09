import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initProps } from './componentProps'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'
export const createComponentInstance = (vnode, parent) => {
  console.log('createComponentInstance', parent)

  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
    provides: parent ? parent.provides : {},
    parent,
    slots: {}
  }
  component.emit = emit.bind(null, component) as any
  return component
}

/**初始化组件 */
export const setupComponent = instance => {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStateFulComponent(instance)
}

/**初始化状态组件 */
const setupStateFulComponent = instance => {
  const Component = instance.type
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    /**使用shallowReadonly让props变成不可修改 */
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
    currentInstance = null
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
let currentInstance = null
/**获取组件实例对象 */
export const getCurrentInstance = () => currentInstance

export const setCurrentInstance = instance => {
  currentInstance = instance
}
