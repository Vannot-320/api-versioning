const express = require('express');
const router = express.Router();
const usersController = require('./controllers/users');

// V2 Root
router.get('/', (req, res) => {
  res.json({ version: 'v2', status: 'current', endpoints: ['/users'] });
});

// V2 User Routes - CRUD complet + pagination
router.get('/users', usersController.getAll);
router.get('/users/:id', usersController.getById);
router.post('/users', usersController.create);
router.patch('/users/:id', usersController.update);
router.delete('/users/:id', usersController.remove);

module.exports = router;