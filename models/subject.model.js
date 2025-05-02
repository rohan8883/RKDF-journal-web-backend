import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const subjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  parentSubject: { type: Schema.Types.ObjectId, ref: "Subject" },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

subjectSchema.plugin(aggregatePaginate)
const Subject = model("Subject", subjectSchema)
export default Subject
