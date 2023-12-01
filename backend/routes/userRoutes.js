const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { getTokenAndSecret } = require('../helpers/functions');
const { isValidEmail, isValidPassword } = require('../helpers/functions');


router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId }, { password: 0 });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: 'Id is not valid, please try again.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong with this operation, please try again.' });
  }
});

router.put('/', async (req, res) => {
  const { token, secret } = getTokenAndSecret(req);

  try {
    const decodedUser = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decodedUser._id });
    const sameUser = decodedUser._id === user._id.toString();

    if (sameUser) {
      const { name, email, password, confirmPassword } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Please insert your name.' });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please insert a valid email.' });
      }

      if (!isValidPassword(password)) {
        return res.status(400).json({
          error: 'Invalid password format. Password must have at least 8 characters, one uppercase, one lowercase and one digi'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Please make sure both passwords are equal.' });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const updatedData = {
        name,
        email,
        password: passwordHash,
      };

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: updatedData },
        { new: true, projection: { password: 0 } }
      );

      res
        .status(200)
        .json({ error: null, message: 'User updated!', updatedUser });
    }
  } catch (error) {
    res.status(401).json({ error: 'Access denied.' });
  }
});

module.exports = router;
