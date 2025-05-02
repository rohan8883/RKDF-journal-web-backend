import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const issueSchema = new Schema({
  journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
  volume: { type: Number, required: true },
  issueNumber: { type: Number, required: true },
  title: { type: String, required: true },
  publicationDate: { type: Date, required: true },
  description: { type: String },
  coverImage: { type: String },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

issueSchema.plugin(aggregatePaginate)
const Issue = model("Issue", issueSchema)
export default Issue
