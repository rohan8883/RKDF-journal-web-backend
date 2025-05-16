import Submission from "../models/submission.model.js"
import Person from "../models/user.model.js"
import Journal from "../models/journal.model.js"
import mongoose from 'mongoose';
import { uploadFile } from '../middleware/_multer.js';
/**
 * @route   POST /api/submissions
 * @desc    Create a new submission
 * @body    { title, abstract, keywords, submittedBy, journalId, manuscriptFile, coverLetter }
 * @returns Submission object
 */
// export async function CreateSubmission(req, res) {
//   try {
//     const { title, abstract, keywords, journalId, manuscriptFile, coverLetter } = req.body
//     const submittedBy = req.user._id // 🟢 Get user ID from token

//     if (!title || !abstract || !journalId || !manuscriptFile) {
//       return res.status(400).json({ success: false, message: "Missing required fields" })
//     }

//     // Verify person exists (optional if user is already authenticated)
//     const personExists = await Person.findById(submittedBy)
//     if (!personExists) {
//       return res.status(404).json({ success: false, message: "Person not found" })
//     }

//     // Verify journal exists
//     const journalExists = await Journal.findById(journalId)
//     if (!journalExists) {
//       return res.status(404).json({ success: false, message: "Journal not found" })
//     }

//     const submission = new Submission({
//       title,
//       abstract,
//       keywords,
//       submittedBy,
//       journalId,
//       manuscriptFile,
//       coverLetter,
//     })

//     await submission.save()
//     res.status(201).json({
//       success: true,
//       message: "Submission created successfully",
//       data: submission,
//     })
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message })
//   }
// }
export async function CreateSubmission(req, res) {
  const upload = await uploadFile('./uploads/manuscripts');
  try {
    await upload.single('manuscriptFile')(req, res, async (err) => {

      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }


      const { title, abstract, keywords, journalId } = req.body;
      const submittedBy = req.body.submittedBy || req.user._id;

      // Validate required fields
      if (!title || !abstract || !journalId || !req.file) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // Check if person exists
      const personExists = await Person.findById(submittedBy);
      if (!personExists) {
        return res.status(404).json({ success: false, message: "Person not found" });
      }

      // Check if journal exists
      const journalExists = await Journal.findById(journalId);
      if (!journalExists) {
        return res.status(404).json({ success: false, message: "Journal not found" });
      }

      // Create submission
      const submission = new Submission({
        title,
        abstract,
        keywords,
        submittedBy,
        journalId,
        manuscriptFile: req.file.filename,
        fullManuscriptUrl: `${process.env.BACKEND_URL}/${req.file.filename}`
      });

      await submission.save();

      return res.status(201).json({
        success: true,
        message: "Submission created successfully",
        data: submission
      });

    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const AssignReviewer = async (req, res) => {
  const { submissionId, reviewerId } = req.body;

  if (!submissionId || !reviewerId) {
    return res.status(400).json({
      success: false,
      message: "submissionId and reviewerId are required",
    });
  }

  try {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Check if the reviewer is already assigned
    const alreadyAssigned = submission.reviewerAssignments.some(
      (assignment) => assignment.reviewer.toString() === reviewerId
    );

    if (alreadyAssigned) {
      return res.status(200).json({
        success: false,
        message: "Reviewer is already assigned to this submission.",
      });
    }

    // Push new reviewer assignment
    submission.reviewerAssignments.push({
      reviewer: reviewerId,
      comment: "",
      commentedAt: null,
    });

    // Optionally update status to under_review if this is the first reviewer
    if (submission.status === "submitted") {
      submission.status = "under_review";
    }

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Reviewer assigned successfully.",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const UpdateReviewerAssignment = async (req, res) => {
  const { submissionId, reviewerId, comment } = req.body;

  if (!submissionId || !reviewerId || !comment) {
    return res.status(400).json({
      success: false,
      message: "submissionId, reviewerId, and comment are required",
    });
  }

  try {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Find the reviewer assignment
    const assignment = submission.reviewerAssignments.find(
      (assignment) => assignment.reviewer.toString() === reviewerId
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Reviewer assignment not found.",
      });
    }

    // Update the assignment
    assignment.comment = comment;
    assignment.commentedAt = new Date();

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Reviewer assignment updated successfully.",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteReviewerAssignment = async (req, res) => {
  const { submissionId, reviewerId } = req.body;

  if (!submissionId || !reviewerId) {
    return res.status(400).json({
      success: false,
      message: "submissionId and reviewerId are required",
    });
  }

  try {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // Find the index of the reviewer assignment
    const assignmentIndex = submission.reviewerAssignments.findIndex(
      (assignment) => assignment.reviewer.toString() === reviewerId
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Reviewer assignment not found.",
      });
    }

    // Remove the assignment
    submission.reviewerAssignments.splice(assignmentIndex, 1);

    // If no reviewers left, change status back to submitted
    if (submission.reviewerAssignments.length === 0 && submission.status === "under_review") {
      submission.status = "submitted";
    }

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Reviewer assignment deleted successfully.",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @route   GET /api/submissions
 * @desc    Get all submissions with pagination and search
 * @query   { page, limit, q, journalId, submittedBy, status }
 * @returns Paginated submissions
 */
// export const GetAllSubmissions = async (req, res) => {
//   const { page = 1, limit = 10, q, journalId, submittedBy, status } = req.query
//   const options = { page, limit }

//   try {
//     const query = [
//       { $sort: { submissionDate: -1 } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "submittedBy",
//           foreignField: "_id",
//           as: "author",
//         },
//       },
//       { $unwind: "$author" },
//       {
//         $lookup: {
//           from: "journals",
//           localField: "journalId",
//           foreignField: "_id",
//           as: "journal",
//         },
//       },
//       { $unwind: "$journal" },
//       { $project: { __v: 0, "author.__v": 0, "journal.__v": 0 } },
//     ]

//     const matchConditions = {}

//     if (journalId) {
//       matchConditions.journalId = journalId
//     }

//     if (submittedBy) {
//       matchConditions.submittedBy = submittedBy
//     }

//     if (status) {
//       matchConditions.status = status
//     }

//     if (Object.keys(matchConditions).length > 0) {
//       query.push({ $match: matchConditions })
//     }

//     if (q) {
//       query.push({
//         $match: {
//           $or: [
//             { title: { $regex: new RegExp(q, "i") } },
//             { abstract: { $regex: new RegExp(q, "i") } },
//             { "author.firstName": { $regex: new RegExp(q, "i") } },
//             { "author.lastName": { $regex: new RegExp(q, "i") } },
//             { "journal.title": { $regex: new RegExp(q, "i") } },
//           ],
//         },
//       })
//     }

//     const aggregate = Submission.aggregate(query)
//     const submissions = await Submission.aggregatePaginate(aggregate, options)

//     if (!submissions.totalDocs) {
//       return res.status(404).json({ success: false, message: "No records found!" })
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Submissions fetched successfully.",
//       data: submissions,
//     })
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message })
//   }
// }

// export const GetAllSubmissions = async (req, res) => {
//   const { page = 1, limit = 10, q, journalId, submittedBy, status } = req.query;
//   const options = { page, limit };
//   const loggedInUserId = req.user._id;

//   try {
//     const query = [
//       { $sort: { submissionDate: -1 } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "submittedBy",
//           foreignField: "_id",
//           as: "author",
//         },
//       },
//       { $unwind: "$author" },
//       {
//         $lookup: {
//           from: "journals",
//           localField: "journalId",
//           foreignField: "_id",
//           as: "journal",
//         },
//       },
//       { $unwind: "$journal" },
//       { $project: { __v: 0, "author.__v": 0, "journal.__v": 0 } },
//     ];

//     const matchConditions = {};

//     if (journalId) {
//       matchConditions.journalId = journalId;
//     }

//     if (status) {
//       matchConditions.status = status;
//     }

//     // Ensure only show submissions made by the logged-in user
//     matchConditions.submittedBy = new mongoose.Types.ObjectId(loggedInUserId);

//     query.push({ $match: matchConditions });

//     if (q) {
//       query.push({
//         $match: {
//           $or: [
//             { title: { $regex: new RegExp(q, "i") } },
//             { abstract: { $regex: new RegExp(q, "i") } },
//             { "author.firstName": { $regex: new RegExp(q, "i") } },
//             { "author.lastName": { $regex: new RegExp(q, "i") } },
//             { "journal.title": { $regex: new RegExp(q, "i") } },
//           ],
//         },
//       });
//     }

//     const aggregate = Submission.aggregate(query);
//     const submissions = await Submission.aggregatePaginate(aggregate, options);

//     if (!submissions.totalDocs) {
//       return res.status(404).json({ success: false, message: "No records found!" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Submissions fetched successfully.",
//       data: submissions,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const GetAllSubmissions = async (req, res) => {
//   const { page = 1, limit = 10, q, journalId, status } = req.query;
//   const options = { page, limit };
//   const loggedInUserId = req.user._id;
//   const loggedInUserRoleId = req.user.roleId;  
//   const adminRoleId = "67193213e0e76d08635e31fb"; 

//   try {
//     const query = [
//       { $sort: { submissionDate: -1 } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "submittedBy",
//           foreignField: "_id",
//           as: "author",
//         },
//       },
//       { $unwind: "$author" },
//       {
//         $lookup: {
//           from: "journals",
//           localField: "journalId",
//           foreignField: "_id",
//           as: "journal",
//         },
//       },
//       { $unwind: "$journal" },
//       { $project: { __v: 0, "author.__v": 0, "journal.__v": 0 } },
//     ];

//     const matchConditions = {};

//     if (journalId) {
//       matchConditions.journalId = new mongoose.Types.ObjectId(journalId);
//     }

//     if (status) {
//       matchConditions.status = status;
//     }

//     // If the user is NOT admin, limit to their own submissions
//     if (loggedInUserRoleId !== adminRoleId) {
//       matchConditions.submittedBy = new mongoose.Types.ObjectId(loggedInUserId);
//     }

//     query.push({ $match: matchConditions });

//     if (q) {
//       query.push({
//         $match: {
//           $or: [
//             { title: { $regex: new RegExp(q, "i") } },
//             { abstract: { $regex: new RegExp(q, "i") } },
//             { "author.firstName": { $regex: new RegExp(q, "i") } },
//             { "author.lastName": { $regex: new RegExp(q, "i") } },
//             { "journal.title": { $regex: new RegExp(q, "i") } },
//           ],
//         },
//       });
//     }

//     const aggregate = Submission.aggregate(query);
//     const submissions = await Submission.aggregatePaginate(aggregate, options);

//     if (!submissions.totalDocs) {
//       return res.status(404).json({ success: false, message: "No records found!" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Submissions fetched successfully.",
//       data: submissions,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };


export const GetAllSubmissions = async (req, res) => {
  const { page = 1, limit = 10, q, journalId, status } = req.query;
  const options = { page, limit };
  const loggedInUserId = req.user._id;
  const loggedInUserRoleId = req.user.roleId;
  const adminRoleId = "67193213e0e76d08635e31fb";

  try {
    const matchConditions = {};

    if (journalId) {
      matchConditions.journalId = new mongoose.Types.ObjectId(journalId);
    }

    if (status) {
      matchConditions.status = status;
    }

    // Base match for non-admin users
    if (loggedInUserRoleId !== adminRoleId) {
      matchConditions.$or = [
        { submittedBy: new mongoose.Types.ObjectId(loggedInUserId) },
        { "reviewerAssignments.reviewer": new mongoose.Types.ObjectId(loggedInUserId) }
      ];
    }

    const query = [
      { $match: matchConditions },
      { $sort: { submissionDate: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "submittedBy",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "journals",
          localField: "journalId",
          foreignField: "_id",
          as: "journal",
        },
      },
      { $unwind: "$journal" },
      { $project: { __v: 0, "author.__v": 0, "journal.__v": 0 } },
    ];

    if (q) {
      query.push({
        $match: {
          $or: [
            { title: { $regex: new RegExp(q, "i") } },
            { abstract: { $regex: new RegExp(q, "i") } },
            { "author.fullName": { $regex: new RegExp(q, "i") } },
            { "journal.title": { $regex: new RegExp(q, "i") } },
          ],
        },
      });
    }

    const aggregate = Submission.aggregate(query);
    const submissions = await Submission.aggregatePaginate(aggregate, options);

    if (!submissions.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully.",
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



/**
 * @route   GET /api/submissions/:id
 * @desc    Get submission by ID
 * @params  { id }
 * @returns Submission object
 */
// export const GetSubmissionById = async (req, res) => {
//   const { id } = req.params

//   try {
//     const submission = await Submission.findById(id).populate("submittedBy").populate("journalId")

//     if (!submission) {
//       return res.status(404).json({ success: false, message: "Submission not found." })
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Submission fetched successfully.",
//       data: submission,
//     })
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message })
//   }
// }


export const GetSubmissionById = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findById(id)
      .populate("submittedBy")
      .populate("journalId")
      .populate("reviewerAssignments.reviewer"); // <-- populate reviewer data

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Submission fetched successfully.",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @route   PUT /api/submissions/:id
 * @desc    Update submission by ID
 * @params  { id }
 * @body    { title, abstract, keywords, status, manuscriptFile, coverLetter }
 * @returns Success message
 */
export const UpdateSubmission = async (req, res) => {
  const { id } = req.params
  const updateFields = req.body

  try {
    const submission = await Submission.findById(id)
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." })
    }

    // Don't allow changing submittedBy or journalId after creation
    if (updateFields.submittedBy || updateFields.journalId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change submitter or journal after submission is created",
      })
    }

    await Submission.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Submission updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PATCH /api/submissions/:id/status
 * @desc    Update submission status
 * @params  { id }
 * @body    { status }
 * @returns Updated submission
 */
export const UpdateSubmissionStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const submission = await Submission.findById(id)
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." })
    }

    if (!["submitted", "under_review", "accepted", "rejected", "revisions_requested"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" })
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(id, { status }, { new: true })

    return res.status(200).json({
      success: true,
      message: "Submission status updated successfully.",
      data: updatedSubmission,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Delete submission by ID
 * @params  { id }
 * @returns Success message
 */
export const DeleteSubmission = async (req, res) => {
  const { id } = req.params

  try {
    const submission = await Submission.findById(id)
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." })
    }

    await Submission.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Submission deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
