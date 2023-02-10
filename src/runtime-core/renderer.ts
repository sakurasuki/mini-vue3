import { createComponentInstance } from './component'
import { setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
import { createAppApi } from './createApp'
import { effect } from '../reactivity/effect'
export const createRenderer = options => {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options
  const render = (vnode, container) => {
    patch(null, vnode, container, null)
  }

  /**
   *
   * @param n1 旧的虚拟节点
   * @param n2 新的虚拟节点
   * @param container 容器
   */
  const patch = (n1, n2, container, parentComponent) => {
    const { shapeFlag, type } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  const processText = (n1, n2, container) => {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }
  const processFragment = (n1, n2, container, parentComponent) => {
    mountChildren(n2, container, parentComponent)
  }
  /**
   * 处理节点
   * @param vnode  虚拟节点
   * @param container 容器
   */
  const processElement = (n1, n2, container, parentComponent) => {
    /**区分初始化/更新节点 */
    if (!n1) mountElement(n2, container, parentComponent)
    else patchElement(n1, n2, container)
  }
  /**
   *
   * @param n1 旧节点
   * @param n2 新节点
   * @param container  容器
   */
  const patchElement = (n1, n2, container) => {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
  }
  const EMPTY_OBJ = {}
  /**
   *
   * @param oldProp
   * @param newProp
   */
  const patchProps = (el, oldProp, newProp) => {
    if (oldProp !== newProp) {
      for (const key in newProp) {
        const prevProp = oldProp[key]
        const nextProp = newProp[key]
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      if (oldProp !== EMPTY_OBJ) {
        for (const key in oldProp) {
          if (!(key in newProp)) hostPatchProp(el, key, oldProp[key], null)
        }
      }
    }
  }
  /**
   * 生成el
   * @param vnode 虚拟节点
   * @param container 容器
   */
  const mountElement = (vnode, container, parentComponent) => {
    const { type, children, props, shapeFlag } = vnode
    /**存储组件根元素到虚拟节点上 */
    const el = (vnode.el = hostCreateElement(type))
    if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
      mountChildren(vnode, el, parentComponent)
    }
    for (const key in props) {
      const val = props[key]

      hostPatchProp(el, key, null, val)
    }
    // container.append(el)
    hostInsert(el, container)
  }
  const mountChildren = (vnode, container, parentComponent) => {
    vnode.children.forEach(v => patch(null, v, container, parentComponent))
  }
  /**
   *处理组件
   * @param vnode 虚拟节点
   * @param container 容器
   */
  const processComponent = (n1, n2, container, parentComponent) => {
    mountComponent(n2, container, parentComponent)
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
    effect(() => {
      if (!instance.isMonted) {
        console.log('init')
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        initinalVNode.el = subTree.el
        instance.isMonted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        console.log('current:', subTree)
        console.log('prev:', prevSubTree)
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppApi(render)
  }
}
