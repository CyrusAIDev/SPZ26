# Xcode Build Issue - Troubleshooting Guide

## Current Status

The iOS folder has been successfully generated with all dependencies installed, but there's a persistent Xcode destination resolution error preventing the build from completing.

## What Was Completed Successfully

✅ Cleared all caches (Expo, CocoaPods, Xcode DerivedData)
✅ Generated iOS folder with `npx expo prebuild`
✅ Installed CocoaPods dependencies (88 pods)
✅ Created Xcode workspace at `ios/exposupabasestarter.xcworkspace`

## The Problem

When attempting to build, xcodebuild fails with error code 70:

```
xcodebuild: error: Unable to find a destination matching the provided destination specifier
Ineligible destinations for the "exposupabasestarter" scheme:
{ platform:iOS, id:dvtdevice-DVTiPhonePlaceholder-iphoneos:placeholder, name:Any iOS Device, error:iOS 26.2 is not installed. }
```

### What's Confusing:

- The error says "iOS 26.2 is not installed" but iOS SDK 26.2 IS installed (`xcodebuild -showsdks` confirms this)
- Simulators exist and are booted:
  - iPhone 16 Plus (664B9ACA-D94B-4EB0-BF4C-3646546C9B80) - Booted
  - iPhone 16 Pro (354B4BB2-52E0-4BCD-A851-A2CF2C92230C) - Available
- Xcode version: 26.2 (Build 17C52)
- iOS Simulator SDK: 26.2 installed
- Tried multiple approaches:
  - Building with device ID
  - Building with device name
  - Building with platform and OS version
  - All failed with the same error

## Root Cause Analysis

This appears to be a destination resolution bug in Xcode 26.2 or a mismatch between:
1. The Xcode version (26.2 - which is unusual, typically Xcode is 15.x or 16.x)
2. The simulator runtime expectations
3. How the Expo-generated project is configured

The error message is misleading - it's not actually about the iOS SDK being missing.

## Workaround Solutions

You have three viable options to continue:

### Option 1: Build with Xcode GUI (Recommended for Now)

1. Open Xcode:
   ```bash
   open ios/exposupabasestarter.xcworkspace
   ```

2. In Xcode:
   - Select a simulator from the device dropdown (top toolbar)
   - Click the Play button (▶️) to build and run
   - This bypasses the command-line destination resolution issue

3. Once built, you can continue development with:
   ```bash
   npm run start:dev-client
   ```

**Pros:**
- Bypasses the xcodebuild destination bug
- Full native functionality
- Can test real deep links

**Cons:**
- Requires using Xcode GUI for first build
- Takes 5-10 minutes

### Option 2: Use EAS Build (Cloud Build)

Build in the cloud without dealing with local Xcode issues:

```bash
# One-time setup
npm install -g eas-cli
eas login
eas build:configure

# Build for development
eas build --profile development --platform ios

# Download and install the .ipa on your device
```

**Pros:**
- No local Xcode issues
- Builds in the cloud
- Can be installed on physical devices

**Cons:**
- Requires Expo account
- Build takes 10-20 minutes
- Requires internet connection

### Option 3: Continue with Expo Go (Fastest)

For testing app logic and functionality, Expo Go works perfectly:

```bash
npm run start:go
```

Then scan the QR code with Expo Go app on your iPhone.

**Pros:**
- Works immediately
- Perfect for testing invite flow logic
- Fast iteration
- No build complexity

**Cons:**
- Can't test custom URL scheme `groupactivity://`
- Must use `exp://` URLs for deep links
- Some native features limited

## What to Try Next

### Fix Attempt 1: Reset Simulator Settings

```bash
# Shut down all simulators
xcrun simctl shutdown all

# Erase the problematic simulator
xcrun simctl erase "iPhone 16 Plus"

# Boot it again
xcrun simctl boot "iPhone 16 Plus"

# Try building again
npx expo run:ios
```

### Fix Attempt 2: Check Xcode Command Line Tools

```bash
# Check current setting
xcode-select -p

# Reset to Xcode app
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Try building again
npx expo run:ios
```

### Fix Attempt 3: Update Xcode (if available)

The Xcode version 26.2 seems unusual. Check if there's an update available:
1. Open Xcode
2. Go to Xcode → Settings → Software Updates
3. Install any available updates
4. Restart and try again

### Fix Attempt 4: Verify Platform Support

In Xcode:
1. Go to Settings → Platforms
2. Ensure iOS 18.6 platform is fully downloaded
3. If not, download it
4. Restart Xcode

## My Recommendation

**For immediate testing:**
Use **Option 3 (Expo Go)** right now:
```bash
npm run start:go
```

This lets you:
- Test all app functionality
- Test on your real iPhone
- Iterate quickly
- No build hassles

**For production-ready testing:**
Later, try **Option 1 (Xcode GUI build)** to build once through Xcode's interface, then continue with dev-client mode.

**For hassle-free builds:**
Use **Option 2 (EAS Build)** for cloud builds without local Xcode issues.

## Files Created

The iOS folder structure is ready:
```
ios/
├── exposupabasestarter.xcworkspace  ← Open this in Xcode
├── Podfile
├── Pods/
└── exposupabasestarter/
```

## Next Steps

1. **Quick path**: Run `npm run start:go` and continue testing with Expo Go
2. **Native path**: Open `ios/exposupabasestarter.xcworkspace` in Xcode and build from there
3. **Cloud path**: Set up EAS Build for cloud-based builds

## Summary

- iOS project generated successfully ✅
- CocoaPods dependencies installed ✅
- Xcode command-line build failing ❌ (destination resolution bug)
- Three viable workarounds available ✅

The core issue is an Xcode/xcodebuild configuration problem, not with your app code or setup. The app structure is ready to build - it just needs to be built through Xcode GUI or EAS instead of command-line for now.
