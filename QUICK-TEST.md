# 🎯 Quick Testing Reference

## Start Testing in 30 Seconds

```bash
# 1. Start Expo in Expo Go mode
npm run start:go

# 2. Press 'i' for iOS Simulator (or scan QR with Expo Go app)

# 3. Navigate to test-setup screen
npx uri-scheme open "exp://localhost:8081/--/test-setup" --ios

# 4. Tap "Create Test Group"

# 5. Copy the invite link and test!
```

💡 **Note**: Use `npm run start:go` to avoid the "development build not found" error.

---

## Test the Invite Flow

### Option A: Quick In-App Test
Tap the "🧪 Test Now" button on the test-setup screen.

### Option B: Deep Link Test (Better)
```bash
npx uri-scheme open "groupactivity://invite/YOUR_CODE" --ios
```

### Option C: iMessage Test (Best - PRD Required!)
1. Copy invite link from test-setup screen
2. Send to yourself in iMessage
3. Tap the link
4. Complete the join flow

---

## Expected Flow

1. **Tap invite link** → App opens to invite screen
2. **See**: Group name "Test Group", display name input
3. **Enter name** → Tap "Join Group"
4. **Navigate to** → Group Home screen
5. **See**: Welcome message, your name in members list

**Total time: < 10 seconds** ⏱️

---

## Verify in Supabase

```sql
-- Check if you joined
SELECT * FROM public.group_members 
ORDER BY joined_at DESC LIMIT 5;

-- Check invite usage
SELECT * FROM public.invites 
ORDER BY created_at DESC LIMIT 5;
```

---

## Common Issues

**"User must be authenticated"**
→ Enable anonymous auth in Supabase Dashboard

**Deep link doesn't work**
→ Use `exp://` scheme in development:
```bash
npx uri-scheme open "exp://localhost:8081/--/invite/CODE" --ios
```

**Can't find test-setup screen**
→ Use the command above to navigate directly

---

## Files You Can Remove Later

When ready to ship, delete:
- `app/test-setup.tsx`
- `SETUP-COMPLETE.md`
- `README-TESTING.md` (or keep for reference)
- This file

Just remove the test-setup route from `app/_layout.tsx` too.

---

**Full documentation**: See `README-TESTING.md`

**Setup summary**: See `SETUP-COMPLETE.md`
