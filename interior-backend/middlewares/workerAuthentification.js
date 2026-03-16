const jwt = require('jsonwebtoken');

const workerAuthentification = async (req, res, next) => {
  try {
    const token = req.cookies.workertoken;
    if (!token) return res.status(400).send('You are not logged in as worker');
    const secret = process.env.WORKER_JWT_SECRET || 'workerxsecretkey99';
    const data = jwt.verify(token, secret);
    req.worker = data;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports = workerAuthentification;
