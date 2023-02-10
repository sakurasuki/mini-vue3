import { h, ref } from '../../lib/guide-mini-vue.esm.js'
export const App = {
  name: 'App',
  setup() {
    const count = ref(0)
    const onClick = () => count.value++
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo'
    }
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }
    return { props, count, onClick, onChangePropsDemo1, onChangePropsDemo2, onChangePropsDemo3 }
  },
  render() {
    return h('div', { foo: this.props.foo, bar: this.props.bar }, [
      ('div', {}, 'count:' + this.count),
      h('button', { onClick: this.onClick }, 'click'),
      h('button', { onClick: this.onChangePropsDemo1 }, 'Props-修改'),
      h('button', { onClick: this.onChangePropsDemo2 }, 'Props-删除'),
      h('button', { onClick: this.onChangePropsDemo3 }, 'Props-111')
    ])
  }
}
