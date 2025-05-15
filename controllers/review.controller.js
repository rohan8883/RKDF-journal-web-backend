import Review from "../models/review.model.js"
import ReviewRound from "../models/reviewRound.model.js"
import Submission from "../models/submission.model.js"
// import User from "../models/user.model.js"

/**
 * @route   POST /api/reviews
 * @desc    Create a new review assignment
 * @body    { reviewRoundId, reviewerId, submissionId, dueDate }
 * @returns Review object
 */
export const createReview = async (req, res) => {
  try {
    const { reviewRoundId, submissionId, recommendation, comments, confidentialComments, status } = req.body
    const reviewerId = req.user._id // Assuming user is authenticated

    if (!reviewRoundId || !submissionId) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify review round exists
    const reviewRound = await ReviewRound.findById(reviewRoundId)
    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found" })
    }

    // Verify submission exists
    const submission = await Submission.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" })
    }

    // Check if reviewer already has a review for this round
    const existingReview = await Review.findOne({ reviewRoundId, reviewerId, submissionId })
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this round",
      })
    }

    const review = new Review({
      reviewRoundId,
      reviewerId,
      submissionId,
      recommendation,
      comments,
      confidentialComments,
      submissionDate: status === "completed" ? new Date() : undefined,
      status: status || "pending",
    })

    await review.save()

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews with pagination and filtering
 * @query   { page, limit, reviewRoundId, reviewerId, submissionId, status }
 * @returns Paginated reviews
 */
// export const getAllReviews = async (req, res) => {
//   const { page = 1, limit = 10, reviewRoundId, reviewerId, submissionId, status } = req.query
//   const options = { page, limit }

//   try {
//     const query = [
//       { $sort: { createdAt: -1 } },
//       {
//         $lookup: {
//           from: "review_rounds",
//           localField: "reviewRoundId",
//           foreignField: "_id",
//           as: "reviewRound",
//         },
//       },
//       { $unwind: "$reviewRound" },
//       {
//         $lookup: {
//           from: "users",
//           localField: "reviewerId",
//           foreignField: "_id",
//           as: "reviewer",
//         },
//       },
//       { $unwind: "$reviewer" },
//       {
//         $lookup: {
//           from: "submissions",
//           localField: "submissionId",
//           foreignField: "_id",
//           as: "submission",
//         },
//       },
//       { $unwind: "$submission" },
//       { $project: { __v: 0, "reviewRound.__v": 0, "reviewer.__v": 0, "reviewer.password": 0, "submission.__v": 0 } },
//     ]

//     if (reviewRoundId) {
//       query.push({
//         $match: { reviewRoundId: { $eq: reviewRoundId } },
//       })
//     }

//     if (reviewerId) {
//       query.push({
//         $match: { reviewerId: { $eq: reviewerId } },
//       })
//     }

//     if (submissionId) {
//       query.push({
//         $match: { submissionId: { $eq: submissionId } },
//       })
//     }

//     if (status) {
//       query.push({
//         $match: { status: { $eq: status } },
//       })
//     }

//     const aggregate = Review.aggregate(query)
//     const reviews = await Review.aggregatePaginate(aggregate, options)

//     if (!reviews.totalDocs) {
//       return res.status(404).json({ success: false, message: "No records found!" })
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Reviews fetched successfully.",
//       data: reviews,
//     })
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message })
//   }
// }
export const getAllReviews = async (req, res) => {
  try {
    const { reviewRoundId } = req.query

    if (!reviewRoundId) {
      return res.status(400).json({ success: false, message: "Review round ID is required" })
    }

    const reviews = await Review.find({ reviewRoundId })
      .populate('reviewerId', 'fullName email')
      .sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      data: reviews,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

 
/**
 * @route   GET /api/reviews/:id
 * @desc    Get review by ID
 * @params  { id }
 * @returns Review object
 */
export const getReviewById = async (req, res) => {
  const { id } = req.params

  try {
    const review = await Review.findById(id)
      .populate("reviewRoundId")
      .populate("reviewerId", "-password")
      .populate("submissionId")

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Review fetched successfully.",
      data: review,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @params  id - Review ID
 * @body    { recommendation, comments, confidentialComments, status }
 * @returns Updated Review object
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { recommendation, comments, confidentialComments, status } = req.body
    const userId = req.user._id // Assuming user is authenticated

    const review = await Review.findById(id)

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }

    // Only allow the reviewer or admin to update the review
    // if (!req.user.isAdmin && review.reviewerId.toString() !== userId.toString()) {
    //   return res.status(403).json({ success: false, message: "Not authorized to update this review" })
    // }

    // Update fields if provided
    if (recommendation) review.recommendation = recommendation
    if (comments !== undefined) review.comments = comments
    if (confidentialComments !== undefined) review.confidentialComments = confidentialComments
    
    // If status is changing to completed, set submission date
    if (status && status !== review.status && status === "completed") {
      review.submissionDate = new Date()
    }
    
    if (status) review.status = status

    await review.save()

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review by ID
 * @params  { id }
 * @returns Success message
 */
export const deleteReview = async (req, res) => {
  const { id } = req.params

  try {
    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." })
    }

    // Only allow deletion if review is in "pending" status
    if (review.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reviews can be deleted",
      })
    }

    await Review.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/reviews/:id/submit
 * @desc    Submit a review (update recommendation, comments, and status)
 * @params  { id }
 * @body    { recommendation, comments, confidentialComments, attachments }
 * @returns Success message
 */
export const submitReview = async (req, res) => {
  const { id } = req.params
  const { recommendation, comments, confidentialComments, attachments } = req.body

  if (!recommendation) {
    return res.status(400).json({ success: false, message: "Recommendation is required" })
  }

  try {
    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." })
    }

    if (review.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reviews can be submitted",
      })
    }

    await Review.findByIdAndUpdate(
      id,
      {
        recommendation,
        comments,
        confidentialComments,
        attachments,
        submissionDate: Date.now(),
        status: "completed",
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/reviews/:id/decline
 * @desc    Decline a review assignment
 * @params  { id }
 * @returns Success message
 */
export const declineReview = async (req, res) => {
  const { id } = req.params

  try {
    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." })
    }

    if (review.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reviews can be declined",
      })
    }

    await Review.findByIdAndUpdate(
      id,
      {
        status: "declined",
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: "Review declined successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
