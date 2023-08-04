import { json } from 'stream/consumers'

/**
 * SSE 文本消息逐字转换
 * @param response 响应数据
 * @param callback 回调
 * @param done 是否完成
 * @param textDataList 文本数据列表
 */
export const transformSSEMessage = (
  streamBody: ReadableStream,
  callback: (done: boolean, textDataList: any[]) => void
) => {
  // FIXME: 健壮性需要优化
  if (!streamBody) return
  const reader = streamBody.getReader()
  const decoder = new TextDecoder()

  async function readStream() {
    const { done, value } = await reader.read()

    let result = []
    if (!done) {
      const message = decoder.decode(value, { stream: !done })
      // console.log('Stream: ', message)
      // 提取json字符串中的对象字符串
      const jsonList = message.match(/(?<=data: )\{.*\}/g)
      // console.log('jsonList: ', jsonList)
      if (jsonList)
        result = jsonList.map((json) => {
          const obj = JSON.parse(json)
          if (obj instanceof Object) {
            return obj
          }
        })
      // if (jsonList) {
      //   for (let i = 0; i < jsonList.length; i++) {
      //     const json = jsonList[i]
      //     if (json) {
      //       try {
      //         const obj = JSON.parse(json)
      //         if (obj instanceof Object) {
      //           result.push(obj)
      //         }
      //       } catch (e) {
      //         console.log(e)
      //       }
      //     }
      //   }
      // }

      readStream()
    } else {
      console.log('Stream: DONE')
    }

    callback && callback(done, result)
  }

  readStream()
}
