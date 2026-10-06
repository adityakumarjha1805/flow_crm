import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || ''
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    req.user = { id: payload.sub, role: payload.role }
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' })
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' })
  }
}
