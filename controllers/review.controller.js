import Review from "../models/review.model.js"
import ReviewRound from "../models/review-round.model.js"
import Submission from "../models/submission.model.js"
import User from "../models/user.model.js"

/**
 * @route   POST /api/reviews
 * @desc    Create a new review assignment
 * @body    { reviewRoundId, reviewerId, submissionId, dueDate }
 * @returns Review object
 */
export const createReview = async (req, res) => {
  try {
    const { reviewRoundId, reviewerId, submissionId, dueDate } = req.body

    if (!reviewRoundId || !reviewerId || !submissionId || !dueDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify review round exists
    const reviewRoundExists = await ReviewRound.findById(reviewRoundId)
    if (!reviewRoundExists) {
      return res.status(404).json({ success: false, message: "Review round not found" })
    }

    // Verify reviewer exists
    const reviewerExists = await User.findById(reviewerId)
    if (!reviewerExists) {
      return res.status(404).json({ success: false, message: "Reviewer not found" })
    }

    // Verify submission exists
    const submissionExists = await Submission.findById(submissionId)
    if (!submissionExists) {
      return res.status(404).json({ success: false, message: "Submission not found" })
    }

    // Check if this reviewer is already assigned to this submission in this round
    const existingReview = await Review.findOne({
      reviewRoundId,
      reviewerId,
      submissionId,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "This reviewer is already assigned to this submission in this review round",
      })
    }

    const review = new Review({
      reviewRoundId,
      reviewerId,
      submissionId,
      dueDate,
    })

    await review.save()
    res.status(201).json({
      success: true,
      message: "Review assignment created successfully",
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
export const getAllReviews = async (req, res) => {
  const { page = 1, limit = 10, reviewRoundId, reviewerId, submissionId, status } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "review_rounds",
          localField: "reviewRoundId",
          foreignField: "_id",
          as: "reviewRound",
        },
      },
      { $unwind: "$reviewRound" },
      {
        $lookup: {
          from: "users",
          localField: "reviewerId",
          foreignField: "_id",
          as: "reviewer",
        },
      },
      { $unwind: "$reviewer" },
      {
        $lookup: {
          from: "submissions",
          localField: "submissionId",
          foreignField: "_id",
          as: "submission",
        },
      },
      { $unwind: "$submission" },
      { $project: { __v: 0, "reviewRound.__v": 0, "reviewer.__v": 0, "reviewer.password": 0, "submission.__v": 0 } },
    ]

    if (reviewRoundId) {
      query.push({
        $match: { reviewRoundId: { $eq: reviewRoundId } },
      })
    }

    if (reviewerId) {
      query.push({
        $match: { reviewerId: { $eq: reviewerId } },
      })
    }

    if (submissionId) {
      query.push({
        $match: { submissionId: { $eq: submissionId } },
      })
    }

    if (status) {
      query.push({
        $match: { status: { $eq: status } },
      })
    }

    const aggregate = Review.aggregate(query)
    const reviews = await Review.aggregatePaginate(aggregate, options)

    if (!reviews.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      data: reviews,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
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
 * @desc    Update review by ID
 * @params  { id }
 * @body    { recommendation, comments, confidentialComments, attachments, submissionDate, dueDate, status }
 * @returns Success message
 */
export const updateReview = async (req, res) => {
  const { id } = req.params
  const updateFields = req.body

  try {
    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." })
    }

    // If status is being updated to "completed", ensure recommendation is provided
    if (updateFields.status === "completed" && !updateFields.recommendation && !review.recommendation) {
      return res.status(400).json({
        success: false,
        message: "Recommendation is required when completing a review",
      })
    }

    // If recommendation is provided, set submissionDate to now if not already set
    if (updateFields.recommendation && !review.submissionDate) {
      updateFields.submissionDate = Date.now()
    }

    // If status is being updated to "completed", set submissionDate to now if not already set
    if (updateFields.status === "completed" && !review.submissionDate) {
      updateFields.submissionDate = Date.now()
    }

    await Review.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
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
