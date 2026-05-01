# AiMark Labs — Next.js + Firebase App

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, CSS Modules
- **Backend**: Next.js API Routes (server-side)
- **Database**: Firebase Firestore
- **File Storage**: Local `/public/uploads/` (swap with Firebase Storage if needed)

---

## ⚡ Quick Start

### Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Add Project"** → name it `aimarklabs`
3. Disable Google Analytics (optional) → **Create Project**

### Step 2 — Enable Firestore
1. Left sidebar → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your region → **Done**

### Step 3 — Get Client SDK Config
1. Project Settings (gear icon) → **Your Apps** → click **"<>"** (Web)
2. Register app → copy the `firebaseConfig` object
3. Paste values into `.env.local`

### Step 4 — Get Admin SDK Key
1. Project Settings → **Service Accounts** tab
2. Click **"Generate new private key"** → Download JSON
3. Copy values into `.env.local`

### Step 5 — Fill `.env.local`
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

### Step 6 — Install & Run
```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

---

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `leads` | Portal inquiry submissions from LinkedIn ad |
| `applications` | Job applications submitted via /apply |
| `positions` | Open job positions shown on /careers |

---

## Pages

| Route | Page |
|-------|------|
| `/` | Home — lead form |
| `/careers` | Browse open positions |
| `/apply?positionId=X&title=Y` | Apply for a position |
| `/admin/leads` | Manage leads |
| `/admin/applications` | Manage applications |

---

## API Endpoints (all use Firestore)

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/leads` | Fetch leads (filter/search/sort) |
| POST | `/api/leads` | Create lead |
| PATCH | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/applications` | Fetch applications |
| POST | `/api/applications` | Submit application + resume |
| PATCH | `/api/applications/:id` | Update application |
| DELETE | `/api/applications/:id` | Delete application |
| GET | `/api/positions` | Fetch positions |
| POST | `/api/positions` | Create position |

---

## Deploy to Vercel
```bash
npx vercel
```
Add all `.env.local` variables in **Vercel → Settings → Environment Variables**
