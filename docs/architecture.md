# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: React 19 components fetch through the shared `getJson` client in `src/api/client.ts`, which resolves relative `/api/*` paths through the Vite dev proxy to the Express API on port 8000.
- Logic tier decision: Express routes in `src/routes/api.ts` delegate validation and business logic to functions in `src/services/octofitService.ts`, returning deliberate 4xx responses for invalid or missing references instead of letting Mongoose cast errors surface as 500s.
- Data tier decision: Mongoose schemas in `src/models` enforce `required` validation on business-critical fields, and `src/scripts/seed.ts` upserts demo fixtures idempotently without clearing unrelated application data.
- Activity tracking approach: `POST /api/activities` validates `userId`/`teamId` as well-formed, existing Mongo ObjectIds before creating an `Activity` with computed `points` (equal to `minutes`) and a server-assigned `occurredAt` timestamp.
- Team management approach: `POST /api/teams` requires `name` and `mascot`, accepts an optional initial `members` array, and `GET /api/teams` lists all teams with their member ids for the frontend to render.
- Leaderboard approach: `GET /api/leaderboard` aggregates `Activity.points` grouped by `team`, sorts descending, and maps each team's total to a 1-based `rank` alongside its `teamName`.
- Workout suggestions approach: `GET /api/workouts/suggestions/:userEmail` looks up the user by email (404 if not found), infers a focus area from their most recent activity type (falling back to their stored `fitnessGoal`), and returns matching `Workout` documents with a human-readable `reason`.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- API command: `npm run test:api --prefix octofit-tracker/backend`
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
