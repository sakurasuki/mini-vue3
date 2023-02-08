import { ShapeFlags } from '../shared/ShapeFlags'
export const createVNode = (type, props?, children?) => {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  if (typeof children === 'string') vnode.shapeFlag |= ShapeFlags.TEXT_CHILREN
  else if (Array.isArray(children)) vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN

  /**判断slot插槽 */
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vnode
}

const getShapeFlag = type => {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
