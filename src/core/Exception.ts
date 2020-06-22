import { HttpException } from './HttpException'
let env = process.env.NODE_ENV
// 统一参数
env = env === 'prod' || env === 'production' ? 'production' : 'dev'

export default async function(ctx: any, next: any): Promise<any> {
  try {
    await next()
  } catch (error) {
    const isHttpException = error instanceof HttpException
    if (env === 'dev' && !isHttpException) {
      throw error
    } else {
      ctx.body = {
        ...error
      }
    }
  }
}
