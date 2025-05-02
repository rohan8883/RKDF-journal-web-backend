import { model, Schema } from "mongoose"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const personSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  affiliation: { type: String },
  orcid: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
})

personSchema.plugin(aggregatePaginate)
const Person = model("Person", personSchema)
export default Person
