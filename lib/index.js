"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Models = exports.Base = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = Model;

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

require("moment/locale/zh-cn");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_moment2.default.locale("zh-cn");

function convertFun(args) {
  var convert = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var temp = {};
  var convertKeys = Object.keys(convert);
  if (!convertKeys.length) return args;
  Object.keys(args).map(function (key) {
    var convertValue = convert[key];
    var argsValue = args[key];
    if (convertKeys.includes(key) && (typeof convertValue === "undefined" ? "undefined" : _typeof(convertValue)) != "object") {
      temp[convertValue] = argsValue;
    } else if ((typeof convertValue === "undefined" ? "undefined" : _typeof(convertValue)) == "object") {
      if (argsValue instanceof Array) temp[convertValue[0]] = argsValue.map(function (item) {
        return convertFun(item, convertValue[1]);
      });else temp[convertValue[0]] = convertFun(argsValue, convertValue[1]);
    } else {
      temp[key] = argsValue;
    }
  });
  return temp;
}

var ps = ["args", "_toObj", "_toJS"];

/**创建模型方法
 * @param {object} args 入参
 * @param {object} convert 需要转换的key的配置
 *      convert说明：{key: 'convertKey', key: ['convertKey', {key:'convertKey'}]}
 *      key为将被替换的key，convertKey是替换key的名称，
 *      如果key对应的值是Array或Object，那么传入数组第一个为将被替换的key，第二个参数为重复上面说的替换模式
 */
function Model(args, convert) {
  var _args = args ? convertFun(args, convert) : {};
  Object.defineProperty(this, "args", {
    configurable: true,
    enumerable: true,
    get: function get() {
      return _args;
    },
    set: function set() {
      throw new Error("args can not be update");
    }
  });
}

Model.prototype._toObj = function (obj) {
  obj = obj || this;
  var temp = {};
  for (var item in obj) {
    if (ps.indexOf(item) != -1) continue;else if (obj[item] instanceof ModelArray) {
      temp[item] = obj[item].value && obj[item].value.map(function (i) {
        return i._toObj();
      });
    } else if (obj[item] instanceof Base) {
      temp[item] = obj[item].value;
    } else if (obj[item] instanceof Model) {
      temp[item] = obj[item]._toObj();
    } else {
      temp[item] = obj[item];
      console.warn("\"" + item + "\" doesn't use Model type create this field.");
    }
  }
  return temp;
};
Model.prototype._toJS = function (obj) {
  obj = obj || this;
  var temp = {};
  for (var item in obj) {
    if (ps.indexOf(item) != -1) continue;else if (obj[item] instanceof ModelArray) {
      temp[item] = obj[item].value && obj[item].value.map(function (i) {
        return i._toJS();
      });
    } else if (obj[item] instanceof MomentBase) {
      temp[item] = obj[item].value.isValid() ? obj[item].value.format(obj[item].args.format) : undefined;
    } else if (obj[item] instanceof Base) {
      temp[item] = obj[item].value;
    } else if (obj[item] instanceof Model) {
      temp[item] = obj[item]._toJS();
    } else {
      temp[item] = obj[item];
      console.warn("\"" + item + "\" doesn't use Model type create this field.");
    }
  }
  return temp;
};

Model.use = function (fun) {
  var factory = function factory(args) {
    var temp = fun(args);
    for (var key in temp) {
      this[key] = temp[key];
    }
  };
  factory.prototype = new Model();
  return factory;
};

Model.dispatch = {
  toJS: function toJS(modelName, data) {
    if (!(modelName instanceof Model)) throw new Error("modelName is not type of 'Model'.");
    if (data instanceof Array) {
      return data.map(function (item) {
        return new modelName(item)._toJS();
      });
    }
    return new modelName(data)._toJS();
  },
  toObj: function toObj(modelName, data) {
    if (!(modelName instanceof Model)) throw new Error("modelName is not type of 'Model'.");
    if (data instanceof Array) {
      return data.map(function (item) {
        return new modelName(item)._toObj();
      });
    }
    return new modelName(data)._toObj();
  }
};

Model.Create = function (modalName, val) {
  return val ? new modalName(val) : new UndefinedBase();
};
/**
 * uuid类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Uuid = function (val, args) {
  return new StringBase(val, args);
};
/**
 * uuid默认空类型，返回空字符串
 * @param {String/Int} val 必填，值
 */
Model.UuidEmpty = function (val) {
  return new StringBase(val, { default: "" });
};
/**
 * uuid默认值类型，返回uuid字符串
 * @param {String/Int} val 必填，值
 */
Model.UuidDefault = function (val) {
  return new StringBase(val, { default: _util2.default.uuid() });
};

/**
 * 字符串类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.String = function (val, args) {
  return new StringBase(val, args);
};
/**
 * 字符串默认空类型，返回的是空字符串
 * @param {String/Int} val 必填，值
 */
Model.StringDefault = function (val) {
  return new StringBase(val, { default: "" });
};

/**
 * 数值类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Number = function (val, args) {
  return new NumberBase(val, args);
};
/**
 * 数值NaN类型，返回NaN
 * @param {String/Int} val 必填，值
 */
Model.NumberNaN = function (val) {
  return new NumberBase(val, { default: NaN });
};
/**
 * 数值默认空类型，返回0
 * @param {String/Int} val 必填，值
 */
Model.NumberDefault = function (val) {
  return new NumberBase(val, { default: 0 });
};

/**
 * 整数类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Integer = function (val, args) {
  return new IntegerBase(val, args);
};
/**
 * 整数NaN类型，返回NaN
 * @param {String/Int} val 必填，值
 */
Model.IntegerNaN = function (val) {
  return new IntegerBase(val, { default: NaN });
};
/**
 * 整数默认空类型，返回0
 * @param {String/Int} val 必填，值
 */
Model.IntegerDefault = function (val) {
  return new IntegerBase(val, { default: 0 });
};

/**
 * 浮点类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Float = function (val, args) {
  return new FloatBase(val, args);
};
/**
 * 浮点默认NaN类型，返回NaN
 * @param {String/Int} val 必填，值
 */
Model.FloatNaN = function (val) {
  return new FloatBase(val, { default: NaN });
};
/**
 * 浮点默认空类型，返回0
 * @param {String/Int} val 必填，值
 */
Model.FloatDefault = function (val) {
  return new FloatBase(val, { default: 0 });
};

/**
 * 布尔类型
 * @param {String/Int} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Boolean = function (val, args) {
  return new BooleanBase(val, args);
};
/**
 * 布尔默认空类型，返回false
 * @param {String/Int} val 必填，值
 */
Model.BooleanDefault = function (val) {
  return new BooleanBase(val, { default: false });
};

// moment类型可以通过这个修改全局的默认转换配置
Model.MomentFormat = "YYYY-MM-DD HH:mm:ss";
/**
 * 时间类型
 * @param {String} val 必填，值
 * @param {Object} args 可选，配置参数
 */
Model.Moment = function (val, args) {
  return new MomentBase(val, args);
};
/**
 * 时间默认类型，返回当前的moment对象
 * @param {String} val 必填，值
 */
Model.MomentDefault = function (val) {
  return new MomentBase(val, { default: (0, _moment2.default)() });
};

/**
 * 模型数组类型
 * @param {String} modelName 必填，模型名称
 * @param {Object} val 必填，模型需要的对象值
 * @param {Object} args 选填，配置
 */
Model.ModelArray = function (modelName, val, args) {
  return new ModelArray(modelName, val, args);
};
/**
 * 模型数组默认空类型，返回空数组
 * @param {String} modelName 必填，模型名称
 * @param {Object} val 必填，模型需要的对象值
 */
Model.ModelArrayDefault = function (modelName, val) {
  return new ModelArray(modelName, val, { default: [] });
};

/**
 * 普通数组类型
 * @param {Object} val 必填，模型需要的对象值
 * @param {Object} args 选填，配置
 */
Model.Array = function (val, args) {
  return new ArrayBase(val, args);
};
/**
 * 普通数组默认空类型，返回空数组
 * @param {Object} val 必填，模型需要的对象值
 */
Model.ArrayDefault = function (val) {
  return new ArrayBase(val, { default: [] });
};

/**
 * Modal的基类
 */

var Base = exports.Base = function () {
  function Base(val, args) {
    var _this = this;

    _classCallCheck(this, Base);

    if (typeof args == "undefined") args = {};else if (!(args instanceof Object && args.constructor.name == "Object")) args = { default: args };
    this.val = val;
    this.args = args;
    this.defaultFalse = [undefined, null, ""];
    Object.defineProperty(this, "value", {
      configurable: true,
      enumerable: true,
      get: function get() {
        return _this.getValue();
      },
      set: function set() {
        throw new Error("value can not be update");
      }
    });
  }

  _createClass(Base, [{
    key: "getValue",
    value: function getValue() {
      return this.defaultFalse.indexOf(this.val) == -1 ? this.setFun() : this.args.default;
    }
  }, {
    key: "setFun",
    value: function setFun() {
      return this.val;
    }
  }]);

  return Base;
}();

var UndefinedBase = function (_Base) {
  _inherits(UndefinedBase, _Base);

  function UndefinedBase() {
    _classCallCheck(this, UndefinedBase);

    return _possibleConstructorReturn(this, (UndefinedBase.__proto__ || Object.getPrototypeOf(UndefinedBase)).call(this));
  }

  return UndefinedBase;
}(Base);

/**
 * array类型
 * args.includeEmpty 为空数组时是否要使用默认值
 */


var ArrayBase = function (_Base2) {
  _inherits(ArrayBase, _Base2);

  function ArrayBase(val, args) {
    _classCallCheck(this, ArrayBase);

    return _possibleConstructorReturn(this, (ArrayBase.__proto__ || Object.getPrototypeOf(ArrayBase)).call(this, val, args));
  }

  _createClass(ArrayBase, [{
    key: "valid",
    value: function valid() {
      if (!(this.val instanceof Array)) throw new Error("params of val must be Array, but get " + (this.val.constructor ? this.val.constructor.name : this.val) + ".");
    }
  }, {
    key: "setFun",
    value: function setFun() {
      this.valid();
      if (this.args.includeEmpty && this.val.length == 0) return this.args.default;
      return this.val;
    }
  }]);

  return ArrayBase;
}(Base);

/**
 * 模型的array类型
 * args.includeEmpty 为空数组时是否要使用默认值
 */


var ModelArray = function (_ArrayBase) {
  _inherits(ModelArray, _ArrayBase);

  function ModelArray(modelName, val, args) {
    _classCallCheck(this, ModelArray);

    var _this4 = _possibleConstructorReturn(this, (ModelArray.__proto__ || Object.getPrototypeOf(ModelArray)).call(this, val, args));

    _this4.modelName = modelName;
    return _this4;
  }

  _createClass(ModelArray, [{
    key: "setFun",
    value: function setFun() {
      var _this5 = this;

      this.valid();
      if (this.args.includeEmpty && this.val.length == 0) return this.args.default;
      return this.val.map(function (item) {
        return new _this5.modelName(item);
      });
    }
  }]);

  return ModelArray;
}(ArrayBase);

/**
 * 字符串类型
 */


var StringBase = function (_Base3) {
  _inherits(StringBase, _Base3);

  function StringBase(val, args) {
    _classCallCheck(this, StringBase);

    return _possibleConstructorReturn(this, (StringBase.__proto__ || Object.getPrototypeOf(StringBase)).call(this, val, args));
  }

  _createClass(StringBase, [{
    key: "setFun",
    value: function setFun() {
      return String(this.val);
    }
  }]);

  return StringBase;
}(Base);

/**
 * 数值类型
 */


var NumberBase = function (_Base4) {
  _inherits(NumberBase, _Base4);

  function NumberBase(val, args) {
    _classCallCheck(this, NumberBase);

    return _possibleConstructorReturn(this, (NumberBase.__proto__ || Object.getPrototypeOf(NumberBase)).call(this, val, args));
  }

  _createClass(NumberBase, [{
    key: "setFun",
    value: function setFun() {
      return Number(this.val);
    }
  }]);

  return NumberBase;
}(Base);

/**
 * 整数类型
 */


var IntegerBase = function (_Base5) {
  _inherits(IntegerBase, _Base5);

  function IntegerBase(val, args) {
    _classCallCheck(this, IntegerBase);

    return _possibleConstructorReturn(this, (IntegerBase.__proto__ || Object.getPrototypeOf(IntegerBase)).call(this, val, args));
  }

  _createClass(IntegerBase, [{
    key: "setFun",
    value: function setFun() {
      return parseInt(this.val);
    }
  }]);

  return IntegerBase;
}(Base);

/**
 * 浮点类型
 */


var FloatBase = function (_Base6) {
  _inherits(FloatBase, _Base6);

  function FloatBase(val, args) {
    _classCallCheck(this, FloatBase);

    return _possibleConstructorReturn(this, (FloatBase.__proto__ || Object.getPrototypeOf(FloatBase)).call(this, val, args));
  }

  _createClass(FloatBase, [{
    key: "setFun",
    value: function setFun() {
      return parseFloat(this.val);
    }
  }]);

  return FloatBase;
}(Base);

/**
 * 布尔类型
 */


var BooleanBase = function (_Base7) {
  _inherits(BooleanBase, _Base7);

  function BooleanBase(val, args) {
    _classCallCheck(this, BooleanBase);

    return _possibleConstructorReturn(this, (BooleanBase.__proto__ || Object.getPrototypeOf(BooleanBase)).call(this, val, args));
  }

  _createClass(BooleanBase, [{
    key: "setFun",
    value: function setFun() {
      var value = this.val == "false" ? false : this.val;
      return Boolean(value);
    }
  }]);

  return BooleanBase;
}(Base);

/**
 * 时间类型
 */


var MomentBase = function (_Base8) {
  _inherits(MomentBase, _Base8);

  function MomentBase(val, args) {
    _classCallCheck(this, MomentBase);

    return _possibleConstructorReturn(this, (MomentBase.__proto__ || Object.getPrototypeOf(MomentBase)).call(this, val, args));
  }

  _createClass(MomentBase, [{
    key: "setFun",
    value: function setFun() {
      this.args.format = this.args.format || Model.MomentFormat;
      if (_moment2.default.isMoment(this.val)) return this.val;
      return (0, _moment2.default)(this.val, this.args.format);
    }
  }]);

  return MomentBase;
}(Base);

var Models = exports.Models = {
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
};