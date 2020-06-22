import { HttpException } from './HttpException'

let env = process.env.NODE_ENV
// 统一参数
env = env === 'prod' || env === 'production' ? 'production' : 'dev'

export default async function(ctx: any, next: any): Promise<any> {
  try {
    await next()
  } catch (error) {
    const isHttpException = error instanceof HttpException
    // 开发环境&&不是HttpException
    if (env === 'dev' && !isHttpException) {
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
