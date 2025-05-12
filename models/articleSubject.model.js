import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const articleSubjectSchema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  createdAt: { type: Date, default: Date.now },
})

articleSubjectSchema.plugin(aggregatePaginate)
const ArticleSubject = model("Article_subject", articleSubjectSchema)
export default ArticleSubject
