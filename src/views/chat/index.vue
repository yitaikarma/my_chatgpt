<script setup lang="ts">
import Settings from './conmpoents/settings.vue'
import { ref, toRef, onBeforeMount, onBeforeUnmount, nextTick, watch } from 'vue'
import { useSettings } from './hooks/useSettingsStore'

// import { ChatGPTAPI } from 'chatgpt'
// import { Configuration, OpenAIApi } from 'openai';

import MarkdownIt from 'markdown-it'
import Clipboard from 'clipboard'
import hljs from 'highlight.js'
import 'highlight.js/styles/tokyo-night-dark.css'

const { getSettingsAttr } = useSettings()

const apiURL = toRef(() => getSettingsAttr('api_url'))
const apiKey = toRef(() => getSettingsAttr('api_key'))
const model = toRef(() => getSettingsAttr('model'))
const userNick = toRef(() => getSettingsAttr('user_nick'))
const roleNick = toRef(() => getSettingsAttr('role_nick'))
const roleDirective = toRef(() => getSettingsAttr('role_directive'))
// let openai = null

// FIXME: 状态管理，需要重新设计
const requesting = ref<boolean>(false)
const msgStatus = ref<string>('requesting')

const content = '任何问题都可以问我，我会尽力回答的。'
// 用户输入的消息
const questionMessage = ref<string>('')
// 请求消息
let requestMessageList: RequestMessage[] = []
// 客户端消息
const messageList = ref<Message[]>([])

let md: MarkdownIt | null = null

onBeforeMount(() => {
  initChatSystem()
  initMessage()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEnter)
})

watch(roleDirective, () => {
  updateRoleDirective()
})

// 更新角色指令
function updateRoleDirective() {
  console.log('updateRoleDirective', roleDirective.value)

  if (requestMessageList?.[0]) {
    requestMessageList[0].content = getSettingsAttr('role_directive')
  }
}

/**
 * 设置消息
 * @param role 角色
 * @param content 内容
 * @param name 昵称
 * @returns Message 消息
 */
function setRoleMessage(role: string, content: string, name?: string): Message {
  const message: Message = { role, content }
  if (name) {
    message.name = name
    message.time = new Date().toLocaleString()
  }
  return message
}

// 系统初始化
function initChatSystem() {
  // createGPT()
  createMarkdownIt()
  // 监听enter键
  document.addEventListener('keydown', handleEnter)
}
// 消息初始化
function initMessage() {
  questionMessage.value = ''
  // FIXME: 清空数组可以使用 arr.length = 0
  messageList.value = [setRoleMessage('assistant', content, roleNick.value)]
  requestMessageList = [setRoleMessage('user', roleDirective.value)]

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
// 创建markdown-it实例,并处理代码块
function createMarkdownIt() {
  // 创建 markdown-it 实例
  md = new MarkdownIt({
    highlight: null
  })

  // 处理代码块
  md.renderer.rules.fence = function (...args) {
    // const [tokens, idx, options, env, self] = args;
    const [tokens, idx] = args
    const token = tokens[idx]
    const lang = token.info.trim()

    const buttonId = `copyButton${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

    const clipboard = new Clipboard('.copy-button')

    clipboard.on('success', function (e) {
      // e.trigger.innerText = 'Copied!'
      e.trigger.textContent = 'Copied!'
      setTimeout(() => {
        e.trigger.textContent = 'Copy'
      }, 2000)
    })

    clipboard.on('error', function (e) {
      console.error('Action:', e.action)
      console.error('Trigger:', e.trigger)
    })

    if (lang && hljs.getLanguage(lang)) {
      // console.log(tokens, idx, options, env, self);
      const code = hljs.highlight(lang, token.content).value
      return `<div class="code-block">
                <div class="code-block-info">
                  <span>${lang.toUpperCase()}</span>
                  <button id="${buttonId}" class="copy-button" data-clipboard-text="${
        token.content
      }">Copy</button>
                </div>
                <pre><code class="hljs language-${lang} scroll code_scroll">${code}</code></pre>
              </div>`
    }

    return `<pre><code>${token.content}</code></pre>`
  }

  // 处理行内代码
  md.renderer.rules.code_inline = function (...args) {
    // const [tokens, idx, options, env, self] = args;
    const [tokens, idx] = args
    // console.log(tokens, idx, options, env, self);
    const token = tokens[idx]
    const code = token.content
    return '<code class="code_inline">' + code + '</code>'
    // const highlighted = hljs.highlightAuto(code).value
    // return '<code class="code_inline">' + highlighted + '</code>';
  }
}
// 渲染markdown
function renderMarkdown(text: string) {
  return md && md.render(text)
}
// 发送消息时的处理
function hookBeforeSendMessage() {
  const userMessage: Message = setRoleMessage('user', questionMessage.value, userNick.value)
  const waitMessage: Message = setRoleMessage('assistant', '正在绞尽脑汁...', roleNick.value)
  const questionMsg: Message = setRoleMessage('user', questionMessage.value)

  messageList.value.push(userMessage, waitMessage)
  requestMessageList.push(questionMsg)
  questionMessage.value = ''

  nextTick(() => {
    scrollToBottom('message_list')
  })
}
// 接收消息时的处理
function hookAfterReceiveMessage(done: boolean, messageTextList: any[], currentMessage: Message) {
  if (done) {
    const message: Message = setRoleMessage('assistant', currentMessage.content)
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

  for (let i = 0; i < messageTextList.length; i++) {
    const messageTextObj = messageTextList[i]
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
// 处理SSE流消息
function transformSSEMessage(
  response: Response,
  callback: (done: boolean, messageTextList: any[]) => void
) {
  // FIXME: 健壮性需要优化
  if (!response?.body) return
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  async function readStream() {
    const { done, value } = await reader.read()

    let result = []
    if (!done) {
      const message = decoder.decode(value, { stream: !done })
      // console.log('Stream: ', message);

      // 提取json字符串中的对象字符串
      const jsonList = message.match(/(?<=data: )\{.*\}/g)
      // console.log('jsonList: ', jsonList);
      if (jsonList) {
        for (let i = 0; i < jsonList.length; i++) {
          const json = jsonList[i]
          if (json) {
            try {
              const obj = JSON.parse(json)
              if (obj instanceof Object) {
                result.push(obj)
              }
            } catch (e) {
              console.log(e)
            }
          }
        }
      }

      readStream()
    } else {
      console.log('Stream: DONE')
    }

    callback && callback(done, result)
  }

  readStream()
}
// 发送消息
function sendMessage() {
  // TODO: 需要添加节流控制
  // 若用户未输入内容（包括换行和空格），则不发送请求
  if (!questionMessage.value.trim()) {
    console.log('请输入内容或合法内容')
    return
  }

  requesting.value = true

  hookBeforeSendMessage()

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.value}`
    },
    body: JSON.stringify({
      messages: requestMessageList,
      model: model.value || 'gpt-3.5-turbo',
      temperature: 0.5,
      max_tokens: 1000,
      stream: true
    })
  }

  // openai.createChatCompletion(requestOptions.body)
  fetch(apiURL.value, requestOptions)
    .then((response: Response) => {
      // FIXME: 当前消息赋值类型待优化
      const currentMessage: Message = messageList.value.at(-1) || {
        role: 'assistant',
        content: ''
      }
      transformSSEMessage(response, (done, messageTextList) => {
        hookAfterReceiveMessage(done, messageTextList, currentMessage)
      })
    })
    .catch((error) => {
      console.error('Error occurred when fetching SSE endpoint', error)
    })
}
// Enter键发送消息与换行
function handleEnter(e: KeyboardEvent) {
  if (e.keyCode === 13) {
    if (e.shiftKey) return // shift + enter 换行
    e.preventDefault()
    if (!requesting.value) sendMessage()
    // console.log('enter', e);
  }
}
// 滚动到底部
function scrollToBottom(id: string) {
  const container = document.getElementById(id)
  if (container && container.scrollTop + container.clientHeight < container.scrollHeight) {
    // console.log('滚动到底部');
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
  }
}
// 清空历史消息
function handleClearMessage() {
  // FIXME 在一个消息请求正在进行时执行清空操作，请求未停止，请求结束后，会将最后一条消息添加到历史消息中
  initMessage()
}
// 代码高亮
// function translateCodeToHighlight(str, lang) {
//   // 此处判断是否有添加代码语言
//   if (lang && hljs.getLanguage(lang)) {
//     try {
//       // 得到经过highlight.js之后的html代码
//       const preCode = hljs.highlight(lang, str, true).value
//       // 以换行进行分割
//       const lines = preCode.split(/\n/).slice(0, -1)
//       // 添加自定义行号
//       let html = lines.map((item, index) => {
//         return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
//       }).join('')
//       html = '<ol>' + html + '</ol>'
//       // 添加代码语言
//       if (lines.length) {
//         html += '<b class="name">' + lang + '</b>'
//       }
//       return `<pre class="hljs"><code>${html}</code></pre>`
//     } catch (__) { }
//   }
//   // 未添加代码语言，此处与上面同理
//   const preCode = md.utils.escapeHtml(str)
//   const lines = preCode.split(/\n/).slice(0, -1)
//   let html = lines.map((item, index) => {
//     return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
//   }).join('')
//   html = '<ol>' + html + '</ol>'
//   return `<pre class="hljs"><code>${html}</code></pre>`
// }

const settingsRef = ref<InstanceType<typeof Settings> | null>(null)
// 设置
function handleChangeSettingsDisplay() {
  settingsRef.value?.openSettings()
}
</script>
``

<template>
  <div class="chat_view">
    <div class="chat_list_wrapper">
      <div class="chat_list"></div>
      <div class="utils_nav">
        <div class="settings_btn" @click="handleChangeSettingsDisplay">设置</div>
      </div>
    </div>
    <div class="chat_container">
      <div id="message_list" class="chat_history_container scroll">
        <div
          class="message_item"
          :user="item.role === 'user'"
          v-for="(item, i) in messageList"
          :key="i"
        >
          <div class="avatar">
            <img v-if="item.role === 'assistant'" src="@/assets/svg/chatgpt.svg" alt="" />
            <div v-if="item.role === 'user'" class="fake_avatar_img">
              {{ item.role.slice(0, 1).toLocaleUpperCase() }}
            </div>
          </div>
          <div class="message" :user="item.role === 'user'">
            <div class="message_header">
              <div class="message_role">{{ item.role === 'user' ? userNick : roleNick }}</div>
              <div class="message_time">{{ item.time }}</div>
            </div>
            <div class="message_content">
              <div v-if="item.role === 'user'" class="message_text">{{ item.content }}</div>
              <div v-else class="message_text" v-html="`${renderMarkdown(item.content)}`"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="toolbar">
        <div class="clear_msg" @click="handleClearMessage">
          <span>重新开始</span>
        </div>
      </div>
      <div class="user_wrapper">
        <textarea
          name="user"
          id="user"
          class="scroll textarea_scroll"
          v-model="questionMessage"
          cols="60"
          placeholder="请入内容后，按Enter键发送"
          rows="3"
        ></textarea>
        <button v-show="!requesting" @click="sendMessage">send</button>
        <button v-show="requesting">sending</button>
      </div>
    </div>
    <settings ref="settingsRef" />
  </div>
</template>

<style scoped lang="scss">
@font-face {
  font-family: 'FiraCode';
  src: url('@/assets/fonts/FiraCode-VF.woff2'), url('@/assets/fonts/FiraCode-Light.woff2'),
    url('@/assets/fonts/FiraCode-Bold.woff2'), url('@/assets/fonts/FiraCode-Medium.woff2'),
    url('@/assets/fonts/FiraCode-Regular.woff2');
}

:deep(.scroll)::-webkit-scrollbar-thumb {
  background: #555;
  border: 6px solid #232425;
}

:deep(.scroll)::-webkit-scrollbar-track {
  background: #232425;
}

.chat_view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #232425;
}

.chat_list_wrapper {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-right: 1px solid #3c3f45;
  background-color: #23252b;

  .chat_list {
    width: 300px;
    height: 100%;
    padding: 20px;
  }

  .utils_nav {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid #2e3035;

    .settings_btn {
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #353535;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      color: #c3c3c3;

      &:hover {
        color: #1890ff;
      }
    }
  }
}

.chat_container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: #232425;
  box-shadow: 0 0 10px #0000001a;
  font-family: 'FiraCode';
}

.chat_history_container {
  overflow-y: auto;
  padding: 20px;
  width: 100%;
  /* height: 500px; */
  height: 100%;
  border-radius: 6px;
  background-color: #232425;
}

.message_item {
  display: grid;
  /* grid-template-columns: 60px 700px 60px; */
  grid-template-columns: 60px 1fr 60px;
  margin-bottom: 20px;
}

.avatar {
  user-select: none;
  position: sticky;
  top: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffffff;
  margin-right: 10px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.fake_avatar_img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #16a160;
  line-height: 1;
  font-size: 26px;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message_header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 4px;
}

.message_role {
  margin: 0 6px;
  font-size: 14px;
  color: #fff;
}
.message_time {
  margin: 0 6px;
  letter-spacing: -1px;
  font-size: 12px;
  color: #b9b9b9;
}

.message_content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 20px;
  max-width: 100%;
  border-radius: 10px;
  background: #2c2c2c;
  color: #b9b9b9;
  box-shadow: 0 0 10px #0000001a;
}

.message_text {
  width: 100%;
}
// FIXME: 优化CSS格式
.message_item[user='true'] {
  justify-items: end;
}

.message_item[user='true'] .avatar {
  grid-column: 3;
  margin-left: 20px;
  margin-right: 0;
  background-color: #2a2b78;
}

.message_item[user='true'] .fake_avatar_img {
  background-color: #2a2b78;
}

.message_item[user='true'] .message {
  grid-row: 1;
  grid-column: 2;
  align-items: flex-end;
}

.message_item[user='true'] .message_header {
  justify-content: flex-end;
}

.message_item[user='true'] .message_content {
  background-color: #2a2b78;
}
.message_item[user='true'] .message_role {
  order: 1;
}

.assistant {
  overflow-y: auto;
  width: 100%;
  width: 600px;
  min-height: 100px;
  max-height: 400px;
  padding: 10px 20px;
  border-radius: 10px;
  background: #2c2c2c;
  color: #b9b9b9;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-height: 30px;
  background-color: #2c2c2c;
}

.clear_msg {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px;
  height: 30px;
  border-radius: 50%;
  background-color: #2c2c2c;
  color: #dd5050;
  cursor: pointer;
}

.user_wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

textarea {
  position: relative;
  width: 100%;
  height: 100px;
  resize: none;
  border: none;
  outline: none;
  background: #2c2c2c00;
  padding: 20px 20px;
  font-size: 16px;
  line-height: 1.5;
  color: #b9b9b9;
}

:deep(.textarea_scroll)::-webkit-scrollbar-thumb {
  background: #555;
  border: 6px solid #2c2c2c;
}

:deep(.textarea_scroll)::-webkit-scrollbar-track {
  background: #2c2c2c;
}

textarea::placeholder {
  /* font-style: italic; */
  font-size: 14px;
  color: #555;
}

// textarea:focus {
//   /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); */
// }

button {
  /* position: absolute; */
  /* bottom: 10px; */
  right: 10px;
  margin: 10px;
  padding: 6px 14px;
  border: none;
  outline: none;
  background: #3e3e3e;
  border-radius: 10px;
  color: #b9b9b9;
  font-size: 16px;
  line-height: 1.5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

:deep(.code-block) {
  overflow: hidden;
  margin: 1rem 0;
  border-radius: 6px;
}

:deep(.code-block-info) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 14px;
  color: #6565ff;
  font-size: 0.75rem;
  background-color: #1d2636;
}

:deep(.hljs) {
  font-family: 'FiraCode';
}

:deep(.code_scroll)::-webkit-scrollbar {
  height: 16px;
}

:deep(.code_scroll)::-webkit-scrollbar-thumb {
  background: #29356f;
  border: 6px solid #1d2636;
}

:deep(.code_scroll)::-webkit-scrollbar-track {
  background: #1d2636;
}

:deep(.code_inline) {
  /* padding: .1em .2em; */
  margin: 0.2em;
  border-radius: 4px;
  // background: #262631;
  font-family: 'FiraCode';
  color: #8f68cd;
  white-space: nowrap;
}

/* Copy */
:deep(.copy-button) {
  margin-left: 10px;
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  background-color: #6565ff;
  color: #fff;
  cursor: pointer;
}

/* :depp(.hljs-keyword,
  .hljs-selector-tag,
  .hljs-built_in,
  .hljs-name) {
  font-weight: bold;
}

:deep(.hljs-string,
  .hljs-title,
  .hljs-section,
  .hljs-attribute,
  .hljs-literal,
  .hljs-symbol,
  .hljs-bullet,
  .hljs-addition,
  .hljs-regexp,
  .hljs-link) {
  color: #2b91af;
}

:deep(.hljs-comment,
  .hljs-quote,
  .hljs-meta) {
  color: #a0a1a7;
  font-style: italic;
}

:deep(.hljs-deletion) {
  background-color: #fdd;
} */
</style>
