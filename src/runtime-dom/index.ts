import { createRenderer } from '../runtime-core'
/**
 * 创建元素节点
 * @param type
 * @returns
 */
const createElement = type => {
  return document.createElement(type)
}

/**
 * 处理元素属性
 * @param el
 * @param key
 * @param val
 */
const patchProp = (el, key, val) => {
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, val)
  } else el.setAttribute(key, val)
}
/**
 * 插入元素节点
 * @param el
 * @param container
 */
const insert = (el, container) => {
  container.append(el)
}
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export const createApp = (...args) => renderer.createApp(...args)

export * from '../runtime-core'
