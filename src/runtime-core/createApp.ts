import { createVNode } from './vnode'
import { render } from './renderer'
export const createApp = rootComponent => {
  return {
    mount(rootContainer) {
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}
