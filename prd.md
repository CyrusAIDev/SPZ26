# PRD: Group Activity Decider (Working Name)

## 1) Product summary

A mobile-first app that helps friends, couples, and families decide what to do together—without endless texting. Users create groups, add activities, rate them (stars + notes), run polls, and spin a wheel that can be biased by ratings, upcoming dates, and preferences. The app is designed to go viral via link/QR sharing (works great in iMessage) and to monetize later via affiliate local events users can add to their groups.

Primary platform: iOS
Secondary: Android (same codebase via Expo)

## 2) Goals

### Primary goals (MVP)

- Join a group in under 10 seconds from a link/QR (no forced signup).
- Make it easy to: add activities → decide → schedule → rate.
- Make sharing in group chats feel effortless (iMessage/WhatsApp/DMs).
- Provide an in-app calendar view so people can check back in.

### Secondary goals (post-MVP)

- Monetization via local event discovery + affiliate links.
- Personalization (preferences) and smarter wheel biasing.
- Better retention via reminders and lightweight "nudges."

## 3) Non-goals (MVP)

- No chat/messaging system inside the app.
- No complex permissions beyond owner/admin vs member.
- No advanced scheduling assistant (availability matching).
- No heavy social feed.
- No iMessage extension app (use standard share + deep links first).

## 4) Target users & key use cases

### Users

- **Guest (anonymous)**: joins via link/QR, provides display name only.
- **Registered user**: signs in to sync calendar, persist across devices, browse events, purchase via affiliates, own groups.
- **Group owner/admin**: can delete group and manage membership.

### Key use cases

- "My friend sent a link in iMessage—I tap it and I'm instantly in the group."
- "We can't decide—spin the wheel."
- "Let's vote—create a poll."
- "We did it—rate it."
- "What are we doing next week—check the calendar."

## 5) Core product principles

- **Link-first growth**: sharing is the main loop.
- **Progressive identity (no-login login)**: display name first, real login only when it adds value.
- **Fast actions**: add, vote, rate, spin should be one-tap flows.
- **Group is the home**: shared links land directly in group context.
- **Simple MVP foundation**: build small, stable, then expand.

## 6) Tech stack (beginner-friendly, Cursor-friendly, commercial-ready)

### Mobile app

- React Native + Expo (Managed)
- TypeScript
- expo-router (recommended for deep links + simple routing)
- UI: React Native Paper or NativeWind (pick one to stay consistent)
- Data fetching/caching: TanStack Query
- Local state (optional): Zustand
- Validation: Zod
- Expo modules (as needed):
  - expo-linking (deep links)
  - expo-sharing (share sheet)
  - expo-camera (QR scan)
  - expo-notifications (reminders)
  - expo-calendar (calendar read/write)
  - expo-secure-store (optional for local secure storage)

### Backend

- Supabase
  - Postgres DB
  - Auth: anonymous + OAuth (Apple, Google) later
  - RLS (Row Level Security) mandatory
  - Storage (group icons)
  - Edge Functions (invite validation, affiliate redirect tracking, anti-abuse)

### Monetization

- RevenueCat (subscriptions/entitlements/paywalls)

### Lifecycle messaging

- Loops (email onboarding + re-engagement) via server-side calls only (Edge Function)

### Analytics & stability (recommended before public launch)

- Sentry (crash + error reporting)
- PostHog (funnels: invite → join → first action)

### Web for link fallback (required for virality)

Pick one:
- **Option A (recommended)**: Next.js on Vercel for "Join/Preview Group" pages + deep link into app
- **Option B**: Expo Web minimal pages (works, but Next.js is usually smoother for sharing)

### Build & release

- EAS Build + EAS Update
- GitHub source control
- Cursor for implementation assistance

## 7) Commercial readiness requirements (MVP)

- Supabase RLS enabled on all user/group data tables
- No secret keys in the app bundle
- Rate limiting / abuse controls on invites and anonymous actions
- Basic audit logging for membership changes (minimal)
- Sentry enabled in production builds
- Privacy policy + terms (simple) before App Store submission
- Deep links tested across iOS Messages, Safari, and installed/not-installed flows

## 8) Core "No-login login" experience (must-have)

### Principle

A new user who taps a group invite link should not be blocked by signup.

### First-time invite flow (iMessage-friendly)

1. User taps shared link in iMessage (or scans QR).
2. If app installed → opens app to Invite Route.
3. If app not installed → opens web invite page:
   - Shows group name + small preview
   - Buttons: Open in App / Get the App
4. Once in app, show **Invite Intro Overlay** (single screen):
   - "You've been invited to {Group Name}"
   - Member avatars/count (if available)
   - One field: Display name
   - Button: Join
5. On Join:
   - Create/restore an anonymous Supabase session
   - Add membership to group (server-validated)
   - Navigate to Group Home

**Target**: entire flow takes <10 seconds.

### When to prompt real login (progressive)

Prompt signup only when user tries to:
- sync calendar across devices
- create a group (optional: allow guests to create, but safer to require signup)
- restore data on new phone
- receive reminders
- buy tickets / affiliate purchase
- subscribe via RevenueCat

## 9) Core features (MVP scope)

### A) Groups

- Create group (name + optional icon)
- Join via link/QR/code
- Leave group
- View members
- Owner/admin can remove members and delete group

### B) Activities

- Create activity (title, optional notes, optional category)
- Optional scheduled date/time (can be added later)
- Include/exclude from wheel toggle
- View activity detail (ratings + notes + schedule)

### C) Ratings

- Stars 1–5
- Optional note
- Date/time (default now; editable)
- Store rating per user per activity (allow updates)

### D) Wheel Decider

- Spins among included activities in a group
- Bias modes (MVP):
  - No bias
  - Higher average rating
  - Soonest upcoming date
- Result screen:
  - winner + quick actions: "Schedule it", "Start poll", "Spin again"

### E) Polls/Voting

- Create poll by selecting activities
- Members vote once
- Poll results view
- Optional deadline (MVP: optional; keep simple)

### F) Calendar

- In-app calendar view (month + agenda list)
- Shows scheduled activities
- Filter: All groups / specific group

### G) Calendar connect (optional for MVP, but planned)

- Write scheduled activities to user calendar
- Prefer "create a dedicated calendar" (e.g., "Group Activity Decider") or let user choose a calendar

## 10) Monetization feature (post-MVP / Phase 2)

Event discovery marketplace:
- browse events in city
- add event to group as activity
- affiliate redirect tracking
- purchase flows

Login required at purchase time if needed.

## 11) Core screens (MVP)

### Entry & Sharing

- **Shared Group Landing (Web)** (Next.js or Expo Web)
  - Group preview + CTA to open/install app
- **Invite Intro Overlay (In App)**
  - display name input + Join
- **Welcome / Join Gate**
  - Join via link/QR/code, Create group (minimal)

### Groups

- **Groups List (Home)**
  - list groups, create/join
- **Create Group**
- **Group Home (Dashboard)**
  - Upcoming, Activities, Polls, Wheel CTA, Members preview
- **Members & Invites**
  - member list, QR, link copy, join code, leave group, admin actions
- **Group Settings**
  - rename group, delete group (owner only)

### Activities

- **Activities List**
  - sort/filter; add activity
- **Create/Edit Activity**
- **Activity Detail**
  - avg rating, history, next scheduled date, include-in-wheel toggle
- **Rate Activity (Modal)**
  - stars, note, date

### Decision Tools

- **Wheel**
  - bias controls + spin + included list management (simple)
- **Poll Create**
- **Poll Detail / Results**

### Planning

- **Calendar**
- **Connect Calendar** (Permissions + Select Calendar)

### Account

- **Progressive Login / Signup**
  - Apple / Google / Email (Apple strongly recommended on iOS)
- **Settings**
  - notifications, account, privacy, support

## 12) Key user flows (MVP)

### Flow 1: iMessage invite → join group (no login)

1. Friend shares group link
2. Recipient taps link
   - If app installed: open `/invite/{code}`
   - If not installed: web page → install/open app → same invite route
3. In app: display name → join → Group Home

**Success criteria**: <10 seconds to land on Group Home, no account creation required

### Flow 2: Create activity → decide → schedule

1. Group Home → Add Activity → save
2. Wheel → spin → winner
3. Winner → "Schedule it" → add date → appears on calendar

### Flow 3: Poll voting

1. Group Home → Create poll → select activities → publish
2. Members vote → results update
3. Optional finalize winner

### Flow 4: Rate after doing activity

1. Activity Detail → Rate → stars + note → saved
2. Average updates everywhere

### Flow 5: Connect calendar (progressive login trigger)

1. Calendar tab → Connect calendar
2. If guest: prompt login (optional, recommended)
3. If logged-in: request permissions → create/select calendar → write events

## 13) Data model (MVP)

### Users

**users**
- id (uuid)
- is_guest (bool)
- display_name (text)
- created_at

### Groups

**groups**
- id
- name
- owner_user_id
- icon_url (optional)
- created_at
- deleted_at (optional soft delete)

**group_members**
- group_id
- user_id
- role (owner/admin/member)
- joined_at
- left_at (optional)

### Invites

**invites**
- id
- group_id
- code (unique, short)
- type (link/qr/code)
- created_by
- created_at
- expires_at (optional)
- max_uses (optional)
- uses_count

### Activities & categories

**activity_categories**
- id
- group_id
- name
- created_at

**activities**
- id
- group_id
- title
- notes (optional)
- category_id (optional)
- include_in_wheel (bool, default true)
- created_by
- created_at

**activity_schedules**
- id
- activity_id
- group_id (denormalized for easy queries)
- start_at (timestamp)
- end_at (optional)
- timezone (text, optional)
- created_by
- created_at

### Ratings

**activity_ratings**
- id
- activity_id
- group_id (denormalized)
- user_id
- stars (1–5)
- note (optional)
- rated_at (timestamp)
- updated_at

Rule: one rating per user per activity (upsert/update allowed).

### Polls

**polls**
- id
- group_id
- title (optional, e.g. "What should we do this weekend?")
- created_by
- created_at
- closes_at (optional)
- status (open/closed)

**poll_options**
- id
- poll_id
- activity_id

**poll_votes**
- id
- poll_id
- option_id
- user_id
- created_at

Rule: one vote per user per poll.

### Wheel (MVP can be computed, not stored)

No table needed initially.

Optional later: `wheel_spins` log (group_id, winner_activity_id, bias_mode, created_at)

## 14) Security & permissions (Supabase)

**Requirement**: RLS ON for all tables above.

### High-level policies (conceptual):

- A user can read a group only if they are a member (group_members exists and not left).
- A user can insert activities/ratings/polls only if they are a member.
- Only owner/admin can remove members (except self-leave).
- Only owner can delete group.

### Invites:

Invite redemption should be validated via Edge Function to prevent abuse and enforce max uses/expiry.

## 15) iMessage / sharing requirements

### MVP (recommended)

- Use native Share Sheet to send:
  - group invite link
  - activity link
  - poll link
- Ensure links generate rich previews (title + description) via web landing page OG tags (Next.js makes this easy).

### Later (optional)

iMessage app extension is not required and adds complexity; only consider after product-market fit.

## 16) Success metrics (MVP)

- Invite → Join conversion rate
- Time to join group (median under 10s)
- % of joined users who perform a first action:
  - add activity / vote / spin / rate
- 7-day retention of group members
- Groups created per active user
- "Decision completed" events per group (wheel or poll)

## 17) Release scope (phased plan for a beginner)

### Phase 1: Viral core (launchable)

- Supabase auth (guest)
- Groups + membership
- Invites (link + QR + code)
- Activities CRUD
- Ratings
- Wheel (no bias + rating bias)
- Basic calendar view (in-app only)
- Sentry + PostHog

### Phase 2: Planning polish

- Polls
- Calendar write integration
- Better wheel bias options

### Phase 3: Monetization

- Events discovery
- Affiliate tracking redirect (Edge Function)
- RevenueCat paywall/subscription (optional)

## 18) Risks & mitigations

- **Spam/abuse via invites**: add invite expiry/max uses + rate limiting in Edge Function.
- **Data leakage with public key**: enforce RLS and test it.
- **Guest identity loss**: persist sessions locally; prompt login for cross-device.
- **Link routing issues (installed vs not)**: invest time early in deep-link testing and web landing pages.
- **Overbuilding too early**: stick to Phase 1 strictly.

## 19) Acceptance criteria (MVP essentials)

### Shared link join

- Opening invite link shows group context (web or app)
- In app: only asks for display name
- User lands on Group Home and can act immediately
- Works from iMessage on iOS reliably

### Group & activity

- Members can add activities and see them update
- Ratings update average across list + detail
- Wheel uses current included activities

### Stability

- No crashes in core flows (Sentry installed)
- Analytics events tracked for funnels (PostHog)

## 20) Build notes for Cursor (how to stay sane)

- Build one screen/flow at a time.
- Don't "perfect" UI early—ship functional.
- Keep route names aligned with deep links:
  - `/invite/[code]`
  - `/group/[id]`
  - `/activity/[id]`
  - `/poll/[id]`
- Add types for Supabase rows (helps Cursor generate correct code).
- Use Edge Functions for anything that smells like "security" (invite redemption, affiliate redirects, admin actions).
