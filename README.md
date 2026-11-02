# Startupia OS

Piensa en grande. Empieza inteligente.

Unified Next.js application migrated from the existing Startupia Sites projects. The canonical repository is rafaelmellov/startupia-os. The owner explicitly authorized publishing the source and documentation without secrets. Consult docs/DELIVERY.md for the publication status and verification of this release. Authentication, organization-scoped persistence and private file storage use Supabase; the unified publication target is Sites, with a Next.js deployment path also documented.

## Run locally

Node 24 and pnpm 11.25.0 are required.

```sh
pnpm install --frozen-lockfile --ignore-scripts
cp .env.example .env.local
# Configure the Supabase URL and publishable key, and your exact APP_ORIGIN.
pnpm dev
```

Apply all migrations in order from `supabase/migrations` to a new Supabase project before testing. The current Startupia project already has these migrations' schemas. Do not apply it twice. Configure Auth Site URL and allowed callback URLs for each deployment. API secrets belong only in protected server environment variables.

## Implemented

- Preserved landing and brand, real login, registration/confirmation and password recovery handlers.
- Shared onboarding and workspace, versioned saves with conflict rejection, tenant row security, private files.
- Existing Build tools, reports, templates, tasks, projects, business context and optional browser AI.
- Mentors request workflow with quotas and administrator authorization.
- Growth experiments, metrics and customer editors with real entitlement enforcement and shared versioned persistence. Choosing a plan does not grant paid access.
- Stripe sandbox checkout/portal/webhook adapters, signature verification and transactional event ledger.
- Optional consent-based PostHog events. The project connection can be read; ingestion for this revision is not verified.
- OpenAI Responses server adapter with saved business context, per-plan quotas and output budgets, real streaming, reviewed action proposals and explicit unavailable errors when unconfigured.

## Verification

```sh
pnpm test
pnpm build
pnpm typecheck
```

`supabase/tests/tenant-isolation.sql` uses a transaction and rolls back fixtures. Run only in a controlled test session. Historical Worker tests are retained as regression coverage; they do not replace verification of the migrated API. See `docs/SAAS-STATUS.md` for measured results and limitations.

## Not production complete

Vercel project creation returned 403 for the connected account. OpenAI credentials were not present in supplied SDK examples, so remote generation is not verified. Stripe adapters and database ledger are implemented, but end-to-end Checkout needs server credentials and sandbox verification. PostHog ingestion and full commercial funnels for this revision remain pending. Growth supports records and experiments; advanced automated analysis remains pending. Mentors does not yet have a verified production catalog or payment flow. Email delivery, broad accessibility/visual automation, production monitoring and independent security review remain pending.

Original Sites Worker/Drizzle files are kept for migration traceability and regression tests; Next.js uses `app/api` and Supabase, not those Workers. Legacy quality documents describe prior versions and are not proof of the current deployment.

Previously published Sites URL (V2, owner-private audience): https://startupia-platform-os.contact-rafaelmello.chatgpt.site. This URL does not establish that the new revision is published; the outer login can block external webhooks until an explicit deployment decision resolves that path. Current prices: Build USD17/month; Growth USD37/month. See docs/PRICING.md.


## Delivery package and manual

See [the integral manual](docs/MANUAL-INTEGRAL.md) for architecture, all nine deliverables, real functions, per-plan limits, configuration, operation, tests and pending work. [DELIVERY.md](docs/DELIVERY.md) records the phase scope.

Run `node scripts/export-delivery.mjs --docs` to prepare the readable/printable manual, and `--pages --origin http://127.0.0.1:3100` for public HTML review copies without accounts or cookies. Protected modules export explanatory portals with canonical links, never simulated private workspaces. Source React and server routes run together; static HTML does not execute that backend.

Only after the source owner freezes the version, run `node scripts/export-delivery.mjs --zip --frozen`. Output defaults to the parent workspace's `delivery/` directory, with separate source and HTML/manual ZIPs plus a unified archive and SHA-256 manifests. Python uses `STARTUPIA_PYTHON` or portable `python3`; secrets, real environment files, sessions, caches, dependencies and build outputs are excluded. Publication evidence and the final source version must be updated after deployment.


## Current delivery and motion system

Start with [the detailed manual](docs/MANUAL-INTEGRAL.md), [delivery map](docs/DELIVERY.md), [access model](docs/ACCESS.md), and [design verification](docs/NEXT-DESIGN.md). BUILD is USD17/month; GROWTH is USD37/month. Paid access requires an active subscription and a future server-verified paid invoice period. Trial status, browser URLs and commercial selection do not grant access.

The landing has original procedural brand video, scroll-linked decorative scenes, keyboard module tabs, a split-flap module readout, bounded particles, local orientation, subtle glass/metal surfaces and reduced-motion support. Native scrolling is preserved. The existing OS inventory contains320 surface/event variants; this is not a claim of320 independent animations.

The export helper prepares review HTML and a printable manual, then creates source, HTML/manual and combined ZIPs only after explicit source freeze. The static HTML copies do not replace the authenticated server application. Never include runtime keys, account data or environment files in a public package.

```sh
node scripts/export-delivery.mjs --docs --pages --origin http://127.0.0.1:3100
# Only after the reviewed source is frozen:
node scripts/export-delivery.mjs --zip --frozen
```
