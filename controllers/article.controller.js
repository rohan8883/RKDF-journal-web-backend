import Article from "../models/article.model.js"
import Issue from "../models/issue.model.js"
import Submission from "../models/submission.model.js"

/**
 * @route   POST /api/articles
 * @desc    Create a new article
 * @body    { title, abstract, keywords, issueId, submissionId, doi, pages, publicationDate, fullText }
 * @returns Article object
 */
export async function CreateArticle(req, res) {
  try {
    const { title, abstract, keywords, issueId, submissionId, doi, pages, publicationDate, manuscriptFile } = req.body

    if (!title || !abstract || !issueId || !manuscriptFile) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify issue exists
    const issueExists = await Issue.findById(issueId)
    if (!issueExists) {
      return res.status(404).json({ success: false, message: "Issue not found" })
    }

    // If submissionId is provided, verify it exists
    if (submissionId) {
      const submissionExists = await Submission.findById(submissionId)
      if (!submissionExists) {
        return res.status(404).json({ success: false, message: "Submission not found" })
      }
    }

    const article = new Article({
      title,
      abstract,
      keywords,
      issueId,
      submissionId,
      doi,
      pages,
      publicationDate,
      manuscriptFile,
    })

    await article.save()
    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/articles
 * @desc    Get all articles with pagination and search
 * @query   { page, limit, q, issueId }
 * @returns Paginated articles
 */
export const GetAllArticles = async (req, res) => {
  const { page = 1, limit = 10, q, issueId } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "issues",
          localField: "issueId",
          foreignField: "_id",
          as: "issue",
        },
      },
      { $unwind: "$issue" },
      {
        $lookup: {
          from: "journals",
          localField: "issue.journalId",
          foreignField: "_id",
          as: "journal",
        },
      },
      { $unwind: "$journal" },
      { $project: { __v: 0, "issue.__v": 0, "journal.__v": 0 } },
    ]

    if (issueId) {
      query.push({
        $match: { issueId: { $eq: issueId } },
      })
    }

    if (q) {
      query.push({
        $match: {
          $or: [
            { title: { $regex: new RegExp(q, "i") } },
            { abstract: { $regex: new RegExp(q, "i") } },
            { keywords: { $regex: new RegExp(q, "i") } },
            { "issue.title": { $regex: new RegExp(q, "i") } },
            { "journal.title": { $regex: new RegExp(q, "i") } },
          ],
        },
      })
    }

    const aggregate = Article.aggregate(query)
    const articles = await Article.aggregatePaginate(aggregate, options)

    if (!articles.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Articles fetched successfully.",
      data: articles,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/articles/:id
 * @desc    Get article by ID
 * @params  { id }
 * @returns Article object
 */
// export const GetArticleById = async (req, res) => {
//   const { id } = req.params

//   try {
//     const article = await Article.findById(id)
//       .populate({
//         path: "issueId",
//         populate: {
//           path: "journalId",
//         },
//       })
//       .populate("submissionId")

//     if (!article) {
//       return res.status(404).json({ success: false, message: "Article not found." })
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Article fetched successfully.",
//       data: article,
//     })
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message })
//   }
// }
export const GetArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id)
      .populate({
        path: "issueId",
        populate: {
          path: "journalId",
        },
      })
      .populate({
        path: "submissionId",
        populate: {
          path: "submittedBy", // This assumes 'submittedBy' is a reference to a user or author
        },
      });

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Article fetched successfully.",
      data: article,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/articles/:id
 * @desc    Update article by ID
 * @params  { id }
 * @body    { title, abstract, keywords, issueId, submissionId, doi, pages, publicationDate, fullText }
 * @returns Success message
 */
export const UpdateArticle = async (req, res) => {
  const { id } = req.params
  const updateFields = req.body

  try {
    const article = await Article.findById(id)
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found." })
    }

    // If issueId is being updated, verify it exists
    if (updateFields.issueId) {
      const issueExists = await Issue.findById(updateFields.issueId)
      if (!issueExists) {
        return res.status(404).json({ success: false, message: "Issue not found" })
      }
    }

    // If submissionId is being updated, verify it exists
    if (updateFields.submissionId) {
      const submissionExists = await Submission.findById(updateFields.submissionId)
      if (!submissionExists) {
        return res.status(404).json({ success: false, message: "Submission not found" })
      }
    }

    await Article.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Article updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/articles/:id
 * @desc    Delete article by ID
 * @params  { id }
 * @returns Success message
 */
export const DeleteArticle = async (req, res) => {
  const { id } = req.params

  try {
    const article = await Article.findById(id)
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found." })
    }

    await Article.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Article deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PATCH /api/articles/:id/toggle-status
 * @desc    Toggle article status
 * @params  { id }
 * @returns Updated article
 */
export async function ToggleArticleStatus(req, res) {
  const { id } = req.params

  try {
    const article = await Article.findOne({ _id: id })

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      })
    }

    const updatedArticle = await Article.findOneAndUpdate(
      { _id: id },
      {
        status: article?.status == 1 ? 0 : 1,
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: updatedArticle?.status == 1 ? "Article is Activated" : "Article is Deactivated",
      data: updatedArticle,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
