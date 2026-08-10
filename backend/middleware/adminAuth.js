/**
 * Very lightweight protection for admin-only write routes.
 * The frontend admin page must send the same key in the "x-admin-key" header.
 * This is intentionally simple for a "lite" project - swap in real auth
 * (JWT, sessions, etc.) before using this in production.
 */
function adminAuth(req, res, next) {
  const providedKey = req.header('x-admin-key');
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    // Fail safe: if no admin key is configured on the server, block writes
    return res.status(500).json({ message: 'Server admin key is not configured' });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ message: 'Unauthorized: invalid or missing admin key' });
  }

  next();
}

module.exports = adminAuth;
