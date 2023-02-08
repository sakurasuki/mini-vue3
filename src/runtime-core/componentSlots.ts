import { ShapeFlags } from '../shared/ShapeFlags'

export const initSlots = (instance, children) => {
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

const normalizeObjectSlots = (children, slots) => {
  for (const key in children) {
    const val = children[key]
    slots[key] = props => normalizeSlotValue(val(props))
  }
}
const normalizeSlotValue = val => (Array.isArray(val) ? val : [val])
