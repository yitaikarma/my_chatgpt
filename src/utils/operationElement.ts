// BUG: 过快的执行会导致不能滚动到底部，可能是因为滚动事件还没执行完就执行了滚动到底部的方法，可以考虑使用节流函数
/**
 * 滚动到底部
 * @param elementId 元素id
 */
export const scrollToBottom = (elementId: string) => {
  try {
    const container = document.getElementById(elementId)
    if (container && container.scrollTop + container.clientHeight < container.scrollHeight) {
      // console.log('滚动到底部');
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  } catch (e) {
    console.log(e)
  } finally {
    // console.log('scrollToBottom');
  }
}
