const router = require('express').Router();

const Users = require('../users/users-model.js');
const restricted = require('../auth/restricted-middleware.js');
const checkRole = require('../auth/check-role-middleware.js');

router.get('/', restricted, checkRole('Student'), (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

router.get('/:id', restricted, checkRole('Student'), (req, res) => {
  Users.findById(req.params.id)
    .then(user => {
      res.json(user);
    })
    .catch(err => res.send(err));
});

module.exports = router;
