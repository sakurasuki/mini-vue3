import { hasOwn } from '../shared/index'
/** 组件原型上的一些方法实现*/
const publicProperiesMap = {
  $el: instance => instance.vnode.el,
  $slots: instance => instance.slots
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (key in setupState) {
      return setupState[key]
    }
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }
    const publicGetter = publicProperiesMap[key]
    return publicGetter?.(instance)
  }
}
