/**
 * 事件监听器
 * @param element 元素
 * @param eventName 事件名
 * @param handler 处理程序
 */
export function useEventListener(
  element: HTMLElement | Document | Window,
  eventName: string,
  handler: EventListenerOrEventListenerObject
) {
  // 创建一个处理程序的引用。
  const savedHandler = ref<EventListenerOrEventListenerObject>()

  // 创建事件监听器
  onBeforeMount(() => {
    if (!element.addEventListener) return
    // 更新 handler
    savedHandler.value = handler
    element.addEventListener(eventName, handler)
  })

  // 删除事件监听器
  onUnmounted(() => {
    if (!element.removeEventListener) return
    element.removeEventListener(eventName, handler)
  })
}
