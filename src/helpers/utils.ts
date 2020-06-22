const toString = Object.prototype.toString

export function isString(val: any): val is String {
  return toString.call(val) === '[object String]'
}

export function isArray(val: any): val is Array<any> {
  return toString.call(val) === '[object Array]'
}
