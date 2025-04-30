///////////////////////////////////////////////////////// DEPENDENCIES /////////////////////////////////////////////////////////////////

import { Schema, model } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const OtpSchema = new Schema(
  {
    email: {
      type: String,
      require: true
    },
    otp: {
      type: String,
      require: true
    },
    password: {
      type: String,
      require: true
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'tbl_roles_mstrs',
      path: '_id',
      // required: true
    },
    status: {
      type: Number,
      default: 1
    },
  },
  {
    timestamps: true
  }
);

OtpSchema.plugin(aggregatePaginate);

const Otp = model('tbl_otps', OtpSchema);

export default Otp;
