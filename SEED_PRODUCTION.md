# Seed production database (Render)

Your live site has empty tables. To add the language courses (Spanish, French, etc.), seed the **production** database once.

## Option A: Run seed from your machine (easiest)

1. **Get the production database URL**
   - In [Render](https://dashboard.render.com): open your **PostgreSQL** service.
   - In **Info**, copy **Internal Database URL** (use this only from Render) or **External Database URL** (use from your PC).

2. **Run the seed against production**
   - In a terminal, from your project folder, set `DATABASE_URL` to the **External** URL and run the seed:

   **Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   npx prisma db seed
   ```

   **macOS/Linux (bash):**
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require" npx prisma db seed
   ```

   Replace the URL with your actual Render Postgres **External Database URL** (from the Render dashboard).

3. **Check the site**
   - Refresh your live site; the course list (e.g. Spanish for Beginners, French for Beginners) should appear.

## Option B: Run seed from Render Shell

1. In Render: open your **Web Service** → **Shell** tab.
2. Run:
   ```bash
   npx prisma db seed
   ```
   The Shell already has `DATABASE_URL` set to the internal Postgres URL, so the seed will run against the production DB.

---

**Note:** The seed in `prisma/seed.ts` **deletes** existing courses, units, lessons, and exercises, then creates Spanish and French courses with all units, lessons, and exercises. User accounts are not deleted.
