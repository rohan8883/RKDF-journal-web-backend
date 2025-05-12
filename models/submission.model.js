import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const submissionSchema = new Schema({
  title: String,
  abstract: String,
  keywords: [String],
  submittedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
  journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
  submissionDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["submitted", "under_review", "accepted", "rejected", "revisions_requested"],
    default: "submitted",
  },
  manuscriptFile: String,
  coverLetter: String,
  createdAt: { type: Date, default: Date.now },

  // NEW FIELD: assigned reviewers and their comments
  reviewerAssignments: [
    {
      reviewer: { type: Schema.Types.ObjectId, ref: "users" },
      comment: { type: String, default: "" },
      commentedAt: { type: Date }
    }
  ]
})

submissionSchema.plugin(aggregatePaginate)
const Submission = model("Submission", submissionSchema)
export default Submission
