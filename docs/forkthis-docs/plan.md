# ForkThis Workshop Documentation Implementation Plan

## Plan Status

Phases 1–3 are complete. Phases 4–7 are implemented and awaiting manual review. Phase 8 (search) is intentionally deferred until requested; Phase 9 rollout verification remains. Every phase has an explicit exit gate.

## Delivery Principles

- Preserve the current global navigation and visual system.
- Make the smallest coherent change in each phase.
- Keep Draft and Publication behavior explicit at every layer.
- Share validation and Markdown security rules instead of duplicating them.
- Do not expose unfinished Drafts through public endpoints, search, metadata, or navigation.
- Keep Additional Resources visually and behaviorally unchanged.
- Prefer integration tests at API and route boundaries over isolated tests of static configuration.
- Run `git --no-pager diff` and `git diff --check` after every phase.

## Phase 0 — Baseline and Dependency Verification

### Objective

Establish a reproducible baseline and lock the compatible dependency versions before schema or route changes begin.

### Work

1. Record the current branch, commit, and clean/dirty worktree state.
2. Run the existing targeted checks before modification:
   - database type check;
   - API type check and tests;
   - admin type check, lint, tests, and build;
   - web lint and build.
3. Inspect the installed Next.js 16 documentation for dynamic routes, Server Components, metadata, and caching before adding routes.
4. Verify current releases and Next.js 16/React 19 compatibility for:
   - `fumadocs-core`;
   - `react-markdown`;
   - `remark-gfm`;
   - `rehype-slug`;
   - `rehype-sanitize`.
5. Confirm that only headless Fumadocs packages are required. Do not initialize a Fumadocs theme or run a generator that replaces application layout files.
6. Document any pre-existing failed check before continuing; do not attribute it to this feature.

### Deliverables

- Verified dependency set recorded in workspace package manifests and lockfile during the phase that first uses each package.
- Baseline check results available in the implementation handoff.

### Exit criteria

- Existing failures are understood and recorded.
- Dependency versions support the repository's Node, Bun, Next.js, and React versions.
- No Fumadocs theme CSS or alternate navbar is planned for installation.

## Phase 1 — Resource Contracts and PostgreSQL Model

### Objective

Create the shared language, validation, persistence model, and migration that every later layer depends on.

### Work

1. Create the `@repo/resource-contracts` workspace package.
2. Add strict Zod schemas for:
   - create Draft;
   - update Draft;
   - complete Section Order replacement;
   - UUID and slug route parameters;
   - public search query with a bounded query length.
3. Validate:
   - trimmed title length 1–120;
   - lowercase kebab-case slug length 1–80;
   - reserved slug `additional`;
   - Markdown presence and 65,536-byte maximum;
   - non-empty, unique UUID list for ordering.
4. Define DTOs for admin summaries, admin detail, public summaries, public section detail, and search results.
5. Add Drizzle schemas for `resource_sections` and `resource_publications`.
6. Add relations to `users` for creator, updater, and publisher identities with explicit relation names.
7. Add database constraints and indexes:
   - unique Draft slug;
   - unique Publication slug;
   - index on Section position;
   - indexes for creator/updater/publisher foreign keys.
8. Generate and inspect the SQL migration. Confirm cascading deletion applies only from Section to Publication, not from user deletion to content.
9. Export the new tables and types from `@repo/db`.

### Minimum tests

- Contract schemas accept valid Git/GitHub lesson content.
- Invalid, mixed-case, spaced, reserved, and overlong slugs fail.
- Oversized Markdown fails before database access.
- Reorder schemas reject duplicates and malformed IDs.
- Migration applies to an empty test database.

### Exit criteria

- Database and contract packages type-check.
- Migration is additive and reviewable.
- Draft and Publication can coexist independently in the schema.

## Phase 2 — Administrative Resource API

### Objective

Implement the complete authenticated lifecycle before building either user interface.

### Work

1. Add a focused resource administration controller/service instead of extending the already large general admin controller.
2. Mount routes under the existing `/api/admin` router after `requireSession` and `requireAdmin`.
3. Implement ordered Draft listing with calculated status:
   - `draft`: no Publication exists;
   - `published`: Draft equals Publication;
   - `modified`: Publication exists but title, slug, or Markdown differs.
4. Implement Draft detail lookup including the current Publication snapshot.
5. Implement Draft creation:
   - normalize input through shared schemas;
   - append at `max(position) + 1`;
   - assign creator and updater from the authenticated administrator;
   - map unique violations to `RESOURCE_SECTION_SLUG_EXISTS`.
6. Implement Draft update:
   - update only supplied fields;
   - reject an empty patch;
   - update `updated_by` and `updated_at`;
   - leave Publication unchanged.
7. Implement complete reorder in a transaction:
   - lock or otherwise protect the relevant rows;
   - compare requested IDs with the complete stored ID set;
   - reject duplicates, omissions, and unknown IDs;
   - rewrite positions contiguously from zero.
8. Implement publish/republish in a transaction:
   - reread Draft inside the transaction;
   - revalidate all publishable fields;
   - check public slug uniqueness;
   - upsert an exact snapshot and publisher identity;
   - leave the previous Publication untouched on failure.
9. Implement unpublish by deleting the Publication only.
10. Implement delete by deleting the Section and relying on the Publication cascade.
11. Emit structured mutation logs without Markdown bodies.

### Minimum integration tests

- Unauthenticated requests fail.
- Authenticated non-admin requests fail.
- Admin can create and read a Draft.
- Editing a published section produces `modified` and does not change its Publication.
- Republish replaces the snapshot.
- Failed republish preserves the previous snapshot.
- Duplicate and reserved slugs return explicit conflicts.
- Reordering is atomic and rejects partial orders.
- Unpublish retains Draft content.
- Delete removes both Draft and Publication.

### Exit criteria

- All lifecycle operations work through HTTP.
- No Draft can be reached through a public route.
- API tests and type checks pass.

## Phase 3 — Public Resource API

### Objective

Expose the smallest read-only contract required by the participant web application.

### Work

1. Add a public `resources` API module mounted at `/api/resources`.
2. Implement published summary listing:
   - join Publications to Section Order;
   - return only published snapshots;
   - use deterministic ordering;
   - return a revision fingerprint based on published IDs and timestamps.
3. Implement lookup by published slug.
4. Return 404 `RESOURCE_SECTION_NOT_FOUND` for Draft-only, unpublished, deleted, and unknown slugs.
5. Set `Cache-Control: no-store` until an explicit invalidation system is introduced.
6. Ensure public reads do not require cookies and continue to satisfy existing CORS configuration.

### Minimum integration tests

- Published summaries are ordered correctly.
- Draft-only sections are absent.
- A later Draft edit does not affect public detail.
- Republish changes public detail.
- Unpublish removes summary and detail access.
- `additional` can never resolve as a dynamic section.

### Exit criteria

- The public contract is stable enough for web integration.
- Public tests prove Draft isolation.

## Phase 4 — Shared Safe Markdown Renderer

### Objective

Create one rendering and parsing boundary used by admin preview, public pages, TOC generation, and search extraction.

### Work

1. Create `@repo/markdown` with strict React and TypeScript configuration.
2. Add `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-sanitize`, and `fumadocs-core` as declared package dependencies.
3. Build a single plugin pipeline:
   - parse CommonMark;
   - enable GFM;
   - create deterministic heading slugs;
   - sanitize the transformed tree with an explicit schema;
   - never enable raw HTML parsing.
4. Implement URL policies:
   - permit `http`, `https`, and `mailto` links;
   - permit only HTTPS external images;
   - reject unsafe or malformed schemes explicitly;
   - apply `noopener noreferrer` to external links.
5. Implement semantic render components for headings, paragraphs, lists, blockquotes, tables, task lists, inline code, fenced code, links, images, and footnotes.
6. Add code-block overflow behavior and a client-side copy control without turning the entire Markdown body into a client component.
7. Expose TOC generation through the Fumadocs Markdown TOC utility.
8. Expose Fumadocs `structure()` output for search indexing.
9. Keep visual wrappers configurable so admin and web can supply their own container classes without altering the security pipeline.

### Minimum tests

- GFM table, task list, footnote, autolink, and strikethrough render.
- Duplicate headings receive stable unique IDs.
- TOC URLs match rendered heading IDs.
- Script tags and event handlers do not render.
- Raw HTML cannot create elements.
- `javascript:`, `data:`, and malformed URLs are rejected.
- HTTPS images render with alt text and lazy loading.
- Search structure excludes executable markup while retaining readable content.

### Exit criteria

- The same fixture renders equivalently in server and client contexts.
- Security tests pass.
- Both applications can consume the package without bundling errors.

## Phase 5 — Admin Resources Interface

### Objective

Give administrators a safe, complete authoring and publishing workflow using existing admin conventions.

### Work

1. Add “Resources” to the existing admin sidebar with a Lucide documentation icon.
2. Add the ordered section list page using existing PageHeader, Table, Badge, Empty, Button, AlertDialog, Skeleton, and Sonner patterns.
3. Display title, slug, status, order, updated time, and published time.
4. Add accessible move-up and move-down controls. Disable impossible moves at the first and last positions.
5. Add a dedicated create page.
6. Add a dedicated edit page that loads complete Draft and Publication state server-side.
7. Build the editor with shadcn Field components:
   - title;
   - editable slug;
   - large monospace Markdown textarea;
   - Draft status and publication metadata.
8. Derive an initial slug from the title only when creating. Never overwrite a slug the administrator has manually changed.
9. Add Edit and Preview tabs. Preview uses the current unsaved textarea value and `@repo/markdown`.
10. Add Server Actions for create, update, reorder, publish, unpublish, and delete.
11. Validate with shared schemas before API calls and surface the API's explicit error message.
12. Revalidate list and editor routes after successful actions.
13. Add separate confirmation dialogs for unpublish and permanent delete.
14. Warn on browser navigation when the form differs from its loaded Draft.

### Minimum tests

- Admin list distinguishes Draft, Published, and Modified.
- Preview renders unsaved Markdown but does not publish it.
- Save Draft keeps public content unchanged.
- Publish and Republish update status.
- Reorder updates the displayed sequence.
- Unpublish and delete confirmations describe distinct effects.
- Invalid slug and oversized Markdown errors are visible and actionable.

### Exit criteria

- An administrator can complete the entire lifecycle without database access.
- Admin lint, type checks, tests, and build pass.

## Phase 6 — Participant Documentation Shell

### Objective

Replace the static Resources page structure with linkable documentation while preserving global ForkThis navigation and branding.

### Work

1. Keep `SiteHeader` in the root layout unchanged.
2. Add a resources layout that fetches published summaries server-side with `cache: "no-store"`.
3. Convert summaries into a flat Fumadocs page tree without mounting the Fumadocs theme.
4. Build the ForkThis-styled documentation shell:
   - account for the existing header height;
   - retain the neon frame and black/green palette;
   - use existing font variables;
   - avoid any second top-level navbar.
5. Implement desktop Documentation Navigation as a sticky left column.
6. Implement mobile Documentation Navigation as a separate labelled sheet that does not interfere with the global mobile menu.
7. Add `/resources/[slug]`:
   - fetch summary list and selected Publication in parallel;
   - return `notFound()` for missing or unpublished content;
   - generate page metadata from the Publication;
   - generate H2/H3 TOC through `@repo/markdown`;
   - render sanitized Markdown;
   - calculate previous and next section links from the page tree.
8. Add active heading behavior through Fumadocs headless TOC primitives.
9. Add an accessible compact TOC disclosure for mobile.
10. Make wide tables and code blocks horizontally scroll without causing page overflow.
11. Ensure internal section links use Next.js navigation while external links retain safe new-tab behavior.

### Minimum smoke tests

- Direct section URL loads without prior client navigation.
- Refresh and browser back/forward preserve the selected section.
- Desktop sidebar, mobile sheet, desktop TOC, and mobile TOC work.
- Previous/next links follow administrator order.
- Global Home, Dashboard, Leaderboard, Resources, and auth controls remain clickable.
- No duplicate navbar or Fumadocs theme chrome appears.
- Invalid and unpublished slugs return the correct not-found experience.

### Exit criteria

- Documentation feels like part of ForkThis, not a separate site.
- Web lint and production build pass.

## Phase 7 — Additional Resources Migration

### Objective

Move the existing static resource experience under the documentation shell without redesigning or rewriting it.

### Work

1. Create `/resources/additional`.
2. Move the current YouTube, Articles, and GitHub section composition to that route.
3. Reuse existing `RESOURCE_SECTIONS`, cards, grids, images, and external links.
4. Remove the current right-side scroll-spy navigation because Documentation Navigation now owns resource-level navigation.
5. Add “Additional Resources” as a synthetic final node after all published Documentation Sections.
6. Implement `/resources` redirect behavior:
   - first published section when at least one exists;
   - `/resources/additional` when no Publication exists.
7. Keep Additional Resources excluded from admin management and documentation search.

### Minimum smoke tests

- Existing cards retain their layout, content, hover behavior, and links.
- Additional Resources is always last in desktop and mobile navigation.
- Empty documentation state lands on Additional Resources.
- A first publication changes `/resources` to land on that section.

### Exit criteria

- No curated resource is lost or silently changed.
- `/resources` has deterministic behavior with zero or many published sections.

## Phase 8 — Published Documentation Search

### Objective

Add current, heading-aware search without introducing a separate hosted service or requiring frontend redeployment.

### Work

1. Build search records from Publications only.
2. Use `@repo/markdown` structured data so each result can target a page or heading anchor.
3. Implement a search-index service in the API:
   - calculate the publication fingerprint;
   - reuse an index when unchanged;
   - rebuild when IDs or publication timestamps change;
   - deduplicate concurrent rebuilds;
   - replace the old index only after a successful build.
4. Implement bounded `/api/resources/search?q=...` queries.
5. Return title, URL, heading, excerpt, and highlight data in the shared contract.
6. Build a ForkThis-styled search trigger and dialog using Fumadocs headless search hooks.
7. Place search inside the documentation shell rather than the global SiteHeader.
8. Support keyboard opening while focus is not inside an input or textarea.
9. Show explicit loading, empty, and error states.
10. Log rebuild duration and document count without logging content or queries.

### Minimum integration and UI tests

- Draft text never appears in results.
- Publish and Republish update results without deployment.
- Unpublish and Delete remove results.
- Heading results navigate to the correct anchor.
- Empty and whitespace-only queries do not hit the database.
- Concurrent initial searches cause one index build per process.
- Search failure leaves direct documentation reading operational.

### Exit criteria

- Search reflects the current Publication set.
- Search behavior works in desktop and mobile layouts.

## Phase 9 — End-to-End Verification and Rollout

### Objective

Verify the complete editorial and participant journey, deploy safely, and retain a straightforward rollback.

### Work

1. Run all package checks:
   - `bun run check-types`;
   - `bun run test`;
   - `bun run lint`;
   - production builds for API, admin, and web.
2. Apply the migration in a staging or local production-like database.
3. Exercise the full workflow with two Documentation Sections:
   - create Getting Started;
   - create Setting Up Git;
   - preview both;
   - publish both;
   - reorder them;
   - edit one without publishing;
   - prove public content is unchanged;
   - republish and prove public content changes;
   - search for a heading;
   - unpublish and restore one;
   - verify Additional Resources remains final.
4. Test at desktop and mobile breakpoints.
5. Verify all global navbar destinations from a documentation page.
6. Verify accessibility basics:
   - keyboard navigation;
   - visible focus;
   - landmark labels;
   - dialog titles and focus trapping;
   - heading hierarchy;
   - image alt text;
   - sufficient contrast.
7. Verify security fixtures in deployed behavior, not only unit tests.
8. Observe API logs during publish, search index rebuild, reads, and failures.
9. Deploy database migration before application versions that depend on it.
10. Deploy API, then admin and web.
11. Create the initial workshop Drafts through admin; publish only after preview approval.

### Rollback

1. Restore the previous web Resources route if participant presentation fails.
2. Disable the admin Resources navigation if authoring fails.
3. Retain the additive database tables and content; do not drop them during application rollback.
4. Restore API routes after correcting the issue, then re-enable admin and web integration.

### Exit criteria

- All automated checks pass or have explicitly accepted pre-existing exceptions.
- Production navigation remains frictionless.
- Draft isolation, publication, search freshness, and Additional Resources are verified end to end.
- The rollback path has been reviewed before production release.

## Final Acceptance Checklist

- [ ] Administrators can create, save, preview, publish, republish, unpublish, reorder, and delete Documentation Sections.
- [ ] Editing a published section never changes public content before Republish.
- [ ] Participants can open stable `/resources/[slug]` URLs without signing in.
- [ ] Documentation Navigation and Page Outline work on desktop and mobile.
- [ ] Search contains Publications only and updates without a deployment.
- [ ] Existing Additional Resources cards are unchanged and always last.
- [ ] The existing global navbar remains the only primary navbar.
- [ ] Dashboard and Leaderboard remain directly accessible from every documentation route.
- [ ] Raw HTML, MDX, unsafe links, and unsafe images cannot execute or render.
- [ ] PostgreSQL migration, API tests, type checks, lint, and production builds pass.
