import { createComponentInstance } from './component'
import { setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
export const render = (vnode, container) => {
  patch(vnode, container)
}

/**
 *
 * @param vnode 虚拟节点
 * @param container 容器
 */
const patch = (vnode, container) => {
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) processElement(vnode, container)
  else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) processComponent(vnode, container)
}
/**
 * 处理组件
 * @param vnode  虚拟节点
 * @param container 容器
 */
const processElement = (vnode, container) => {
  mountElement(vnode, container)
}
/**
 * 生成el
 * @param vnode 虚拟节点
 * @param container 容器
 */
const mountElement = (vnode, container) => {
  const { type, children, props, shapeFlag } = vnode
  /**存储组件根元素到虚拟节点上 */
  const el = (vnode.el = document.createElement(type))
  if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
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
 * @param vnode 虚拟节点
 * @param container 容器
 */
const processComponent = (vnode, container) => {
  mountComponent(vnode, container)
}

/**
 * 生成组件
 * @param initinalVNode 虚拟节点
 * @param container 容器
 */
const mountComponent = (initinalVNode, container) => {
  const instance = createComponentInstance(initinalVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initinalVNode, container)
}

const setupRenderEffect = (instance, initinalVNode, container) => {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initinalVNode.el = subTree.el
}
