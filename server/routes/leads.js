import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import FollowUp from '../models/FollowUp.js'
import Lead from '../models/Lead.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const statuses = ['New', 'Contacted', 'Converted', 'Closed']
const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).refine((value) => !value || /^\+?[\d\s().-]{7,30}$/.test(value), 'Enter a valid phone number').optional().default(''),
  company: z.string().trim().max(120).optional().default(''),
  source: z.string().trim().min(1).max(80).optional().default('Website'),
  status: z.enum(statuses).optional().default('New'),
  message: z.string().trim().max(2000).optional().default(''),
}).strict()
const updateSchema = leadSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required')
const noteSchema = z.object({ text: z.string().trim().min(1).max(2000) }).strict()
const followUpSchema = z.object({
  date: z.coerce.date().refine((date) => !Number.isNaN(date.valueOf()), 'A valid date is required'),
  description: z.string().trim().min(1).max(250),
}).strict()
const validId = (id) => mongoose.isValidObjectId(id)

router.get('/', async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))
  const filter = {}
  if (statuses.includes(req.query.status)) filter.status = req.query.status
  if (typeof req.query.source === 'string' && req.query.source.length <= 80) filter.source = req.query.source
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const escaped = req.query.search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { email: { $regex: escaped, $options: 'i' } }, { company: { $regex: escaped, $options: 'i' } }]
  }
  const direction = req.query.sort === 'oldest' ? 1 : -1
  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: direction }).skip((page - 1) * limit).limit(limit).lean(),
    Lead.countDocuments(filter),
  ])
  const followUps = await FollowUp.find({ lead: { $in: leads.map((lead) => lead._id) } }).sort({ date: 1 }).lean()
  const followUpsByLead = new Map()
  followUps.forEach((followUp) => {
    const key = followUp.lead.toString()
    followUpsByLead.set(key, [...(followUpsByLead.get(key) || []), followUp])
  })
  leads.forEach((lead) => { lead.followUps = followUpsByLead.get(lead._id.toString()) || [] })
  return res.json({ leads, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

router.get('/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead identifier' })
  const lead = await Lead.findById(req.params.id).lean()
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  lead.followUps = await FollowUp.find({ lead: lead._id }).sort({ date: 1 }).lean()
  return res.json({ lead })
})

router.post('/', validate(leadSchema), async (req, res) => {
  const lead = await Lead.create(req.validatedBody)
  return res.status(201).json({ lead })
})

router.put('/:id', validate(updateSchema), async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead identifier' })
  const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: req.validatedBody }, { new: true, runValidators: true })
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  return res.json({ lead })
})

router.delete('/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead identifier' })
  const lead = await Lead.findByIdAndDelete(req.params.id)
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  await FollowUp.deleteMany({ lead: lead._id })
  return res.json({ message: 'Lead deleted' })
})

router.post('/:id/notes', validate(noteSchema), async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead identifier' })
  const lead = await Lead.findById(req.params.id)
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  lead.notes.unshift({ text: req.validatedBody.text, createdBy: req.user.id })
  await lead.save()
  return res.status(201).json({ note: lead.notes[0] })
})

router.post('/:id/followups', validate(followUpSchema), async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead identifier' })
  if (!await Lead.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Lead not found' })
  const followUp = await FollowUp.create({ ...req.validatedBody, lead: req.params.id, createdBy: req.user.id })
  return res.status(201).json({ followUp })
})

router.patch('/:id/followups/:followUpId', async (req, res) => {
  if (!validId(req.params.id) || !validId(req.params.followUpId)) return res.status(400).json({ message: 'Invalid resource identifier' })
  if (typeof req.body?.completed !== 'boolean' || Object.keys(req.body || {}).some((key) => key !== 'completed')) return res.status(400).json({ message: 'A completed boolean is required' })
  const followUp = await FollowUp.findOneAndUpdate({ _id: req.params.followUpId, lead: req.params.id }, { $set: { completed: req.body.completed } }, { new: true, runValidators: true })
  if (!followUp) return res.status(404).json({ message: 'Follow-up not found' })
  return res.json({ followUp })
})

export default router
