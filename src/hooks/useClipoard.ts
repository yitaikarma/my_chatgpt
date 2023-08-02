import Clipboard from 'clipboard'

type Selector = string | Element | NodeListOf<Element>

export const useClipboard = (selector: Selector) => {
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
