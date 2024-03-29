import { computed } from '../computed'
import { reactive } from '../reactive'
describe('computed', () => {
  it('happy path', () => {
    const user = reactive({ age: 1 })
    const age = computed(() => user.age)
    expect(age.value).toBe(1)
  })
  it('should compute lazily', () => {
    const value = reactive({ foo: 1 })
    const getter = jest.fn(() => value.foo)
    const cValue = computed(getter)
    /**不调用计算属性的时候不会执行 */
    expect(getter).not.toHaveBeenCalled()
    /**调用计算属性执行一次 */
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)
    /**再次读取计算属性值执行一次 */
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
