///////////////////////////////////////////////////////// DEPENDENCIES /////////////////////////////////////////////////////////////////
import { Schema, model } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      require: true
    },
   
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'tbl_roles_mstrs',
      path: '_id',
      required: true
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
    },
    bankDetails: {
      bankName: { type: String, required: true },
      accountNumber: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /^[0-9]{9,18}$/ // 9-18 digits
      },
      ifscCode: { 
        type: String, 
        required: true, 
        match: /^[A-Z]{4}0[A-Z0-9]{6}$/ // Standard IFSC format (e.g., SBIN0001234)
      },
      branchName: { type: String, required: true },
      accountType: { 
        type: String, 
        enum: ['Savings', 'Current', 'Salary', 'Fixed Deposit'], 
        default: 'Savings' 
      }
    },
    aadhaarNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      match: /^[2-9]{1}[0-9]{11}$/ // 12-digit Aadhaar
    },
    panNumber: { 
      type: String, 
      required: false, 
      unique: true, 
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ // PAN format (optional)
    },
    createdAt: { type: Date, default: Date.now },
    paymentHistory: [{
      planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
      status: { type: String, enum: ['timely', 'late', 'defaulted'], default: 'timely' },
      completedAt: { type: Date }
    }],
    isEligibleForLoan: { type: Boolean, default: false } // Based on payment behavior
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(aggregatePaginate);

const User = model('users', UserSchema);

export default User;
