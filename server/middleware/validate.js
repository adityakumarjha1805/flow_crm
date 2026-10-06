export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ message: 'Please check the submitted fields', errors: result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) })
    }
    req.validatedBody = result.data
    return next()
  }
}

export function rejectMongoOperators(req, res, next) {
  const hasUnsafeKey = (value) => {
    if (!value || typeof value !== 'object') return false
    return Object.entries(value).some(([key, child]) => key.startsWith('$') || key.includes('.') || hasUnsafeKey(child))
  }
  if (hasUnsafeKey(req.body) || Object.keys(req.query).some((key) => key.startsWith('$') || key.includes('.'))) {
    return res.status(400).json({ message: 'Invalid request data' })
  }
  return next()
}
