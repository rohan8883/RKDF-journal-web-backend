import ReviewRound from "../models/reviewRound.model.js"
import Submission from "../models/submission.model.js"
import Review from "../models/review.model.js"

/**
 * @route   POST /api/review-rounds
 * @desc    Create a new review round
 * @body    { submissionId, roundNumber, editorNotes }
 * @returns ReviewRound object
 */
export const createReviewRound = async (req, res) => {
  try {
    const { submissionId, roundNumber, editorNotes } = req.body

    if (!submissionId || !roundNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify submission exists
    const submissionExists = await Submission.findById(submissionId)
    if (!submissionExists) {
      return res.status(404).json({ success: false, message: "Submission not found" })
    }

    // Check if a review round with this number already exists for this submission
    const existingRound = await ReviewRound.findOne({ submissionId, roundNumber })
    if (existingRound) {
      return res.status(400).json({
        success: false,
        message: "A review round with this number already exists for this submission",
      })
    }

    const reviewRound = new ReviewRound({
      submissionId,
      roundNumber,
      editorNotes,
    })

    await reviewRound.save()

    // Update submission status to "under_review" if it's not already
    if (submissionExists.status !== "under_review") {
      await Submission.findByIdAndUpdate(submissionId, { status: "under_review" })
    }

    res.status(201).json({
      success: true,
      message: "Review round created successfully",
      data: reviewRound,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/review-rounds
 * @desc    Get all review rounds with pagination and filtering
 * @query   { page, limit, submissionId, status }
 * @returns Paginated review rounds
 */
export const getAllReviewRounds = async (req, res) => {
  const { page = 1, limit = 10, submissionId, status } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { submissionId: 1, roundNumber: 1 } },
      {
        $lookup: {
          from: "submissions",
          localField: "submissionId",
          foreignField: "_id",
          as: "submission",
        },
      },
      { $unwind: "$submission" },
      { $project: { __v: 0, "submission.__v": 0 } },
    ]

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

    const aggregate = ReviewRound.aggregate(query)
    const reviewRounds = await ReviewRound.aggregatePaginate(aggregate, options)

    if (!reviewRounds.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Review rounds fetched successfully.",
      data: reviewRounds,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/review-rounds/:id
 * @desc    Get review round by ID
 * @params  { id }
 * @returns ReviewRound object
 */
export const getReviewRoundById = async (req, res) => {
  const { id } = req.params

  try {
    const reviewRound = await ReviewRound.findById(id).populate("submissionId")

    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Review round fetched successfully.",
      data: reviewRound,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/review-rounds/:id/reviews
 * @desc    Get all reviews for a review round
 * @params  { id }
 * @returns Array of Review objects
 */
export const getReviewRoundReviews = async (req, res) => {
  const { id } = req.params
  const { page = 1, limit = 10 } = req.query
  const options = { page, limit }

  try {
    const reviewRound = await ReviewRound.findById(id)
    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found." })
    }

    const query = [
      { $match: { reviewRoundId: { $eq: id } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "reviewerId",
          foreignField: "_id",
          as: "reviewer",
        },
      },
      { $unwind: "$reviewer" },
      { $project: { __v: 0, "reviewer.__v": 0, "reviewer.password": 0 } },
    ]

    const aggregate = Review.aggregate(query)
    const reviews = await Review.aggregatePaginate(aggregate, options)

    return res.status(200).json({
      success: true,
      message: "Review round reviews fetched successfully.",
      data: reviews,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/review-rounds/:id
 * @desc    Update review round by ID
 * @params  { id }
 * @body    { editorNotes, status, endDate }
 * @returns Success message
 */
export const updateReviewRound = async (req, res) => {
  const { id } = req.params
  const { editorNotes, status, endDate } = req.body

  try {
    const reviewRound = await ReviewRound.findById(id)
    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found." })
    }

    const updateFields = {}
    if (editorNotes !== undefined) updateFields.editorNotes = editorNotes
    if (status) updateFields.status = status
    if (endDate) updateFields.endDate = endDate

    // If status is being updated to "completed", set endDate to now if not provided
    if (status === "completed" && !endDate) {
      updateFields.endDate = Date.now()
    }

    await ReviewRound.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Review round updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/review-rounds/:id
 * @desc    Delete review round by ID
 * @params  { id }
 * @returns Success message
 */
export const deleteReviewRound = async (req, res) => {
  const { id } = req.params

  try {
    const reviewRound = await ReviewRound.findById(id)
    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found." })
    }

    // Check if there are any reviews associated with this round
    const reviewsCount = await Review.countDocuments({ reviewRoundId: id })
    if (reviewsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete review round with associated reviews. Remove reviews first.",
      })
    }

    await ReviewRound.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Review round deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/review-rounds/:id/complete
 * @desc    Complete a review round
 * @params  { id }
 * @body    { editorNotes }
 * @returns Success message
 */
export const completeReviewRound = async (req, res) => {
  const { id } = req.params
  const { editorNotes } = req.body

  try {
    const reviewRound = await ReviewRound.findById(id)
    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found." })
    }

    if (reviewRound.status === "completed") {
      return res.status(400).json({ success: false, message: "Review round is already completed." })
    }

    const updateFields = {
      status: "completed",
      endDate: Date.now(),
    }

    if (editorNotes !== undefined) {
      updateFields.editorNotes = editorNotes
    }

    await ReviewRound.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Review round completed successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
