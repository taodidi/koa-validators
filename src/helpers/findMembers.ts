import { FindConditionConfig } from '../types'

// 按指定条件查找实例属性及原型对象属性
export default function findMembers(instance: any, findConfig: FindConditionConfig): string[] {
  const { prefix, specifiedType, filter } = findConfig
  // 递归查找
  function _find(instance: any): string[] {
    if (instance.__proto__ === null) {
      return []
    }
    let keys = Reflect.ownKeys(instance)
    keys = keys.filter(key => {
      return _shouldKeep(key as string)
    })
    return keys.concat(_find(instance.__proto__)) as string[]
  }

  function _shouldKeep(key: string): boolean {
    if (filter) return filter(key)
    if (prefix) if (prefix.startsWith(key)) return true
    // 只找当前实例
    if (specifiedType) {
      if (instance[key] instanceof specifiedType) return true
    }
    return false
  }
  return _find(instance)
}
