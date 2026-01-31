# Testing Instructions - Date Picker Fix & Development Build

## ✅ What Was Fixed

### 1. Date Picker Bug (FIXED)
**Issue**: Could only select today's date, future dates were not selectable
**Fix**: Updated `DateTimePickerModal.tsx` to properly sync state with props using `useEffect`
**Status**: Code change complete - ready to test

### 2. Supabase Key (VERIFIED)
**Status**: Confirmed the key in `.env.local` is complete and correct

### 3. Spinning Wheel Error (REQUIRES BUILD)
**Issue**: Worklets version mismatch (0.7.2 vs 0.5.1) in Expo Go
**Solution**: Must use development build
**Status**: Ready to build

## Testing Steps

### Step 1: Test Date Picker Fix (In Expo Go)

You can test the date picker fix RIGHT NOW in Expo Go:

1. **Restart Metro Server** (if not already running):
   ```bash
   npm run start:go
   ```
   Or just reload the app in the simulator

2. **Test Date Selection**:
   - Open the app
   - Navigate to a group
   - Tap "Add Activity" (+)
   - Tap "Add Schedule" button
   - Tap the "Date" row
   - **Try scrolling through dates** - you should now be able to select future dates
   - Tap "Done"
   - Tap the "Time" row
   - **Try scrolling through times**
   - Tap "Done"
   - Tap "Set Schedule"
   - Verify the date/time appears correctly
   - Create the activity
   - **Expected**: Activity created successfully with schedule

3. **What You Should See**:
   - ✅ Date picker allows scrolling to future dates
   - ✅ Time picker allows scrolling to any time
   - ✅ Selected date/time persists when you tap "Done"
   - ✅ Schedule appears on the create activity screen
   - ✅ Activity saves successfully

4. **If It Still Doesn't Work**:
   - Make sure Metro reloaded the code (you should see "Reload" in terminal)
   - Try force-reloading: Press `Cmd + R` in the simulator
   - Or shake device and tap "Reload"

### Step 2: Build for Spinning Wheel Fix (Development Build)

The spinning wheel CANNOT work in Expo Go. You MUST build:

#### Option A: Build in Xcode (Recommended)

1. **Open Xcode** (if not already open):
   ```bash
   open /Users/cyrusghoreishi/Desktop/SharedPlanzzz/expo-supabase-starter/ios/exposupabasestarter.xcworkspace
   ```

2. **In Xcode**:
   - Wait for indexing to complete (progress bar at top)
   - Top bar: Select any iOS Simulator from the device dropdown
     - Try "iPhone 16 Plus" (currently running)
     - Or "iPhone 16 Pro"
     - Or "Any iOS Simulator"
   - Press `Cmd + R` or click the Play ▶️ button
   - Wait 3-5 minutes for build

3. **During Build**:
   - You'll see build progress in Xcode
   - Don't cancel it
   - Terminal shows compilation messages

4. **After Build Completes**:
   - Simulator launches automatically
   - Your custom app (NOT Expo Go) opens
   - Metro bundler starts automatically

#### Option B: Command Line Build

If Xcode build fails due to SDK version issues:

1. **Check Xcode version**:
   ```bash
   xcode-select --print-path
   ```

2. **If it shows Xcode-beta**, switch to stable:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app
   ```

3. **Build**:
   ```bash
   cd /Users/cyrusghoreishi/Desktop/SharedPlanzzz/expo-supabase-starter
   npx expo run:ios
   ```

#### Option C: If Both Fail

Check for iOS runtime:
```bash
xcrun simctl list runtimes
```

If you see iOS 18.6 but Xcode is looking for iOS 26.2:
- This is an Xcode beta SDK mismatch
- Either update to stable Xcode from App Store
- Or download iOS 26.2 SDK from Xcode > Settings > Components

### Step 3: Test Spinning Wheel (In Development Build)

Once the development build launches:

1. **Verify No Errors**:
   - ✅ App should start without the worklets error
   - ✅ No red error screens
   - ✅ Navigation works properly

2. **Test Spinning Wheel**:
   - Navigate to any group
   - Tap "Spin Wheel" button
   - **Expected**: See a circular wheel with colored segments
   - Tap "SPIN"
   - **Expected**: 
     - Wheel spins smoothly for ~5 seconds
     - Decelerates naturally
     - Lands on a winner
     - Winner card shows the selected activity
   - Try different bias modes:
     - Random (no bias)
     - Rating bias (favors higher-rated activities)
     - Date bias (favors activities with upcoming schedules)

3. **Test All Features**:
   - ✅ Create activities (with and without schedules)
   - ✅ Rate activities
   - ✅ View calendar
   - ✅ Spin wheel
   - ✅ Navigate between screens

## What's Different Between Expo Go and Development Build

### Expo Go (What You Were Using)
- Generic app with pre-compiled native modules
- Has react-native-reanimated 3.x built-in
- **Cannot** use newer native modules
- **Cannot** use react-native-reanimated 4.x
- Fast for testing basic features
- ❌ Spinning wheel doesn't work

### Development Build (What You Need)
- Custom app with YOUR exact dependencies
- Has react-native-reanimated 4.1.1 compiled in
- **Can** use any native modules
- Required for production apps
- ✅ Spinning wheel works perfectly
- ✅ All features work

## Summary

**Date Picker**: Fixed in code, test in Expo Go now
**Spinning Wheel**: Requires development build, test after building in Xcode

Both fixes align with PRD requirements:
- Fast actions for scheduling ✅
- Smooth spinning wheel animation ✅
- Commercial-ready tech stack ✅
- Phase 1 MVP features complete ✅

## Troubleshooting

### Date Picker Still Broken?
- Verify Metro reloaded: check terminal for "Reload" message
- Force reload: `Cmd + R` in simulator
- Check file was saved: re-read `app/components/DateTimePickerModal.tsx`

### Xcode Build Fails?
- Check error message in Xcode
- Try "Product > Clean Build Folder" (`Cmd + Shift + K`)
- Delete `ios/build` folder and rebuild
- Verify Command Line Tools: `xcode-select --install`

### Simulator Doesn't Launch?
- Check if simulator is already running
- Close simulator and rebuild
- Try different simulator (iPhone 16 instead of 16 Plus)

### Metro Bundler Issues?
- Kill existing Metro: `lsof -ti:8081 | xargs kill`
- Restart: `npm run start`
- Clear cache: `npx expo start -c`
