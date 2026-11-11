# THE DODO OS — V0.1

Private Next.js + Supabase creative workspace.

## Setup
1. In Supabase SQL Editor, run `supabase.sql` once.
2. Supabase > Authentication > Providers > Email: disable public sign-ups. Create your own user in Authentication > Users > Add user.
3. Copy `.env.example` to `.env.local` and fill in the Supabase Project URL and **publishable/anon** key (never the service-role/secret key).
4. `npm install` then `npm run dev` to run locally.
5. Push files to your private GitHub repository (do not commit `.env.local`).
6. Vercel > Add New > Project > Import your GitHub repository. Framework: Next.js. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables; deploy.
7. Supabase Authentication > URL Configuration: set Site URL to your actual Vercel URL. Add your production URL to allowed redirects if using email links.

## Security
- Row-level security limits project records to the authenticated owner.
- Never put a Supabase service role key in frontend environment variables.
- No files upload or Google Meet integrations yet.
- Confirm Vercel plan eligibility for business use before production deployment.
