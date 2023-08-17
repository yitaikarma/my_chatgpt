// 正则表达式判断设备的格式，可以判断市面上大部分设备，我这里只对 pc端 和 移动端 做了处理
export function isMobile(): boolean {
  const reg =
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  // const flagT = navigator.userAgent.match(reg)
  const flag = reg.test(navigator.userAgent)
  return flag
}
