/**
 * V1 Users Controller
 *
 * Format de réponse v1 (legacy) :
 * - Champ "name" = firstName + lastName concaténés
 * - Pas de pagination
 * - Pas de métadonnées
 * - success: true/false dans toutes les réponses
 */
const store = require('../../utils/store');

// Transforme le modèle interne vers le format v1
const toV1Format = (user) => ({
  id: user.id,
  name: `${user.firstName} ${user.lastName}`,  // v1 : nom complet en un seul champ
  email: user.email,
  age: user.age,
  role: user.role
});

const getAll = (req, res) => {
  const users = store.getAll().map(toV1Format);
  res.json({ success: true, data: users, count: users.length });
};

const getById = (req, res, next) => {
  const user = store.getById(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    return next(err);
  }
  res.json({ success: true, data: toV1Format(user) });
};

const create = (req, res, next) => {
  const { name, email, age, role } = req.body;

  if (!name || !email) {
    const err = new Error('name and email are required');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }

  // V1 : split le "name" en firstName/lastName pour le store interne
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || '';

  const user = store.create({ firstName, lastName, email, age, role: role || 'user' });
  res.status(201).json({ success: true, data: toV1Format(user) });
};

const update = (req, res, next) => {
  const { name, email, age, role } = req.body;

  const updateData = { email, age, role };
  if (name) {
    const [firstName, ...rest] = name.split(' ');
    updateData.firstName = firstName;
    updateData.lastName = rest.join(' ') || '';
  }

  const user = store.update(req.params.id, updateData);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    return next(err);
  }
  res.json({ success: true, data: toV1Format(user) });
};

const remove = (req, res, next) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    return next(err);
  }
  res.json({ success: true, message: 'User deleted' });
};

module.exports = { getAll, getById, create, update, remove };
