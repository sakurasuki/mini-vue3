import { h, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  name: 'Foo',
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    console.log('Foo:', instance)
  },
  render() {
    const btn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'emitAdd'
    )
    const foo = h('p', {}, 'Foo')
    return h('div', {}, [btn, foo])
  }
}
