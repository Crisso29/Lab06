<div align="center">

# UNIVERSIDAD NACIONAL DE SAN CRISTÓBAL DE HUAMANGA
### Escuela Profesional de Ingeniería de Sistemas

<br>

# 📄 INFORME MONOGRÁFICO: API TESTING
## Laboratorio 06: Pruebas y Aseguramiento de Calidad en Spotify Web API

<br>

![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-000000?style=for-the-badge&logo=npm&logoColor=white)
![Tests](https://img.shields.io/badge/TESTS-12%20PASSED%20/%20FAILED-brightgreen?style=for-the-badge)
![Estado](https://img.shields.io/badge/ESTADO-COMPLETADO-blue?style=for-the-badge)

<br><br>

**ASIGNATURA:** IS-489 Pruebas y Aseguramiento de Calidad de Software <br>
**DOCENTE:** Ing. Lizbeth Jaico Quispe <br>
**ESTUDIANTE:** Crisólogo Aguilar Flores <br>
**LUGAR Y FECHA:** Ayacucho, Perú - Junio 2026

<br>

🔗 [**Leer el Documento Completo en Google Docs**](https://docs.google.com/document/d/1X6HShgGpRAi6yqTFTRyIw7QFlIZwJ4-o/edit?usp=drive_link&ouid=102948391865322967982&rtpof=true&sd=true)

---

</div>

## 📑 Índice
1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Análisis de la Documentación de la API](#2-análisis-de-la-documentación-de-la-api)
3. [Matriz de Pruebas de Endpoints (Postman)](#3-matriz-de-pruebas-de-endpoints-postman)
4. [Estructura del Proyecto y Automatización](#4-estructura-del-proyecto-y-automatización)
5. [Análisis de Hallazgos y Defectos](#5-análisis-de-hallazgos-y-defectos)
6. [Conclusiones](#6-conclusiones)

---

## 1. Resumen Ejecutivo
El presente informe documenta el proceso completo de diseño, configuración, ejecución y análisis de pruebas de interfaz de programación de aplicaciones (API) REST sobre la **Spotify Web API**. Estas pruebas fueron desarrolladas en el marco del Laboratorio 06 de la asignatura IS-489 Pruebas y Aseguramiento de Calidad de Software. 

Se evaluaron un total de doce casos de prueba distribuidos en dos módulos: **Búsqueda (TC-007 a TC-012)** y **Gestión de Playlists (TC-001 a TC-006)**. Para ello, se emplearon dos herramientas complementarias: **Postman Desktop** para la ejecución manual interactiva (mediante assertions con Chai) y **Supertest con Jest** para la automatización del mismo conjunto de pruebas como código JavaScript.

---

## 2. Análisis de la Documentación de la API
Para el diseño de los casos de prueba, se tomó como base la documentación técnica oficial de Spotify Web API. Se identificaron los métodos HTTP, los parámetros requeridos y los esquemas de autenticación:

* **Módulo de Búsqueda (`GET /search`):** Utiliza autenticación *Client Credentials Flow*. Requiere los parámetros `q` (query) y `type` (tipo de elemento a buscar). Retorna un token temporal válido por 1 hora.
* **Módulo de Playlists (`POST /users/{user_id}/playlists` y `PUT /playlists/{playlist_id}`):** Utiliza autenticación *Authorization Code Flow* (requiere token de usuario Premium para autorizar las operaciones de escritura).

<div align="center">
  <img src="Evidencias/API.png" alt="Documentación Spotify API">
  <br>
  <i>Figura 1: Referencia de endpoints en la documentación oficial de Spotify Web API.</i>
</div>

---

## 3. Matriz de Pruebas de Endpoints (Postman)

Antes de la ejecución automatizada, los casos de prueba fueron diseñados, configurados y ejecutados interactivamente mediante colecciones en el workspace de Postman.

<div align="center">
  <img src="Evidencias/postman.png" alt="Colecciones en Postman">
  <br>
  <i>Figura 2: Estructura de la colección de pruebas en el entorno de Postman.</i>
</div>
<br>

A continuación, se detalla la matriz de resultados tras ejecutar las peticiones a los endpoints seleccionados. Todos los resultados fueron validados utilizando *assertions* programados en la pestaña `Scripts > Post-response`.

### 3.1. Módulo de Búsqueda (Casos TC-007 a TC-012)
**Endpoint Base:** `https://api.spotify.com/v1/search`

| ID | Método | Endpoint | Parámetros Enviados (Query Params) | Cód. HTTP Recibido | Respuesta Obtenida | Estado |
|:---|:---:|:---|:---|:---:|:---|:---:|
| **TC-007** | `GET` | `/v1/search` | `q=Dua Lipa, type=artist` | **200 OK** | `total:14, items[0].name='Dua Lipa'` | ✅ PASS |
| **TC-008** | `GET` | `/v1/search` | `q=xkqzmpwvlrfbnt2026ayacucho, type=track` | **200 OK** | `total:3 — fuzzy matching detectó token 'ayacucho'. Retornó 3 artistas locales.` | ❌ FAIL |
| **TC-009** | `GET` | `/v1/search` | `q=Vinchos Ayacucho, type=track` | **200 OK** | `total:3 — 'Adiós Pueblo De Ayacucho', música andina regional.` | ✅ PASS |
| **TC-010** | `GET` | `/v1/search` | `q='x'×850 caracteres, type=track` | **400 Bad Request** | `'Query exceeds maximum length of 250 characters'` | ✅ PASS* |
| **TC-011** | `GET` | `/v1/search` | `q='' (vacío), type=track` | **400 Bad Request** | `error.message: 'No search query'` | ✅ PASS* |
| **TC-012** | `GET` | `/v1/search` | `q=<script>alert('xss')</script>' OR 1=1--, type=track` | **200 OK** | `total:951 — payload tratado como texto plano (URL-encoded). Sin ejecución XSS.` | ✅ PASS |

*(Nota: *PASS con observación: el criterio original no contemplaba explícitamente el rechazo 400 controlado como salida válida).*

### 3.2. Módulo de Gestión de Playlists (Casos TC-001 a TC-006)
**Endpoint Base:** `https://api.spotify.com/v1`

| ID | Método | Endpoint | Parámetros Enviados (Body JSON) | Cód. HTTP Recibido | Respuesta Obtenida | Estado |
|:---|:---:|:---|:---|:---:|:---|:---:|
| **TC-001** | `POST` | `/me/playlists` | `name, description, public:false` | **201 Created** | `Playlist creada exitosamente en la cuenta del usuario con el nombre y desc. correctos.` | ✅ PASS |
| **TC-002** | `PUT` | `/playlists/{id}` | `name editado, description editada` | **200 OK** | `Body vacío. Edición confirmada por GET de verificación.` | ✅ PASS |
| **TC-003** | `PUT` | `/playlists/{id}` | `description: 'A'×301 chars` | **200 OK** | `Spotify almacenó 305 chars completos. No truncó a 300 ni rechazó.` | ❌ FAIL |
| **TC-004** | `PUT` | `/playlists/{id}` | `name: 'B'×100 chars` | **200 OK** | `Nombre de 100 chars aceptado y almacenado íntegro.` | ✅ PASS |
| **TC-005** | `PUT` | `/playlists/{id}` | `name: 'C'×101 chars` | **200 OK** | `Spotify almacenó 101 chars completos. No truncó a 100 ni rechazó.` | ❌ FAIL |
| **TC-006** | `PUT` | `/playlists/{id}` | `name: '' (vacío)` | **200 OK** | `Spotify ignoró el campo vacío. Mantuvo el nombre anterior (actualización parcial).` | ❌ FAIL |

---

## 4. Estructura del Proyecto y Automatización
Para garantizar que las pruebas sean reproducibles e integrables en pipelines de CI/CD, se ha estructurado el repositorio y automatizado el 100% de las pruebas manuales ejecutadas en Postman traduciéndolas a código JavaScript con **Supertest y Jest**.

<div align="center">
  <img src="Evidencias/Explorador.png" alt="Estructura del Proyecto">
  <br>
  <i>Figura 3: Árbol de directorios del proyecto.</i>
</div>

El comando `npm test` ejecuta los suites `busqueda.test.js` y `playlist.test.js`, validando los mismos doce casos documentados en la matriz contra el servidor real.

<div align="center">
  <img src="Evidencias/resultadoJest.png" alt="Resultado del Supertest">
  <br>
  <i>Figura 4: Resultado de la ejecución de los tests automatizados demostrando la persistencia de los fallos identificados.</i>
</div>

---

## 5. Análisis de Hallazgos y Defectos
Durante las pruebas se identificaron cuatro hallazgos donde el comportamiento real de la API difiere de los criterios de aceptación del proyecto. Cabe resaltar que la API funciona correctamente según su propia especificación; los fallos evidencian que los criterios fueron redactados basándose en el comportamiento de la interfaz visual del cliente web, no del backend REST:

1. **Fuzzy Matching en Búsqueda (TC-008):** La API no devuelve 0 resultados ante un término "basura" si este contiene una palabra clave válida (ej. "ayacucho"). El motor de búsqueda aplica tokenización y fuzzy matching, lo cual es un comportamiento esperado, no un defecto del servidor.
2. **La API No Trunca Descripciones (TC-003):** El límite de 300 caracteres es una restricción exclusiva del frontend de Spotify Web, pero la API REST subyacente permite almacenar longitudes mayores sin truncar el texto.
3. **La API No Trunca Nombres (TC-005):** Similar al caso anterior, el límite de 100 caracteres solo se valida en la interfaz de usuario (capa de presentación), no en el backend REST.
4. **Nombre Vacío Ignorado (TC-006):** El método PUT de la API actúa semánticamente como una actualización parcial (PATCH). En lugar de lanzar un error 400 por enviar un campo de nombre vacío, la API lo ignora y preserva el nombre existente.

---

## 6. Conclusiones
El presente proyecto logró integrar exitosamente los conocimientos de diseño de pruebas de caja negra, flujos de autenticación OAuth 2.0 y automatización de API Testing sobre un entorno empresarial real. 

Los hallazgos documentados evidencian una lección valiosa para el aseguramiento de calidad: las restricciones y validaciones impuestas en las interfaces de usuario (Frontend) rara vez coinciden de manera idéntica con las implementadas en la base de datos o en el backend (API REST). La automatización dual con Postman y Supertest demostró ser un flujo de trabajo altamente eficiente para descubrir estas discrepancias, documentar la realidad y generar artefactos versionables aptos para la Integración Continua.

<div align="center">

**IS-489 · Pruebas y Aseguramiento de Calidad de Software**
UNSCH · Facultad de Ingeniería · Semestre 2026-I
Aguilar Flores, Crisólogo · Serie 400

</div>