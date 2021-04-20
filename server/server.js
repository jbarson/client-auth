const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors())

const users = {
  jbarson: {
    name: 'Jon Barson',
    password: '123'
  },
  jonb: {
    name: 'Evil Jon',
    password: '123'
  }
}

const authorize = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ success: false, message: 'This route requires authorization header' });
  if (req.headers.authorization.indexOf('Bearer') === -1) return res.status(401).json({ success: false, message: 'This route requires Bearer token' });
  const authToken = req.headers.authorization.split(' ')[1];
  jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'The token is invalid' });
    req.jwtDecoded = decoded;
    next();
  });
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(403).json({ success: false, message: 'User is not found' });
  if (user && user.password === password) {
    const token = jwt.sign(
      {
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + 300, 
        username,
        loginTime: Date.now()
      },
      process.env.JWT_SECRET
    );
    return res.status(200).json({ token });
  } else {
    return res.status(403).json({ success: false, message: 'Username/password combination is wrong' })
  }
});

app.get('/profile', authorize, (req, res) => {
  // if user is authenticated send back the token info that we stored in request object in the middleware but also any additional sensitive information
  res.json({
    tokenInfo: req.jwtDecoded,
    sensitiveInformation: {
      secret: 'Cat Person'
    }
  });
});

app.get('/super-secret', authorize, (req, res) => {
  res.json({
    superSecret: 'I secretly like PHP'
  });
});

app.get('/global', (req, res) => {
  res.status(200).send({info: "not secret"})
})

app.listen(port, () => {
  console.log('started on port', port)
})