import mongoose from 'mongoose';
import Users from '../models/user.model.js';
import { uploadFile } from '../middleware/_multer.js';
import { hash } from '../utils/index.js';

// ════════════════════════════║  API TO Get All User ║═════════════════════════════════//

// export async function CreateUserWithImage(req, res) {
//   const upload = uploadFile('./uploads/profile');
//   try {
//     upload.single('imageUrl')(req, res, async (err) => {
//       if (err) {
//         res.status(400).json(err.message);
//       } else {
//         const { fullName, email, mobile, roleId,  address, password } =
//           req.body;
//         console.log(req.file?.filename);
//         const checkEmail = await Users.findOne({ email });
//         if (checkEmail) {
//           return res.status(200).json({
//             success: false,
//             message: 'Email already exists'
//           });
//         }
//         const hashPassword = await hash(String(password ?? '12345678'));
//         const createUser = await Users.create({
//           fullName,
//           email,
//           mobile,
//           password: hashPassword,
//           roleId,
//           imageUrl: req.file?.filename,
//           address,
//           fullImgUrl: `${process.env.BACKEND_URL}/${req?.file?.filename}`
//         });
//         return res.status(200).json({
//           success: true,
//           userDetails: createUser,
//           message: 'Successfully created'
//         });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

export async function CreateUserWithImage(req, res) {
  const upload = uploadFile('./uploads/profile');
  try {
    upload.single('imageUrl')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const {
        fullName,
        email,
        mobile,
        roleId,
        address,
        password,
        country,
        states,
        city,
        zipCode,
        aadhaarNumber,
        panNumber,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        accountType
      } = req.body;

      // Check for existing email or Aadhaar/account
      const existingUser = await Users.findOne({ $or: [{ email }, { aadhaarNumber }, { 'bankDetails.accountNumber': accountNumber }] });
      if (existingUser) {
        return res.status(200).json({
          success: false,
          message: 'Email, Aadhaar, or Account number already exists'
        });
      }

      const hashedPassword = await hash(String(password ?? '12345678'));

      const newUser = await Users.create({
        fullName,
        email,
        mobile,
        roleId,
        address,
        password: hashedPassword,
        country,
        states,
        city,
        zipCode,
        imageUrl: req.file?.filename,
        fullImgUrl: `${process.env.BACKEND_URL}/${req.file?.filename}`,
        aadhaarNumber,
        panNumber,
        bankDetails: {
          bankName,
          accountNumber,
          ifscCode,
          branchName,
          accountType
        }
      });

      return res.status(200).json({
        success: true,
        userDetails: newUser,
        message: 'Successfully created'
      });
    });
  } catch (error) {
    console.error('CreateUserWithImage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function GetAllUsers(req, res) {
  const { page = 1, limit = 10, q } = req.query;
  try {
    const options = { page, limit };

    let query = [
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          __v: 0,
          password: 0
        }
      }
    ];

    if (q) {
      query.push({
        $match: {
          $or: [
            { email: { $regex: new RegExp(q, 'i') } },
            { fullName: { $regex: new RegExp(q, 'i') } },
            { 'role.roleName': { $regex: new RegExp(q, 'i') } },
            { 'ulb.ulbName': { $regex: new RegExp(q, 'i') } }
          ]
        }
      });
    }

    const aggregate = Users.aggregate([
      {
        $lookup: {
          from: 'tbl_ulbs_mstrs',
          localField: 'ulbId',
          foreignField: '_id',
          as: 'ulb'
        }
      },
      {
        $unwind: {
          path: '$ulb',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: 'tbl_roles_mstrs',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      },

      ...query,
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true
        }
      },

      // role in userDetails?
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          mobile: 1,
          address: 1,
          zipCode: 1,
          country: 1,
          states: 1,
          city: 1,
          imageUrl: 1,
          fullImgUrl: 1,
          status: 1,
          roleId: 1,
          createdAt: 1,
          updatedAt: 1,
          role: '$role.roleName',
          ulb: '$ulb.ulbName'
        }
      },

      {
        $lookup: {
          from: 'tbl_permissions',
          localField: 'roleId',
          foreignField: 'roleId',
          as: 'permission'
        }
      },

      {
        $project: {
          'permission._id': 0,
          'permission.roleId': 0,
          'permission.createdAt': 0,
          'permission.updatedAt': 0,
          'permission.status': 0,
          'permission.__v': 0
        }
      }
      // user id and permission status=1
    ]);

    const getAllUsers = await Users.aggregatePaginate(aggregate, options);

    if (!getAllUsers) {
      return res.status(400).json({
        success: true,
        message: 'No record found!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched successfully.',
      data: getAllUsers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error
    });
  }
}

// ════════════════════════════║  API TO Get User By Id ║═════════════════════════════════//

export async function GetUserWithId(req, res) {
  const { id } = req.params;
  try {
    const userDetails = await Users.findOne({ _id: id }, { __v: 0 }).lean();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      userDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export async function GetUser(req, res) {
  const host = req.headers.host;
  const protocol = req.protocol;
  try {
    // join with permission table
    const userDetails = await Users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user?._id)
        }
      },

      {
        $lookup: {
          from: 'tbl_roles_mstrs',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true
        }
      },
      // role in userDetails?
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          mobile: 1,
          address: 1,
          zipCode: 1,
          country: 1,
          states: 1,
          city: 1,
          gymName:1,
          imageUrl: 1,
          status: 1,
          roleId: 1,
          googleId: 1,
          createdAt: 1,
          updatedAt: 1,
          userUlbId: '$ulbId',

          role: '$role.roleName'
        }
      },

      {
        $lookup: {
          from: 'tbl_permissions',
          localField: 'roleId',
          foreignField: 'roleId',
          as: 'permission',
          pipeline: [
            {
              $match: {
                status: 1
              }
            },
            {
              $lookup: {
                from: 'tbl_menu_mstrs',
                localField: 'menuId',
                foreignField: '_id',
                as: 'menu'
              }
            },
            {
              $unwind: {
                path: '$menu',
                preserveNullAndEmptyArrays: true
              }
            },
            // only menu name pathname
            {
              $project: {
                path: '$menu.pathName',
                menuName: '$menu.menuName',
                create: 1,
                read: 1,
                update: 1,
                delete: 1
              }
            }
          ]
        }
      },

      {
        $project: {
          'permission._id': 0,
          'permission.roleId': 0,
          'permission.createdAt': 0,
          'permission.updatedAt': 0,
          'permission.status': 0,
          'permission.__v': 0,
          'permission.menuId': 0
        }
      }
    ]);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      userDetails: {
        ...userDetails[0],
        imgFullPath: `${protocol}://${host}/${userDetails[0].imageUrl}`
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// ════════════════════════════║  API TO Upload User Profile Image  ║═════════════════════════════════//

export async function UploadProfileImage(req, res) {
  const upload = await uploadFile('./uploads/profile');
  try {
    await upload.single('imageUrl')(req, res, async (err) => {
      if (err) {
        res.status(400).json(err.message);
      } else {
        console.log(req.file?.filename);
        const updateUser = await Users.findOneAndUpdate(
          { _id: req.user?._id },
          {
            imageUrl: req.file?.filename
          },
          {
            new: true
          }
        );
        res.status(200).json({
          success: true,
          id: updateUser?._id,
          message: 'Successfully uploaded'
        });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ════════════════════════════║  API TO Update User Data  ║═════════════════════════════════//

export async function UpdateUser(req, res) {
  
  try {
        const { fullName, mobile, roleId, address, gymName, zipCode} = req.body;
        const updateUser = await Users.findOneAndUpdate(
          { _id: req.user?._id },
          {
            fullName,
            mobile,
            roleId,
            address,
            gymName,
            zipCode
          },
          {
            new: true
          }
        );
        return res.status(200).json({
          success: true,
          userDetails: updateUser,
          message: 'Successfully updated'
        });
     
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
export async function UpdateUserAdmin(req, res) {
  const { id } = req.params;
  const { fullName, mobile, email, status, roleId } = req.body;
  try {
    const updateUser = await Users.findOneAndUpdate(
      { _id: id },
      {
        fullName,
        mobile,
        email,
        status,
        roleId
      },
      {
        new: true
      }
    );
    return res.status(200).json({
      success: true,
      userDetails: updateUser,
      message: 'Successfully updated'
    });
  } catch (err) {
    return res.status(400).json(err);
  }
}

// ════════════════════════════║  API TO Update User Permission   ║═════════════════════════════════//

export async function UpdatePermission(req, res) {
  const { id } = req.params;
  const { permission } = req.body;
  try {
    if (permission?.length === 0)
      return res.status(400).json({ message: 'Please select permission' });
    const getUser = await Users.findOne({ _id: id });

    const isPermission = getUser?.permission?.map((item) => {
      return;
    });

    return res.status(200).json({ message: 'Successfully updated' });
  } catch (err) {
    res.status(400).json(err);
  }
}

// ════════════════════════════║  API TO Create User  ║═════════════════════════════════//

export async function CreateUser(req, res) {
  const { fullName, email, mobile, roleId } = req.body;
  const img = req.files;
  console.log('Creating user', img);

  try {
    const checkEmail = await Users.findOne({ email });
    if (checkEmail) {
      return res.status(200).json({
        success: false,
        message: 'Email already exists'
      });
    }
    const hashPassword = await hash(String('12345678'));
    const createUser = await Users.create({
      fullName,
      email,
      mobile,
      password: hashPassword,
      roleId
    });
    return res.status(200).json({
      success: true,
      userDetails: createUser,
      message: 'Successfully created'
    });
  } catch (err) {
    res.status(400).json(err);
  }
}

// ════════════════════════════║  API TO Update Users Status By Id ║═════════════════════════════════//

export async function UpdateUserStatus(req, res) {
  const { id } = req.params;
  const status = await Users.findOne({ _id: id });
  try {
    const UserDetails = await Users.findOneAndUpdate(
      { _id: id },
      {
        // if status is 1, then change to 0, and vice
        status: status?.status == 1 ? 0 : 1
      },
      { new: true }
    );

    if (!UserDetails) {
      return res.status(200).json({
        success: false,
        message: 'Users not found'
      });
    }
    return res.status(200).json({
      success: true,
      message:
        UserDetails?.status == 1 ? 'User is Activated' : 'User is Deactivated',
      data: UserDetails
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error
    });
  }
}
