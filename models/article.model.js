import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const articleSchema = new Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  keywords: [{ type: String }],
  issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
  submissionId: { type: Schema.Types.ObjectId, ref: "Submission" },
  doi: { type: String },
  pages: { type: String },
  publicationDate: { type: Date },
  manuscriptFile: { type: String, required: true },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

articleSchema.plugin(aggregatePaginate)
const Article = model("Article", articleSchema)
export default Article
