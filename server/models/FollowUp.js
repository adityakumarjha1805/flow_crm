import mongoose from 'mongoose'

const followUpSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  date: { type: Date, required: true },
  description: { type: String, required: true, trim: true, maxlength: 250 },
  completed: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

followUpSchema.index({ date: 1, completed: 1 })

export default mongoose.model('FollowUp', followUpSchema)
