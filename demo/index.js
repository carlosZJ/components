import Model, { Models } from "../lib"

class testModel extends Model {
  id = Models.UuidDefault(this.args.id)
  name = Models.String(this.args.nickName, "-")
  children = Models.ModelArrayDefault(testModel, this.args.child)
}

const testModel2 = Models.use((args) => ({
  id: Models.UuidDefault(args.id),
  name: Models.String(args.nickName, "-"),
  other: args,
  children: Models.ModelArrayDefault(testModel2, args.child)
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

