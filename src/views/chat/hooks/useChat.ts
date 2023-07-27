import { ref, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/modules/settings'
import { useChatStore } from '@/stores/modules/chat/index'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'
import { transformSSEMessage } from '@/utils/transform'
import { scrollToBottom } from '@/utils/operationElement'
import { Message } from '@vicons/tabler'
import { useMessage } from 'naive-ui'

// import { ChatGPTAPI } from 'chatgpt'
// import { Configuration, OpenAIApi } from 'openai';

const settingsStore = useSettingsStore()
const chatStore = useChatStore()
const { role_collection, currentRole } = storeToRefs(chatStore)
const message = useMessage()

// let openai = null

// FIXME: 状态管理，需要重新设计
const requesting = ref<boolean>(false)
const msgStatus = ref<string>('requesting')
// 提示语
const greetingsText = '任何问题都可以问我，我会尽力回答的。'
const waitText = '正在绞尽脑汁...'
// 用户问题
const questionText = ref<string>('')

// 监听前缀指令变化
watch(
  () => settingsStore.getConfigAttr('role_directive'),
  (value) => {
    // FIXME: 指令更新逻辑待重构
    // console.log('updateRoleDirective', value)
    // if (requestMessageList?.[0]) {
    //   requestMessageList[0].content = value
    // }
  }
)

export function useChat() {
  /**
   * 初始化消息
   */
  const initMessage = () => {
    questionText.value = ''
    // FIXME: 是否初始化消息的逻辑待优化
    if (!chatStore.getCurrentForAttr(currentRole.value, 'title')) {
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
      greetingsText,
      settingsStore.getConfigAttr('role_nick')
    )
    const requestMessageList = setRequestMessage(
      'user',
      settingsStore.getConfigAttr('role_directive')
    )

    chatStore.setCurrentForRole(currentRole.value, {
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
    const messageList = chatStore.getCurrentForAttr(currentRole.value, 'message_list')
    const currentUuid = chatStore.getCurrentForRole(currentRole.value).uuid
    const historyList = chatStore.getHistoryList(currentRole.value)
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
      chatStore.setCurrentForAttr(currentRole.value, 'title', messageList[1].content)

      chatStore.setCurrentToHistory(currentRole.value)
    } else {
      chatStore.setHistoryForAttr(
        currentRole.value,
        historyIndex,
        'date',
        new Date().toLocaleString()
      )
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
      message.warning('请输入内容或合法内容')
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
        messages: chatStore.getCurrentForAttr(currentRole.value, 'request_message_list'),
        model: settingsStore.getConfigAttr('model') || 'gpt-3.5-turbo',
        temperature: 0.5,
        max_tokens: 1000,
        stream: true
      })
    }

    // openai.createChatCompletion(requestOptions.body)
    fetch(settingsStore.getConfigAttr('api_url'), requestOptions)
      .then((response: Response) => {
        // FIXME: 当前消息赋值类型待优化
        const currentMessage = chatStore
          .getCurrentForAttr(currentRole.value, 'message_list')
          .at(-1) || {
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
      time: new Date().toLocaleString()
    }
  }

  /**
   * 发送消息前的处理
   */
  const hookBeforeSendMessage = () => {
    const userMessage = setChatMessage(
      'user',
      questionText.value,
      settingsStore.getConfigAttr('user_nick')
    )
    // FIXME: 消息传输状态待优化
    const waitMessage: Message = setChatMessage(
      'assistant',
      waitText,
      settingsStore.getConfigAttr('role_nick')
    )
    const questionMessage: Message = setRequestMessage('user', questionText.value)

    chatStore.setCurrentForAttr(currentRole.value, 'message_list', [userMessage, waitMessage])
    chatStore.setCurrentForAttr(currentRole.value, 'request_message_list', [questionMessage])
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
      chatStore.setCurrentForAttr(currentRole.value, 'request_message_list', [message])
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
