import findMembers from '../../src/helpers/findMembers'
import { KoaValidator, Rule } from '../../src/index'

describe('helpers:findMembers', () => {
  class RegisterValidator extends KoaValidator {
    username: Rule[]
    group_id: Rule
    constructor() {
      super()
      this.username = [
        new Rule('isNotEmpty', '昵称不可为空'),
        new Rule('isLength', '昵称长度必须在2~10之间', 2, 10)
      ]
      this.group_id = new Rule('isInt', '分组id必须是整数，且大于0', {
        min: 1
      })
    }

    validateConfirmPassword(data: any) {
      if (!data.body.password || !data.body.confirm_password) {
        return [false, '两次输入的密码不一致，请重新输入']
      }
      let ok = data.body.password === data.body.confirm_password
      if (ok) {
        return ok
      } else {
        return [false, '两次输入的密码不一致，请重新输入']
      }
    }
  }

  class SubRegisterValidator extends RegisterValidator {
    email: Rule
    constructor() {
      super()
      this.email = new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
    }
    validateTest(data: any): boolean {
      return true
    }
  }

  function findMembersFilter(this: any, key: string): boolean {
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

  const register = new RegisterValidator()

  const subRegister = new SubRegisterValidator()

  test('should validate findMembers', () => {
    expect(findMembers(register, { filter: findMembersFilter.bind(register) })).toEqual([
      'username',
      'group_id',
      'validateConfirmPassword'
    ])
    expect(findMembers(subRegister, { filter: findMembersFilter.bind(subRegister) })).toEqual([
      'username',
      'group_id',
      'email',
      'validateTest',
      'validateConfirmPassword'
    ])
  })
})
