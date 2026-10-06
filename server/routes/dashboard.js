import { Router } from 'express'
import Lead from '../models/Lead.js'

const router = Router()

router.get('/stats', async (req, res) => {
  const [counts, recentLeads, byDay] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
    Lead.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 86400000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ])
  const statuses = Object.fromEntries(['New', 'Contacted', 'Converted', 'Closed'].map((status) => [status, counts.find((item) => item._id === status)?.count || 0]))
  const total = Object.values(statuses).reduce((sum, count) => sum + count, 0)
  return res.json({ total, ...statuses, conversionRate: total ? Math.round(statuses.Converted / total * 100) : 0, recentLeads, leadsByDay: byDay })
})

export default router
