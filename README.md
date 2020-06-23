# Koa parameter validator

Koa-validators Is an easy to use server-side parameter validator, which provides field validators and custom validators
Field validation depends on "validator.js" So its validation rules are limited "validator.js"
And koa-validators will validate: ctx.request.body(上下文请求体)`、`ctx.request.query(上下文请求 query 参数)`、`ctx.request.header(上下文请求头)`、`ctx.param(路由参数)Perform uniform validation, so make sure your parameters are not repeated

koa-validators 是一款简单易用的服务端参数校验器，它提供了字段校验和自定义校验两种方式

字段校验依赖于"validator.js"所以它的校验规则受限于"validator.js"

同时 koa-validators 会对：ctx.request.body(上下文请求体)`、`ctx.request.query(上下文请求 query 参数)`、`ctx.request.header(上下文请求头)`、`ctx.param(路由参数) 进行统一的校验，所以请保证你的参数没有重复

## Installation

```
$ npm install koa-validators
```

## 注册全局异常处理 Register global exception handling

注册了全局异常处理中间件后，你的所有错误都将被它捕获，同时它会根据错误类型，选择返回客户端或者直接抛出。
Once you have registered the global exception-handling middleware, it will catch all your errors and either return them to the client or throw them directly, depending on the type of error.

```js
const Koa = require('koa')
const { exception } = require('koa-validators')
const app = new Koa()

// Registered middleware
app.use(exception)

app.listen(3000)
```

### 定义校验规则 Define validation rules

The fields you need to validate are organized in a class manner, and you need to inherit from the base class KoaValidator. Each validation Rule can be an array or a single Rule instance
You can set the return status code and errorCode uniformly before defining the rule

使用类的方式组织你需要校验的字段，并且你需要继承基类 KoaValidator，每个校验规则可以是数组也可以是单个 Rule 实例

在定义规则之前你可以统一设置返回的状态码以及 errorCode

```js
const { Rule, KoaValidator } = require('koa-validators')

//The unified returned code and errorCode default to 400 1000

KoaValidator.defaults = {
  code: 400,
  errorCode: 10000
}
```

```javascript
class CustomValidator extends KoaValidator {
  constructor() {
    super()
    //this.usename是你需要校验的字段
    //定义的规则可以是单个Rule实例 或者是包含多个Rule规则的数组
    this.username = [
      new Rule('isLength', '昵称长度必须在2~10之间', 2, 10),
      //isOptional表示这个字段为可选字段，第三个参数可以设置这个字段的默认值
      new Rule('isOptional', '', 'Tom')
    ]
    this.group_id = new Rule('isInt', '分组id必须是整数，且大于0', {
      min: 1
    })
  }
  //自定义校验规则
  // 所有自定义校验函数必须以validate开头
  // 当校验通过时你可以直接return true
  // 当校验失败时你可以直接return false 但这样将会丢失错误信息
  // 所以当校验失败时你最好使用 return [false, '两次输入的密码不一致，请重新输入']
  // 你也可以直接抛出一个错误 throw new Error('两次输入的密码不一致，请重新输入')
  validateConfirmPassword(data) {
    if (!data.body.password || !data.body.confirm_password) {
      return [false, '两次输入的密码不一致，请重新输入']
    }
    let ok = data.body.password === data.body.confirm_password
    if (ok) {
      return true
    } else {
      return [false, '两次输入的密码不一致，请重新输入']
    }
  }
}
```

### 字段校验 Field calibration

```javascript
this.id = new Rule('isInt', '分组id必须是整数，且大于0', {
  min: 1
})
```

当你定义上面这样一个校验规则时 Rule 类的第一个参数实际是 validator.js 的方法名，它在 validator.js 中表现为

When you define a validation Rule like the one above, the first argument to the Rule class is actually the method name of Validator.js, which is what validator.js looks like

```javascript
isInt('X', { min: 1 })
```

### isOptional

设置 isOptional 可以让一个参数变为可选，当客户端没有向服务端传递参数时它将使用你定义的默认值如下。

当客户端没有传递参数，那么 isEmail 这个校验规则将不会生效

Setting isOptional makes an argument optional. If the client doesn't pass an argument to the server, it will use the default values you defined below.
If the client does not pass a parameter, the isEmail validation rule will not take effect

```javascript
new Rule('isOptional', '', 'xxxx@email.com'),
  new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
```

当客户端向服务端传递了参数时，那么 isEmail 这个校验规则将会生效，也正符合 isOptional 可选的含义
When a client passes a parameter to a server, the isEmail validation rule takes effect, which is exactly what isOptional means

### 自定义规则函数 Custom rule functions

Custom rule functions take an argument
自定义规则函数会接受一个参数

```javascript
validateConfirmPassword(data) {
if (!data.body.password || !data.body.confirm_password) {
return [false, "两次输入的密码不一致，请重新输入"];
}
let ok = data.body.password === data.body.confirm_password;
if (ok) {
return ok;
} else {
return [false, "两次输入的密码不一致，请重新输入"];
}
}
```

The overall structure of this parameter is as follows:
这个参数的整体结构如下：

```javascript
this.data = {
  body: ctx.request.body, // body -> body
  query: ctx.request.query, // query -> query
  path: ctx.params, // params -> path
  header: ctx.request.header // header -> header
}
```

### 使用定义的校验规则 Use the defined validation rules

Call the validate function and pass in the CTX to trigger validation. Koa-validators will do the rest for you and return a promise
Resolve by default in this promise and pass in instances of classes you define
调用 validate 函数并且传入 ctx 即可触发校验，koa-validators 将会帮你完成后续工作，并且返回一个 promise
这个 promise 中默认执行 resolve 并且将你定义的类实例传入

```javascript
const Router = require('koa-router')

const router = new Router({
  prefix: '/v1/test'
})

router.get('/search', async ctx => {
  const v = await new CustomValidator().validate(ctx)
  v.get('query.count')
  v.get('query.count', false)
  ctx.body = {
    code: 200
  }
})
// 你还可以通过设置code和errorCode来控制返回的错误状态码
//当客户端的参数没有出错时它将不生效，它会覆盖你设置的默认状态码
const v = await new CustomValidator().validate(ctx, { code: 400, errorCode: 10000 })
```

### 取参 Take out the parameter

When we get the returned instance, we can get the parameters through the GET method
当校验完毕我们获取到返回的实例，可以通过 get 方法获取参数

```javascript
const v = await new CustomValidator().validate(ctx)
v.get('query.count')
v.get('query.count', false)
```

If count is a string, then the parameter obtained by get has been converted to number for you. Of course, if you do not need this conversion, you can pass false on the third parameter
如果 count 是字符串类型，那么通过 get 获取后的参数已经帮你转换为 number 类型，当然如果你不需要这种转换可以在第三个参数传入 false

### 继承 inherit

```javascript
class RegisterValidator extends KoaValidator {
  username: Rule[]
  group_id: Rule
  constructor() {
    super()
    this.username = [
      new Rule('isOptional', '', 't'),
      new Rule('isLength', '昵称长度必须在2~10之间', 2, 10)
    ]
    this.group_id = new Rule('isInt', '分组id必须是整数，且大于0', {
      min: 1
    })
  }

  validateConfirmPassword(data: any) {
    return [false, '两次输入的密码不一致，请重新输入']
  }
}

class SubRegisterValidator extends RegisterValidator {
  email: Rule
  constructor() {
    super()
    this.email = new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')
  }
  validateTest(data: any): boolean {
    return false
  }
}
```

这里 koa-validators 会对所有的字段以及原型链上的 validate 函数做统一校验
Here koa-validators perform uniform validation on all fields and on the validate function on the prototype chain

#### 别名 alias

```javascript
class RegisterValidator extends KoaValidator {
  constructor() {
    super()
    this.group_id = new Rule('isInt', '分组id必须是整数，且大于0', {
      min: 1
    })
  }
}
const v = await new CustomValidator().validate(ctx, {
  alias: { group_id: id },
  code: 400,
  errorCode: 10000
})
```

在调用 validate 做校验时，你可以通过第二个参数设置返回的 code 同时也可以通过它来设置别名

例如：alias:{group_id:id}

它将使用 group_id 的校验规则对客户端传入的 id 参数进行校验

When you call validate to validate, you can set the code returned by the second argument and you can also set the alias by using it
For example: alias:{group_id:id}
It USES the group_ID validation rule to validate the ID parameter passed in by the client
