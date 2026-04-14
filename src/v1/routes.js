const express = require('express');
const router = express.Router();
const usersController = require('./controllers/users');

// V1 Root
router.get('/', (req, res) => {
  res.json({ version: 'v1', status: 'deprecated', sunset: '2025-12-31', endpoints: ['/users'] });
});

// V1 User Routes
router.get('/users', usersController.getAll);
router.get('/users/:id', usersController.getById);
router.post('/users', usersController.create);
router.put('/users/:id', usersController.update);
router.delete('/users/:id', usersController.remove);

module.exports = router;