// tests/api/busqueda.test.js
// IS-489 Lab 06 — Módulo Búsqueda (TC-007 a TC-012)
// API real de Spotify — Client Credentials Flow
// Autor: Crisólogo Aguilar Flores

const request = require('supertest');

const API = 'https://api.spotify.com';

// ⚠️ Reemplaza con tu access_token vigente (Client Credentials)
// Se obtiene con POST https://accounts.spotify.com/api/token
const ACCESS_TOKEN = 'Bearer BQBeuBBoufejutsu-xZ6NSG4Xt_zj3O6kbr68XPKxCHL1cNtvJaLoSB9a-A45W3ffcdtf8TtMmfiokQotM04K78P03YyAQDiMNiZILXJgA0nuwXzRnMRl52ItmAwRJukQVP44iUAhn_X';

describe('Módulo Búsqueda — API real Spotify (TC-007 a TC-012)', () => {

  // TC-007: Búsqueda válida "Dua Lipa" → artista más relevante primero
  test('TC-007: GET /search Dua Lipa → 200 + artista más relevante', async () => {
    const res = await request(API)
      .get('/v1/search')
      .query({ q: 'Dua Lipa', type: 'artist' })
      .set('Authorization', ACCESS_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.artists).toBeDefined();
    expect(Array.isArray(res.body.artists.items)).toBe(true);
    expect(res.body.artists.items.length).toBeGreaterThan(0);
    expect(res.body.artists.items[0].name).toBe('Dua Lipa');
  });

  // TC-008: Término sin sentido → FAIL esperado (fuzzy matching encontró resultados)
  test('TC-008: GET /search término sin sentido → 0 resultados [CRITERIO ORIGINAL]', async () => {
    const res = await request(API)
      .get('/v1/search')
      .query({ q: 'xkqzmpwvlrfbnt2026ayacucho', type: 'track' })
      .set('Authorization', ACCESS_TOKEN);

    expect(res.status).toBe(200);
    // HALLAZGO: Spotify aplica fuzzy matching — encontró resultados
    // por el substring "ayacucho". Criterio original esperaba 0 resultados.
    expect(res.body.tracks.items.length).toBe(0); // ← falla intencionalmente
  });

  // TC-009: Término regional → resultados aproximados O vacío (ambos válidos)
  test('TC-009: GET /search Vinchos Ayacucho → resultados aproximados o vacío', async () => {
    const res = await request(API)
      .get('/v1/search')
      .query({ q: 'Vinchos Ayacucho', type: 'track' })
      .set('Authorization', ACCESS_TOKEN);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tracks.items)).toBe(true);
    // Criterio acepta cualquiera de las dos salidas
    expect(res.body.tracks.items.length).toBeGreaterThanOrEqual(0);
  });

  // TC-010: Cadena >250 chars → rechazo controlado 400 (PASS con observación)
  test('TC-010: GET /search cadena 800+ chars → rechazo controlado sin error 5xx', async () => {
    const queryLarga = 'x'.repeat(850);
    const res = await request(API)
      .get('/v1/search')
      .query({ q: queryLarga, type: 'track' })
      .set('Authorization', ACCESS_TOKEN);

    // HALLAZGO: Spotify impone límite duro de 250 chars → 400 controlado
    // No es error de aplicación (5xx), es validación correcta
    expect(res.status).not.toBeGreaterThanOrEqual(500);
    expect(res.status).toBe(400);
  });

  // TC-011: Query vacío → rechazo controlado 400 (PASS con observación)
  test('TC-011: GET /search query vacío → rechazo controlado 400', async () => {
    const res = await request(API)
      .get('/v1/search')
      .query({ q: '', type: 'track' })
      .set('Authorization', ACCESS_TOKEN);

    expect(res.status).not.toBeGreaterThanOrEqual(500);
    expect(res.status).toBe(400);
  });

  // TC-012: XSS/SQL injection → tratado como texto plano, sin ejecución
  test('TC-012: GET /search XSS/SQL injection → sanitizado como texto plano', async () => {
    const res = await request(API)
      .get('/v1/search')
      .query({ q: "<script>alert('xss')</script>' OR 1=1--", type: 'track' })
      .set('Authorization', ACCESS_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.tracks).toBeDefined();
    expect(Array.isArray(res.body.tracks.items)).toBe(true);
    // Verificar que el script no aparece ejecutado en la respuesta
    expect(res.text).not.toContain('<script>alert');
  });

});