import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/db.js'

const port = Number(process.env.PORT) || 4000
const requiredEnv = ['JWT_SECRET']
const missing = requiredEnv.filter((key) => !process.env[key])
if (process.env.JWT_SECRET && Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
  missing.push('JWT_SECRET (must be at least 32 bytes)')
}

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exitCode = 1
} else {
  try {
    await connectDatabase(process.env.MONGODB_URI)
    app.listen(port, () => console.info(`Mini CRM API listening on port ${port}`))
  } catch (error) {
    console.error('Unable to start the API:', error.message)
    process.exitCode = 1
  }
}
