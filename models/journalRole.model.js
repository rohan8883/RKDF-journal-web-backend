import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const journalRoleSchema = new Schema({
  journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
  personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

journalRoleSchema.plugin(aggregatePaginate)
const JournalRole = model("JournalRole", journalRoleSchema)
export default JournalRole
