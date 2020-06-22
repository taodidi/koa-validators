// HTTP请求异常
export class HttpException extends Error {
  public code: number
  public errorCode: number
  public msg: string | string[]
  constructor(
    code: number = 400,
    errorCode: number = 10000,
    msg: string | string[] = '服务器异常'
  ) {
    super()
    this.msg = msg
    this.code = code
    this.errorCode = errorCode
    Object.setPrototypeOf(this, HttpException.prototype)
  }
}

// 参数错误
export class ParameterException extends HttpException {
  constructor(msg: string | string[] = '参数错误', code: number = 400, errorCode: number = 10000) {
    super(code, errorCode, msg)
  }
}
