import JournalRole from "../models/journal-role.model.js"
import Journal from "../models/journal.model.js"
import User from "../models/user.model.js"
import Role from "../models/role.model.js"

/**
 * @route   POST /api/journal-roles
 * @desc    Create a new journal role assignment
 * @body    { journalId, personId, roleId, startDate, endDate }
 * @returns JournalRole object
 */
export const createJournalRole = async (req, res) => {
  try {
    const { journalId, personId, roleId, startDate, endDate } = req.body

    if (!journalId || !personId || !roleId) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Verify journal exists
    const journalExists = await Journal.findById(journalId)
    if (!journalExists) {
      return res.status(404).json({ success: false, message: "Journal not found" })
    }

    // Verify person exists
    const personExists = await User.findById(personId)
    if (!personExists) {
      return res.status(404).json({ success: false, message: "Person not found" })
    }

    // Verify role exists
    const roleExists = await Role.findById(roleId)
    if (!roleExists) {
      return res.status(404).json({ success: false, message: "Role not found" })
    }

    // Check if this person already has this role for this journal
    const existingRole = await JournalRole.findOne({
      journalId,
      personId,
      roleId,
      status: 1, // Only check active roles
    })

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "This person already has this role for this journal",
      })
    }

    const journalRole = new JournalRole({
      journalId,
      personId,
      roleId,
      startDate: startDate || Date.now(),
      endDate,
    })

    await journalRole.save()
    res.status(201).json({
      success: true,
      message: "Journal role assignment created successfully",
      data: journalRole,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/journal-roles
 * @desc    Get all journal roles with pagination and filtering
 * @query   { page, limit, journalId, personId, roleId, status }
 * @returns Paginated journal roles
 */
export const getAllJournalRoles = async (req, res) => {
  const { page = 1, limit = 10, journalId, personId, roleId, status } = req.query
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
      {
        $lookup: {
          from: "users",
          localField: "personId",
          foreignField: "_id",
          as: "person",
        },
      },
      { $unwind: "$person" },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      { $project: { __v: 0, "journal.__v": 0, "person.__v": 0, "person.password": 0, "role.__v": 0 } },
    ]

    if (journalId) {
      query.push({
        $match: { journalId: { $eq: journalId } },
      })
    }

    if (personId) {
      query.push({
        $match: { personId: { $eq: personId } },
      })
    }

    if (roleId) {
      query.push({
        $match: { roleId: { $eq: roleId } },
      })
    }

    if (status !== undefined) {
      query.push({
        $match: { status: { $eq: Number.parseInt(status) } },
      })
    }

    const aggregate = JournalRole.aggregate(query)
    const journalRoles = await JournalRole.aggregatePaginate(aggregate, options)

    if (!journalRoles.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Journal roles fetched successfully.",
      data: journalRoles,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/journal-roles/:id
 * @desc    Get journal role by ID
 * @params  { id }
 * @returns JournalRole object
 */
export const getJournalRoleById = async (req, res) => {
  const { id } = req.params

  try {
    const journalRole = await JournalRole.findById(id)
      .populate("journalId")
      .populate("personId", "-password")
      .populate("roleId")

    if (!journalRole) {
      return res.status(404).json({ success: false, message: "Journal role assignment not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Journal role assignment fetched successfully.",
      data: journalRole,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/journal-roles/:id
 * @desc    Update journal role by ID
 * @params  { id }
 * @body    { startDate, endDate, status }
 * @returns Success message
 */
export const updateJournalRole = async (req, res) => {
  const { id } = req.params
  const { startDate, endDate, status } = req.body

  try {
    const journalRole = await JournalRole.findById(id)
    if (!journalRole) {
      return res.status(404).json({ success: false, message: "Journal role assignment not found." })
    }

    const updateFields = {}
    if (startDate) updateFields.startDate = startDate
    if (endDate !== undefined) updateFields.endDate = endDate
    if (status !== undefined) updateFields.status = status

    await JournalRole.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Journal role assignment updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/journal-roles/:id
 * @desc    Delete journal role by ID
 * @params  { id }
 * @returns Success message
 */
export const deleteJournalRole = async (req, res) => {
  const { id } = req.params

  try {
    const journalRole = await JournalRole.findById(id)
    if (!journalRole) {
      return res.status(404).json({ success: false, message: "Journal role assignment not found." })
    }

    await JournalRole.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Journal role assignment deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/journal-roles/:id/deactivate
 * @desc    Deactivate a journal role (set status to 0 and set end date)
 * @params  { id }
 * @returns Success message
 */
export const deactivateJournalRole = async (req, res) => {
  const { id } = req.params

  try {
    const journalRole = await JournalRole.findById(id)
    if (!journalRole) {
      return res.status(404).json({ success: false, message: "Journal role assignment not found." })
    }

    if (journalRole.status === 0) {
      return res.status(400).json({ success: false, message: "Journal role is already inactive." })
    }

    await JournalRole.findByIdAndUpdate(
      id,
      {
        status: 0,
        endDate: Date.now(),
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: "Journal role deactivated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
