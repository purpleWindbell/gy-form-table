import request from '../packages/utils/request'

// 分页查询
export function attendCheckRecordPage(data) {
  return request({
    url: '/attendCheckRecord/page',
    method: 'post',
    data: data,
    baseURL: '/ehr-attendance'
  })
}
