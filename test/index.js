"use strict";

var _lib = require("../lib");

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var testModel = function (_Model) {
  _inherits(testModel, _Model);

  function testModel() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, testModel);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = testModel.__proto__ || Object.getPrototypeOf(testModel)).call.apply(_ref, [this].concat(args))), _this), _this.id = _lib.Models.UuidDefault(_this.args.id), _this.name = _lib.Models.String(_this.args.nickName, "-"), _this.children = _lib.Models.ModelArrayDefault(testModel, _this.args.child), _temp), _possibleConstructorReturn(_this, _ret);
  }

  return testModel;
}(_lib2.default);

var testModel2 = _lib.Models.use(function (args) {
  return {
    id: _lib.Models.UuidDefault(args.id),
    name: _lib.Models.String(args.nickName, "-"),
    other: args,
    children: _lib.Models.ModelArrayDefault(testModel2, args.child)
  };
});

var serverData = {
  nickName: "Carlos", child: [{ nickName: "Json", child: [{ nickName: "Merry" }, { nickName: "Ame" }] }, { nickName: "Dear" }]
};

var modelObj = new testModel(serverData);

var modelObj2 = new testModel2(serverData);

console.log(JSON.stringify(modelObj._toJS()));
console.log(JSON.stringify(modelObj2._toJS()));