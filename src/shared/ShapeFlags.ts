/**
 * 使用位运算符来标记类型
 */
export const enum ShapeFlags {
  ELEMENT = 1, //0001->1
  STATEFUL_COMPONENT = 1 << 1, //0010->2
  TEXT_CHILREN = 1 << 2, //0100->4
  ARRAY_CHILREN = 1 << 3, //1000->8
  SLOT_CHILDREN = 1 << 4
}
