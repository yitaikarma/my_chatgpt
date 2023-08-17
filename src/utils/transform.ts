/**
 * SSE 文本消息逐字转换
 * @param response 响应数据
 * @param callback 回调
 * @param done 是否完成
 * @param textDataList 文本数据列表
 */
export const transformSSEMessage = (
  streamBody: ReadableStream,
  callback: (done: boolean, textDataList: any[], abort?: () => void) => void
) => {
  const reader = streamBody.getReader()
  const decoder = new TextDecoder()
  let result

  new ReadableStream({
    start(controller) {
      const abort = () => {
        reader.cancel()
        console.log('Stream: ABORT')
      }

      // The following function handles each data chunk
      function push() {
        // "done" is a Boolean and value a "Uint8Array"
        reader.read().then(({ done, value }) => {
          // Is there no more data to read?
          if (done) {
            // Tell the browser that we have finished sending data
            callback(done, [])
            controller.close()
            reader.releaseLock()
            console.log('Stream: DONE')
            return
          }

          result = []
          const message = decoder.decode(value)
          // console.log('Stream: ', message)
          const jsonList = message.match(/(?<=data: )\{.*\}/g)
          // console.log('jsonList: ', jsonList)
          if (jsonList) {
            result = jsonList.map((json) => JSON.parse(json))
          }
          // if (jsonList)
          //   result = jsonList.map((json) => {
          //     const obj = JSON.parse(json)
          //     if (obj instanceof Object) {
          //       return obj
          //     }
          //   })

          // Get the data and send it to the browser via the controller
          //   controller.enqueue(value)
          callback && callback(done, result, abort)
          push()
        })
      }
      push()
    }
  })
}
