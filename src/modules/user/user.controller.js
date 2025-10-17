const user = require('./user.model');

const userLoginController = (req, res) => {
  const { email, password } = req.body;

  const ExsistingUser = user.findBy
};
