import { ref, nextTick, watch } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'
import { useRoleConfig } from '@/hooks/chat/core/useRoleConfig'
import { useSession } from '@/hooks/chat/core/useSession'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'
import { transformSSEMessage } from '@/utils/transform'
import { scrollToBottom } from '@/utils/operationElement'
import { Message } from '@vicons/tabler'

// import { ChatGPTAPI } from 'chatgpt'
// import { Configuration, OpenAIApi } from 'openai';

const settingsStore = useSettingsStore()
const { roleConfigStore } = useRoleConfig()
const { sessionStore } = useSession()

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
//   // () => settingsStore.getConfigAttr('role_directive'),
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
   * 初始化消息
   */
  const initMessage = () => {
    questionText.value = ''
    // FIXME: 是否初始化消息的逻辑待优化
    if (!sessionStore.getCurrentSessionAttr('title')) {
      clearMessage()
    }

    requesting.value = false
  }

  /**
   * 重置消息
   */
  const clearMessage = () => {
    const greetingsMessage = setChatMessage(
      'assistant',
      roleConfigStore.getRoleConfigAttr('greetings_text'),
      roleConfigStore.getRoleConfigAttr('role_nick')
    )
    const requestMessageList = setRequestMessage(
      'user',
      roleConfigStore.getRoleConfigAttr('role_directive')
    )

    sessionStore.updateCurrentRoleSession({
      uuid: generateUUIDUsingMathRandom(),
      title: greetingsMessage.content,
      date: new Date().toLocaleString(),
      message_list: [greetingsMessage],
      request_message_list: [requestMessageList]
    })
  }

  /**
   * 保存消息
   */
  const seveMessage = () => {
    const messageList = sessionStore.getCurrentSessionAttr('message_list')
    const currentUuid = sessionStore.getCurrentSession.uuid
    const historyList = sessionStore.getHistoryList()
    let historyIndex = 0
    const isExist = historyList.some((item, index) => {
      historyIndex = index
      return item.uuid === currentUuid
    })

    // 未进行过对话，不保存
    if (messageList.length < 2) return

    // 保存未记录的对话，否则只更新历史记录
    if (!isExist) {
      // 设置第一个提问消息为标题
      sessionStore.updateCurrentSessionAttr('title', messageList[1].content)

      sessionStore.updateCurrentSessionToHistory()
    } else {
      sessionStore.updateHistoryAttr(historyIndex, 'date', new Date().toLocaleString())
    }
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
    // TODO: 需要添加节流控制
    // 若用户未输入内容（包括换行和空格），则不发送请求
    if (!questionText.value.trim()) {
      console.log('请输入内容或合法内容')
      // message.warning('请输入内容或合法内容')
      return
    }

    requesting.value = true

    hookBeforeSendMessage()

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settingsStore.getConfigAttr('api_key')}`
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
    fetch(settingsStore.getConfigAttr('api_url'), requestOptions)
      .then((response: Response) => {
        // FIXME: 当前消息赋值类型待优化
        const currentMessage = sessionStore.getCurrentSessionAttr('message_list').at(-1) || {
          role: 'assistant',
          content: ''
        }

        transformSSEMessage(response, (done, textDataList) => {
          hookAfterReceiveMessage(done, textDataList, currentMessage)
        })
      })
      .catch((error) => {
        console.error('Error occurred when fetching SSE endpoint', error)
      })
  }

  /**
   * 设置请求消息
   * @param role 角色
   * @param content 内容
   * @returns Message 消息
   */
  const setRequestMessage = (role: string, content: string): Message => {
    return {
      role,
      content
    }
  }

  /**
   * 设置聊天消息
   * @param role 角色
   * @param content 内容
   * @param name 昵称
   * @returns Message 消息
   */
  const setChatMessage = (role: string, content: string, name: string): Message => {
    return {
      role,
      content,
      name,
      date: new Date().toLocaleString()
    }
  }

  /**
   * 发送消息前的处理
   */
  const hookBeforeSendMessage = () => {
    const userMessage = setChatMessage(
      'user',
      questionText.value,
      roleConfigStore.getRoleConfigAttr('user_nick')
    )
    // FIXME: 消息传输状态待优化
    const waitMessage: Message = setChatMessage(
      'assistant',
      roleConfigStore.getRoleConfigAttr('wait_text'),
      roleConfigStore.getRoleConfigAttr('role_nick')
    )
    const questionMessage: Message = setRequestMessage('user', questionText.value)

    sessionStore.updateCurrentSessionAttr('message_list', [userMessage, waitMessage])
    sessionStore.updateCurrentSessionAttr('request_message_list', [questionMessage])
    questionText.value = ''

    nextTick(() => {
      scrollToBottom('message_list')
    })
  }

  /**
   * 接收消息时的处理
   * @param done 是否完成
   * @param textDataList 文本数据列表
   * @param currentMessage 当前消息
   */
  const hookAfterReceiveMessage = (done: boolean, textDataList: any[], currentMessage: Message) => {
    if (done) {
      const message: Message = setRequestMessage('assistant', currentMessage.content)
      sessionStore.updateCurrentSessionAttr('request_message_list', [message])
      // FIXME: 消息传输状态待优化
      msgStatus.value = 'requesting'
      requesting.value = false
      console.log('done')
      return
    }
    // 状态从请求中转为生成中
    if (msgStatus.value === 'requesting') {
      currentMessage.content = ''
      msgStatus.value = 'generating'
    }

    for (let i = 0; i < textDataList.length; i++) {
      const messageTextObj = textDataList[i]
      if (messageTextObj?.choices) {
        const choice = messageTextObj.choices?.[0]
        const content: string = choice?.delta?.content
        if (content) {
          currentMessage.content += content
          scrollToBottom('message_list')
        }
      }
    }
  }

  return {
    setRequestMessage,
    setChatMessage,
    initMessage,
    clearMessage,
    seveMessage,
    sendMessage,
    questionText,
    requesting,
    msgStatus
  }
}
