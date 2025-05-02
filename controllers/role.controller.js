import Role from '../models/role.model.js';
import Joi from 'joi';
// ════════════════════════════║  API TO Create Role   ║═════════════════════════════════//
export async function CreateRole(req, res) {
  const { roleName, description } = req.body;

  try {
    const schema = Joi.object({
      roleName: Joi.string()
        .required()
        .min(1)
        .max(50)
        .label('roleName is not more than 50 characters'),
      description: Joi.string().required()
    });
    const newRole = new Role({
      roleName,
      description
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(200)
        .json({ message: error.details[0].message, success: false });
    }
    await newRole.save();

    return res.status(201).json({
      success: true,
      message: 'Created successfully.',
      newRole
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ════════════════════════════║  API TO Get All Role   ║═════════════════════════════════//
export const GetAllRole = async (req, res) => {
  const { page = 1, limit = 10, q } = req.query;
  const options = { page, limit };
  try {
    let query = [
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          __v: 0
        }
      }
    ];

    if (q) {
      query.push({
        $match: {
          $or: [
            { roleName: { $regex: new RegExp(q, 'i') } },
            { description: { $regex: new RegExp(q, 'i') } }
          ]
        }
      });
    }

    const aggregate = Role.aggregate(query);
    const roles = await Role.aggregatePaginate(aggregate, options);

    if (!roles) {
      return res.status(400).json({
        success: true,
        message: 'No record found!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched successfully.',
      data: roles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ════════════════════════════║  API TO Get Role By Id ║═════════════════════════════════//
export const GetRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Get role by id successfully.',
      data: role
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ════════════════════════════║  API TO Update Role By Id ║═════════════════════════════════//
export const UpdateRole = async (req, res) => {
  const { roleName, description } = req.body;
  const { id } = req.params;

  try {
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.'
      });
    }

    await Role.findByIdAndUpdate(id, {
      roleName,
      description
    });

    return res.status(200).json({
      success: true,
      message: 'Updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ════════════════════════════║  API TO Delete Role By Id ║═════════════════════════════════//
export const DeleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.'
      });
    }

    await Role.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ════════════════════════════║  API TO Update Role Status By Id ║═════════════════════════════════//
export async function UpdateRoleStatus(req, res) {
  const { id } = req.params;
  const status = await Role.findOne({ _id: id });
  try {
    const RoleDetails = await Role.findOneAndUpdate(
      { _id: id },
      {
        // if status is 1, then change to 0, and vice
        status: status?.status == 1 ? 0 : 1
      },
      { new: true }
    );

    if (!RoleDetails) {
      return res.status(200).json({
        success: false,
        message: 'Role not found'
      });
    }
    return res.status(200).json({
      success: true,
      message:
        RoleDetails?.status == 1 ? 'Role is Activated' : 'Role is Deactivated',
      data: RoleDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error
    });
  }
}

// ════════════════════════════║  API TO Get role list By Role wise For Super Admin or State Admin or Ulb Amdin ║═════════════════════════════════//
