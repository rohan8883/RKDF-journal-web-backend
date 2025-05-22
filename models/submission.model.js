// import { model, Schema } from "mongoose"
// import aggregatePaginate from "mongoose-aggregate-paginate-v2"

// const submissionSchema = new Schema({
//   title: String,
//   abstract: String,
//   keywords: [String],
//   submittedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
//   journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
//   submissionDate: { type: Date, default: Date.now },
//   status: {
//     type: String,
//     enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions","major_revisions"],
//     default: "submitted",
//   },
//   manuscriptFile: String,
//   fullManuscriptUrl: String,
//   // coverLetter: String,
//   createdAt: { type: Date, default: Date.now },

//   // NEW FIELD: assigned reviewers and their comments
//   reviewerAssignments: [
//     {
//       reviewer: { type: Schema.Types.ObjectId, ref: "users" },
//       comment: { type: String, default: "" },
//       commentedAt: { type: Date }
//     }
//   ]
// })

// submissionSchema.plugin(aggregatePaginate)
// const Submission = model("Submission", submissionSchema)
// export default Submission

import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const submissionSchema = new Schema({
  title: String,
  abstract: String,
  references: String,
  keywords: [String],
  submittedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
  journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
  submissionDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions", "major_revisions"],
    default: "submitted",
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions", "major_revisions"],
      },
      date: { type: Date, default: Date.now },
      changedBy: { type: Schema.Types.ObjectId, ref: "users" }
    }
  ],
  manuscriptFile: String,
  fullManuscriptUrl: String,
  // coverLetter: String,
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

// This function needs to be called when updating the status
// It requires passing the user ID who made the change
submissionSchema.methods.updateStatus = function(newStatus, changedById) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    changedBy: changedById
  });
  return this.save();
};

// Pre-save middleware as a fallback to ensure history is tracked even if updateStatus method isn't used
submissionSchema.pre('save', function(next) {
  // Check if status is modified
  if (this.isModified('status')) {
    // Only add to history if the last entry doesn't match current status
    const lastEntry = this.statusHistory.length > 0 ? 
      this.statusHistory[this.statusHistory.length - 1] : null;
    
    if (!lastEntry || lastEntry.status !== this.status) {
      this.statusHistory.push({
        status: this.status,
        date: new Date(),
        // changedBy will be null if not explicitly provided
      });
    }
  }
  next();
});

submissionSchema.plugin(aggregatePaginate)
const Submission = model("Submission", submissionSchema)
export default Submission