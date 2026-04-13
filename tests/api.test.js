const request = require('supertest');
const app = require('../src/app');

// ─── Health & Info ──────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('retourne 200 avec le statut ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body.versions.current).toBe('v2');
    expect(res.body.versions.supported).toContain('v1');
    expect(res.body.versions.supported).toContain('v2');
  });
});

describe('GET /api', () => {
  it('retourne les infos générales de l\'API', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('versions');
    expect(res.body.versions.v1.status).toBe('deprecated');
    expect(res.body.versions.v2.status).toBe('current');
  });
});

// ─── API v1 ─────────────────────────────────────────────────────────────────
describe('API v1 — /api/v1/users', () => {

  it('GET /api/v1/users — retourne la liste des utilisateurs', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('count');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/users — retourne le header de dépréciation', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.headers).toHaveProperty('deprecation');
  });

  it('GET /api/v1/users/:id — retourne un utilisateur existant', async () => {
    const res = await request(app).get('/api/v1/users/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id', 1);
    expect(res.body.data).toHaveProperty('name');
  });

  it('GET /api/v1/users/:id — retourne 404 si utilisateur introuvable', async () => {
    const res = await request(app).get('/api/v1/users/9999');
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/users — crée un nouvel utilisateur', async () => {
    const newUser = {
      name: 'Marie Curie',
      email: 'marie@example.com',
      age: 45,
      role: 'user'
    };
    const res = await request(app).post('/api/v1/users').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('marie@example.com');
  });

  it('PUT /api/v1/users/:id — met à jour un utilisateur', async () => {
    const updated = { name: 'Alice Modifiée', email: 'alice@example.com', age: 31, role: 'admin' };
    const res = await request(app).put('/api/v1/users/1').send(updated);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data.name).toBe('Alice Modifiée');
  });

  it('DELETE /api/v1/users/:id — supprime un utilisateur', async () => {
    const res = await request(app).delete('/api/v1/users/3');
    expect([200, 204]).toContain(res.status);
  });
});

// ─── API v2 ─────────────────────────────────────────────────────────────────
describe('API v2 — /api/v2/users', () => {

  it('GET /api/v2/users — retourne la liste avec meta pagination', async () => {
    const res = await request(app).get('/api/v2/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('limit');
    expect(res.body.meta).toHaveProperty('pages');
  });

  it('GET /api/v2/users — pagination avec ?page=1&limit=2', async () => {
    const res = await request(app).get('/api/v2/users?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });

  it('GET /api/v2/users/:id — retourne un utilisateur avec format enrichi', async () => {
    const res = await request(app).get('/api/v2/users/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('firstName');
    expect(res.body.data).toHaveProperty('lastName');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
    expect(res.body.data.id).toBe(1);
  });

  it('GET /api/v2/users/:id — retourne 404 si utilisateur introuvable', async () => {
    const res = await request(app).get('/api/v2/users/9999');
    expect(res.status).toBe(404);
  });

  it('POST /api/v2/users — crée un utilisateur avec timestamps', async () => {
    const newUser = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      age: 28,
      role: 'user'
    };
    const res = await request(app).post('/api/v2/users').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data.firstName).toBe('Jean');
    expect(res.body.data.lastName).toBe('Dupont');
  });

  it('PATCH /api/v2/users/:id — mise à jour partielle', async () => {
    const res = await request(app)
      .patch('/api/v2/users/1')
      .send({ age: 35 });
    expect(res.status).toBe(200);
    expect(res.body.data.age).toBe(35);
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  it('PATCH /api/v2/users/:id — ne modifie que les champs envoyés', async () => {
    const before = await request(app).get('/api/v2/users/2');
    const originalEmail = before.body.data.email;

    await request(app).patch('/api/v2/users/2').send({ age: 99 });

    const after = await request(app).get('/api/v2/users/2');
    expect(after.body.data.email).toBe(originalEmail);
    expect(after.body.data.age).toBe(99);
  });

  it('DELETE /api/v2/users/:id — supprime un utilisateur', async () => {
    const res = await request(app).delete('/api/v2/users/2');
    expect([200, 204]).toContain(res.status);
  });

  it('DELETE /api/v2/users/:id — retourne 404 après suppression', async () => {
    await request(app).delete('/api/v2/users/3');
    const res = await request(app).get('/api/v2/users/3');
    expect(res.status).toBe(404);
  });
});

// ─── Route inconnue ──────────────────────────────────────────────────────────
describe('Routes inconnues', () => {
  it('retourne 404 pour une route inexistante', async () => {
    const res = await request(app).get('/api/v99/users');
    expect(res.status).toBe(404);
  });
});
