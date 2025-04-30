// api permission middleware?
import ApiPermission from '../models/apiPermission.model.js';
import Role from '../models/role.model.js/index.js';

export default async function (req, res, next) {
  const { user } = req;
  const { role } = user;
  const { method, path } = req;
  const apiPermission = await ApiPermission.findOne({
    path,
    method
  });
  if (!apiPermission) {
    return res.status(403).json({
      message: 'Forbidden'
    });
  }
  const rolePermission = await Role.findOne({
    _id: role
  });
  if (!rolePermission) {
    return res.status(403).json({
      message: 'Forbidden'
    });
  }
  const { permissions } = rolePermission;
  if (!permissions.includes(apiPermission._id)) {
    return res.status(403).json({
      message: 'Forbidden'
    });
  }
  next();
}
