import ArticleAuthor from "../models/article-author.model.js"
import Article from "../models/article.model.js"
import User from "../models/user.model.js"

/**
 * @route   POST /api/article-authors
 * @desc    Create a new article author relationship
 * @body    { articleId, personId, authorOrder, isCorrespondingAuthor, contributionStatement }
 * @returns ArticleAuthor object
 */
export const createArticleAuthor = async (req, res) => {
  try {
    const { articleId, personId, authorOrder, isCorrespondingAuthor, contributionStatement } = req.body

    if (!articleId || !personId || authorOrder === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify article exists
    const articleExists = await Article.findById(articleId)
    if (!articleExists) {
      return res.status(404).json({ success: false, message: "Article not found" })
    }

    // Verify person exists
    const personExists = await User.findById(personId)
    if (!personExists) {
      return res.status(404).json({ success: false, message: "Person not found" })
    }

    // Check if this author is already associated with this article
    const existingRelation = await ArticleAuthor.findOne({ articleId, personId })
    if (existingRelation) {
      return res.status(400).json({
        success: false,
        message: "This author is already associated with this article",
      })
    }

    const articleAuthor = new ArticleAuthor({
      articleId,
      personId,
      authorOrder,
      isCorrespondingAuthor: isCorrespondingAuthor || false,
      contributionStatement,
    })

    await articleAuthor.save()
    res.status(201).json({
      success: true,
      message: "Article author relationship created successfully",
      data: articleAuthor,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/article-authors
 * @desc    Get all article authors with pagination and filtering
 * @query   { page, limit, articleId, personId }
 * @returns Paginated article authors
 */
export const getAllArticleAuthors = async (req, res) => {
  const { page = 1, limit = 10, articleId, personId } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { authorOrder: 1 } },
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
          localField: "personId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      { $project: { __v: 0, "article.__v": 0, "author.__v": 0, "author.password": 0 } },
    ]

    if (articleId) {
      query.push({
        $match: { articleId: { $eq: articleId } },
      })
    }

    if (personId) {
      query.push({
        $match: { personId: { $eq: personId } },
      })
    }

    const aggregate = ArticleAuthor.aggregate(query)
    const articleAuthors = await ArticleAuthor.aggregatePaginate(aggregate, options)

    if (!articleAuthors.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Article authors fetched successfully.",
      data: articleAuthors,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/article-authors/:id
 * @desc    Get article author by ID
 * @params  { id }
 * @returns ArticleAuthor object
 */
export const getArticleAuthorById = async (req, res) => {
  const { id } = req.params

  try {
    const articleAuthor = await ArticleAuthor.findById(id).populate("articleId").populate("personId", "-password")

    if (!articleAuthor) {
      return res.status(404).json({ success: false, message: "Article author relationship not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Article author relationship fetched successfully.",
      data: articleAuthor,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/article-authors/:id
 * @desc    Update article author by ID
 * @params  { id }
 * @body    { authorOrder, isCorrespondingAuthor, contributionStatement }
 * @returns Success message
 */
export const updateArticleAuthor = async (req, res) => {
  const { id } = req.params
  const { authorOrder, isCorrespondingAuthor, contributionStatement } = req.body

  try {
    const articleAuthor = await ArticleAuthor.findById(id)
    if (!articleAuthor) {
      return res.status(404).json({ success: false, message: "Article author relationship not found." })
    }

    const updateFields = {}
    if (authorOrder !== undefined) updateFields.authorOrder = authorOrder
    if (isCorrespondingAuthor !== undefined) updateFields.isCorrespondingAuthor = isCorrespondingAuthor
    if (contributionStatement !== undefined) updateFields.contributionStatement = contributionStatement

    await ArticleAuthor.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Article author relationship updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/article-authors/:id
 * @desc    Delete article author by ID
 * @params  { id }
 * @returns Success message
 */
export const deleteArticleAuthor = async (req, res) => {
  const { id } = req.params

  try {
    const articleAuthor = await ArticleAuthor.findById(id)
    if (!articleAuthor) {
      return res.status(404).json({ success: false, message: "Article author relationship not found." })
    }

    await ArticleAuthor.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Article author relationship deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
