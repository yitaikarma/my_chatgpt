/**
 * @description: 为元素添加动画效果
 * @param {HTMLElement} element 要添加动画的元素
 */
export function useAnimation(
  element: HTMLElement | SVGElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: number | KeyframeAnimationOptions
) {
  // 获取要添加动画的元素
  //   const element = document.getElementById(element_id)

  // 定义动画的关键帧
  // const keyFrames = [
  //     { transform: 'translateY(20px)' },
  //     { transform: 'translateY(0px)' }
  // ]

  // 定义动画的配置
  //   const option = {
  //     duration: 500, // 动画持续时间（毫秒）
  //     iterations: 1, // 仅执行一次动画
  //     easing: 'ease-in-out' // 缓动函数
  //   }

  // 创建动画效果
  const animation = element.animate(keyframes, options)

  // 在动画结束后执行其他操作
  animation.onfinish = function () {
    // 移除动画属性
    element.style.animation = ''
  }
}
