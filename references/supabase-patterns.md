# Supabase Patterns — Auth, RLS, Realtime, Edge Functions

## Database Schema Design

```sql
-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies: explicit, named, minimal
CREATE POLICY "Users can read own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

**RLS is your security. Test it. `SELECT * FROM posts` as different users.**

## Auth Patterns

```typescript
// Server-side auth (Server Components, Server Actions)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Client-side auth (Client Components)
import { createBrowserClient } from "@supabase/ssr";

export function useAuth() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Use supabase.auth.onAuthStateChange, signIn, signOut
}
```

## Realtime (Subscriptions)

```typescript
// Subscribe to changes
const channel = supabase
  .channel("posts-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "posts" },
    (payload) => {
      // payload: { eventType: "INSERT" | "UPDATE" | "DELETE", new: Row, old: Row }
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    }
  )
  .subscribe();

// Cleanup
return () => supabase.removeChannel(channel);
```

**Use for:** Collaborative editing, notifications, live dashboards.
**Don't use for:** High-frequency updates (use WebSocket server instead).

## Edge Functions (Deno)

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  // Verify webhook
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  // Handle event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await supabase.from("orders").insert({...});
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Deploy: `supabase functions deploy stripe-webhook --project-ref <ref>`

## Storage (Files)

```typescript
// Upload (client or server)
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`${userId}/${Date.now()}.png`, file, {
    cacheControl: "3600",
    upsert: false,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from("avatars")
  .getPublicUrl(`${userId}/file.png`);

// Signed URL (private buckets)
const { data, error } = await supabase.storage
  .from("private-docs")
  .createSignedUrl(`${userId}/doc.pdf`, 60 * 60); // 1 hour
```

## Migrations

```bash
# Create migration
supabase migration new add_posts_table

# Edit supabase/migrations/..._add_posts_table.sql
# Apply locally
supabase db reset

# Push to remote
supabase db push --project-ref <ref>
```

**Migration rules:**
- Forward only (no down migrations in production)
- One logical change per migration
- Test `supabase db reset` locally before push

## Your Supabase Rules (Add to .ai-rules.md)

```markdown
- RULE: RLS enabled on EVERY table, policies tested as different users
- RULE: Server-side auth via @supabase/ssr, client-side for interactivity
- RULE: Realtime only for collaborative/notification features
- RULE: Edge Functions for webhooks, heavy compute, scheduled tasks
- RULE: Migrations tested with `supabase db reset` before push
- RULE: Storage: public buckets for public, signed URLs for private
```