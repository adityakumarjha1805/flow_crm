import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDatabase } from './config/db.js'
import FollowUp from './models/FollowUp.js'
import Lead from './models/Lead.js'
import User from './models/User.js'

const demoLeads = [
  ['Olivia Rhye', 'olivia@untitledui.com', 'Untitled UI', 'Website', 'New', 0],
  ['Phoenix Baker', 'phoenix@baker.com', 'Baker & Co.', 'Referral', 'Contacted', 1],
  ['Lana Steiner', 'lana@steiner.io', 'Steiner Studio', 'LinkedIn', 'Converted', 2],
  ['Demi Wilkinson', 'demi@wilkinson.co', 'Wilkinson Design', 'Website', 'New', 3],
  ['Candice Wu', 'candice@acme.com', 'Acme Corp', 'Campaign', 'Contacted', 4],
  ['Natali Craig', 'natali@frame.io', 'Frame', 'Referral', 'Closed', 5],
  ['Drew Cano', 'drew@canostudio.com', 'Cano Studio', 'Website', 'New', 6],
  ['Orlando Diggs', 'orlando@diggs.com', 'Diggs Creative', 'LinkedIn', 'Converted', 7],
  ['Andi Lane', 'andi@lane.design', 'Lane Design', 'Website', 'Contacted', 8],
  ['Kate Morrison', 'kate@morrison.io', 'Morrison Labs', 'Campaign', 'New', 9],
].map(([name, email, company, source, status, daysAgo]) => ({
  name, email, company, source, status, phone: '',
  message: `Interested in exploring how we can work together. ${name.split(' ')[0]} would appreciate a conversation.`,
  createdAt: new Date(Date.now() - daysAgo * 86400000),
}))

try {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your environment before seeding.')
  }
  if (process.env.ADMIN_PASSWORD.length < 12 || Buffer.byteLength(process.env.ADMIN_PASSWORD, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must contain 12 to 72 UTF-8 bytes for bcrypt.')
  }
  await connectDatabase(process.env.MONGODB_URI)
  const email = process.env.ADMIN_EMAIL.toLowerCase()
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await User.findOneAndUpdate({ email }, { name: process.env.ADMIN_NAME, email, password, role: 'admin' }, { upsert: true, new: true, runValidators: true })
  if (process.env.SEED_DEMO_DATA === 'true') {
    const existingSamples = await Lead.find({ email: { $in: demoLeads.map((lead) => lead.email) } }).select('_id').lean()
    await FollowUp.deleteMany({ lead: { $in: existingSamples.map((lead) => lead._id) } })
    await Lead.deleteMany({ email: { $in: demoLeads.map((lead) => lead.email) } })
    const leads = await Lead.insertMany(demoLeads)
    await FollowUp.create([
      { lead: leads[1]._id, date: new Date(Date.now() + 86400000), description: 'Send over the tailored proposal' },
      { lead: leads[3]._id, date: new Date(Date.now() + 2 * 86400000), description: 'Book a discovery call' },
      { lead: leads[4]._id, date: new Date(Date.now() - 86400000), description: 'Check in about the proposal', completed: true },
    ])
  }
  console.info(`Admin account ready for ${email}${process.env.SEED_DEMO_DATA === 'true' ? ' with sample leads' : ''}`)
} catch (error) {
  console.error('Unable to seed the database:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
