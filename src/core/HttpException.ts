// HTTP请求异常

export class HttpException extends Error {
  public msg: string | string[]
  public errorCode: number
  public code: number
  constructor(
    msg: string | string[] = '服务器异常',
    errorCode: number = 10000,
    code: number = 400
  ) {
    super()
    this.msg = msg
    this.errorCode = errorCode
    this.code = code
    Object.setPrototypeOf(this, HttpException.prototype)
  }
}

// 参数错误
export class ParameterException extends HttpException {
  constructor(msg: string | string[] = '参数错误', errorCode: number = 10000, code: number = 400) {
    super(msg, errorCode, code)
  }
}
