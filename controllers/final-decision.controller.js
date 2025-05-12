import FinalDecision from "../models/final-decision.model.js"
import Article from "../models/article.model.js"
import User from "../models/user.model.js"

/**
 * @route   POST /api/final-decisions
 * @desc    Create a new final decision
 * @body    { articleId, decision, decisionBy, comments }
 * @returns FinalDecision object
 */
export const createFinalDecision = async (req, res) => {
  try {
    const { articleId, decision, decisionBy, comments } = req.body

    if (!articleId || !decision || !decisionBy) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify article exists
    const articleExists = await Article.findById(articleId)
    if (!articleExists) {
      return res.status(404).json({ success: false, message: "Article not found" })
    }

    // Verify decision maker exists
    const decisionMakerExists = await User.findById(decisionBy)
    if (!decisionMakerExists) {
      return res.status(404).json({ success: false, message: "Decision maker not found" })
    }

    // Check if a final decision already exists for this article
    const existingDecision = await FinalDecision.findOne({ articleId })
    if (existingDecision) {
      return res.status(400).json({
        success: false,
        message: "A final decision already exists for this article",
      })
    }

    const finalDecision = new FinalDecision({
      articleId,
      decision,
      decisionBy,
      comments,
    })

    await finalDecision.save()
    res.status(201).json({
      success: true,
      message: "Final decision created successfully",
      data: finalDecision,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/final-decisions
 * @desc    Get all final decisions with pagination and filtering
 * @query   { page, limit, articleId, decision, decisionBy }
 * @returns Paginated final decisions
 */
export const getAllFinalDecisions = async (req, res) => {
  const { page = 1, limit = 10, articleId, decision, decisionBy } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { decisionDate: -1 } },
      {
        $lookup: {
          from: "articles",
          localField: "articleId",
          foreignField: "_id",
          as: "article",
        },
      },
      { $unwind: "$article" },
      {
        $lookup: {
          from: "users",
          localField: "decisionBy",
          foreignField: "_id",
          as: "decisionMaker",
        },
      },
      { $unwind: "$decisionMaker" },
      { $project: { __v: 0, "article.__v": 0, "decisionMaker.__v": 0, "decisionMaker.password": 0 } },
    ]

    if (articleId) {
      query.push({
        $match: { articleId: { $eq: articleId } },
      })
    }

    if (decision) {
      query.push({
        $match: { decision: { $eq: decision } },
      })
    }

    if (decisionBy) {
      query.push({
        $match: { decisionBy: { $eq: decisionBy } },
      })
    }

    const aggregate = FinalDecision.aggregate(query)
    const finalDecisions = await FinalDecision.aggregatePaginate(aggregate, options)

    if (!finalDecisions.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Final decisions fetched successfully.",
      data: finalDecisions,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/final-decisions/:id
 * @desc    Get final decision by ID
 * @params  { id }
 * @returns FinalDecision object
 */
export const getFinalDecisionById = async (req, res) => {
  const { id } = req.params

  try {
    const finalDecision = await FinalDecision.findById(id).populate("articleId").populate("decisionBy", "-password")

    if (!finalDecision) {
      return res.status(404).json({ success: false, message: "Final decision not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Final decision fetched successfully.",
      data: finalDecision,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/final-decisions/article/:articleId
 * @desc    Get final decision by article ID
 * @params  { articleId }
 * @returns FinalDecision object
 */
export const getFinalDecisionByArticleId = async (req, res) => {
  const { articleId } = req.params

  try {
    const finalDecision = await FinalDecision.findOne({ articleId })
      .populate("articleId")
      .populate("decisionBy", "-password")

    if (!finalDecision) {
      return res.status(404).json({ success: false, message: "Final decision not found for this article." })
    }

    return res.status(200).json({
      success: true,
      message: "Final decision fetched successfully.",
      data: finalDecision,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/final-decisions/:id
 * @desc    Update final decision by ID
 * @params  { id }
 * @body    { decision, comments }
 * @returns Success message
 */
export const updateFinalDecision = async (req, res) => {
  const { id } = req.params
  const { decision, comments } = req.body

  try {
    const finalDecision = await FinalDecision.findById(id)
    if (!finalDecision) {
      return res.status(404).json({ success: false, message: "Final decision not found." })
    }

    const updateFields = {}
    if (decision) updateFields.decision = decision
    if (comments !== undefined) updateFields.comments = comments

    // Update decision date when decision is modified
    if (decision) updateFields.decisionDate = Date.now()

    await FinalDecision.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Final decision updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/final-decisions/:id
 * @desc    Delete final decision by ID
 * @params  { id }
 * @returns Success message
 */
export const deleteFinalDecision = async (req, res) => {
  const { id } = req.params

  try {
    const finalDecision = await FinalDecision.findById(id)
    if (!finalDecision) {
      return res.status(404).json({ success: false, message: "Final decision not found." })
    }

    await FinalDecision.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Final decision deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
