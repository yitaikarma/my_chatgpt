// import { ChatGPTAPI } from 'chatgpt'
// import { Configuration, OpenAIApi } from 'openai';

export function useChat() {
  /**
   * 设置请求消息
   * @param role 角色
   * @param content 内容
   * @returns Message 消息
   */
  const setRequestMessage = (role: string, content: string): Message => {
    return { role, content }
  }
  /**
   * 设置聊天消息
   * @param role 角色
   * @param content 内容
   * @param name 昵称
   * @returns Message 消息
   */
  const setChatMessage = (role: string, content: string, name: string): Message => {
    return { role, content, name, time: new Date().toLocaleString() }
  }

  // 创建 Node-GPT
  // function createGPT() {

  //   const configuration = new Configuration({
  //     apiKey
  //   });

  //   openai = new OpenAIApi(configuration);

  //   // async function getCompletionFromOpenAI() {
  //   //   const completion = await openai.createChatCompletion({
  //   //     model: 'gpt-3.5-turbo',
  //   //     messages: [
  //   //       { role: 'user', content: 'Hello!' }
  //   //     ],
  //   //     temperature: 0,
  //   //   });

  //   //   console.log(completion.data.choices[0].message.content);
  //   // }

  //   // getCompletionFromOpenAI();
  // }

  return { setRequestMessage, setChatMessage }
}
