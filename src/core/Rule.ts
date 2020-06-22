import validator from 'validator'
import { RuleAbstract } from '../types'

export class RuleResult {
  pass: boolean
  msg: string
  constructor(pass: boolean, msg = '') {
    this.pass = pass
    this.msg = msg
  }
}
// 用于字段校验的返回;
export class RuleFieldResult extends RuleResult {
  legalValue: any
  constructor(pass: boolean, msg = '', legalValue = null) {
    super(pass, msg)
    this.legalValue = legalValue
  }
}

export class Rule implements RuleAbstract {
  name: string
  msg?: string
  params: any[]
  constructor(name: string, msg?: string, ...params: any[]) {
    this.name = name
    this.msg = msg
    this.params = params
  }

  validate(field: string): RuleResult {
    // 如果为可选字段则直接返回true
    if (this.name == 'isOptional') return new RuleResult(true)
    const params = [field].concat(this.params)
    if (!(validator as any)[this.name](...params)) {
      return new RuleResult(false, this.msg || '参数错误')
    }
    return new RuleResult(true, '')
  }
}

export class RuleField {
  rules: Rule[]
  constructor(rules: Rule[]) {
    this.rules = rules
  }

  validate(field: any): RuleFieldResult {
    if (field == null) {
      const allowEmpty = this._allowEmpty()
      const defaultValue = this._hasDefault()
      // 如果是可选参数则直接返回true
      if (allowEmpty) {
        return new RuleFieldResult(true, '', defaultValue)
      } else {
        return new RuleFieldResult(false, '字段是必填参数')
      }
    }

    const filedResult = new RuleFieldResult(false)
    for (let rule of this.rules) {
      let result = rule.validate(field)
      if (!result.pass) {
        filedResult.msg = result.msg
        filedResult.legalValue = null
        // 一旦一条校验规则不通过，则立即终止这个字段的验证
        return filedResult
      }
    }
    return new RuleFieldResult(true, '', this._convert(field))
  }
  // 解析字段值
  _convert(value: any): any {
    for (let rule of this.rules) {
      if (rule.name == 'isInt') {
        return parseInt(value)
      }
      if (rule.name == 'isFloat') {
        return parseFloat(value)
      }
      if (rule.name == 'isBoolean') {
        return value ? true : false
      }
    }
    return value
  }
  // 是否为可选参数
  _allowEmpty(): boolean {
    for (let rule of this.rules) {
      if (rule.name == 'isOptional') {
        return true
      }
    }
    return false
  }
  // 获取默认值
  _hasDefault(): any {
    for (let rule of this.rules) {
      const defaultValue = rule.params[0]
      if (rule.name == 'isOptional') {
        return defaultValue
      }
    }
  }
}
