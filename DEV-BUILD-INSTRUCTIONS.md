# Development Build Instructions

## IMPORTANT: Stop Metro First

Before running the development build, you need to stop the current Metro server:

1. Go to the terminal where you ran `npm run start:go`
2. Press `Ctrl+C` to stop Metro
3. Wait for it to fully stop

## Then Run Development Build

Once Metro is stopped, the build will start automatically. This will take 5-10 minutes for the first build.

## What the Build Does

1. **Installs native dependencies** - Including react-native-reanimated 4.1.1 with proper native code
2. **Compiles iOS app** - Creates a custom app with your exact dependencies
3. **Installs on simulator** - Places the app on your iOS Simulator
4. **Starts Metro** - Automatically starts the bundler
5. **Launches app** - Opens your custom app (not Expo Go)

## What to Expect

**During Build (5-10 minutes):**
- You'll see CocoaPods installation messages
- Xcode will compile the native modules
- Terminal will show build progress

**After Build:**
- iOS Simulator will launch
- Your custom app will install and open
- No more worklets error
- All features will work, including spinning wheel

## Troubleshooting

If build fails:
- Make sure Xcode is installed and up to date
- Make sure Xcode Command Line Tools are installed: `xcode-select --install`
- Try clearing build cache: `rm -rf ios/build`

## Future Development

After this first build:
- Code changes will hot reload instantly (same as before)
- Only rebuild when you add/remove native dependencies
- Use `npm run ios` or `npx expo run:ios` to launch
