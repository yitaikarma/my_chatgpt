import { onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import Clipboard from 'clipboard'
import hljs from 'highlight.js'
// import hljs from 'highlight.js/lib/core';
// import javascript from 'highlight.js/lib/languages/javascript';
// import typescript from 'highlight.js/lib/languages/typescript';

// import 'highlight.js/styles/atom-one-dark.css'
// import 'highlight.js/styles/github-dark.css'
import 'highlight.js/styles/tokyo-night-dark.css'

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
