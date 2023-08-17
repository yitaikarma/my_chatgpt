import Clipboard from 'clipboard'

type Selector = string | Element | NodeListOf<Element>

/**
 * @description 复制到剪贴板
 * @param {selector} Selector 选择器
 * @param {callback} () => void 回调
 */
export const useClipboard = (selector: Selector, options?: Clipboard.Options) => {
  const clipboard = new Clipboard(selector, options)
  return clipboard
  clipboard.on('success', function (e) {
    // e.trigger.innerText = 'Copied!'
    e.trigger.textContent = '已拷贝'
    setTimeout(() => {
      e.trigger.textContent = '拷贝'
    }, 2000)
  })

  clipboard.on('error', function (e) {
    console.error('Action:', e.action)
    console.error('Trigger:', e.trigger)
  })
}
