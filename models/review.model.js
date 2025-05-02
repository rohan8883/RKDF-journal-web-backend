import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const reviewSchema = new Schema({
  reviewRoundId: { type: Schema.Types.ObjectId, ref: "ReviewRound", required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  submissionId: { type: Schema.Types.ObjectId, ref: "Submission", required: true },
  recommendation: {
    type: String,
    enum: ["accept", "minor_revisions", "major_revisions", "reject"],
  },
  comments: { type: String },
  confidentialComments: { type: String },
  attachments: [{ type: String }],
  submissionDate: { type: Date },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["pending", "completed", "declined", "overdue"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
})

reviewSchema.plugin(aggregatePaginate)
const Review = model("Review", reviewSchema)
export default Review
