// tests/api/playlist.test.js
// IS-489 Lab 06 — Módulo Playlist (TC-001 a TC-006)
// API real de Spotify — Authorization Code Flow (requiere cuenta Premium)
// Autor: Crisólogo Aguilar Flores

const request = require('supertest');

const API = 'https://api.spotify.com';

// ⚠️ Reemplaza con tu user_token vigente (Authorization Code Flow)
// Se obtiene desde developer.spotify.com/documentation/web-api/reference/create-playlist
const USER_TOKEN = 'Bearer BQAtT3GqM8cuZlNBLxHRbwdcSOZ224KfMWvPJFig5Pja_bD7ERMGGv8a1z03uhtwFbPbY7Sxjp7lYvy00GSUiinWXT6OaLmwEyWy04ZuccQYOuF24mfcpj0ShWvDHpaUMJhWNlLr8BDcgm1I3sY1qaMOHJNH-jY1FdP9kt8BDZamd8Z3I4RPphI-TAp5SRE10bhk9f49iT2kuZsVUmFFalHXsLUuS9zAqGCE9vnYOsD70OdfbPT-nHtXMO7I0eQeT_GgiTVCkx5IKkuAqY4DzWj6LqjP2_REzCgtESk62tMHSzVFl1K3DqbvPfkzd0FWxN6YMLQ8O5Ir8wT3NO2p_2XOvl3-RpfOVeVArM5fFV8yJsoS8Oj66aK1KjwFIQEUG0DZys7YGEp8nnyiPcgwd7y8-ArKmyYWsg';// ID de la playlist creada en TC-001 (se actualiza automáticamente)
let playlistId = null;

describe('Módulo Playlist — API real Spotify (TC-001 a TC-006)', () => {

  // TC-001: Crear playlist válida → 201 Created
  test('TC-001: POST /me/playlists → 201 + playlist creada correctamente', async () => {
    const res = await request(API)
      .post('/v1/me/playlists')
      .set('Authorization', USER_TOKEN)
      .set('Content-Type', 'application/json')
      .send({
        name: 'IS489 Lab06 Supertest QA',
        description: 'Playlist creada por Supertest - TC-001',
        public: false
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('IS489 Lab06 Supertest QA');
    expect(res.body.description).toBe('Playlist creada por Supertest - TC-001');
    expect(res.body.id).toBeDefined();

    // Guardamos el ID para los siguientes TC
    playlistId = res.body.id;
    console.log('Playlist creada con ID:', playlistId);
  });

  // TC-002: Editar playlist → 200 OK
  test('TC-002: PUT /playlists/:id → 200 + nombre y descripción editados', async () => {
    // Espera que TC-001 haya creado la playlist
    expect(playlistId).not.toBeNull();

    const res = await request(API)
      .put(`/v1/playlists/${playlistId}`)
      .set('Authorization', USER_TOKEN)
      .set('Content-Type', 'application/json')
      .send({
        name: 'IS489 Lab06 Supertest QA - Editada',
        description: 'Descripción actualizada por Supertest - TC-002'
      });

    expect(res.status).toBe(200);
  });

  // TC-003: Descripción 301 chars → FAIL (API no trunca)
  test('TC-003: PUT descripción 301 chars → no trunca [CRITERIO ORIGINAL FAIL]', async () => {
    expect(playlistId).not.toBeNull();

    const desc301 = 'A'.repeat(301);
    const res = await request(API)
      .put(`/v1/playlists/${playlistId}`)
      .set('Authorization', USER_TOKEN)
      .set('Content-Type', 'application/json')
      .send({
        name: 'IS489 Lab06 Supertest QA - Editada',
        description: desc301
      });

    // HALLAZGO: API acepta 301 chars sin truncar ni rechazar
    // Criterio original esperaba truncado a 300
    expect(res.status).not.toBeGreaterThanOrEqual(500);
    expect(res.status).toBe(400); // ← falla intencionalmente (llega 200)
  });

  // TC-004: Nombre exacto 100 chars → PASS
  test('TC-004: PUT nombre exacto 100 chars (AVL N) → 200 aceptado', async () => {
    expect(playlistId).not.toBeNull();

    const nombre100 = 'B'.repeat(100);
    const res = await request(API)
      .put(`/v1/playlists/${playlistId}`)
      .set('Authorization', USER_TOKEN)
      .set('Content-Type', 'application/json')
      .send({ name: nombre100 });

    expect(res.status).toBe(200);
  });

  // TC-005: Nombre 101 chars → FAIL (API no trunca)
  test('TC-005: PUT nombre 101 chars (AVL N+1) → no trunca [CRITERIO ORIGINAL FAIL]', async () => {
    expect(playlistId).not.toBeNull();

    const nombre101 = 'C'.repeat(101);
    const res = await request(API)
      .put(`/v1/playlists/${playlistId}`)
      .set('Authorization', USER_TOKEN)
      .set('Content-Type', 'application/json')
      .send({ name: nombre101 });

    // HALLAZGO: API acepta 101 chars sin truncar
    // Criterio original esperaba truncado a 100
    expect(res.status).not.toBeGreaterThanOrEqual(500);
    expect(res.status).toBe(400); // ← falla intencionalmente (llega 200)
  });

  // TC-006: Nombre vacío → FAIL (API ignora silenciosamente)
  test('TC-006: PUT nombre vacío → error obligatorio [CRITERIO ORIGINAL FAIL]', async () => {
    expect(playlistId).not.toBeNull();

    const res = await request(API)
      .put(`/v1/playlists/${playlistId}`)
      .set('Authorization', USER_TOKEN)
      .set('Content-Type', 'application/json')
      .send({ name: '' });

    // HALLAZGO: API ignora nombre vacío y devuelve 200
    // Criterio original esperaba 400 con mensaje de error obligatorio
    expect(res.status).toBe(400); // ← falla intencionalmente (llega 200)
  });

});