import Subject from "../models/subject.model.js"
import ArticleSubject from "../models/article-subject.model.js"

/**
 * @route   POST /api/subjects
 * @desc    Create a new subject
 * @body    { name, description, parentSubject }
 * @returns Subject object
 */
export const createSubject = async (req, res) => {
  try {
    const { name, description, parentSubject } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: "Subject name is required" })
    }

    // Check if a subject with this name already exists
    const existingSubject = await Subject.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
      })
    }

    // If parentSubject is provided, verify it exists
    if (parentSubject) {
      const parentExists = await Subject.findById(parentSubject)
      if (!parentExists) {
        return res.status(404).json({ success: false, message: "Parent subject not found" })
      }
    }

    const subject = new Subject({
      name,
      description,
      parentSubject,
    })

    await subject.save()
    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects with pagination and search
 * @query   { page, limit, q, parentSubject, status }
 * @returns Paginated subjects
 */
export const getAllSubjects = async (req, res) => {
  const { page = 1, limit = 10, q, parentSubject, status } = req.query
  const options = { page, limit }

  try {
    const query = [
      { $sort: { name: 1 } },
      {
        $lookup: {
          from: "subjects",
          localField: "parentSubject",
          foreignField: "_id",
          as: "parent",
        },
      },
      {
        $addFields: {
          parent: { $arrayElemAt: ["$parent", 0] },
        },
      },
      { $project: { __v: 0, "parent.__v": 0 } },
    ]

    if (parentSubject) {
      if (parentSubject === "null") {
        // Find subjects with no parent
        query.push({
          $match: { parentSubject: { $eq: null } },
        })
      } else {
        // Find subjects with specific parent
        query.push({
          $match: { parentSubject: { $eq: parentSubject } },
        })
      }
    }

    if (status !== undefined) {
      query.push({
        $match: { status: { $eq: Number.parseInt(status) } },
      })
    }

    if (q) {
      query.push({
        $match: {
          $or: [{ name: { $regex: new RegExp(q, "i") } }, { description: { $regex: new RegExp(q, "i") } }],
        },
      })
    }

    const aggregate = Subject.aggregate(query)
    const subjects = await Subject.aggregatePaginate(aggregate, options)

    if (!subjects.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully.",
      data: subjects,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/subjects/:id
 * @desc    Get subject by ID
 * @params  { id }
 * @returns Subject object
 */
export const getSubjectById = async (req, res) => {
  const { id } = req.params

  try {
    const subject = await Subject.findById(id).populate("parentSubject")

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Subject fetched successfully.",
      data: subject,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/subjects/:id/children
 * @desc    Get all child subjects of a subject
 * @params  { id }
 * @returns Array of Subject objects
 */
export const getChildSubjects = async (req, res) => {
  const { id } = req.params
  const { page = 1, limit = 10 } = req.query
  const options = { page, limit }

  try {
    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found." })
    }

    const query = [{ $match: { parentSubject: { $eq: id } } }, { $sort: { name: 1 } }]

    const aggregate = Subject.aggregate(query)
    const children = await Subject.aggregatePaginate(aggregate, options)

    return res.status(200).json({
      success: true,
      message: "Child subjects fetched successfully.",
      data: children,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update subject by ID
 * @params  { id }
 * @body    { name, description, parentSubject, status }
 * @returns Success message
 */
export const updateSubject = async (req, res) => {
  const { id } = req.params
  const { name, description, parentSubject, status } = req.body

  try {
    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found." })
    }

    // If name is being updated, check for duplicates
    if (name && name !== subject.name) {
      const existingSubject = await Subject.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id }, // Exclude current subject
      })

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: "A subject with this name already exists",
        })
      }
    }

    // If parentSubject is being updated, verify it exists and prevent circular references
    if (parentSubject && parentSubject !== subject.parentSubject?.toString()) {
      // Prevent setting parent to self
      if (parentSubject === id) {
        return res.status(400).json({
          success: false,
          message: "A subject cannot be its own parent",
        })
      }

      const parentExists = await Subject.findById(parentSubject)
      if (!parentExists) {
        return res.status(404).json({ success: false, message: "Parent subject not found" })
      }

      // Check for circular references
      let currentParent = parentExists
      while (currentParent.parentSubject) {
        if (currentParent.parentSubject.toString() === id) {
          return res.status(400).json({
            success: false,
            message: "Circular reference detected in subject hierarchy",
          })
        }
        currentParent = await Subject.findById(currentParent.parentSubject)
      }
    }

    const updateFields = {}
    if (name) updateFields.name = name
    if (description !== undefined) updateFields.description = description
    if (parentSubject !== undefined) updateFields.parentSubject = parentSubject || null
    if (status !== undefined) updateFields.status = status

    await Subject.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete subject by ID
 * @params  { id }
 * @returns Success message
 */
export const deleteSubject = async (req, res) => {
  const { id } = req.params

  try {
    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found." })
    }

    // Check if there are any child subjects
    const childrenCount = await Subject.countDocuments({ parentSubject: id })
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subject with child subjects. Update or delete child subjects first.",
      })
    }

    // Check if there are any articles associated with this subject
    const articlesCount = await ArticleSubject.countDocuments({ subjectId: id })
    if (articlesCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subject with associated articles. Remove article associations first.",
      })
    }

    await Subject.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
