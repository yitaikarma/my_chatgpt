import { useConfig } from '@/hooks/chat/useGlobalConfig'
import { useRoleConfig } from '@/hooks/chat/useRoleConfig'
import { useSession } from '@/hooks/chat/useSession'
import { transformSSEMessage } from '@/utils/transform'
import { scrollToBottom } from '@/utils/operationElement'
import { throttle } from '@/utils/functions/throttle'

const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const { sessionStore, sessionTemplate } = useSession()
// 终止 SSE 连接
// const abortController = new AbortController()

export function useChat() {
  // 初始化聊天状态
  const initChatStatus = () => {
    sessionStore.setQuestionText('')
    sessionStore.setRequesting(false)
  }

  // 创建请求参数
  const createRequestParams = () => {
    // TODO: 请求消息数量限制功能待完善
    const requestMessageLength = roleConfigStore.getRoleConfigAttr('request_message_length')
    const temperature = roleConfigStore.getRoleConfigAttr('temperature')
    const maxTokens = roleConfigStore.getRoleConfigAttr('max_tokens')
    const stream = roleConfigStore.getRoleConfigAttr('stream')

    const historyList = sessionStore
      .getCurrentSessionAttr('request_message_list')
      .slice(0, requestMessageLength)

    const messages = [sessionTemplate().promptMessage, ...historyList]

    const requestOptions = {
      method: 'POST',
      // signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${globalConfigStore.getConfigAttr('api_key')}`
      },
      body: JSON.stringify({
        messages: messages,
        model: roleConfigStore.getRoleConfigAttr('model') || 'gpt-3.5-turbo',
        temperature: temperature,
        max_tokens: maxTokens,
        stream: stream
      })
    }

    return requestOptions
  }

  /**
   * 发送消息
   * @param requestConfig 请求配置
   */
  const sendMessage = () => {
    sessionStore.setRequesting(true)

    beforeSendMessage()

    fetch(globalConfigStore.getConfigAttr('api_url'), createRequestParams())
      .then((response: Response) => {
        afterSendMessage('successful', response)
      })
      .catch((error) => {
        afterSendMessage('failed', error)
      })
  }

  /**
   * 终止消息请求
   */
  const abortMessage = () => {
    // FIXME: 无法终止非stream模式的请求
    sessionStore.setRequesting(false)
    sessionStore.deleteCurrentMessage(-1)

    // abortController.abort()
    // abortController.signal.addEventListener('abort', () => {
    //   sessionStore.setRequesting(false)
    //   sessionStore.deleteCurrentMessage(-1)
    // })
  }

  /**
   * 发送消息前的处理
   */
  const beforeSendMessage = () => {
    const userMessage = sessionTemplate().userMessage
    const waitMessage = sessionTemplate().waitMessage
    const questionMessage = sessionTemplate().questionMessage

    sessionStore.updateCurrentSessionAttr('message_list', [userMessage, waitMessage])
    sessionStore.updateCurrentSessionAttr('request_message_list', [questionMessage])
    sessionStore.setQuestionText('')

    // 若当前会话是历史会话，并且已从历史列表移除，则更新为非历史会话
    const isHistory = sessionStore.getCurrentSession.is_history
    const isHistoryExist = sessionStore.getHistoryList().some((history) => {
      return history.uuid === sessionStore.getCurrentSession.uuid
    })
    if (isHistory && !isHistoryExist) {
      sessionStore.updateCurrentSessionAttr('is_history', false)
    }

    nextTick(() => {
      scrollToBottom('message_list')
    })
  }

  /**
   * 发送消息后的处理
   * @param status 请求状态
   * @param response 响应
   */
  const afterSendMessage = (status: string, response: Response | any) => {
    // FIXME: 当前消息赋值类型待优化
    const currentMessage = sessionStore.getCurrentSessionAttr('message_list').at(-1) || {
      role: 'assistant',
      content: ''
    }

    if (status === 'successful') {
      // console.log('successful', response)

      // 处理响应错误
      if (!response.ok) {
        response.text().then((text: string) => {
          currentMessage.content = `\`\`\`json\n${text}\n\`\`\``
          sessionStore.setRequesting(false)
          nextTick(() => {
            scrollToBottom('message_list')
          })
          console.log('done')
        })
        return
      }

      // 处理响应成功
      if (response.body) {
        // 生成新的消息时，清空当前消息
        currentMessage.content = ''

        // 处理非流式响应
        if (!roleConfigStore.getRoleConfigAttr('stream')) {
          response.text().then((text: string) => {
            currentMessage.content = JSON.parse(text).choices[0].message.content
            const message = { role: 'assistant', content: currentMessage.content }
            sessionStore.updateCurrentSessionAttr('request_message_list', [message])
            sessionStore.setRequesting(false)

            nextTick(() => {
              scrollToBottom('message_list')
            })
            console.log('done')
          })
          return
        }

        const throttleScrollBottom = throttle(() => {
          scrollToBottom('message_list', false)
        }, 50)

        transformSSEMessage(response.body, (done, streamDataList, abort) => {
          // 处理stream结束
          if (done && sessionStore.getRequesting) {
            const message = { role: 'assistant', content: currentMessage.content }
            sessionStore.updateCurrentSessionAttr('request_message_list', [message])
            sessionStore.setRequesting(false)
            console.log('done')
            return
          }

          // 终止stream
          if (!sessionStore.getRequesting) {
            abort && abort()
            return
          }

          for (let i = 0; i < streamDataList.length; i++) {
            const messageTextObj = streamDataList[i]
            if (messageTextObj?.choices) {
              const choice = messageTextObj.choices?.[0]
              const content: string = choice?.delta?.content
              if (content) {
                currentMessage.content += content
                nextTick(() => {
                  throttleScrollBottom()
                })
              }
            }
          }
        })
      }
    } else {
      // 处理请求错误
      // console.log('error', response)
      currentMessage.content = `\`\`\`text\n${response}\n\`\`\``
      sessionStore.setRequesting(false)
      nextTick(() => {
        scrollToBottom('message_list')
      })
      console.log('done')
    }
  }

  return { initChatStatus, sendMessage, abortMessage }
}
