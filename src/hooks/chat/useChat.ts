import { ref, nextTick, watch } from 'vue'
import { useConfig } from '@/hooks/chat/useGlobalConfig'
import { useRoleConfig } from '@/hooks/chat/useRoleConfig'
import { useSession } from '@/hooks/chat/useSession'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'
import { transformSSEMessage } from '@/utils/transform'
import { scrollToBottom } from '@/utils/operationElement'
import { Message } from '@vicons/tabler'
import { throttle } from '@/utils/functions/throttle'

// import { ChatGPTAPI } from 'chatgpt'
// import { Configuration, OpenAIApi } from 'openai';

const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const { sessionStore, initSession } = useSession()

// let openai = null

// FIXME: 状态管理，需要重新设计
const requesting = ref<boolean>(false)
const msgStatus = ref<string>('requesting')
// 用户问题
const questionText = ref<string>('')

// FIXME: 指令更新逻辑待重构, 改为统一管理状态后，更加需要重构。
// 思路是：从请求聊天数据里分离出指令，每次请求都从同一配置里获取指令，否则指令更新后，需要需要处理所有的历史消息。

// 监听前缀指令变化
// watch(
//   // () => globalConfigStore.getConfigAttr('role_directive'),
//   () => userSettingsStore.getConfig('a', 'role_directive'),
//   (value) => {
//     // console.log('updateRoleDirective', value)
//     // if (requestMessageList?.[0]) {
//     //   requestMessageList[0].content = value
//     // }
//   }
// )

export function useChat() {
  /**
   * 初始化聊天状态
   */
  const initChatStatus = () => {
    questionText.value = ''
    requesting.value = false
  }

  // 创建 Node-GPT
  // function createGPT() {

  //   const configuration = new Configuration({
  //     apiKey
  //   });

  //   openai = new OpenAIApi(configuration);

  //   // async function getCompletionFromOpenAI() {
  //   //   const completion = await openai.createChatCompletion({
  //   //     model: 'gpt-3.5-turbo',
  //   //     messages: [
  //   //       { role: 'user', content: 'Hello!' }
  //   //     ],
  //   //     temperature: 0,
  //   //   });

  //   //   console.log(completion.data.choices[0].message.content);
  //   // }

  //   // getCompletionFromOpenAI();
  // }

  /**
   * 发送消息
   * @param requestConfig 请求配置
   */
  const sendMessage = () => {
    requesting.value = true

    beforeSendMessage()

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${globalConfigStore.getConfigAttr('api_key')}`
      },
      body: JSON.stringify({
        messages: sessionStore.getCurrentSessionAttr('request_message_list'),
        model: roleConfigStore.getRoleConfigAttr('model') || 'gpt-3.5-turbo',
        temperature: 0.5,
        max_tokens: 1000,
        stream: true
      })
    }

    // openai.createChatCompletion(requestOptions.body)
    fetch(globalConfigStore.getConfigAttr('api_url'), requestOptions)
      .then((response: Response) => {
        afterSendMessage('successful', response)
      })
      .catch((error) => {
        afterSendMessage('failed', error)
      })
  }

  /**
   * 发送消息前的处理
   */
  const beforeSendMessage = () => {
    // FIXME: 消息传输状态待优化, 用调用模板方法的方式
    const userMessage = {
      uuid: generateUUIDUsingMathRandom(),
      role: 'user',
      content: questionText.value,
      name: roleConfigStore.getRoleConfigAttr('user_nick'),
      date: new Date().toLocaleString()
    }
    const waitMessage = {
      uuid: generateUUIDUsingMathRandom(),
      role: 'assistant',
      content: roleConfigStore.getRoleConfigAttr('wait_text'),
      name: roleConfigStore.getRoleConfigAttr('role_nick'),
      date: new Date().toLocaleString()
    }
    const questionMessage = {
      role: 'user',
      content: questionText.value
    }

    sessionStore.updateCurrentSessionAttr('message_list', [userMessage, waitMessage])
    sessionStore.updateCurrentSessionAttr('request_message_list', [questionMessage])
    questionText.value = ''

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
          requesting.value = false
          console.log('done')
          scrollToBottom('message_list')
        })
        return
      }
      // 处理响应成功
      if (response.body) {
        // 生成新的消息时，清空当前消息
        currentMessage.content = ''

        const throttleScrollBottom = throttle(() => {
          scrollToBottom('message_list', false)
        }, 50)

        transformSSEMessage(response.body, (done, streamDataList) => {
          if (done) {
            const message = { role: 'assistant', content: currentMessage.content }
            sessionStore.updateCurrentSessionAttr('request_message_list', [message])
            requesting.value = false
            console.log('done')
            return
          }

          for (let i = 0; i < streamDataList.length; i++) {
            const messageTextObj = streamDataList[i]
            if (messageTextObj?.choices) {
              const choice = messageTextObj.choices?.[0]
              const content: string = choice?.delta?.content
              if (content) {
                currentMessage.content += content
                throttleScrollBottom()
              }
            }
          }
        })
      }
    } else {
      // 处理请求错误
      // console.log('error', response)
      currentMessage.content = `\`\`\`text\n${response}\n\`\`\``
      requesting.value = false
      console.log('done')
    }
  }

  return {
    initChatStatus,
    sendMessage,
    questionText,
    requesting,
    msgStatus
  }
}
