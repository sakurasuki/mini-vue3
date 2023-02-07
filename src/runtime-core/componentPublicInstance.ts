import { hasOwn } from '../shared/index'
const publicProperiesMap = {
  $el: i => i.vnode.el
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (key in setupState) {
      return setupState[key]
    }
    if (hasOwn(setupState, key)) return setupState[key]
    else if (hasOwn(props, key)) return props[key]
    /** 组件原型上的一些方法实现*/
    const publicGetter = publicProperiesMap[key]
    return publicGetter?.(instance)
  }
}
