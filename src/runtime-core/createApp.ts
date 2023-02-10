import { createVNode } from './vnode'
export const createAppApi = render => {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }
  }
}
