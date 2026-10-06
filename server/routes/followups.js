import { Router } from 'express'
import FollowUp from '../models/FollowUp.js'

const router = Router()

router.get('/', async (req, res) => {
  const followUps = await FollowUp.find().populate('lead', 'name').sort({ date: 1 }).lean()
  return res.json({
    followUps: followUps.map((item) => ({ ...item, leadId: item.lead?._id, leadName: item.lead?.name || 'Deleted lead' })),
  })
})

export default router
