/**
 * @description 消息文本内容类型
 * @param {T} string 内容
 */
type Content<T = string> = T

/**
 * @description 请求消息
 * @param {role} string 角色
 * @param {content} Content<string> 内容
 */
interface RequestMessage {
  role: string
  content: Content<string>
}

/**
 * @description 响应消息
 * @param {role} string 角色
 * @param {name} string 昵称
 * @param {content} Content<string> 内容
 * @param {time} string 时间
 */
interface Message {
  role: string
  name?: string
  content: Content<string>
  time?: string
}
