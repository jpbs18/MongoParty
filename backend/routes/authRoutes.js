const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { genereateTokenPair, isValidEmail, isValidPassword } = require('../helpers/functions');

const ACCESS_TOKEN_MAX_AGE = process.env.ACCESS_TOKEN_MAX_AGE;
const REFRESH_TOKEN_MAX_AGE = process.env.REFRESH_TOKEN_MAX_AGE;

router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: 'Please fill all the form fields to register.' });
    }

     if (!isValidEmail(email)) {
       return res.status(400).json({ error: 'Invalid email format.' });
     }

     if (!isValidPassword(password)) {
       return res.status(400).json({
         error:
           'Invalid password format. Password must have at least 8 characters, one uppercase, one lowercase and one digit.',
       });
     }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: 'Please make sure both passwords are equal.' });
    }

    const emailExists = await User.findOne({ email: email });

    if (emailExists) {
      return res
        .status(400)
        .json({ error: 'Someone is already using that email.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name,
      email: email,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      const { accessToken, refreshToken } = genereateTokenPair({
        _id: newUser._id,
      });

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        maxAge: ACCESS_TOKEN_MAX_AGE,
        sameSite: 'None',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: REFRESH_TOKEN_MAX_AGE,
        sameSite: 'None',
      });

      res.status(201).json({
        error: null,
        message: 'Register completed!',
        _id: newUser._id,
        name: newUser.name,
      });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Please insert email and password to login.' });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({
      error:
        'This email is not registered in our database, please register before login.',
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(400).json({
      error: 'Invalid password, please try again.',
    });
  }

  const { accessToken, refreshToken } = genereateTokenPair({ _id: user._id });

  res.cookie('jwt', accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    sameSite: 'None',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    sameSite: 'None',
  });

  res.status(200).json({
    error: null,
    message: 'Login completed!',
    _id: user._id,
    name: user.name,
  });
});


module.exports = router;