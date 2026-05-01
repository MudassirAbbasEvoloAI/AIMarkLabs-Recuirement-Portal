# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

No lint or test scripts are configured.

## Environment Variables

Requires `.env.local` with two sets of Firebase credentials:

```
# Client SDK (browser-safe, NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin SDK (server-only, no NEXT_PUBLIC_ prefix)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Architecture

**Next.js 14 App Router** with two Firebase SDK layers:

- `src/lib/firebase.js` — Client SDK (`firebase` package). Used in browser/client components. Exports `db` and `storage`.
- `src/lib/firebaseAdmin.js` — Admin SDK (`firebase-admin` package). Used **only** in API routes (server-side). Exports `adminDb` and `adminStorage`. Configured as a `serverComponentsExternalPackages` in `next.config.js` to prevent client bundling.

**Fallback system**: `src/lib/fallback.js` exports static arrays (`FALLBACK_POSITIONS`, `FALLBACK_APPLICATIONS`, `FALLBACK_LEADS`). All API routes catch Firestore errors and return this data with `fallback: true`. The admin UIs display a "Demo Mode" banner when fallback data is served.

**Styling**: CSS Modules throughout (`.module.css` per page/component). The two admin pages (`/admin/leads` and `/admin/applications`) share a single stylesheet at `src/app/admin/applications/page.module.css`.

**Path alias**: `@/` maps to `src/`.

## Data Model

Three Firestore collections:

| Collection | Key fields |
|---|---|
| `leads` | `name`, `email`, `phone`, `details`, `status` (new/contacted/in-progress/closed), `source`, `createdAt` |
| `applications` | `positionId`, `positionTitle`, `name`, `email`, `phone`, `experience`, `currentRole`, `details`, `resumeName`, `resumeUrl`, `status` (pending/reviewing/shortlisted/rejected), `createdAt` |
| `positions` | `title`, `department`, `location`, `type`, `experience`, `description`, `requirements[]`, `salary`, `active`, `createdAt` |

## File Upload

Resume uploads are saved to `public/uploads/` (local filesystem) via `fs/promises` in the applications POST route. The stored URL is a relative path (`/uploads/<timestamp>-<filename>`). There is no Firebase Storage integration yet — the code has a comment indicating it can be swapped in.

## Admin Pages

`/admin/leads` and `/admin/applications` are unprotected client components with no authentication. They support search (debounced 400ms), status filter, sort, inline status updates (optimistic), and delete with confirmation modal.
