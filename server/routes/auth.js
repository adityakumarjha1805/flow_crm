import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password is too long'),
}).strict()

router.post('/login', validate(loginSchema), async (req, res) => {
  const user = await User.findOne({ email: req.validatedBody.email.toLowerCase() }).select('+password')
  if (!user || !(await bcrypt.compare(req.validatedBody.password, user.password))) {
    return res.status(401).json({ message: 'Email or password is incorrect' })
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

export default router
