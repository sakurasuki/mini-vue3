const publicProperiesMap = {
  $el: i => i.vnode.el
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
    }
    /** 组件原型上的一些方法实现*/
    const publicGetter = publicProperiesMap[key]
    return publicGetter?.(instance)
  }
}
