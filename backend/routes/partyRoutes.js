const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

const User = require('../models/user');
const Party = require('../models/party');
const diskStorage = require('../helpers/multer-configuration');
const { getTokenAndSecret } = require('../helpers/functions');
const upload = multer({ storage: diskStorage });

router.post('/', upload.fields([{ name: 'photos' }]), async (req, res) => {
  const { title, description, partyDate, privacy } = req.body;
  const { token, secret } = getTokenAndSecret(req);
  const files = req.files ? req.files.photos : [];

  if (!title || !description || !partyDate) {
    return res.status(400).json({
      error: 'Please fill at least name, description and party date fields.',
    });
  }

  try {
    const decodedUser = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decodedUser._id });
    let photos = [];

    if (files && files.length > 0) {
      photos = files.map((file) => file.path);
    }

    const party = new Party({
      userId: user._id.toString(),
      title,
      description,
      partyDate,
      photos,
      privacy,
    });

    const newParty = await party.save();
    res.status(200).json({ error: null, message: 'Party added!', newParty });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get('/all', async (req, res) => {
  try {
    const parties = await Party.find().sort([['_id', -1]]);
    res.status(200).json({ error: null, parties });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get('/userparties', async (req, res) => {
  const { token, secret } = getTokenAndSecret(req);

  try {
    const decodedUser = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decodedUser._id });
    const userParties = await Party.find({ userId: user._id }).sort([
      ['_id', -1],
    ]);

    res.status(200).json({ error: null, userParties });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get('/userparty/:id', async (req, res) => {
  const { token, secret } = getTokenAndSecret(req);

  try {
    const decodedUser = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decodedUser._id });
    const partyId = req.params.id;
    const party = await Party.findOne({ userId: user._id, _id: partyId });

    res.status(200).json({ error: null, party });
  } catch (error) {
    res.status(400).json({ error: 'Invalid partyId!' });
  }
});

router.delete('/:id', async (req, res) => {
  const { token, secret } = getTokenAndSecret(req);

  try {
    const decodedUser = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decodedUser._id });
    const partyId = req.params.id;
    const result = await Party.deleteOne({ userId: user._id, _id: partyId });

    return result.deletedCount
      ? res.status(200).json({ error: null, message: 'Party removed!' })
      : res
          .status(400)
          .json({ error: 'The party does not belong to the user.' });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put('/:id', upload.fields([{ name: 'photos' }]), async (req, res) => {
  const { title, description, partyDate, privacy, userId } = req.body;
  const partyId = req.params.id;
  const { token, secret } = getTokenAndSecret(req);
  const files = req.files ? req.files.photos : [];

  if (!title || !description || !partyDate) {
    return res.status(400).json({
      error: 'Please fill at least name, description and party date fields.',
    });
  }

  try {
    const decodedUser = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decodedUser._id });

    let photos = [];

    if (files && files.length > 0) {
      photos = files.map((file) => file.path);
    }

    const party = {
      _id: partyId,
      userId,
      title,
      description,
      partyDate,
      privacy,
      photos,
    };

    const updatedParty = await Party.findOneAndUpdate(
      { _id: partyId, userId: user._id },
      { $set: party },
      { new: true }
    );

    if(!updatedParty){
      return res.status(400).json({ error: 'That party does not belong to the user.' });
    }

    res.status(200).json({ error: null, message: 'Party updated!', updatedParty });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
