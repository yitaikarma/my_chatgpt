/**
 * 使用动画
 * @param {HTMLElement} element 要添加动画的元素
 * @param {Keyframe[]} keyframes 动画的关键帧
 * @param {number | KeyframeAnimationOptions} options 动画的配置
 * @param {() => void} beforeCallback 动画开始前的回调函数
 * @param {() => void} afterCallback 动画结束后的回调函数
 */
export function useAnimation(
  element: HTMLElement | SVGElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: number | KeyframeAnimationOptions,
  beforeCallback?: () => void,
  afterCallback?: () => void
) {
  // 创建动画前
  if (typeof beforeCallback === 'function') {
    beforeCallback()
  }

  // 创建动画效果
  const animation = element.animate(keyframes, options)

  // 在动画结束后执行其他操作
  animation.onfinish = function () {
    // 移除动画属性
    element.style.animation = ''

    // 动画结束后
    if (typeof afterCallback === 'function') {
      afterCallback()
    }
  }
}

/**
 * 使用每个元素
 * @param {string} elementId 列表元素 id
 * @param {() => void} callback 回调函数
 * @param {boolean} reverse 是否反向遍历
 */
export function useEachElement(
  elementId: string,
  callback: (element: HTMLElement) => void,
  reverse: boolean = false
) {
  const container = document.getElementById(elementId) as HTMLElement

  if (!container) return

  let scrollContainer = container
  const children = container.children

  // 获取滚动容器
  // 解决 如果列表不是滚动元素，则无法计算是否在可视区域内，因为 scrollTop 为 0
  const findScrollContainer = (element: HTMLElement): HTMLElement => {
    if (!element) return container
    if (element.scrollHeight > element.clientHeight) {
      return element
    } else {
      return findScrollContainer(element.parentElement as HTMLElement)
    }
  }
  scrollContainer = findScrollContainer(container)

  // 设置容器为相对定位，子元素offsetTop相对于定位元素计算的
  container.style.setProperty('position', 'relative')

  const childrenLength = children.length
  let child, visibleTop, visibleBottom, childTop, childBottom

  // for (let i = childrenLength - 1; i >= 0; i--) {
  for (let i = 0; i < childrenLength; i++) {
    const index = reverse ? childrenLength - 1 - i : i
    child = children[index] as HTMLElement

    visibleTop = scrollContainer.scrollTop
    visibleBottom = visibleTop + scrollContainer.offsetHeight
    // visibleBottom = visibleTop + scrollContainer.clientHeight
    childTop = child.offsetTop
    childBottom = childTop + child.offsetHeight

    // 子元素是否在可视范围内 (包括部分可视)， 上边部分可视 || 全部可视 || 下边部分可视
    const isVisible =
      (childTop <= visibleTop && visibleTop <= childBottom) ||
      (visibleTop <= childTop && childBottom <= visibleBottom) ||
      (childTop <= visibleBottom && visibleBottom <= childBottom)

    if (isVisible) {
      // 子元素在可视范围内

      // if (elementId === 'role_list') {
      //   console.log('containerTop:', visibleTop)
      //   console.log('containerBottom:', visibleBottom)
      //   console.log('childTop:', childTop)
      //   console.log('childBottom:', childBottom)
      //   console.log('----------------------')
      // }

      if (typeof callback === 'function') {
        callback(child)
      }
    } else {
      // 子元素不在可视范围内
    }
  }
}

/**
 * 通用初始化列表动画
 * @param {string} elementId 要绑定动画的列表元素 id
 */
export function useInitListAnimation(elementId: string, direction: string = 'down') {
  let counter = -1

  const rule: { [key: string]: number } = { down: 20, up: -20 }
  useEachElement(
    elementId,
    (element) => {
      counter++
      useAnimation(
        element,
        [
          { opacity: 0, transform: `translateY(${rule[direction]}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 300, delay: counter * 30 },
        () => (element.style.opacity = '0'),
        () => (element.style.opacity = 'initial')
      )
    },
    direction === 'down' ? false : true
  )
}

/**
 * 会话布局切换过渡动画
 */
export function useSessionSwitchLayoutAnimation() {
  let counter = -1

  const createAnimation = (element: HTMLElement, distance: number) => {
    counter++
    useAnimation(
      element,
      [
        { opacity: 0, transform: `translateX(${distance}px)` },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      { duration: 300, delay: counter * 30 },
      () => (element.style.opacity = '0'),
      () => (element.style.opacity = 'initial')
    )
  }

  useEachElement('message_list', (element) => {
    if (element.getAttribute('chatTheme') === 'Q&A') {
      createAnimation(element, 20)
    } else {
      if (element.getAttribute('role') === 'user') {
        createAnimation(element, -20)
      } else {
        createAnimation(element, 20)
      }
    }
  })
}

/**
 * 风格切换
 * @param {() => void} callback 回调函数
 */
function handleStyleChange(callback?: (element: HTMLElement, counter: number) => void) {
  const counter = -1

  const messageListEl = document.querySelectorAll('.message_item')

  // const createAnimation = (element: HTMLElement, distance: number) => {
  //   counter++

  //   useAnimation(
  //     element,
  //     [
  //       { opacity: 0, transform: `translateX(${distance}px)` },
  //       { opacity: 1, transform: 'translateX(0)' }
  //     ],
  //     { duration: 300, delay: counter * 30 },
  //     () => (element.style.opacity = '0'),
  //     () => (element.style.opacity = 'initial')
  //   )
  // }

  const messageElementLength = messageListEl.length

  for (let i = 0; i < messageElementLength; i++) {
    const element = messageListEl[i] as HTMLElement
    if (typeof callback === 'function') {
      callback(element, counter)
    }
    // if (element.getAttribute('chatTheme') === 'Q&A') {
    //   createAnimation(element as HTMLElement, 20)
    // } else {
    //   if (element.getAttribute('role') === 'user') {
    //     createAnimation(element as HTMLElement, -20)
    //   } else {
    //     createAnimation(element as HTMLElement, 20)
    //   }
    // }
  }
}
