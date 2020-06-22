# Koa parameter validator

Koa-validators perform uniform validations on ctx.request.body ctx.request.query ctx.request.header ctx.param
Make sure your parameter names are not repeated
Koa-validators use validator as a dependency so they only support all validator validators

## Installation

```
$ npm install koa-validators
```

## Hello koa-validators

```js
const Koa = require('koa')
const exception = require('koa-validators')
const app = new Koa()

// Registered middleware
app.use(exception)

app.listen(3000)
```

### Define your own validation rules

koa-validators It validates the instance fields that you defined and you have to inherit from the base class KoaValidator

```js
const { Rule, KoaValidator } = require('koa-validators')

//The unified returned code and errorCode default to 400 1000

KoaValidator.defaults = {
  code: 400,
  errorCode: 10000
}

class CustomValidator extends KoaValidator {
  constructor() {
    super()
    //A Rule can be an array or a single Rule instance
    this.username = [
      new Rule('isLength', '昵称长度必须在2~10之间', 2, 10),
      //Set optional parameter the third parameter is the default value
      new Rule('isOptional', '', 'Tom')
    ]
    this.group_id = new Rule('isInt', '分组id必须是整数，且大于0', {
      min: 1
    })
  }
  //Custom validation rules
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

### Use validation rules in routing

Validate returns a promise It resolves by default and passes in CTX data
You can use the GET method to get the formatted data
You can also pass false on the second argument to get the original data

```js
const Router = require('koa-router')

const router = new Router({
  prefix: '/v1/test'
})

router.get('/search', async ctx => {
  const v = await new CustomValidator().validate(ctx)
  //Formatted data
  v.get('query.count')
  // Unformatted data
  v.get('query.count', false)
  ctx.body = {
    code: 200
  }
})
// You can specify the status and errorCode to return when you call Validate
const v = await new CustomValidator().validate(ctx, { code: 400, errorCode: 10000 })
```

### About custom validations

Custom validation rules must begin with validate
It supports multiple return values

```js
class CustomValidator extends KoaValidator {
  //You can return true directly
  validateConfirmPassword(data) {
    if (!data.body.password || !data.body.confirm_password) {
      return [false, '两次输入的密码不一致，请重新输入']
    }
    let ok = data.body.password === data.body.confirm_password
    if (ok) {
      return true
    } else {
      // You can return false in case of error, but this will lose the prompt
      return false
    }
  }

  validateConfirmPassword(data) {
    if (!data.body.password || !data.body.confirm_password) {
      return [false, '两次输入的密码不一致，请重新输入']
    }
    let ok = data.body.password === data.body.confirm_password
    if (ok) {
      return true
    } else {
      // You can also throw an exception directly
      throw new Error('两次输入的密码不一致，请重新输入')
    }
  }
}
```
