/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟时间
 */
export const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout

  return (...args: any[]) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
