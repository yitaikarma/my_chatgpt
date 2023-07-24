import { onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import Clipboard from 'clipboard'
import hljs from 'highlight.js'
// import hljs from 'highlight.js/lib/core';
// import javascript from 'highlight.js/lib/languages/javascript';
// import typescript from 'highlight.js/lib/languages/typescript';

// import 'highlight.js/styles/atom-one-dark.css'
// import 'highlight.js/styles/github-dark.css'
// import 'highlight.js/styles/tokyo-night-dark.css'

// hljs.registerLanguage('javascript', javascript);

export const useClipboard = (selector: string | Element | NodeListOf<Element>) => {
  const clipboard = new Clipboard(selector)

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
}

// 创建markdown-it实例,并处理代码块
export const useMarkdown = () => {
  // 创建 markdown-it 实例
  const md = new MarkdownIt({
    // html: true, // 在源码中启用 HTML 标签
    // xhtmlOut: true, // 使用 '/' 来闭合单标签 （比如 <br />）。
    // // 这个选项只对完全的 CommonMark 模式兼容。
    // breaks: true, // 转换段落里的 '\n' 到 <br>。
    // langPrefix: 'language-', // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
    // linkify: true, // 将类似 URL 的文本自动转换为链接。

    // // 启用一些语言中立的替换 + 引号美化
    // typographer: true,

    // // 双 + 单引号替换对，当 typographer 启用时。
    // // 或者智能引号等，可以是 String 或 Array。
    // //
    // // 比方说，你可以支持 '«»„“' 给俄罗斯人使用， '„“‚‘'  给德国人使用。
    // // 还有 ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] 给法国人使用（包括 nbsp）。
    // quotes: '“”‘’',
    highlight: null
  })

  // 处理代码块
  md.renderer.rules.fence = function (...args) {
    // const [tokens, idx, options, env, self] = args;
    // console.log(tokens, idx, options, env, self);
    const [tokens, idx] = args
    const token = tokens[idx]
    const lang = token.info.trim()

    const selectorClassName = 'copy-button'
    const buttonId = `copyButton${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

    useClipboard(selectorClassName)

    if (lang && hljs.getLanguage(lang)) {
      const code = hljs.highlight(lang, token.content).value
      return `
      <div class="code-block">
                <div class="code-block-info">
                  <span>${lang.toUpperCase()}</span>
                  <button
                    id="${buttonId}"
                    class="${selectorClassName}"
                    data-clipboard-text="${token.content}">
                    Copy
                  </button>
                </div>
                <pre><code class="hljs language-${lang} scroll code_scroll">${code}</code></pre>
              </div>`
    }

    return `<pre><code>${token.content}</code></pre>`
  }

  // 处理行内代码
  md.renderer.rules.code_inline = function (...args) {
    // const [tokens, idx, options, env, self] = args;
    // console.log(tokens, idx, options, env, self);
    const [tokens, idx] = args
    const token = tokens[idx]
    const code = token.content
    return '<code class="code_inline">' + code + '</code>'
    // const highlighted = hljs.highlightAuto(code).value
    // return '<code class="code_inline">' + highlighted + '</code>';
  }
  return md
}
