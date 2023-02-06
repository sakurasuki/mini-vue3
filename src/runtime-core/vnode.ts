import { ShapeFlags } from '../shared/ShapeFlags'
export const createVNode = (type, props?, children?) => {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type)
  }
  debugger
  if (typeof children === 'string') vnode.shapeFlag |= ShapeFlags.TEXT_CHILREN
  else if (Array.isArray(children)) vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN
  return vnode
}

const getShapeFlag = type => {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
