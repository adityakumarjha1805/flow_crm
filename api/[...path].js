import app from '../server/app.js'
import { connectDatabase } from '../server/config/db.js'

let databaseConnection

export default async function handler(req, res) {
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    console.error('JWT_SECRET must be configured with at least 32 bytes.')
    return res.status(500).json({ message: 'The API is not configured correctly.' })
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI must be configured for the deployed API.')
    return res.status(500).json({ message: 'The API is not configured correctly.' })
  }

  try {
    if (!databaseConnection) {
      databaseConnection = connectDatabase(process.env.MONGODB_URI).catch((error) => {
        databaseConnection = undefined
        throw error
      })
    }
    await databaseConnection
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message)
    return res.status(503).json({ message: 'The database is unavailable. Check the API logs and database connection settings.' })
  }

  return app(req, res)
}
