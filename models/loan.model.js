import { model, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const loanSchema = new  Schema({
  userId: { type:  Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'repaid', 'defaulted'], default: 'active' },
  repaymentSchedule: [{
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paidOn: { type: Date },
    isLate: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});
loanSchema.plugin(aggregatePaginate);
const Loan =  model('Loan', loanSchema);
export default Loan;