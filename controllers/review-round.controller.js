// controllers/reviewRound.controller.js
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
 * @desc    Get all review rounds for a submission
 * @query   submissionId
 * @returns Array of ReviewRound objects
 */
export const getReviewRounds = async (req, res) => {
  try {
    const { submissionId } = req.query

    if (!submissionId) {
      return res.status(400).json({ success: false, message: "Submission ID is required" })
    }

    const reviewRounds = await ReviewRound.find({ submissionId }).sort({ roundNumber: 1 })

    res.status(200).json({
      success: true,
      data: reviewRounds,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/review-rounds/:id
 * @desc    Get a specific review round by ID
 * @params  id - ReviewRound ID
 * @returns ReviewRound object
 */
export const getReviewRoundById = async (req, res) => {
  try {
    const { id } = req.params

    const reviewRound = await ReviewRound.findById(id)

    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found" })
    }

    res.status(200).json({
      success: true,
      data: reviewRound,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/review-rounds/:id
 * @desc    Update a review round
 * @params  id - ReviewRound ID
 * @body    { status, endDate, editorNotes }
 * @returns Updated ReviewRound object
 */
export const updateReviewRound = async (req, res) => {
  try {
    const { id } = req.params
    const { status, endDate, editorNotes } = req.body

    const reviewRound = await ReviewRound.findById(id)

    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found" })
    }

    // Update fields if provided
    if (status) reviewRound.status = status
    if (endDate) reviewRound.endDate = endDate
    if (editorNotes !== undefined) reviewRound.editorNotes = editorNotes

    await reviewRound.save()

    // If the review round is completed, update all pending reviews to overdue
    if (status === "completed") {
      await Review.updateMany(
        { reviewRoundId: id, status: "pending" },
        { status: "overdue" }
      )
    }

    res.status(200).json({
      success: true,
      message: "Review round updated successfully",
      data: reviewRound,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/review-rounds/:id
 * @desc    Delete a review round
 * @params  id - ReviewRound ID
 * @returns Success message
 */
export const deleteReviewRound = async (req, res) => {
  try {
    const { id } = req.params

    const reviewRound = await ReviewRound.findById(id)

    if (!reviewRound) {
      return res.status(404).json({ success: false, message: "Review round not found" })
    }

    // Check if there are any reviews for this round
    const reviewsCount = await Review.countDocuments({ reviewRoundId: id })
    if (reviewsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete review round with existing reviews",
      })
    }

    await reviewRound.remove()

    res.status(200).json({
      success: true,
      message: "Review round deleted successfully",
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}