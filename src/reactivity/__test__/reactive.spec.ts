import { reactive, isReactive, isProxy, readonly } from '../reactive'
describe('reactive', () => {
  it('haapy path', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
  })
  test('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
  it('isProxy', () => {
    const user = { age: 18, name: '秋簌' }
    const reactiveObj = reactive(user)
    const readonlyObj = readonly(user)
    expect(isProxy(reactiveObj)).toBe(true)
    expect(isProxy(readonlyObj)).toBe(true)
    expect(isProxy(user)).toBe(false)
  })
})
