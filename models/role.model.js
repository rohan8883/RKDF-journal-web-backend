import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const roleSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  permissions: [{ type: String }],
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

roleSchema.plugin(aggregatePaginate)
const Role = model("tbl_roles_mstrs", roleSchema)
export default Role
