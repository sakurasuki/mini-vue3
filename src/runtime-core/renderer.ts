import { isObject } from '../shared/index'
import { createComponentInstance } from './component'
import { setupComponent } from './component'
export const render = (vnode, container) => {
  patch(vnode, container)
}

/**
 *
 * @param vnode
 * @param container
 */
const patch = (vnode, container) => {
  /**
   * 判断type 是组件/el
   */
  if (isObject(vnode.type)) processComponent(vnode, container)
  else processElement(vnode, container)
}
/**处理el */
const processElement = (vnode, container) => {
  mountElement(vnode, container)
}
/**生成el */
const mountElement = (vnode, container) => {
  const { type, children, props } = vnode
  const el = (vnode.el = document.createElement(type))
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.append(el)
}
const mountChildren = (vnode, container) => {
  vnode.children.forEach(v => patch(v, container))
}
/**
 *处理组件
 * @param vnode
 * @param container
 */
const processComponent = (vnode, container) => {
  mountComponent(vnode, container)
}

/**
 * 生成组件
 * @param vnode
 */
const mountComponent = (vnode, container) => {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

const setupRenderEffect = (instance, vnode, container) => {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  vnode.el = subTree.el
}
