# Website
A blog & about-me website based on a starter Next.js template.

## Views tracking (MongoDB)
This project tracks page views (home page and each blog post) using MongoDB.

Setup:
1. Create a MongoDB database (MongoDB Atlas or self‑hosted).
2. Copy `.env.example` to `.env.local` and set values:

```
MONGODB_URI=your-connection-string
MONGODB_DB=blog
```

3. Install deps and start the app:

```
npm install
npm run dev
```

How it works:
- API route: `app/api/views/route.ts` exposes `GET /api/views?id=<id>` and `POST /api/views` with `{ id }` to increment.
- Client component: `app/components/view-counter.tsx` increments on mount and shows the current count.
- Integration:
  - Home page uses id `home` in `app/page.tsx`.
  - Blog posts use id `blog/<slug>` in `app/blog/[slug]/page.tsx`.

Collection:
- Database collection `views`, documents shaped like:
```
{ _id: string, count: number, createdAt?: Date, updatedAt?: Date }
```

Notes:
- The API route is marked `dynamic = 'force-dynamic'` to bypass caching.
- The MongoDB client is cached across hot reloads in `app/lib/mongodb.ts`.
