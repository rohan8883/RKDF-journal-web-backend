import { model, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['payment', 'fine', 'interest', 'loan_disbursement', 'loan_repayment'], required: true },
  amount: { type: Number, required: true },
  referenceId: { type: Schema.Types.ObjectId },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
transactionSchema.plugin(aggregatePaginate);
const Transaction = model('Transaction', transactionSchema);
export default Transaction;