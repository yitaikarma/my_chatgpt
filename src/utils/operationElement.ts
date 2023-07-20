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
