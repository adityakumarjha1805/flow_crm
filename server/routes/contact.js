import { Router } from 'express'
import { z } from 'zod'
import Lead from '../models/Lead.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).refine((value) => !value || /^\+?[\d\s().-]{7,30}$/.test(value), 'Enter a valid phone number').optional().default(''),
  message: z.string().trim().min(5).max(2000),
}).strict()

router.post('/', validate(contactSchema), async (req, res) => {
  const lead = await Lead.create({ ...req.validatedBody, source: 'Website Contact Form', status: 'New' })
  return res.status(201).json({ message: 'Contact request received', lead })
})

export default router
