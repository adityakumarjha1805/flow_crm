import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  company: { type: String, trim: true, maxlength: 120, default: '' },
  source: { type: String, required: true, trim: true, maxlength: 80, default: 'Website' },
  status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Closed'], default: 'New' },
  message: { type: String, trim: true, maxlength: 2000, default: '' },
  notes: { type: [noteSchema], default: [] },
}, { timestamps: true })

leadSchema.index({ createdAt: -1 })
leadSchema.index({ status: 1, source: 1 })
leadSchema.index({ email: 1 })

export default mongoose.model('Lead', leadSchema)
