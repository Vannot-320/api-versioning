/**
 * Store en mémoire partagé entre v1 et v2
 * En production, remplacer par une vraie base de données
 */
let users = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Dupont',
    email: 'alice@example.com',
    age: 30,
    role: 'admin',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Martin',
    email: 'bob@example.com',
    age: 25,
    role: 'user',
    createdAt: '2024-02-15T14:30:00Z',
    updatedAt: '2024-03-01T09:00:00Z'
  },
  {
    id: 3,
    firstName: 'Carol',
    lastName: 'Bernard',
    email: 'carol@example.com',
    age: 35,
    role: 'user',
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2024-03-20T08:00:00Z'
  }
];

let nextId = 4;

module.exports = {
  getAll: () => [...users],
  getById: (id) => users.find(u => u.id === parseInt(id)),
  create: (data) => {
    const user = { id: nextId++, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    users.push(user);
    return user;
  },
  update: (id, data) => {
    const idx = users.findIndex(u => u.id === parseInt(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
    return users[idx];
  },
  remove: (id) => {
    const idx = users.findIndex(u => u.id === parseInt(id));
    if (idx === -1) return false;
    users.splice(idx, 1);
    return true;
  }
};
