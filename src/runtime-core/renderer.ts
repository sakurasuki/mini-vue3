import { createComponentInstance } from './component'
import { setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
export const render = (vnode, container) => {
  //TODO undefined
  patch(vnode, container, null)
}

/**
 *
 * @param vnode 虚拟节点
 * @param container 容器
 */
const patch = (vnode, container, parentComponent) => {
  const { shapeFlag, type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
      break
  }
}

const processText = (vnode, container) => {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}
const processFragment = (vnode, container, parentComponent) => {
  mountChildren(vnode, container, parentComponent)
}
/**
 * 处理组件
 * @param vnode  虚拟节点
 * @param container 容器
 */
const processElement = (vnode, container, parentComponent) => {
  mountElement(vnode, container, parentComponent)
}
/**
 * 生成el
 * @param vnode 虚拟节点
 * @param container 容器
 */
const mountElement = (vnode, container, parentComponent) => {
  const { type, children, props, shapeFlag } = vnode
  /**存储组件根元素到虚拟节点上 */
  const el = (vnode.el = document.createElement(type))
  if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
    mountChildren(vnode, el, parentComponent)
  }
  for (const key in props) {
    const val = props[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else el.setAttribute(key, val)
  }

  container.append(el)
}
const mountChildren = (vnode, container, parentComponent) => {
  vnode.children.forEach(v => patch(v, container, parentComponent))
}
/**
 *处理组件
 * @param vnode 虚拟节点
 * @param container 容器
 */
const processComponent = (vnode, container, parentComponent) => {
  mountComponent(vnode, container, parentComponent)
}

/**
 * 生成组件
 * @param initinalVNode 虚拟节点
 * @param container 容器
 */
const mountComponent = (initinalVNode, container, parentComponent) => {
  const instance = createComponentInstance(initinalVNode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initinalVNode, container)
}

const setupRenderEffect = (instance, initinalVNode, container) => {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container, instance)
  initinalVNode.el = subTree.el
}
