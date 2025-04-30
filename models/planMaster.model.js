import { model, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const planSchema = new Schema({
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  fineRate: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: Number, default: 1}
});
planSchema.plugin(aggregatePaginate);
const Plan = model('Plan', planSchema);
export default Plan;