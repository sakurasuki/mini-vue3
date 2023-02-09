import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'
export const App = {
  name: 'App',
  render() {
    return h('div', {}, [h(Consumer)])
  },
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')
    return { foo }
  },
  render() {
    return h('div', {}, [h('p', {}, `Consumer-${this.foo}`), h(Child)])
  }
}

const Child = {
  name: 'Child',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'bazDefault')
    return { foo, bar, baz }
  },
  render() {
    return h('div', {}, `Child:-${this.foo}-${this.bar}-${this.baz}`)
  }
}
