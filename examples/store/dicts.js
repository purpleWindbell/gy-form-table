/*
 * @Description:
 * @StartVersion: 2.0
 * @LastVersion: 2.0
 * @Autor: gaoyue
 * @Date: 2023-03-20 17:17:03
 * @LastEditTime: 2023-03-20 17:19:22
 */
const state = {
  dicts: {
    ehr: {
      ehr_status: [
        { label: '正常', value: '1' },
        { label: '停用', value: '2' }
      ]
    }
  }
}

export default {
  namespaced: true,
  state
}

