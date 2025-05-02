import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const articleAuthorSchema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
  personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  authorOrder: { type: Number, required: true },
  isCorrespondingAuthor: { type: Boolean, default: false },
  contributionStatement: { type: String },
  createdAt: { type: Date, default: Date.now },
})

articleAuthorSchema.plugin(aggregatePaginate)
const ArticleAuthor = model("ArticleAuthor", articleAuthorSchema)
export default ArticleAuthor
