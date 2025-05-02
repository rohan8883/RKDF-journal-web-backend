///////////////////////////////////////////////////////// DEPENDENCIES /////////////////////////////////////////////////////////////////
import { Schema, model } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      require: true
    },
    familyName: {
      type: String,
    },
    userName: {
      type: String,
    },
    affiliation: {
      type: String,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'tbl_roles_mstrs',
      path: '_id',
      // default: 'Author',
    },
    mobile: {
      type: String,
      require: true
    },
    email: {
      type: String
    },
    password: {
      type: String,
      require: true
    },
    address: {
      type: String
    },
    country: {
      type: String
    },
    states: {
      type: String
    },
    city: {
      type: String
    },
    zipCode: {
      type: String
    },
    status: {
      type: Number,
      default: 1
    },
    imageUrl: {
      type: String
    },
    fullImgUrl: {
      type: String
    },
    googleId: {
      type: String
    },
    permission: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(aggregatePaginate);

const User = model('users', UserSchema);

export default User;
