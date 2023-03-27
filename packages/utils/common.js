
// 引入Decimal yarn add decimal.js 或者 npm install decimal.js --save
import { Decimal } from 'decimal.js'
import fileDownload from 'js-file-download'

//  将数字金额转换为大写金额
export function getChineseNumber(money) {
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'] // 汉字的数字
  const cnIntRadice = ['', '拾', '佰', '仟'] // 基本单位
  const cnIntUnits = ['', '万', '亿', '兆'] // 对应整数部分扩展单位
  const cnDecUnits = ['角', '分', '毫', '厘']// 对应小数部分单位
  const cnInteger = '整' // 整数金额时后面跟的字符
  const cnIntLast = '元' // 整数完以后的单位
  // 最大处理的数字
  const maxNum = 999999999999999.9999
  // 输出的中文金额字符串
  let chineseStr = ''
  if (money === '') { return '' }
  money = parseFloat(money)
  if (money >= maxNum) {
    // 超出最大处理数字
    return '超出最大处理数字'
  }
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger
    return chineseStr
  }

  // 四舍五入保留两位小数,转换为字符串
  money = Math.round(money * 100).toString()
  const integerNum = money.substr(0, money.length - 2) // 金额整数部分
  const decimalNum = money.substr(money.length - 2) // 金额小数部分

  // 获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0
    const IntLen = integerNum.length
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1)
      const p = IntLen - i - 1
      const q = p / 4
      const m = p % 4
      if (n == '0') {
        zeroCount++
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0]
        }
        // 归零
        zeroCount = 0
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m]
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q]
      }
    }
    chineseStr += cnIntLast
  }
  // 小数部分
  if (decimalNum != '') {
    const decLen = decimalNum.length
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1)
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i]
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger
  } else if (decimalNum == '' || /^0*$/.test(decimalNum)) {
    chineseStr += cnInteger
  }
  return chineseStr
}

// 大写汉字转数字;'叁仟肆佰伍拾亿零壹佰陆拾柒万叁仟肆佰伍拾壹' => '345001673451'
export const getArabNumber = (money) => {
  // 大写汉字对应的数字
  const dic = { 零: 0, 壹: 1, 贰: 2, 叁: 3, 肆: 4, 伍: 5, 陆: 6, 柒: 7, 捌: 8, 玖: 9 }
  // 处理仟,佰,拾;'叁仟肆佰伍拾壹' => '3451'
  const getInfo = (item) => {
    let itemCount = new Decimal(0)

    // 将仟，佰，拾 拆分数组 '叁仟肆佰伍拾壹' => ['叁仟', '肆佰', '伍拾', '壹']
    const arr = item
      .replace(/(\w*仟)(\w*)/, '$1,$2')
      .replace(/(\w*佰)(\w*)/, '$1,$2')
      .replace(/(\w*拾)(\w*)/, '$1,$2')
      .split(',')
      .filter(_item => {
        return _item && _item.trim()
      })

    // 处理每个单位对应的值
    for (const subItem of arr) {
      let currValue = new Decimal(0)
      const subArr = subItem.split('')
      if (subArr[1] === '拾') {
        // 处理拾位
        currValue = new Decimal(dic[subArr[0]]).mul(new Decimal(10))
      } else if (subArr[1] === '佰') {
        // 处理佰位
        currValue = new Decimal(dic[subArr[0]]).mul(new Decimal(100))
      } else if (subArr[1] === '仟') {
        // 处理仟位
        currValue = new Decimal(dic[subArr[0]]).mul(new Decimal(1000))
      } else {
        // 处理个位
        currValue = new Decimal(dic[subArr[0]])
      }
      itemCount = new Decimal(itemCount).add(new Decimal(currValue))
    }
    return itemCount
  }

  let totalMoney = new Decimal(0)

  /**
   * 按照亿,万,元,角,分拆分成数组;
   * '叁仟肆佰伍拾亿零壹佰陆拾柒万叁仟肆佰伍拾壹元捌角肆分' => ['叁仟肆佰伍拾亿', '壹佰陆拾柒万', '叁仟肆佰伍拾壹元', '捌角', '肆分']
   */
  const newMoney = money
    .replace(/零/g, '')
    .replace(/整/g, '') // 去掉 '零','整'
    .replace(/(\w*亿)(\w*)/, '$1,$2')
    .replace(/(\w*万)(\w*)/, '$1,$2')
    .replace(/(\w*元)(\w*)/, '$1,$2')
    .replace(/(\w*角)(\w*)/, '$1,$2')
    .split(',')
    .filter(_item => {
      return _item && _item.trim()
    })

  // 按照亿,万及以下单位为组, 循环求解求解数值;
  for (const mainItem of newMoney) {
    let currMoney = new Decimal(0)
    const mainArr = mainItem.split('')

    if (mainArr[mainArr.length - 1] === '亿') {
      mainArr.pop() // 去掉亿单位
      currMoney = new Decimal(getInfo(mainArr.join(''))).mul(new Decimal(100000000)) // 求仟,佰,拾
    } else if (mainArr[mainArr.length - 1] === '万') {
      mainArr.pop() // 去掉万单位
      currMoney = new Decimal(getInfo(mainArr.join(''))).mul(new Decimal(10000)) // 求仟,佰,拾
    } else if (mainArr[mainArr.length - 1] === '元') {
      mainArr.pop() // 去掉元
      currMoney = new Decimal(getInfo(mainArr.join(''))) // 求仟,佰,拾
    } else if (mainArr[mainArr.length - 1] === '角') {
      mainArr.pop() // 去掉角
      currMoney = new Decimal(dic[mainArr[0]]).mul(new Decimal(0.1))
    } else if (mainArr[mainArr.length - 1] === '分') {
      mainArr.pop() // 去掉分
      currMoney = new Decimal(dic[mainArr[0]]).mul(new Decimal(0.01))
    }
    totalMoney = new Decimal(totalMoney).add(new Decimal(currMoney))
  }

  return totalMoney.toString()
}

// 去除字符串中其他文字，获取大写数字金额。如“人民币贰佰万元整”得到“贰佰万元”
export const getRealMoney = (value) => {
  const regExp = /[零壹贰叁肆伍陆柒捌玖拾佰仟万亿元角分]/g
  return value.match(regExp).join('')
}

// 保留金额到万
export const getThousand = (money) => {
  let resReslut
  const regExp = /\./g
  // 有小数点 102321.10
  if (regExp.test('money')) {
    resReslut = money
      .replace(/(\d*)(\d{4}(?=\.))(\d*)/g, '$1.$2$3') // 102321.10 => 10.2321.10
      .replace(/(\d*)(\.)(\d*)(\.)(\d*)/, '$1$2$3$5') // 10.2321.10 => 10.232110
      .replace(/0*$/, '') // 去掉最后的'0' 10.232110 => 10.23211
      .replace(/\.$/, '') // 去掉最后的'.'
  } else {
    // 231023310 => 23102.3310 => 23102.331
    resReslut = money
      .replace(/(\d)(\d{4}$)/, '$1.$2')
      .replace(/0*$/, '') // 去掉最后的'0'
      .replace(/\.$/, '') // 去点最后的'.'
  }
  return resReslut
}

export function getFilterList(arr) {
  const filterList = []
  arr.filter(item => {
    if (item.filterSort != undefined) {
      filterList.push(item)
    }
    if (item.children && item.children.length > 0) {
      handleChildren(item.children)
    }
  })
  function handleChildren(list) {
    list.map(item => {
      if (item.filterSort != undefined) {
        filterList.push(item)
      }
      if (item.children && item.children.length > 0) {
        handleChildren(item.children)
      }
    })
  }
  return filterList
}

// 调用接口处理数据交互
/**
 * @param {*} api : 请求方法
 * @param {*} params : 请求参数
 * @param {*} info : 操作按钮的配置项
 * @param {*} confirm : 是否做二次提示
 * @param {*} refresh : 刷新列表方法
 * @param {*} callback : 操作之后的回调
 * @param {*} type : 操作类型，主要区分导出
 */
export function handleConfirmData(data) {
  let loading = ''
  const { api, params, info = {}, confirm = false, type, callback } = data
  if (!confirm) {
    api(params).then(res => { this.$message.success(res.msg) })
    return
  }
  // 确认弹框的提示信息  // alertAllMsg：弹框的所有提示信息
  const msg = info.alertAllMsg ? info.alertAllMsg : '确认是否' + info.label
  this.$confirm(msg, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    dangerouslyUseHTMLString: true,
    type: 'warning'
  }).then(() => {
    loading = this.$loading({ lock: true, text: `正在${info.label}...`, spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)' })
    api(params).then(res => {
      if (type == 'export') { fileDownload(res, `${params.filename}.xls`) }
      this.$message.success(info.label + '成功')
      if (callback) { callback() }
    }).catch(() => {
    }).finally(() => {
      loading.close()
    })
  })
}

// 导出数据
export function exportData({ api, info, params = {}}) {
  this.handleConfirmData({ api, params, confirm: true, info: { ...info }, type: 'export' })
}
