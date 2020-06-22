export interface FindConditionConfig {
  prefix?: string
  specifiedType?: any
  filter?: (name: string) => boolean
}

export interface KoaRequestdata {
  body?: any
  query?: any
  path?: any
  header?: any
  default?: any
}
export interface KoaRequestValidator {
  data: KoaRequestdata
  parsed: KoaRequestdata
  alias: any
  get(path: string, parsed: boolean): any
  validate(ctx: any, alias: any): Promise<KoaRequestValidator>
  [propName: string]: any
}

export interface RuleAbstract {
  name: string
  msg?: string
  params: any[]
  validate(field: string): RuleResult
}

export interface RuleResult {
  pass: boolean
  msg: string
}

export interface checkResult {
  success: boolean
  msg: string
}

export interface Defaults {
  code: number
  errorCode: number
}

export interface ValidateOptions {
  alias?: any
  code?: number
  errorCode?: number
}

export interface Va {
  a: number
}
