import Issue from "../models/issue.model.js"
import Journal from "../models/journal.model.js"

/**
 * @route   POST /api/issues
 * @desc    Create a new issue
 * @body    { journalId, volume, issueNumber, title, publicationDate, description, coverImage }
 * @returns Issue object
 */
export async function CreateIssue(req, res) {
  try {
    const { journalId, volume, issueNumber, title, publicationDate, description, coverImage } = req.body

    if (!journalId || !volume || !issueNumber || !title || !publicationDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify journal exists
    const journalExists = await Journal.findById(journalId)
    if (!journalExists) {
      return res.status(404).json({ success: false, message: "Journal not found" })
    }

    const issue = new Issue({
      journalId,
      volume,
      issueNumber,
      title,
      publicationDate,
      description,
      coverImage,
    })

    await issue.save()
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/issues
 * @desc    Get all issues with pagination and search
 * @query   { page, limit, q, journalId }
 * @returns Paginated issues
 */
export const GetAllIssues = async (req, res) => {
  const { page = 1, limit = 10, q, journalId } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "journals",
          localField: "journalId",
          foreignField: "_id",
          as: "journal",
        },
      },
      { $unwind: "$journal" },
      { $project: { __v: 0, "journal.__v": 0 } },
    ]

    if (journalId) {
      query.push({
        $match: { journalId: { $eq: journalId } },
      })
    }

    if (q) {
      query.push({
        $match: {
          $or: [
            { title: { $regex: new RegExp(q, "i") } },
            { description: { $regex: new RegExp(q, "i") } },
            { "journal.title": { $regex: new RegExp(q, "i") } },
          ],
        },
      })
    }

    const aggregate = Issue.aggregate(query)
    const issues = await Issue.aggregatePaginate(aggregate, options)

    if (!issues.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Issues fetched successfully.",
      data: issues,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/issues/:id
 * @desc    Get issue by ID
 * @params  { id }
 * @returns Issue object
 */
export const GetIssueById = async (req, res) => {
  const { id } = req.params

  try {
    const issue = await Issue.findById(id).populate("journalId")

    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Issue fetched successfully.",
      data: issue,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/issues/:id
 * @desc    Update issue by ID
 * @params  { id }
 * @body    { journalId, volume, issueNumber, title, publicationDate, description, coverImage }
 * @returns Success message
 */
export const UpdateIssue = async (req, res) => {
  const { id } = req.params
  const updateFields = req.body

  try {
    const issue = await Issue.findById(id)
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found." })
    }

    // If journalId is being updated, verify it exists
    if (updateFields.journalId) {
      const journalExists = await Journal.findById(updateFields.journalId)
      if (!journalExists) {
        return res.status(404).json({ success: false, message: "Journal not found" })
      }
    }

    await Issue.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/issues/:id
 * @desc    Delete issue by ID
 * @params  { id }
 * @returns Success message
 */
export const DeleteIssue = async (req, res) => {
  const { id } = req.params

  try {
    const issue = await Issue.findById(id)
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found." })
    }

    await Issue.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PATCH /api/issues/:id/toggle-status
 * @desc    Toggle issue status
 * @params  { id }
 * @returns Updated issue
 */
export async function ToggleIssueStatus(req, res) {
  const { id } = req.params

  try {
    const issue = await Issue.findOne({ _id: id })

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      })
    }

    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: id },
      {
        status: issue?.status == 1 ? 0 : 1,
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: updatedIssue?.status == 1 ? "Issue is Activated" : "Issue is Deactivated",
      data: updatedIssue,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
