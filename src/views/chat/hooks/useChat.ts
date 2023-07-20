import { ref, nextTick, watch } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'
import { transformSSEMessage } from '@/utils/transform'
import { scrollToBottom } from '@/utils/operationElement'

// import { ChatGPTAPI } from 'chatgpt'
// import { Configuration, OpenAIApi } from 'openai';

export function useChat() {
  const settingsStore = useSettingsStore()
  // let openai = null

  // FIXME: 状态管理，需要重新设计
  const requesting = ref<boolean>(false)
  const msgStatus = ref<string>('requesting')

  const greetingsText = '任何问题都可以问我，我会尽力回答的。'
  const waitText = '正在绞尽脑汁...'
  // 用户输入的消息
  const questionText = ref<string>('')
  // 请求消息
  let requestMessageList: RequestMessage[] = []
  // 客户端消息
  const messageList = ref<Message[]>([])

  // 监听前缀指令变化
  watch(
    () => settingsStore.getConfigAttr('role_directive'),
    (value) => {
      console.log('updateRoleDirective', value)
      // 更新角色指令
      if (requestMessageList?.[0]) {
        requestMessageList[0].content = value
      }
    }
  )

  /**
   * 初始化消息
   */
  const initMessage = () => {
    questionText.value = ''
    messageList.value = [
      setChatMessage('assistant', greetingsText, settingsStore.getConfigAttr('role_nick'))
    ]
    requestMessageList = [setRequestMessage('user', settingsStore.getConfigAttr('role_directive'))]

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
    // TODO: 需要添加节流控制
    // 若用户未输入内容（包括换行和空格），则不发送请求
    if (!questionText.value.trim()) {
      console.log('请输入内容或合法内容')
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
        messages: requestMessageList,
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
        const currentMessage: Message = messageList.value.at(-1) || {
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
    return { role, content }
  }
  /**
   * 设置聊天消息
   * @param role 角色
   * @param content 内容
   * @param name 昵称
   * @returns Message 消息
   */
  const setChatMessage = (role: string, content: string, name: string): Message => {
    return { role, content, name, time: new Date().toLocaleString() }
  }

  /**
   * 发送消息前的处理
   */
  const hookBeforeSendMessage = () => {
    const userMessage: Message = setChatMessage(
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

    messageList.value.push(userMessage, waitMessage)
    requestMessageList.push(questionMessage)
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
      requestMessageList.push(message)
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
    sendMessage,
    questionText,
    messageList,
    requesting,
    msgStatus
  }
}
