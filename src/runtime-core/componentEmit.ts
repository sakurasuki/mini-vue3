import { camelize, toHandlerKey } from '../shared/index'

/**
 *
 * @param instance
 * @param event
 * @param args
 */
export const emit = (instance, event, ...args) => {
  console.log('emit', event)
  const { props } = instance
  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler?.(...args)
}
