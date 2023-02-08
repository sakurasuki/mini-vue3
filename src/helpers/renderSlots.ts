import { createVNode } from '../runtime-core/vnode'

export const renderSlots = (slots, name, props) => {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return createVNode('div', {}, slot(props))
    }
  }
}
