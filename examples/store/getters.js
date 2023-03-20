/*
 * @Description:
 * @StartVersion: 2.0
 * @LastVersion: 2.0
 * @Autor: gaoyue
 * @Date: 2022-03-03 14:18:38
 * @LastEditTime: 2022-03-17 12:09:19
 */
const permissions = []
const getters = {
  permissions: state => permissions,
  dicts: state => state.dicts.dicts
}
export default getters

