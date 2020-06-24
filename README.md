# Koa parameter validator

Koa-validators Is an easy to use server-side parameter validator, which provides field validators and custom validators
Field validation depends on "validator.js" So its validation rules are limited "validator.js"
And koa-validators will validate: ctx.request.body`、`ctx.request.query`、`ctx.request.header`、`ctx.param Perform uniform validation, so make sure your parameters are not repeated

[中文文档](http://www.xbin.club/validator)

## Installation

```
$ npm install koa-validators
```

## Register global exception handling

Once you have registered the global exception-handling middleware, it will catch all your errors and either return them to the client or throw them directly, depending on the type of error.

```js
const Koa = require('koa')
const { exception } = require('koa-validators')
const app = new Koa()

// Registered middleware
app.use(exception)

app.listen(3000)
```

### Define validation rules

The fields you need to validate are organized in a class manner, and you need to inherit from the base class KoaValidator. Each validation Rule can be an array or a single Rule instance
You can set the return status code and errorCode uniformly before defining the rule

```js
const { Rule, KoaValidator } = require('koa-validators')

//The unified returned code and errorCode default to 400 1000

KoaValidator.defaults = {
  errorCode: 10000,
  code: 400
}
```

```javascript
class CustomValidator extends KoaValidator {
  constructor() {
    super()
    //this.usename Is the field that you need to check
    //A Rule defined by a field that you want to check can be a single Rule instance or an array that contains multiple Rule rules
    this.username = [
      new Rule('isLength', 'Nicknames must be between 2 and 10 in length', 2, 10),
      //isOptional Indicates that this field is optional, and the third parameter can set the default value of this field
      new Rule('isOptional', '', 'Tom')
    ]
    this.group_id = new Rule('isInt', 'The grouping ID must be an integer and greater than 0', {
      min: 1
    })
  }
  //Custom validation rules
  // All custom validation functions must begin with validate
  // You can simply return true when the check passes
  // You can simply return false if validation fails but this will lose the error message
  // So you'd better use return [false, 'The two passwords do not match, please try again ']
  // You can also throw a "throw New Error" (" The password is different, please re-enter ")
  validateConfirmPassword(data) {
    if (!data.body.password || !data.body.confirm_password) {
      return [false, 'The passwords you entered do not match. Please try again']
    }
    let ok = data.body.password === data.body.confirm_password
    if (ok) {
      return true
    } else {
      return [false, 'The passwords you entered do not match. Please try again']
    }
  }
}
```

### Field calibration

```javascript
this.id = new Rule('isInt', 'The grouping ID must be an integer and greater than 0', {
  min: 1
})
```

When you define a validation Rule like the one above, the first argument to the Rule class is actually the method name of Validator.js, which is what validator.js looks like

```javascript
isInt('X', { min: 1 })
```

### isOptional

Setting isOptional makes an argument optional. If the client doesn't pass an argument to the server, it will use the default values you defined below.
If the client does not pass a parameter, the isEmail validation rule will not take effect

```javascript
new Rule('isOptional', '', 'xxxx@email.com'),
  new Rule(
    'isEmail',
    'Email address does not conform to the specification, please enter the correct email address'
  )
```

When a client passes a parameter to a server, the isEmail validation rule takes effect, which is exactly what isOptional means

### Custom rule functions

Custom rule functions take an argument

```javascript

validateConfirmPassword(data) {
  if (!data.body.password || !data.body.confirm_password) {
    return [false, 'The passwords you entered do not match. Please try again']
  }
  let ok = data.body.password === data.body.confirm_password
  if (ok) {
    return ok
  } else {
    return [false, 'The passwords you entered do not match. Please try again']
  }
}

```

The overall structure of this parameter is as follows:

```javascript
this.data = {
  body: ctx.request.body, // body -> body
  query: ctx.request.query, // query -> query
  path: ctx.params, // params -> path
  header: ctx.request.header // header -> header
}
```

### Use the defined validation rules

Call the validate function and pass in the CTX to trigger validation. Koa-validators will do the rest for you and return a promise
Resolve by default in this promise and pass in instances of classes you define

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

// You can also control the error status code returned by setting code and errorCode
// It will not take effect when there is no error in the client's parameters and will override the default status code you set
const v = await new CustomValidator().validate(ctx, { errorCode: 10000, code: 400 })
```

### Take out the parameter

When we get the returned instance, we can get the parameters through the GET method

```javascript
const v = await new CustomValidator().validate(ctx)
v.get('query.count')
v.get('query.count', false)
```

If count is a string, then the parameter obtained by get has been converted to number for you. Of course, if you do not need this conversion, you can pass false on the third parameter

### inherit

```javascript
class RegisterValidator extends KoaValidator {
  username: Rule[]
  group_id: Rule
  constructor() {
    super()
    this.username = [
      new Rule('isOptional', '', 't'),
      new Rule('isLength', 'Nicknames must be between 2 and 10 in length', 2, 10)
    ]
    this.group_id = new Rule('isInt', 'The grouping ID must be an integer and greater than 0', {
      min: 1
    })
  }

  validateConfirmPassword(data: any) {
    return [false, 'The passwords you entered do not match. Please try again']
  }
}

class SubRegisterValidator extends RegisterValidator {
  email: Rule
  constructor() {
    super()
    this.email = new Rule(
      'isEmail',
      'Email address does not conform to the specification, please enter the correct email address'
    )
  }
  validateTest(data: any): boolean {
    return false
  }
}
```

Here koa-validators perform uniform validation on all fields and on the validate function on the prototype chain

#### alias

```javascript
class RegisterValidator extends KoaValidator {
  constructor() {
    super()
    this.group_id = new Rule('isInt', 'The grouping ID must be an integer and greater than 0', {
      min: 1
    })
  }
}
const v = await new CustomValidator().validate(ctx, {
  alias: { group_id: id },
  errorCode: 10000,
  code: 400
})
```

When you call validate to validate, you can set the code returned by the second argument and you can also set the alias by using it
For example: alias:{group_id:id}
It USES the group_ID validation rule to validate the ID parameter passed in by the client
