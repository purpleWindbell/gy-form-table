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

// // 导出
export function exportSummaryAttendRecord(data) {
  return request({
    url: '/attendCheckRecord/export',
    method: 'post',
    data: data,
    responseType: 'blob',
    baseURL: '/ehr-attendance'
  })
}
