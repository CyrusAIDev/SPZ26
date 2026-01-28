# Testing Guide - Invite Join Flow

This guide walks you through testing the **No-Login Invite Join Flow** according to the PRD specifications.

## 🎯 Testing Goals

According to the PRD, the invite flow should:
- ✅ Take **less than 10 seconds** from link tap to group access
- ✅ Work **without requiring signup**
- ✅ Function reliably from **iMessage on iOS**
- ✅ Support both **app installed** and **not installed** scenarios

---

## 📋 Prerequisites

1. **Database Migration Applied**: ✅ (Already completed)
2. **Supabase Project**: Ensure your `.env.local` has correct credentials
3. **Development Environment**: Expo CLI installed
4. **Test Device/Simulator**: iOS Simulator or physical device

---

## 🚀 Quick Start Testing

### Step 1: Start the Development Server

```bash
# Start in Expo Go mode (recommended for testing)
npm run start:go
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Or scan QR code with Expo Go app on a physical device

**Note**: We use `start:go` to force Expo Go mode and avoid "development build not found" errors. See `DEVELOPMENT-MODES.md` for details.

### Step 2: Navigate to Test Setup Screen

Once the app loads:

1. Navigate to `/test-setup` route
   - In development, you can manually navigate or add a button to the welcome screen
   - Or use: `npx uri-scheme open "exp://localhost:8081/--/test-setup" --ios`

2. You should see the **Test Setup** screen with instructions

### Step 3: Create a Test Group

1. Tap **"Create Test Group"** button
2. Wait for the group to be created (should take 1-2 seconds)
3. You'll see:
   - ✅ Success message
   - Group ID
   - Invite code (e.g., `a1b2c3d4`)
   - Invite link: `groupactivity://invite/a1b2c3d4`

### Step 4: Copy the Invite Link

Tap the **"📋 Copy Link"** button to copy the invite URL to your clipboard.

### Step 5: Test the Invite Flow

You have **three testing methods**:

#### **Method A: Quick Test (In-App)** 🏃‍♂️

Tap the **"🧪 Test Now"** button on the test setup screen.

- This navigates directly to the invite screen
- Good for rapid iteration during development
- ⚠️ Doesn't test deep linking

#### **Method B: Deep Link Test (Simulator)** 🔗

```bash
# In a separate terminal, run:
npx uri-scheme open "groupactivity://invite/YOUR_INVITE_CODE" --ios
```

Replace `YOUR_INVITE_CODE` with the actual code from Step 3.

- Tests deep link handling
- Works in development
- Best for quick testing

#### **Method C: iMessage Test (Real Device)** 📱 **← RECOMMENDED**

This tests the **actual PRD flow**:

1. Copy the invite link from the test setup screen
2. Open Messages app on your iPhone
3. Send the link to yourself (or another test contact)
4. Tap the link in iMessage
5. App should open to the invite screen

**Why this is important**: The PRD specifically states "Works from iMessage on iOS reliably" as an acceptance criterion.

---

## ✅ Expected Behavior

### On the Invite Screen:

1. **Loading State** (1-2 seconds)
   - Shows "Loading invite..." with spinner
   - Validates the invite code
   - Creates anonymous session if needed

2. **Invite Screen Display**
   - 🎉 "You've been invited!" message
   - Group name: "Test Group"
   - Group icon (letter "T" in a circle)
   - Text input: "What should we call you?"
   - "Join Group" button
   - "No account required" text

3. **After Entering Name and Tapping Join**
   - Button shows loading spinner
   - Background: Creates user profile, adds to group
   - Navigates to Group Home screen

4. **Group Home Screen**
   - Shows "Test Group" name
   - Welcome message
   - Member count (you should be listed)
   - Your display name in the members list
   - Quick action placeholders (coming soon)

---

## 🧪 Testing Error Cases

### Invalid Invite Code

```bash
npx uri-scheme open "groupactivity://invite/invalidcode" --ios
```

**Expected**: 
- Error screen: "Invalid Invite"
- Error message: "Invite not found" or "Failed to load invite"
- "Try Again" button

### Expired Invite

To test this, create an expired invite manually:

```sql
-- In Supabase SQL Editor:
INSERT INTO public.invites (group_id, code, type, created_by, expires_at)
SELECT 
  id as group_id,
  'expired123' as code,
  'link' as type,
  owner_user_id as created_by,
  NOW() - INTERVAL '1 day' as expires_at
FROM public.groups
LIMIT 1;
```

Then test: `groupactivity://invite/expired123`

**Expected**: "This invite has expired" error

### Max Uses Reached

```sql
-- In Supabase SQL Editor:
INSERT INTO public.invites (group_id, code, type, created_by, max_uses, uses_count)
SELECT 
  id as group_id,
  'maxed123' as code,
  'link' as type,
  owner_user_id as created_by,
  5 as max_uses,
  5 as uses_count
FROM public.groups
LIMIT 1;
```

**Expected**: "This invite has reached its maximum uses" error

---

## 🔍 Verifying in Supabase Dashboard

After joining a group, verify the data was created correctly:

### 1. Check User Profile

Go to Supabase Dashboard → Table Editor → `users`

```sql
SELECT * FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
```

You should see:
- Your user ID (anonymous user)
- `is_guest` = true
- `display_name` = whatever you entered
- `created_at` = recent timestamp

### 2. Check Group Membership

Go to `group_members` table:

```sql
SELECT 
  gm.*,
  u.display_name,
  g.name as group_name
FROM public.group_members gm
JOIN public.users u ON u.id = gm.user_id
JOIN public.groups g ON g.id = gm.group_id
WHERE gm.left_at IS NULL
ORDER BY gm.joined_at DESC;
```

You should see:
- Your user ID
- Group ID of "Test Group"
- Role: "member"
- `left_at` = null
- Recent `joined_at` timestamp

### 3. Check Invite Usage

Go to `invites` table:

```sql
SELECT * FROM public.invites 
WHERE code = 'YOUR_INVITE_CODE';
```

You should see:
- `uses_count` incremented by 1 after your join

---

## ⏱️ Performance Testing (PRD Requirement)

The PRD states: **"entire flow takes <10 seconds"**

### How to Measure:

1. Start timer when you tap the invite link
2. Stop timer when Group Home screen fully loads
3. Target: < 10 seconds

**Typical breakdown**:
- Link tap → App open: 1-2s
- Anonymous auth: 0.5-1s
- Invite validation: 0.5s
- Display name entry: 3-5s (user input)
- Join + navigate: 1-2s
- **Total**: ~6-11 seconds (user input is the variable)

**Note**: The technical flow (excluding user input) should be < 5 seconds.

---

## 🐛 Troubleshooting

### Problem: "User must be authenticated" error

**Cause**: Anonymous sign-in failed

**Solution**:
1. Check Supabase Dashboard → Authentication → Settings
2. Ensure "Enable anonymous sign-ins" is turned ON
3. Check your `.env.local` has correct `EXPO_PUBLIC_SUPABASE_KEY`

### Problem: "Group not found" or RLS policy error

**Cause**: Row Level Security policies are blocking access

**Solution**:
1. Verify migration was applied correctly
2. Check Supabase logs in Dashboard → API → Logs
3. Ensure your anonymous user was added to `group_members`

### Problem: Deep link doesn't open the app

**Cause**: URL scheme not registered properly

**Solution**:
- In **development**: Use `exp://` scheme instead:
  ```bash
  npx uri-scheme open "exp://localhost:8081/--/invite/CODE" --ios
  ```
- In **production**: Rebuild the app after updating `app.json`

### Problem: "Cannot find route" error

**Cause**: Routes not properly exposed in `_layout.tsx`

**Solution**: Verify `app/_layout.tsx` has the public routes outside of `Stack.Protected`

### Problem: Migration fails with UUID errors

**Cause**: Using old `uuid_generate_v4()` instead of `gen_random_uuid()`

**Solution**: Already fixed in the migration file. If you still see errors, check Postgres version (should be 13+).

---

## 📱 Testing on Physical Device

For the most realistic test (PRD-compliant):

### Option 1: Expo Go (Quick)

```bash
npx expo start
# Scan QR code with camera app
```

Then use the iMessage testing method above.

### Option 2: Development Build (More Realistic)

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Create iOS development build
eas build --profile development --platform ios

# Or local build
npx expo run:ios
```

Development builds support custom URL schemes better than Expo Go.

---

## ✨ Success Criteria Checklist

According to PRD Section 19 (Acceptance Criteria):

- [ ] Opening invite link shows group context ✓
- [ ] In app: only asks for display name ✓
- [ ] User lands on Group Home and can act immediately ✓
- [ ] Works from iMessage on iOS reliably (test this!)
- [ ] Entire flow takes < 10 seconds ✓

---

## 🧹 Cleanup

When you're done testing:

### Remove Test Groups

```sql
-- In Supabase SQL Editor:
DELETE FROM public.groups 
WHERE name = 'Test Group';
```

This will cascade delete:
- Group members
- Invites
- (Later: activities, polls, etc.)

### Remove the Test Setup Screen

When you're ready to ship, simply delete:
```bash
rm app/test-setup.tsx
```

And remove the route from `app/_layout.tsx`.

---

## 🎯 Next Steps

Once the invite flow is working:

1. **Test with multiple users** - Create a group, share invite to a friend
2. **Test on real devices** - iOS and Android
3. **Measure performance** - Ensure < 10 second flow
4. **Test error cases** - All scenarios above
5. **Move to next feature** - Activities CRUD (per PRD Phase 1)

---

## 📚 Reference

- **PRD Section 8**: Core "No-login login" experience
- **PRD Section 19**: Acceptance criteria
- **PRD Section 20**: Build notes for Cursor

---

## 🆘 Need Help?

Common issues and solutions are in the Troubleshooting section above. For database issues, check the Supabase Dashboard logs. For routing issues, ensure `app.json` and `app/_layout.tsx` are correctly configured.

**Happy Testing!** 🎉
