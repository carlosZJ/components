import Model from "../lib"

class testModel extends Model {
  id = Model.UuidDefault(this.args.id)
  name = Model.String(this.args.nickName, "-")
  children = Model.ModelArrayDefault(testModel, this.args.child)
}

const testModel2 = Model.use((args) => ({
  id: Model.UuidDefault(args.id),
  name: Model.String(args.nickName, "-"),
  other: args,
  children: Model.ModelArrayDefault(testModel2, args.child)
}))

const serverData = {
  nickName: "Carlos", child: [
    { nickName: "Json", child: [{ nickName: "Merry" }, { nickName: "Ame" }] },
    { nickName: "Dear" }
  ]
}

const modelObj = new testModel(serverData)

const modelObj2 = new testModel2(serverData)

console.log(JSON.stringify(modelObj._toJS()))
console.log(JSON.stringify(modelObj2._toJS()))

