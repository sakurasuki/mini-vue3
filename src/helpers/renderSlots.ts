import { createVNode } from '../runtime-core/vnode'
import { Fragment } from '../runtime-core/vnode'
export const renderSlots = (slots, name, props) => {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
