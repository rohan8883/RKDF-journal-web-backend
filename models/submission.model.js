import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const submissionSchema = new Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  keywords: [{ type: String }],
  submittedBy: { type: Schema.Types.ObjectId, ref: "Person", required: true },
  journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
  submissionDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["submitted", "under_review", "accepted", "rejected", "revisions_requested"],
    default: "submitted",
  },
  manuscriptFile: { type: String, required: true },
  coverLetter: { type: String },
  createdAt: { type: Date, default: Date.now },
})

submissionSchema.plugin(aggregatePaginate)
const Submission = model("Submission", submissionSchema)
export default Submission
