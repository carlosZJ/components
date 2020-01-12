import moment from "moment"
import util from "./util"
import "moment/locale/zh-cn"

moment.locale("zh-cn")

function convertFun(args, convert = {}) {
  let temp = {}
  const convertKeys = Object.keys(convert)
  if (!convertKeys.length) return args
  Object.keys(args).map(key => {
    const convertValue = convert[key]
    const argsValue = args[key]
    if (convertKeys.includes(key) && typeof convertValue != "object") {
      temp[convertValue] = argsValue
    } else if (typeof convertValue == "object") {
      if (argsValue instanceof Array)
        temp[convertValue[0]] = argsValue.map(item => convertFun(item, convertValue[1]))
      else temp[convertValue[0]] = convertFun(argsValue, convertValue[1])
    } else {
      temp[key] = argsValue
    }
  })
  return temp
}

const ps = ["args", "_toObj", "_toJS"]

/**创建模型方法
 * @param {object} args 入参
 * @param {object} convert 需要转换的key的配置
 *      convert说明：{key: 'convertKey', key: ['convertKey', {key:'convertKey'}]}
 *      key为将被替换的key，convertKey是替换key的名称，
 *      如果key对应的值是Array或Object，那么传入数组第一个为将被替换的key，第二个参数为重复上面说的替换模式
 */
export default function Model(args, convert) {
  let _args = args ? convertFun(args, convert) : {}
  Object.defineProperty(this, "args", {
    configurable: true,
    enumerable: true,
    get: () => _args,
    set: () => {
      throw new Error("args can not be update")
    }
  })
}

Model.prototype._toObj = function (obj) {
  obj = obj || this
  let temp = {}
  for (let item in obj) {
    if (ps.indexOf(item) != -1) continue
    else if (obj[item] instanceof ModelArray) {
      temp[item] = obj[item].value && obj[item].value.map(i => i._toObj())
    } else if (obj[item] instanceof Base) {
      temp[item] = obj[item].value
    } else if (obj[item] instanceof Model) {
      temp[item] = obj[item]._toObj()
    } else {
      temp[item] = obj[item]
    }
  }
  return temp
}
Model.prototype._toJS = function (obj) {
  obj = obj || this
  let temp = {}
  for (let item in obj) {
    if (ps.indexOf(item) != -1) continue
    else if (obj[item] instanceof ModelArray) {
      temp[item] = obj[item].value && obj[item].value.map(i => i._toJS())
    } else if (obj[item] instanceof MomentBase) {
      temp[item] = obj[item].value.isValid()
        ? obj[item].value.format(obj[item].args.format)
        : undefined
    } else if (obj[item] instanceof Base) {
      temp[item] = obj[item].value
    } else if (obj[item] instanceof Model) {
      temp[item] = obj[item]._toJS()
    } else {
      temp[item] = obj[item]
    }
  }
  return temp
}

Model.use = function (fun) {
  const factory = function (args) {
    const temp = fun(args)
    for (let key in temp) {
      this[key] = temp[key]
    }
  }
  factory.prototype = new Model()
  return factory
}

Model.dispatch = {
  toJS: function(modelName, data){
    if(!(modelName instanceof Model)) throw new Error("modelName is not type of 'Model'.")
    if(data instanceof Array){
      return data.map(item=> new modelName(item)._toJS())
    }
    return new modelName(data)._toJS()
  },
  toObj: function(modelName, data){
    if(!(modelName instanceof Model)) throw new Error("modelName is not type of 'Model'.")
    if(data instanceof Array){
      return data.map(item=> new modelName(item)._toObj())
    }
    return new modelName(data)._toObj()
  }
}

Model.Create = function (modalName, val) {
  return val ? new modalName(val) : new UndefinedBase()
}
/**
 * uuid类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Uuid = function (val, args) {
  return new StringBase(val, args)
}
/**
 * uuid默认空类型，返回空字符串
 * @param {String/Int} val 必填，值
 */
Model.UuidEmpty = function (val) {
  return new StringBase(val, { default: "" })
}
/**
 * uuid默认值类型，返回uuid字符串
 * @param {String/Int} val 必填，值
 */
Model.UuidDefault = function (val) {
  return new StringBase(val, { default: util.uuid() })
}

/**
 * 字符串类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.String = function (val, args) {
  return new StringBase(val, args)
}
/**
 * 字符串默认空类型，返回的是空字符串
 * @param {String/Int} val 必填，值
 */
Model.StringDefault = function (val) {
  return new StringBase(val, { default: "" })
}

/**
 * 数值类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Number = function (val, args) {
  return new NumberBase(val, args)
}
/**
 * 数值NaN类型，返回NaN
 * @param {String/Int} val 必填，值
 */
Model.NumberNaN = function (val) {
  return new NumberBase(val, { default: NaN })
}
/**
 * 数值默认空类型，返回0
 * @param {String/Int} val 必填，值
 */
Model.NumberDefault = function (val) {
  return new NumberBase(val, { default: 0 })
}

/**
 * 整数类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Integer = function (val, args) {
  return new IntegerBase(val, args)
}
/**
 * 整数NaN类型，返回NaN
 * @param {String/Int} val 必填，值
 */
Model.IntegerNaN = function (val) {
  return new IntegerBase(val, { default: NaN })
}
/**
 * 整数默认空类型，返回0
 * @param {String/Int} val 必填，值
 */
Model.IntegerDefault = function (val) {
  return new IntegerBase(val, { default: 0 })
}

/**
 * 浮点类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Float = function (val, args) {
  return new FloatBase(val, args)
}
/**
 * 浮点默认NaN类型，返回NaN
 * @param {String/Int} val 必填，值
 */
Model.FloatNaN = function (val) {
  return new FloatBase(val, { default: NaN })
}
/**
 * 浮点默认空类型，返回0
 * @param {String/Int} val 必填，值
 */
Model.FloatDefault = function (val) {
  return new FloatBase(val, { default: 0 })
}

/**
 * 布尔类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Boolean = function (val, args) {
  return new BooleanBase(val, args)
}
/**
 * 布尔默认空类型，返回false
 * @param {String/Int} val 必填，值
 */
Model.BooleanDefault = function (val) {
  return new BooleanBase(val, { default: false })
}

// moment类型可以通过这个修改全局的默认转换配置
Model.MomentFormat = "YYYY-MM-DD HH:mm:ss"
/**
 * 时间类型
 * @param {String} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Moment = function (val, args) {
  return new MomentBase(val, args)
}
/**
 * 时间默认类型，返回当前的moment对象
 * @param {String} val 必填，值
 */
Model.MomentDefault = function (val) {
  return new MomentBase(val, { default: moment() })
}

/**
 * 模型数组类型
 * @param {String} modelName 必填，模型名称
 * @param {Object} val 必填，模型需要的对象值
 * @param {Object} args 选填，配置
 */
Model.ModelArray = function (modelName, val, args) {
  return new ModelArray(modelName, val, args)
}
/**
 * 模型数组默认空类型，返回空数组
 * @param {String} modelName 必填，模型名称
 * @param {Object} val 必填，模型需要的对象值
 */
Model.ModelArrayDefault = function (modelName, val) {
  return new ModelArray(modelName, val, { default: [] })
}

/**
 * 普通数组类型
 * @param {Object} val 必填，模型需要的对象值
 * @param {Object} args 选填，配置
 */
Model.Array = function (val, args) {
  return new ArrayBase(val, args)
}
/**
 * 普通数组默认空类型，返回空数组
 * @param {Object} val 必填，模型需要的对象值
 */
Model.ArrayDefault = function (val) {
  return new ArrayBase(val, { default: [] })
}

/**
 * Modal的基类
 */
export class Base {
  constructor(val, args) {
    if (typeof args == "undefined") args = {}
    else if (!(args instanceof Object && args.constructor.name == "Object"))
      args = { default: args }
    this.val = val
    this.args = args
    this.defaultFalse = [undefined, null, ""]
    Object.defineProperty(this, "value", {
      configurable: true,
      enumerable: true,
      get: () => this.getValue(),
      set: () => {
        throw new Error("value can not be update")
      }
    })
  }

  getValue() {
    return this.defaultFalse.indexOf(this.val) == -1 ? this.setFun() : this.args.default
  }

  setFun() {
    return this.val
  }
}

class UndefinedBase extends Base {
  constructor() {
    super()
  }
}

/**
 * array类型
 * args.includeEmpty 为空数组时是否要使用默认值
 */
class ArrayBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  valid() {
    if (!(this.val instanceof Array))
      throw new Error(
        `params of val must be Array, but get ${
          this.val.constructor ? this.val.constructor.name : this.val
          }.`
      )
  }

  setFun() {
    this.valid()
    if (this.args.includeEmpty && this.val.length == 0) return this.args.default
    return this.val
  }
}

/**
 * 模型的array类型
 * args.includeEmpty 为空数组时是否要使用默认值
 */
class ModelArray extends ArrayBase {
  constructor(modelName, val, args) {
    super(val, args)
    this.modelName = modelName
  }

  setFun() {
    this.valid()
    if (this.args.includeEmpty && this.val.length == 0) return this.args.default
    return this.val.map(item => new this.modelName(item))
  }
}

/**
 * 字符串类型
 */
class StringBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  setFun() {
    return String(this.val)
  }
}

/**
 * 数值类型
 */
class NumberBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  setFun() {
    return Number(this.val)
  }
}

/**
 * 整数类型
 */
class IntegerBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  setFun() {
    return parseInt(this.val)
  }
}

/**
 * 浮点类型
 */
class FloatBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  setFun() {
    return parseFloat(this.val)
  }
}

/**
 * 布尔类型
 */
class BooleanBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  setFun() {
    let value = this.val == "false" ? false : this.val
    return Boolean(value)
  }
}

/**
 * 时间类型
 */
class MomentBase extends Base {
  constructor(val, args) {
    super(val, args)
  }

  setFun() {
    this.args.format = this.args.format || Model.MomentFormat
    if (moment.isMoment(this.val)) return this.val
    return moment(this.val, this.args.format)
  }
}

export const Models = {
  use: Model.use,
  Create: Model.Create,
  Uuid: Model.Uuid,
  UuidEmpty: Model.UuidEmpty,
  UuidDefault: Model.UuidDefault,
  String: Model.String,
  StringDefault: Model.StringDefault,
  Number: Model.Number,
  NumberNaN: Model.NumberNaN,
  NumberDefault: Model.NumberDefault,
  Integer: Model.Integer,
  IntegerNaN: Model.IntegerNaN,
  IntegerDefault: Model.IntegerDefault,
  Float: Model.Float,
  FloatNaN: Model.FloatNaN,
  FloatDefault: Model.FloatDefault,
  Boolean: Model.Boolean,
  BooleanDefault: Model.BooleanDefault,
  Moment: Model.Moment,
  MomentDefault: Model.MomentDefault,
  ModelArray: Model.ModelArray,
  ModelArrayDefault: Model.ModelArrayDefault,
  Array: Model.Array,
  ArrayDefault: Model.ArrayDefault
}