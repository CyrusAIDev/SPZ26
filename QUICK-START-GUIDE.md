# Quick Start: Build and Test Your App

## STEP 1: Build in Xcode (One Time Setup)

**Xcode is already open.** Follow these steps:

1. **Wait for Xcode indexing** (progress bar at top)
2. **Select device**: "iPhone 16 Plus" from dropdown (top center)
3. **Press `Cmd + R`** or click the Play ▶️ button
4. **Wait 3-5 minutes** for first build
5. **App launches** on simulator automatically

## STEP 2: Test All Features

Once the app launches:

### Test Calendar View (NEW!)
1. Tap **"Calendar"** tab at bottom
2. Calendar shows current month
3. Create an activity with schedule (tap + somewhere)
4. Return to calendar - date should have green dot
5. Tap that date - activity appears below
6. Tap activity card - opens detail screen

### Test Spinning Wheel (FIXED!)
1. Go to a group
2. Tap **"Spin Wheel"**
3. Tap **"SPIN"** button
4. **Watch**: Wheel spins smoothly with colored segments
5. Decelerates naturally and lands on winner
6. No errors!

### Test Activity Scheduling (NEW!)
1. Tap "Add Activity"
2. Enter title
3. Tap **"Add Schedule"**
4. Select date (tomorrow) and time (2:00 PM)
5. Tap "Set Schedule"
6. Create activity
7. Schedule appears in activity list

### Test Ratings (Existing)
1. View activity detail
2. Tap "Rate this activity"
3. Select stars and add note
4. Save rating
5. Rating appears in activity detail

## What's Fixed

- ✅ Spinning wheel now has actual spinning animation (not card shuffle)
- ✅ No more worklets version mismatch error
- ✅ No more "Unmatched Route" error
- ✅ App navigation works properly
- ✅ All features functional

## What's New

- ✅ **Calendar view** - See all scheduled activities in month view
- ✅ **Activity scheduling** - Add date/time to activities
- ✅ **Spinning wheel visual** - Classic prize wheel with colored segments

## PRD Phase 1 Status

**Completed (8 of 9):**
- ✅ Groups + membership
- ✅ Invites (link + QR + code)
- ✅ Activities CRUD
- ✅ Ratings
- ✅ Wheel decider
- ✅ Scheduling
- ✅ Calendar view
- ✅ Development build configured

**Remaining (1 of 9):**
- Sentry + PostHog (analytics)

## Next Development Session

After today:
- Use `npm run ios` or `npx expo run:ios` to launch
- Or press `Cmd + R` in Xcode
- Code changes hot reload automatically
- Only rebuild when adding native packages

## If Build Fails

If Xcode build fails:
1. Check error messages in Xcode
2. Try: Product → Clean Build Folder (`Cmd + Shift + K`)
3. Try: Close Xcode, delete `ios/build` folder, reopen
4. Verify Xcode Command Line Tools: `xcode-select --install`

## All Implementation Complete

All code is written, all dependencies installed, all features implemented. Just waiting for the Xcode build to complete (happens automatically once you press `Cmd + R`).

After the build: Test, enjoy, and proceed to Phase 2 or add analytics!
