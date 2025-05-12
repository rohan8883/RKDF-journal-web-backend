import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const reviewRoundSchema = new Schema({
  submissionId: { type: Schema.Types.ObjectId, ref: "Submission", required: true },
  roundNumber: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["in_progress", "completed", "cancelled"],
    default: "in_progress",
  },
  editorNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
})

reviewRoundSchema.plugin(aggregatePaginate)
const ReviewRound = model("review_round", reviewRoundSchema)
export default ReviewRound
