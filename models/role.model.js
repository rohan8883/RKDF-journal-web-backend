import { model, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const RoleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    status: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

RoleSchema.plugin(aggregatePaginate);

const Role = model('tbl_roles_mstrs', RoleSchema);
export default Role;
