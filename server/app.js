import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import contactRoutes from './routes/contact.js'
import dashboardRoutes from './routes/dashboard.js'
import followUpRoutes from './routes/followups.js'
import leadRoutes from './routes/leads.js'
import { requireAuth } from './middleware/auth.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { rejectMongoOperators } from './middleware/validate.js'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim())

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: false }))
app.use(express.json({ limit: '20kb' }))
app.use(rejectMongoOperators)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }), authRoutes)
app.use('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }), contactRoutes)
app.use('/api/leads', requireAuth, leadRoutes)
app.use('/api/followups', requireAuth, followUpRoutes)
app.use('/api/dashboard', requireAuth, dashboardRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
