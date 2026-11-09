# Next.js Patterns — App Router, Server Actions, Production

## Mental Model: Server vs Client

```
Server Components (default)          Client Components ("use client")
├── Direct DB access                 ├── Interactive (hooks, state)
├── Secrets safe                     ├── Browser APIs (localStorage)
├── No bundle size cost              ├── Event handlers
└── Streaming by default             └── WebSocket connections

Boundary: "use client" at top of file
```

**Default to Server Components.** Only add `"use client"` when you need interactivity.

## Data Fetching

```typescript
// Server Component — direct DB, no API layer needed
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}

// Parallel fetching (automatic with Promise.all)
async function Dashboard() {
  const [user, posts, notifications] = await Promise.all([
    getUser(),
    getPosts(),
    getNotifications(),
  ]);
  return <>{/* render */}</>;
}

// Streaming for slow data
async function SlowComponent() {
  const data = await slowQuery(); // Suspends, streams when ready
  return <div>{data}</div>;
}
```

## Server Actions (Mutations)

```typescript
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  // Validation (Zod)
  const result = postSchema.safeParse({ title, content });
  if (!result.success) {
    return { error: result.error.flatten() };
  }

  await db.post.create({ data: result.data });
  revalidatePath("/posts"); // Invalidate cache
  redirect("/posts");       // Navigate after mutation
}

// Usage in form
<form action={createPost}>
  <input name="title" />
  <textarea name="content" />
  <button type="submit">Create</button>
</form>
```

## Caching Strategy

| Method | When | Invalidation |
|--------|------|--------------|
| `fetch(..., { cache: "force-cache" })` | Static data | `revalidatePath` / `revalidateTag` |
| `fetch(..., { next: { revalidate: 3600 } })` | Periodic | Time-based |
| `fetch(..., { cache: "no-store" })` | Dynamic/user-specific | N/A |
| `unstable_cache` | Expensive computations | Tags + `revalidateTag` |

```typescript
// Tag-based invalidation
export async function getPosts() {
  return unstable_cache(
    async () => db.post.findMany(),
    ["posts"],
    { tags: ["posts"], revalidate: 3600 }
  )();
}

export async function createPost() {
  await db.post.create({...});
  revalidateTag("posts"); // Instant invalidation
}
```

## Middleware (Edge Runtime)

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get("auth")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rate limiting
  const ip = request.ip || "anonymous";
  if (await isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

## Database (Prisma + Supabase/PostgreSQL)

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

## Authentication (NextAuth v5 / Auth.js)

```typescript
// auth.config.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await verifyCredentials(credentials);
        return user || null;
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard && !isLoggedIn) return false;
      return true;
    },
  },
});
```

## Deployment (Vercel)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }
  ]
}
```

## Your Next.js Rules (Add to .ai-rules.md)

```markdown
- RULE: Default to Server Components, add "use client" only when needed
- RULE: Server Actions for all mutations — no API routes for forms
- RULE: Tag-based cache invalidation (revalidateTag) over path-based
- RULE: Parallel data fetching with Promise.all in Server Components
- RULE: Middleware for auth/rate-limiting at edge
- RULE: Prisma singleton pattern, no multiple clients
- RULE: Zod validation on ALL Server Action inputs
```