import { KoaRequestdata, KoaRequestValidator, checkResult, ValidateOptions } from '../types'
import get from 'lodash/get'
import last from 'lodash/last'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import findMembers from '../helpers/findMembers'
import { ParameterException } from './HttpException'
import defaults from '../defaults'
import { Rule, RuleResult, RuleField } from './Rule'

interface checkParam {
  value: any
  path: string[]
}

export class KoaValidator {
  static defaults = defaults
  data: KoaRequestdata
  parsed: KoaRequestdata
  alias: any = {}
  constructor() {
    // 用于存储原始参数
    this.data = {}
    // 用于存储转化后的参数
    this.parsed = {}
  }

  _assembleAllParams(ctx: any): KoaRequestdata {
    return {
      body: ctx.request.body,
      query: ctx.request.query,
      path: ctx.params,
      header: ctx.request.header
    }
  }
  get(path: string, parsed: boolean = true): any {
    // 为true则返回转化后的参数
    if (parsed) {
      const value = get(this.parsed, path, null)
      // 如果解析结果为undefined则可能为可选参数尝试从default中取值
      if (value == null) {
        const keys = path.split('.')
        const key = last(keys) || ''
        return get(this.parsed.default, key)
      }
      return value
    } else {
      // false返回原始参数
      return get(this.data, path)
    }
  }

  // 筛选需要验证的字段
  _findMembersFilter(this: KoaRequestValidator, key: string): boolean {
    // 函数字段
    if (/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    // 属性字段成员为Rule实例
    let values: Rule[]
    if (this[key] instanceof Rule) {
      values = [this[key]]
    } else {
      values = this[key]
    }
    if (Array.isArray(values)) {
      values.forEach((value: any) => {
        const isRuleType = value instanceof Rule
        if (!isRuleType) {
          throw new Error('验证数组必须全部为Rule类型')
        }
      })
      return true
    }
    return false
  }

  // 验证
  async validate(
    this: KoaRequestValidator,
    ctx: any,
    options: ValidateOptions = {}
  ): Promise<KoaRequestValidator> {
    let { alias = {}, errorCode, code } = options
    this.alias = alias
    let params = this._assembleAllParams(ctx)
    this.data = cloneDeep(params)
    this.parsed = cloneDeep(params)
    // 获取所有需要验证的字段
    const memberKeys = findMembers(this, {
      filter: this._findMembersFilter.bind(this)
    })
    const errorMsgs: string[] = []
    for (let key of memberKeys) {
      const result = await this._check(key, alias)
      // 如果验证字段有误推入错误序列
      if (!result.success) {
        errorMsgs.push(result.msg)
      }
    }
    // 如果有错误则抛出错误序列
    if (errorMsgs.length != 0) {
      errorCode = errorCode || KoaValidator.defaults.errorCode
      code = code || KoaValidator.defaults.code

      throw new ParameterException(errorMsgs, errorCode, code)
    }
    ctx.v = this
    return this
  }

  // 验证每一个字段并返回验证结果
  async _check(this: KoaRequestValidator, key: string, alias: any): Promise<checkResult> {
    const isCustomFunc = typeof this[key] == 'function' ? true : false
    let result
    // 函数验证
    if (isCustomFunc) {
      try {
        result = await this[key](this.data)
        if (!Array.isArray(result)) {
          result = [result]
        }
        const [isPass, msg] = result
        result = new RuleResult(isPass, msg)
      } catch (error) {
        result = new RuleResult(false, error.msg || error.message || '参数错误')
      }
    } else {
      // 属性验证, 数组，内有一组Rule
      const rules = Array.isArray(this[key]) ? this[key] : [this[key]]
      const ruleField = new RuleField(rules)
      // 设置了字段别名则验证用户传入的别名字段
      key = alias[key] ? alias[key] : key
      // 根据字段查找需要验证的参数
      const param = this._findParam(key)
      // 验证字段值
      result = ruleField.validate(param.value)

      if (result.pass) {
        // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值
        if (param.path.length == 0) {
          set(this.parsed, ['default', key], result.legalValue)
        } else {
          // 将parsed参数值重置为解析后
          set(this.parsed, param.path, result.legalValue)
        }
      }
    }
    if (!result.pass) {
      const msg = `${isCustomFunc ? '' : key}${result.msg}`
      return {
        msg: msg,
        success: false
      }
    }
    return {
      msg: 'ok',
      success: true
    }
  }
  // 查找参数
  _findParam(key: string): checkParam {
    let value
    value = get(this.data, ['query', key])
    if (value) {
      return {
        value,
        path: ['query', key]
      }
    }
    value = get(this.data, ['body', key])
    if (value) {
      return {
        value,
        path: ['body', key]
      }
    }
    value = get(this.data, ['path', key])
    if (value) {
      return {
        value,
        path: ['path', key]
      }
    }
    value = get(this.data, ['header', key])
    if (value) {
      return {
        value,
        path: ['header', key]
      }
    }
    return {
      value: null,
      path: []
    }
  }
}
