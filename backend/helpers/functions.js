const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;

const genereateTokenPair = (userCredentials) => {
  const accessToken = jwt.sign(userCredentials, SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign(userCredentials, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

const getTokenAndSecret = (req) => {
  const refreshTokenCookies = req.cookies.refreshToken;
  const accessTokenCookies = req.cookies.jwt;
  const token = accessTokenCookies || refreshTokenCookies;
  const secret = accessTokenCookies ? SECRET : REFRESH_SECRET;

  return { token, secret };
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  return passwordRegex.test(password);
};

module.exports = {
  genereateTokenPair,
  getTokenAndSecret,
  isValidEmail,
  isValidPassword,
};
