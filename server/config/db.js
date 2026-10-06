import mongoose from 'mongoose'

export const defaultMongoUri = 'mongodb://127.0.0.1:27017/mini_crm'

export async function connectDatabase(uri = process.env.MONGODB_URI || defaultMongoUri) {
  await mongoose.connect(uri)
  console.info('Connected to MongoDB')
}
