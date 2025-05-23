
// import { model, Schema } from "mongoose"
// import aggregatePaginate from "mongoose-aggregate-paginate-v2"

// const submissionSchema = new Schema({
//   title: String,
//   abstract: String,
//   references: String,
//   keywords: [String],
//   submittedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
//   journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
//   submissionDate: { type: Date, default: Date.now },
//   status: {
//     type: String,
//     enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions", "major_revisions"],
//     default: "submitted",
//   },
//   contributor: [
//     {
//       fullName: {
//         type: String,
//       },
//       email: {
//         type: String,
//       },
//       affiliation: {
//         type: String,
//       },
//       bioStatement: { 
//         type: String,
//         //  (e.g., department and rank)
//       },
//     }
//   ],
//   statusHistory: [
//     {
//       status: {
//         type: String,
//         enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions", "major_revisions"],
//       },
//       date: { type: Date, default: Date.now },
//       changedBy: { type: Schema.Types.ObjectId, ref: "users" }
//     }
//   ],
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

// // This function needs to be called when updating the status
// // It requires passing the user ID who made the change
// submissionSchema.methods.updateStatus = function(newStatus, changedById) {
//   this.status = newStatus;
//   this.statusHistory.push({
//     status: newStatus,
//     date: new Date(),
//     changedBy: changedById
//   });
//   return this.save();
// };

// // Pre-save middleware as a fallback to ensure history is tracked even if updateStatus method isn't used
// submissionSchema.pre('save', function(next) {
//   // Check if status is modified
//   if (this.isModified('status')) {
//     // Only add to history if the last entry doesn't match current status
//     const lastEntry = this.statusHistory.length > 0 ? 
//       this.statusHistory[this.statusHistory.length - 1] : null;
    
//     if (!lastEntry || lastEntry.status !== this.status) {
//       this.statusHistory.push({
//         status: this.status,
//         date: new Date(),
//         // changedBy will be null if not explicitly provided
//       });
//     }
//   }
//   next();
// });

// submissionSchema.plugin(aggregatePaginate)
// const Submission = model("Submission", submissionSchema)
// export default Submission

import { model, Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const submissionSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  abstract: { 
    type: String, 
    required: true 
  },
  references: { 
    type: String,  
  },
  keywords: { 
    type: [String], 
    default: [] 
  },
  submittedBy: { 
    type: Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
  journalId: { 
    type: Schema.Types.ObjectId, 
    ref: "Journal", 
    required: true 
  },
  submissionDate: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions", "major_revisions"],
    default: "submitted",
  },
  // Changed from 'contributor' to 'contributors' to match frontend
  contributors: [
    {
      fullName: { 
        type: String, 
        required: true 
      },
      email: { 
        type: String, 
        required: true,
        validate: {
          validator: function(v) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
          },
          message: props => `${props.value} is not a valid email address!`
        }
      },
      affiliation: { 
        type: String, 
        required: true 
      },
      bioStatement: { 
        type: String, 
        required: true 
      },
    }
  ],
  hasContributors: {
    type: Boolean,
    default: false
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["submitted", "under_review", "accepted", "rejected", "minor_revisions", "major_revisions"],
        required: true
      },
      date: { 
        type: Date, 
        default: Date.now 
      },
      changedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "users" 
      },
      comment: {
        type: String,
        default: ""
      }
    }
  ],
  manuscriptFile: { 
    type: String, 
    required: true 
  },
  fullManuscriptUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewerAssignments: [
    {
      reviewer: { 
        type: Schema.Types.ObjectId, 
        ref: "users" 
      },
      comment: { 
        type: String, 
        default: "" 
      },
      commentedAt: { 
        type: Date 
      },
      recommendation: {
        type: String,
        enum: ["accept", "minor_revisions", "major_revisions", "reject", null],
        default: null
      }
    }
  ]
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting the submitting author's details
submissionSchema.virtual('author', {
  ref: 'users',
  localField: 'submittedBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting journal details
submissionSchema.virtual('journal', {
  ref: 'Journal',
  localField: 'journalId',
  foreignField: '_id',
  justOne: true
});

// Status update method
submissionSchema.methods.updateStatus = function(newStatus, changedById, comment = "") {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedById,
    comment
  });
  return this.save();
};

// Pre-save hook for status history
submissionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const lastEntry = this.statusHistory.slice(-1)[0];
    if (!lastEntry || lastEntry.status !== this.status) {
      this.statusHistory.push({
        status: this.status,
        date: new Date()
      });
    }
  }
  
  // Set hasContributors based on contributors array
  if (this.isModified('contributors')) {
    this.hasContributors = this.contributors && this.contributors.length > 0;
  }
  
  next();
});

// Indexes for better query performance
submissionSchema.index({ title: 'text', abstract: 'text' });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedBy: 1 });
submissionSchema.index({ journalId: 1 });
submissionSchema.index({ createdAt: -1 });

submissionSchema.plugin(aggregatePaginate);

const Submission = model("Submission", submissionSchema);
export default Submission;