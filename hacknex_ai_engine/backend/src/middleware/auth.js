// const admin = require('../config/firebase');
module.exports.verifyToken = async (req, res, next) => {
  // Dummy auth middleware
  // const token = req.headers.authorization?.split(' ')[1];
  // verify with firebase admin...
  req.user = { uid: '123', role: 'State' }; // mock
  next();
};
