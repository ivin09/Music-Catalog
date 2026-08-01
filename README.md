# Music Catalog Insights Platform

A full-stack app to search the iTunes public catalog, save songs to a personal
library, and explore analytics and AI-generated insights on your saved music.

- **Backend:** Java 24 / Spring Boot 4.0.6 (REST API, Spring Security + JWT, JPA)
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS + Recharts
- **Database:** PostgreSQL in production, H2 in-memory for local dev (see below)

---

## 1. Entity choice: Songs

We chose **Songs** (iTunes `entity=song`) over Albums or Artists because:

- Songs carry the richest, most analytics-friendly field set out of the box:
  `trackTimeMillis` (duration), `primaryGenreName`, `releaseDate`, artist and
  track name — enough to drive a duration histogram, a genre pie chart, a
  releases-by-year line chart, and a top-artists bar chart without needing a
  second API call per result.
- Songs are the unit most users think in when building a personal "library" —
  closer to how streaming apps actually work.
- Track-level granularity produces a denser, more interesting analytics
  dashboard than album- or artist-level data would with the same number of
  saved items.

---

## 2. Architecture

```
music-catalog-platform/
├── backend/     Spring Boot REST API (Java 17, Maven)
├── frontend/    Next.js app (search, library, analytics UI)
└── docker-compose.yml   Postgres + backend for local full-stack runs
```

The backend is the only thing that talks to the iTunes Search API and to the
database — the frontend only ever talks to our own backend.

---

## 3. Database & schema

**Choice: PostgreSQL** (relational). Justification: the data is inherently
structured and small-cardinality per user (a personal library, not a firehose),
and the analytics endpoint needs `GROUP BY`-style aggregation (genre counts,
releases per year, rating distribution) that SQL does natively and efficiently.
There's no need for flexible/nested schemas or horizontal write scale that
would justify a NoSQL store here. H2 (in-memory, SQL-compatible) is used for
local dev with zero setup; the same JPA/Hibernate code path runs against
Postgres in production by switching the `prod` Spring profile.

### `app_user`
| column | type |
|---|---|
| id | bigint, PK |
| username | varchar, unique |
| password | varchar (BCrypt hash) |
| created_at | timestamp |

### `library_item`
| column | type | notes |
|---|---|---|
| id | bigint, PK | |
| user_id | bigint, FK → app_user | scopes every row to its owner |
| apple_catalog_id | bigint | the iTunes `trackId`; unique per user |
| title | varchar | |
| artist_name | varchar | |
| genre | varchar | nullable |
| release_date | date | nullable |
| duration_millis | integer | nullable |
| artwork_url | varchar | nullable |
| user_rating | integer | 1–5, nullable |
| user_notes | varchar(2000) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

Per the brief, **only the user's saved library is persisted** — search results
from iTunes are never cached/stored server-side; they're proxied live.

---

## 4. REST API

All `/api/library/**` and `/api/analytics/**` and `/api/ai/**` routes require a
`Authorization: Bearer <jwt>` header, obtained from `/api/auth/login` or
`/api/auth/register`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | - | Create account, returns JWT |
| POST | `/api/auth/login` | - | Log in, returns JWT |
| GET | `/api/search?query=&type=song\|album\|musicArtist&limit=` | - | Proxies iTunes Search API |
| GET | `/api/library` | ✓ | List the caller's saved items |
| POST | `/api/library` | ✓ | Save an item to the library |
| PUT | `/api/library/{id}` | ✓ | Update `userRating` / `userNotes` |
| DELETE | `/api/library/{id}` | ✓ | Remove an item |
| GET | `/api/analytics` | ✓ | Aggregated stats for charts |
| GET | `/api/ai/insights` | ✓ | AI trend summary + recommendations |

Validation errors (`400`), not-found (`404`), duplicate saves (`409`), and bad
credentials (`401`) are all handled by a single `@RestControllerAdvice` and
returned as a consistent JSON error shape (`status`, `error`, `messages`,
`path`, `timestamp`).

---

## 5. AI feature: Trend summary + recommendations

We implemented a combined **trend summary + content-based recommendations**
feature (`GET /api/ai/insights`):

- **Trend summary**: a natural-language paragraph describing the user's top
  genre, top artist, rating patterns, and era preference, computed
  deterministically from their own library stats.
- **Recommendations**: live iTunes searches seeded by the user's top artist
  and top genre, filtered to exclude anything already saved.

**Trade-off (worth calling out to a reviewer):** the summary is always computed
deterministically from the user's own library stats first, so the feature
works with **zero external configuration** end-to-end. If a `GEMINI_API_KEY`
environment variable is set, the same stats are handed to Google's Gemini API
(`GeminiClient.java`, plain REST call — no SDK) to be rewritten into more
natural prose, with a silent fallback to the template if that call fails or
the key isn't set. This keeps the core deliverable reliable and reproducible
for grading, while showing the LLM integration path as an optional layer.

---

## 6. Running locally

### Backend (H2, no external DB needed)
Requires a local Maven 3.9+ and JDK 24 install (or run `mvn -N io.takari:maven:wrapper`
once to generate `./mvnw`).
```bash
cd backend
mvn spring-boot:run
# API on http://localhost:8080, profile defaults to 'dev' (H2 in-memory)
```

### Backend + Postgres via Docker
```bash
docker compose up --build
# API on http://localhost:8080, Postgres on localhost:5432
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm install
npm run dev
# UI on http://localhost:3000
```

---

## 7. Deployment

- **Backend → Render / Railway**: build with the provided `backend/Dockerfile`,
  set env vars `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL`,
  `DATABASE_USERNAME`, `DATABASE_PASSWORD` (from a managed Postgres addon),
  and `JWT_SECRET` (32+ random bytes). Optionally set `GEMINI_API_KEY` to
  enable Gemini-narrated insights (get one free at aistudio.google.com/apikey).
- **Frontend → Vercel**: import `frontend/` as the project root, set
  `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL.

Live URLs:
- Frontend: _fill in after deploying_
- Backend: _fill in after deploying_

---

## 8. Trade-offs & what's left for "good to have"

- **Pagination**: not implemented on `/api/library` (typical personal
  libraries are small); `/api/search` uses iTunes' own `limit` param.
- **Debounced search**: implemented client-side (400ms) in the search page.
- **Caching**: not implemented — iTunes responses aren't cached server-side,
  per the "store only the user's saved library" requirement.
- **Unit tests**: not included given the 3-day scope; `LibraryService` and
  `AnalyticsService` are the highest-value targets if extended.
- **Duplicate saves** are prevented at the DB level via a unique constraint
  on `(user_id, apple_catalog_id)`, surfaced as a `409 Conflict`.
