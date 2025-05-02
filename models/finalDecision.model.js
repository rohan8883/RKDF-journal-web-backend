import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const finalDecisionSchema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
  decision: {
    type: String,
    enum: ["accept", "reject", "revise"],
    required: true,
  },
  decisionDate: { type: Date, default: Date.now },
  decisionBy: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now },
})

finalDecisionSchema.plugin(aggregatePaginate)
const FinalDecision = model("FinalDecision", finalDecisionSchema)
export default FinalDecision
