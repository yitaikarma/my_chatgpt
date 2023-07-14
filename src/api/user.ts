import HttpClient from '@/plugins/axios'
import type { ListParams, ListModel } from './models/userModel'

// export const getList = (params: ListParams) => {
//     return HttpClient.get<ListModel>('/list', { params });
// };

/**
 * 获取用户列表
 * @param params 请求参数
 * @param params.id 用户id
 * @returns 返回用户列表
 */
export function getList(params: ListParams) {
  return HttpClient.get<ListModel>('/list', { params })
}
