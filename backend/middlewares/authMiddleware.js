const authMiddleware = async (req, res, next) => {
  const refreshTokenCookies = req.cookies.refreshToken;
  const accessTokenCookies = req.cookies.jwt;

  try {
    return accessTokenCookies || refreshTokenCookies
      ? next()
      : res.status(401).json({ error: 'Token lifetime expired, please login.' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong, please try again.' });
  }
};

module.exports = authMiddleware;
