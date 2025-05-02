import Journal from "../models/journal.model.js"

/**
 * @route   POST /api/journals
 * @desc    Create a new journal
 * @body    { title, description, issn, publisher, foundedYear, website, coverImage }
 * @returns Journal object
 */
export async function CreateJournal(req, res) {
  try {
    const { title, description, issn, publisher, foundedYear, website, coverImage } = req.body

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" })
    }

    const journal = new Journal({
      title,
      description,
      issn,
      publisher,
      foundedYear,
      website,
      coverImage,
    })

    await journal.save()
    res.status(201).json({
      success: true,
      message: "Journal created successfully",
      data: journal,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/journals
 * @desc    Get all journals with pagination and search
 * @query   { page, limit, q }
 * @returns Paginated journals
 */
export const GetAllJournals = async (req, res) => {
  const { page = 1, limit = 10, q } = req.query
  const options = { page, limit }

  try {
    const query = [{ $sort: { createdAt: -1 } }, { $project: { __v: 0 } }]

    if (q) {
      query.push({
        $match: {
          $or: [
            { title: { $regex: new RegExp(q, "i") } },
            { description: { $regex: new RegExp(q, "i") } },
            { publisher: { $regex: new RegExp(q, "i") } },
          ],
        },
      })
    }

    const aggregate = Journal.aggregate(query)
    const journals = await Journal.aggregatePaginate(aggregate, options)

    if (!journals.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Journals fetched successfully.",
      data: journals,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/journals/:id
 * @desc    Get journal by ID
 * @params  { id }
 * @returns Journal object
 */
export const GetJournalById = async (req, res) => {
  const { id } = req.params

  try {
    const journal = await Journal.findById(id)

    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Journal fetched successfully.",
      data: journal,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/journals/:id
 * @desc    Update journal by ID
 * @params  { id }
 * @body    { title, description, issn, publisher, foundedYear, website, coverImage }
 * @returns Success message
 */
export const UpdateJournal = async (req, res) => {
  const { id } = req.params
  const updateFields = req.body

  try {
    const journal = await Journal.findById(id)
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found." })
    }

    await Journal.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Journal updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/journals/:id
 * @desc    Delete journal by ID
 * @params  { id }
 * @returns Success message
 */
export const DeleteJournal = async (req, res) => {
  const { id } = req.params

  try {
    const journal = await Journal.findById(id)
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found." })
    }

    await Journal.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Journal deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PATCH /api/journals/:id/toggle-status
 * @desc    Toggle journal status
 * @params  { id }
 * @returns Updated journal
 */
export async function ToggleJournalStatus(req, res) {
  const { id } = req.params

  try {
    const journal = await Journal.findOne({ _id: id })

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal not found",
      })
    }

    const updatedJournal = await Journal.findOneAndUpdate(
      { _id: id },
      {
        status: journal?.status == 1 ? 0 : 1,
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: updatedJournal?.status == 1 ? "Journal is Activated" : "Journal is Deactivated",
      data: updatedJournal,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
