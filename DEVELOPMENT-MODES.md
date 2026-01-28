# Development Modes Guide

Your project supports **two development modes**. Here's when to use each:

---

## 🚀 Quick Testing Mode (Expo Go) - **USE THIS NOW**

### What is it?
Expo Go is a pre-built app that runs your JavaScript code without needing to compile native code.

### When to use:
- ✅ **MVP development** (what you're doing now)
- ✅ **Rapid iteration** on screens and features
- ✅ **Quick testing** of the invite flow
- ✅ **No native code changes** needed
- ✅ **Fastest development cycle**

### How to use:

```bash
# Start in Expo Go mode
npm run start:go

# Or use the shortcut when prompted
# Press 's' to switch to Expo Go
```

### Install Expo Go:
- **iOS**: [Download from App Store](https://apps.apple.com/app/apple-store/id982107779)
- **Android**: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Testing the invite flow:
```bash
# 1. Start Expo Go mode
npm run start:go

# 2. Press 'i' for iOS or scan QR code with Expo Go app

# 3. Navigate to test setup
npx uri-scheme open "exp://192.168.1.160:8081/--/test-setup"
# (Use your actual IP from the QR code terminal output)
```

---

## 🏗️ Production Mode (Development Build) - **USE LATER**

### What is it?
A custom development build of your app with all native code compiled. Like a debug version of your production app.

### When to use:
- ✅ **Before App Store submission**
- ✅ **Testing deep links properly** (custom URL schemes)
- ✅ **When you add native modules** (camera, calendar, etc.)
- ✅ **Testing push notifications**
- ✅ **Production-like environment**

### How to build:

#### Option A: Local Build (Faster, requires Xcode/Android Studio)

```bash
# iOS (requires Xcode installed)
npm run build:dev:ios

# Android (requires Android Studio installed)
npm run build:dev:android
```

This will:
- Compile all native code
- Install the app on simulator/device
- Take 5-10 minutes first time
- Subsequent builds are faster

#### Option B: EAS Build (Cloud build, no Xcode needed)

```bash
# Install EAS CLI (one time)
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --profile development --platform ios

# Build for Android
eas build --profile development --platform android
```

This will:
- Build in the cloud (no Xcode needed)
- Take 10-20 minutes
- Download the build file
- Install on your device

### Testing with development build:

```bash
# Start in dev client mode
npm run start:dev-client

# The app will connect automatically if installed
```

---

## 🎯 Recommendation for Your Current Stage

### **Use Expo Go Mode Now**

According to your PRD:
- Section 20: "Build one screen/flow at a time"
- Section 20: "Don't 'perfect' UI early—ship functional"

**Why Expo Go is better for MVP:**
1. ⚡ **Instant testing** - No build wait time
2. 🔄 **Fast refresh** - See changes immediately
3. 🧪 **Quick iteration** - Perfect for testing invite flow
4. 📱 **Easy device testing** - Just scan QR code

**Switch to Development Build when:**
1. ✅ Core invite flow is working
2. ✅ Ready to test real deep links from iMessage
3. ✅ Adding native features (Calendar, Camera, Notifications)
4. ✅ Preparing for TestFlight/App Store

---

## 🔧 Current Issue - Quick Fix

Your immediate problem is that Expo is looking for a development build but you haven't built one yet.

### Fix Right Now:

**Option 1: Switch to Expo Go (Recommended)**

```bash
# Kill current server (Ctrl+C)

# Start in Expo Go mode
npm run start:go

# Press 'i' for iOS simulator
# Or scan QR code with Expo Go app
```

**Option 2: Build Development Build (10 min wait)**

```bash
# Kill current server (Ctrl+C)

# Build and install (requires Xcode)
npm run build:dev:ios

# This will take 5-10 minutes
# Then press 'i' to open
```

---

## 📋 Command Reference

### Starting the server:

```bash
# Auto-detect mode (current behavior)
npm start

# Force Expo Go mode
npm run start:go

# Force Development Build mode
npm run start:dev-client
```

### Building native apps:

```bash
# Build iOS development build locally
npm run build:dev:ios

# Build Android development build locally
npm run build:dev:android

# Build iOS using EAS (cloud)
eas build --profile development --platform ios
```

### Testing:

```bash
# Open iOS simulator (Expo Go)
# Start server with: npm run start:go
# Then press: i

# Open iOS with development build
# Start server with: npm run start:dev-client
# Then press: i

# Test deep link (Expo Go)
npx uri-scheme open "exp://YOUR_IP:8081/--/invite/CODE"

# Test deep link (Development Build)
npx uri-scheme open "groupactivity://invite/CODE" --ios
```

---

## 🎓 Deep Linking Notes

### Expo Go Limitations:
- ❌ Can't test custom URL schemes (`groupactivity://`)
- ✅ Can test with `exp://` URLs
- ✅ Perfect for testing app flow/logic
- ✅ Good enough for MVP testing

### Development Build:
- ✅ Full custom URL scheme support
- ✅ Tests real iMessage deep links
- ✅ Production-like behavior
- ⚠️ Requires build step

### For PRD Testing:

**Phase 1 (Now)**: Use Expo Go
- Test invite flow logic
- Verify database operations
- Iterate on UI quickly
- Use `exp://` for deep link testing

**Phase 2 (Before Launch)**: Switch to Development Build
- Test real `groupactivity://` links
- Test from actual iMessage
- Verify all native features
- TestFlight distribution

---

## 🚨 Troubleshooting

### "No development build installed"
→ You're in dev-client mode but haven't built the app
→ **Fix**: Use `npm run start:go` instead

### "Expo Go doesn't support this feature"
→ Some native modules don't work in Expo Go
→ **Fix**: Build development build with `npm run build:dev:ios`

### Deep links don't work in Expo Go
→ Custom URL schemes require development build
→ **Fix**: Use `exp://` URLs for now, or build dev client

### Build takes too long
→ Local builds require Xcode/Android Studio setup
→ **Fix**: Use EAS cloud builds (no local setup needed)

---

## ✅ Next Steps for You

**Right now:**

1. Kill your current Expo server (Ctrl+C)
2. Run: `npm run start:go`
3. Press `s` if needed to switch to Expo Go
4. Press `i` to open iOS simulator (or scan QR with Expo Go app)
5. Continue testing as per QUICK-TEST.md

**This will let you test immediately!**

When you're ready for production testing (later), you can build a development build using the commands above.
