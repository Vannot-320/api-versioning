/**
 * V2 Users Controller
 *
 * Améliorations par rapport à v1 :
 * - firstName + lastName séparés (pas de concat)
 * - Pagination (page, limit, total, pages)
 * - Filtrage par role
 * - PATCH partiel au lieu de PUT complet
 * - Timestamps exposés (createdAt, updatedAt)
 * - Enveloppe de réponse avec metadata
 */
const store = require('../../utils/store');

// Transforme le modèle interne vers le format v2
const toV2Format = (user) => ({
  id: user.id,
  firstName: user.firstName,   // v2 : champs séparés
  lastName: user.lastName,
  email: user.email,
  age: user.age,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const getAll = (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const role  = req.query.role;

  let users = store.getAll();

  // Filtrage optionnel par rôle
  if (role) {
    users = users.filter(u => u.role === role);
  }

  const total = users.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data  = users.slice(start, start + limit).map(toV2Format);

  res.json({
    data,
    meta: {
      total,
      page,
      limit,
      pages,
      ...(page < pages && { next: `/api/v2/users?page=${page + 1}&limit=${limit}` }),
      ...(page > 1      && { prev: `/api/v2/users?page=${page - 1}&limit=${limit}` })
    }
  });
};

const getById = (req, res, next) => {
  const user = store.getById(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    return next(err);
  }
  res.json({ data: toV2Format(user) });
};

const create = (req, res, next) => {
  const { firstName, lastName, email, age, role } = req.body;

  if (!firstName || !lastName || !email) {
    const err = new Error('firstName, lastName and email are required');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }

  // Validation email simple
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const err = new Error('Invalid email format');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }

  const user = store.create({ firstName, lastName, email, age, role: role || 'user' });
  res.status(201).json({ data: toV2Format(user) });
};

const update = (req, res, next) => {
  // PATCH : mise à jour partielle, seuls les champs fournis sont modifiés
  const { firstName, lastName, email, age, role } = req.body;
  const updateData = {};

  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName  !== undefined) updateData.lastName  = lastName;
  if (email     !== undefined) updateData.email     = email;
  if (age       !== undefined) updateData.age       = age;
  if (role      !== undefined) updateData.role      = role;

  const user = store.update(req.params.id, updateData);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    return next(err);
  }
  res.json({ data: toV2Format(user) });
};

const remove = (req, res, next) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    return next(err);
  }
  res.status(204).send();  // v2 : 204 No Content au lieu de 200
};

module.exports = { getAll, getById, create, update, remove };
