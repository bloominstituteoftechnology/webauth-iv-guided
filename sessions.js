const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session'); // 1. added this
const KnexSessionStore = require('connect-session-knex')(session);

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

//  3 added this
const sessionConfig = {
  name: 'monkey',
  secret: 'keep it secret, keep it safe!',
  cookie: {
    maxAge: 1000 * 60 * 60, // in ms
    secure: false, // used over https only
  },
  httpOnly: true, // cannot access the cookie from js using document.cookie
  resave: false,
  saveUninitialized: false, // GDPR laws against setting cookies automatically

  store: new KnexSessionStore({
    knex: db,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60, // in ms
  }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig)); // 2. added this

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;

  // generate hash from user's password
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n

  // override user.password with hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      req.session.user = saved;
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // check that passwords match
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user; // 4. this
        res
          .status(200)
          .json({ message: `Welcome ${user.username}!, have a cookie...` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// 5. simplified this a lot
function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'You shall not pass!' });
  }
}
// function restricted(req, res, next) {
//   const { username, password } = req.headers;

//   if (username && password) {
//     Users.findBy({ username })
//       .first()
//       .then(user => {
//         if (user && bcrypt.compareSync(password, user.password)) {
//           next();
//         } else {
//           res.status(401).json({ message: 'Invalid Credentials' });
//         }
//       })
//       .catch(error => {
//         res.status(500).json({ message: 'Ran into an unexpected error' });
//       });
//   } else {
//     res.status(400).json({ message: 'No credentials provided' });
//   }
// }

// axios.get(url, { headers: { username, password } });

// protect this route, only authenticated users should see it
server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/users', restricted, async (req, res) => {
  try {
    const users = await Users.find();

    res.json(users);
  } catch (error) {
    res.send(error);
  }
});

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send(
          'you can checkout any time you like, but you can never leave....'
        );
      } else {
        res.send('bye, thanks for playing');
      }
    });
  } else {
    res.end();
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
