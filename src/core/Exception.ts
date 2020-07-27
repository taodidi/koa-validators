import { HttpException } from './HttpException'

let env = process.env.NODE_ENV
// 统一参数
env = env === 'prod' || env === 'production' ? 'production' : 'dev'

export default async function(ctx: any, next: any): Promise<any> {
  try {
    await next()
  } catch (error) {
    const isJWTError = error.status === 401
    const isHttpException = error instanceof HttpException
    // 开发环境&&不是HttpException
    if (env === 'dev' && !isHttpException && !isJWTError) {
      throw error
    }
    // HttpException错误
    if (isHttpException) {
      ctx.body = {
        msg: error.msg,
        error_code: error.errorCode,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.status = error.code
    } else if (isJWTError) {
      // 权限错误
      ctx.body = {
        msg: 'Protected resource, use Authorization header to get access\n',
        error_code: 999,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.status = 401
    } else {
      // 生产环境不是HttpException错误
      ctx.body = {
        msg: 'An exception has occurred on the server',
        error_code: 999,
        request: `${ctx.method} ${ctx.path}`
      }
      ctx.status = 500
    }
  }
}
