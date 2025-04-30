import { model, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  interestEarned: { type: Number, default: 0 },
  fineCharged: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'defaulted'], default: 'active' },
  paymentSchedule: [{
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paidOn: { type: Date },
    isLate: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});
subscriptionSchema.plugin(aggregatePaginate);
const Subscription = model('Subscription', subscriptionSchema);
export default Subscription;