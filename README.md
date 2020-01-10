# data-model-trans

### 说明

#### 静态方法，
##### 此模块是用于数据解析和过滤用，在处理数据的时候需要编写数据模型：
- [Uuid](#Uuid)
- [String](#String)
- [Number](#Number)
- [Integer](#Integer)
- [Float](#Float)
- [Boolean](#Boolean)
- [Moment](#Moment)
- [Array](#Array)
- [ModelArray](#ModelArray)
#### 非模型方法
- [use](#use) 创建Model对象，简单方法
- [Create](#Create) 实例化model对象
- [dispatch.toJS](#dispatch.toJS) 自动实例化对象并输出toJS
- [dispatch.toObj](#dispatch.toObj) 自动实例化对象并输出toObj

#### 新增Models对象，可以使用以上的静态方法和非模型方法

### 对象方法：
#### 方法用于转换为json或部分转换为json（除了moment）
- [_toJS](#_toJS) 完全转换为json对象
- [_toObj](#_toObj) 部分转换为json对象（moment不转）

#### 特殊说明
注意：这里每一个模型都有一个Default模型，如String => StringDefault ，
就是如果值是undefined、null、""就直接使用默认值，否则统一返回undefined

## Uuid
Model.uuid模型
```js
Model.Uuid(value[,options]) // value为空返回undefined
Model.UuidDefault(value[,options]) //默认value为空的时候返回uuid
```
## String
Model.String 字符串模型
```js
Model.String(value[,options]) // value为空返回undefined
Model.StringDefault(value[,options]) //默认value为空的时候返回""
```
## Number
Model.Number 数字模型
```js
Model.Number(value[,options]) // value为空返回undefined
Model.NumberDefault(value[,options]) // 默认value为空的时候返回0
Model.NumberNaN(value[,options]) // 默认value为空的时候返回NaN
```
## Integer
Model.Integer 整数模型
```js
Model.Integer(value[,options]) // value为空返回undefined
Model.IntegerDefault(value[,options]) //默认value为空的时候返回0
Model.IntegerNaN(value[,options]) // 默认value为空的时候返回NaN
```
## Float
Model.Float 浮点模型
```js
Model.Float(value[,options]) // value为空返回undefined
Model.FloatDefault(value[,options]) //默认value为空的时候返回0
Model.FloatNaN(value[,options]) // 默认value为空的时候返回NaN
```
## Boolean
Model.Boolean 布尔值模型
```js
Model.Boolean(value[,options]) // value为空返回undefined
Model.BooleanDefault(value[,options]) //默认value为空的时候返回false
```
## Moment
Model.Moment moment时间模型
```js
Model.Moment(value[,options]) // value为空返回undefined
Model.MomentDefault(value[,options]) //默认value为空的时候返回moment()
```
## Array
Model.Array 数组模型，这个里面只能放非对象
```js
Model.Array(value[,options]) // value为空返回undefined
Model.ArrayDefault(value[,options]) //默认value为空的时候返回[]
```
## ModelArray
Model.ModelArray 模型数组模型，这个里面可以放对象，里面的对象必须是有描述的
```js
Model.ModelArray(ModelElement,value[,options]) // value为空返回undefined
Model.ModelArrayDefault(ModelElement, value[,options]) //默认value为空的时候返回[]
```
## Create
Model.Create 创建一个对象模型
```js
Model.Create(ModelElement,value)
```

## use(fun)
Model.use 创建Model的方法
- **fun**:
  - Type: `Function`
  - Return: `Object`,必须返回一个描述对象
```js
Model.use(function(){
  return {
    id: Model.UuidDefault()
  }
}) 
```

## dispatch.toJS(fun)
Model.dispatch.toJS 自动实例化对象并输出toJS
- **fun**:
  - Type: `Function`
  - Return: `Object` 处理后的数据
```js
Model.dispatch.toJS(Model, data)
```

## dispatch.toObj(fun)
Model.dispatch.toObj 自动实例化对象并输出toObj
- **fun**:
  - Type: `Function`
  - Return: `Object` 处理后的数据
```js
Model.dispatch.toObj(Model, data)
```


### 例子
```js
// 写法一：  
class testModel extends Model {  
  id = Model.UuidDefault(this.args.id)  
  name = Model.String(this.args.nickName, "-")   // args[1]如果是对象则为配置，否则为默认值  
  children = Model.ModelArrayDefault(testModel, this.args.child)  
}  
/*这个方法可以单独写个文件然后放所有的数据处理模型，然后引用到其他文件中使用
一般用于大量数据的处理情况*/

// 写法二：
const testModel2 = Model.use((args) => ({
  id: Model.UuidDefault(args.id),
  name: Model.String(args.nickName, "-"),
  other: args,
  children: Model.ModelArrayDefault(testModel2, args.child)
}))
// 这个方法是简单的使用方法，效果是一样的

const serverData = {
  nickName: "Carlos", child: [
    { nickName: "Json", child: [{ nickName: "Merry" }, { nickName: "Ame" }] },
    { nickName: "Dear" }
  ]
}

const modelObj = new testModel(serverData)

const modelObj2 = new testModel2(serverData)

modelObj._toJS()
modelObj2._toJS()

```
