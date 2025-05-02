import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const journalSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  issn: { type: String },
  publisher: { type: String },
  foundedYear: { type: Number },
  website: { type: String },
  coverImage: { type: String },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

journalSchema.plugin(aggregatePaginate)
const Journal = model("Journal", journalSchema)
export default Journal
