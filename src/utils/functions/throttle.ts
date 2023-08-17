/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param delay 节流延迟时间
 */
export const throttle = (fn: (...args: any[]) => void, delay: number) => {
  let lastTime = 0
  return (...args: any[]) => {
    const currentTime = Date.now()
    if (currentTime - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = currentTime
    }
  }
}
