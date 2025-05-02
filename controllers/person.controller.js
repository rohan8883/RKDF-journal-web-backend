import Person from "../models/person.model.js"

/**
 * @route   POST /api/persons
 * @desc    Create a new person
 * @body    { firstName, lastName, email, affiliation, orcid, bio, profileImage }
 * @returns Person object
 */
export async function CreatePerson(req, res) {
  try {
    const { firstName, lastName, email, affiliation, orcid, bio, profileImage } = req.body

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" })
    }

    // Check if email already exists
    const existingPerson = await Person.findOne({ email })
    if (existingPerson) {
      return res.status(400).json({ success: false, message: "Email already in use" })
    }

    const person = new Person({
      firstName,
      lastName,
      email,
      affiliation,
      orcid,
      bio,
      profileImage,
    })

    await person.save()
    res.status(201).json({
      success: true,
      message: "Person created successfully",
      data: person,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/persons
 * @desc    Get all persons with pagination and search
 * @query   { page, limit, q }
 * @returns Paginated persons
 */
export const GetAllPersons = async (req, res) => {
  const { page = 1, limit = 10, q } = req.query
  const options = { page, limit }

  try {
    const query = [{ $sort: { createdAt: -1 } }, { $project: { __v: 0 } }]

    if (q) {
      query.push({
        $match: {
          $or: [
            { firstName: { $regex: new RegExp(q, "i") } },
            { lastName: { $regex: new RegExp(q, "i") } },
            { email: { $regex: new RegExp(q, "i") } },
            { affiliation: { $regex: new RegExp(q, "i") } },
          ],
        },
      })
    }

    const aggregate = Person.aggregate(query)
    const persons = await Person.aggregatePaginate(aggregate, options)

    if (!persons.totalDocs) {
      return res.status(404).json({ success: false, message: "No records found!" })
    }

    return res.status(200).json({
      success: true,
      message: "Persons fetched successfully.",
      data: persons,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   GET /api/persons/:id
 * @desc    Get person by ID
 * @params  { id }
 * @returns Person object
 */
export const GetPersonById = async (req, res) => {
  const { id } = req.params

  try {
    const person = await Person.findById(id)

    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found." })
    }

    return res.status(200).json({
      success: true,
      message: "Person fetched successfully.",
      data: person,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PUT /api/persons/:id
 * @desc    Update person by ID
 * @params  { id }
 * @body    { firstName, lastName, email, affiliation, orcid, bio, profileImage }
 * @returns Success message
 */
export const UpdatePerson = async (req, res) => {
  const { id } = req.params
  const updateFields = req.body

  try {
    const person = await Person.findById(id)
    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found." })
    }

    // If email is being updated, check if it's already in use
    if (updateFields.email && updateFields.email !== person.email) {
      const existingPerson = await Person.findOne({ email: updateFields.email })
      if (existingPerson) {
        return res.status(400).json({ success: false, message: "Email already in use" })
      }
    }

    await Person.findByIdAndUpdate(id, updateFields, { new: true })

    return res.status(200).json({
      success: true,
      message: "Person updated successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   DELETE /api/persons/:id
 * @desc    Delete person by ID
 * @params  { id }
 * @returns Success message
 */
export const DeletePerson = async (req, res) => {
  const { id } = req.params

  try {
    const person = await Person.findById(id)
    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found." })
    }

    await Person.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Person deleted successfully.",
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @route   PATCH /api/persons/:id/toggle-status
 * @desc    Toggle person status
 * @params  { id }
 * @returns Updated person
 */
export async function TogglePersonStatus(req, res) {
  const { id } = req.params

  try {
    const person = await Person.findOne({ _id: id })

    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Person not found",
      })
    }

    const updatedPerson = await Person.findOneAndUpdate(
      { _id: id },
      {
        status: person?.status == 1 ? 0 : 1,
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: updatedPerson?.status == 1 ? "Person is Activated" : "Person is Deactivated",
      data: updatedPerson,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
