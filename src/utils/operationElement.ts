import { throttle } from '@/utils/functions/throttle'

/**
 * 滚动到底部
 * @param elementId 元素id
 * @param isTransition 是否使用过渡动画
 */
export const scrollToBottom = (elementId: string, isTransition: boolean = true): void => {
  try {
    const container = document.getElementById(elementId)
    if (container && container.scrollTop + container.clientHeight < container.scrollHeight) {
      // console.log('滚动到底部')
      container.scrollTo({
        top: container.scrollHeight,
        behavior: isTransition ? 'smooth' : 'auto'
      })
    }
  } catch (e) {
    console.log(e)
  } finally {
    // console.log('scrollToBottom');
  }
}

/**
 * 滚动到顶部
 * @param elementId 元素id
 * @param isTransition 是否使用过渡动画
 */
export const scrollToTop = (elementId: string, isTransition: boolean = true): void => {
  try {
    const container = document.getElementById(elementId)
    if (container && container.scrollTop > 0) {
      // console.log('滚动到顶部')
      container.scrollTo({
        top: 0,
        behavior: isTransition ? 'smooth' : 'auto'
      })
    }
  } catch (e) {
    console.log(e)
  } finally {
    // console.log('scrollToTop');
  }
}
type ScrollDirction = 'top' | 'bottom'

/**
 * 节流滚动到顶部或底部
 * @param elementId 元素id
 * @param isTransition 是否使用过渡动画
 * @param direction 滚动方向
 * @param delay 节流延迟时间
 */
export const throttleScrollTo = (
  elementId: string,
  isTransition: boolean = true,
  direction: ScrollDirction,
  delay: number
) => {
  const scrollTo = direction === 'top' ? scrollToTop : scrollToBottom
  throttle(() => {
    scrollTo(elementId, isTransition)
  }, delay)
}
