import { h, getCurrentInstance, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
  name: 'App',
  render() {
    return h('div', {}, [h(Foo), createTextVNode('App')])
  },
  setup() {
    const instance = getCurrentInstance()
    console.log('App:', instance)
  }
}
