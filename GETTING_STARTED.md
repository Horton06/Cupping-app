# 🚀 Getting Started with Cupper App

Welcome! This guide will help you get the Cupper coffee cupping app running on your phone or computer, even if you're new to mobile development.

## 📋 Prerequisites

Before you begin, you'll need to install a few tools on your computer.

### 1. Install Node.js

Node.js is required to run the app and manage dependencies.

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (Long Term Support) - this is the recommended version
3. Run the installer and follow the installation prompts
4. Verify the installation by opening your terminal/command prompt and typing:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers displayed (e.g., `v18.17.0` and `9.6.7`)

### 2. Install Git

Git helps you download and manage the project code.

1. Visit [git-scm.com/downloads](https://git-scm.com/downloads)
2. Download the installer for your operating system (Windows, Mac, or Linux)
3. Run the installer with default settings
4. Verify installation:
   ```bash
   git --version
   ```

## 📥 Download the Project

### Clone the Repository

Open your terminal/command prompt and run these commands:

```bash
# Navigate to where you want to store the project
# For example, your Documents folder:
cd ~/Documents  # Mac/Linux
cd %USERPROFILE%\Documents  # Windows

# Clone the repository from GitHub
git clone https://github.com/Horton06/Cupping-app.git

# Navigate into the project folder
cd Cupping-app
```

## 🔧 Install Dependencies

Install all the required packages and libraries:

```bash
npm install
```

**This will take 2-5 minutes.** You'll see a lot of text scrolling by - this is completely normal! The command is downloading all the tools and libraries the app needs.

## 🎯 Start the Development Server

Start the app's development server:

```bash
npm start
```

After a few seconds, you should see:
- ✅ A QR code displayed in your terminal
- ✅ Text saying "Metro waiting on..."
- ✅ A browser window might automatically open with Expo Dev Tools

**Keep this terminal window open** - it needs to stay running while you use the app!

## 📱 Run the App

You have three options for running the app. Choose the one that works best for you:

### Option A: On Your Phone (Recommended for Beginners) 📱

This is the **easiest way** to see the app in action!

#### For iPhone:

1. Download **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Open your **Camera** app
3. Point your camera at the QR code in your terminal
4. Tap the notification banner that appears
5. The app will load in Expo Go!

#### For Android:

1. Download **Expo Go** from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Open the **Expo Go** app
3. Tap **"Scan QR Code"**
4. Scan the QR code shown in your terminal
5. The app will load!

**⚠️ Important:** Your phone and computer must be connected to the **same WiFi network**!

### Option B: iOS Simulator (Mac Only) 🍎

If you have a Mac, you can run the app in Apple's iOS Simulator:

```bash
# In the terminal where npm start is running, press the 'i' key
# OR run this command in a new terminal window:
npm run ios
```

The first time you run this:
- Xcode Command Line Tools will install (if not already installed)
- The iOS Simulator will launch
- The app will load automatically

### Option C: Android Emulator 🤖

Run the app in an Android virtual device:

#### First-time setup:

1. Download [Android Studio](https://developer.android.com/studio)
2. Install and open Android Studio
3. Click **"More Actions"** → **"Virtual Device Manager"**
4. Click **"Create Device"**
5. Select **"Pixel 5"** (or any phone) → Click **"Next"**
6. Download a system image (recommended: latest API level)
7. Click **"Finish"**
8. Click the ▶️ play button to start your emulator

#### Run the app:

```bash
# In the terminal where npm start is running, press the 'a' key
# OR run this command in a new terminal window:
npm run android
```

## 🎨 Using the App

Once the app is running, try these features:

### Create Your First Cupping Session

1. Tap the **"New Session"** tab at the bottom
2. Choose **"Single Coffee"** session type
3. Enter coffee details (e.g., "Ethiopian Yirgacheffe")
4. Tap through the workflow to select flavors, score attributes, and add notes

### Explore Features

- **Flavor Wheel** - Settings → Flavor Wheel Reference → Browse 132 SCA flavors
- **History** - View all your past cupping sessions
- **Comparison** - Compare multiple coffees side-by-side
- **Table Cupping** - Analyze cup uniformity (for sessions with 3+ cups)

## 🔄 Reloading the App

If you make code changes or the app seems stuck:

### On Your Phone:
- **Shake** your device
- Tap **"Reload"** in the menu that appears

### In Simulator/Emulator:
- Press **`r`** in the terminal where `npm start` is running
- Or use keyboard shortcuts:
  - iOS Simulator: **Cmd+R**
  - Android Emulator: **RR** (press R twice)

## ⚙️ Development Commands

Useful commands while working with the app:

```bash
# Type checking - Find TypeScript errors
npm run type-check

# Linting - Check code quality
npm run lint

# Clear cache and restart (fixes many issues!)
npm start -- --clear

# Reset everything (nuclear option)
rm -rf node_modules
npm install
npm start
```

## 🐛 Troubleshooting

### "Command not found: npm" or "Command not found: node"

**Problem:** Node.js isn't installed or isn't in your PATH.

**Solution:**
1. Restart your terminal completely (close and reopen)
2. Try `node --version` again
3. If still not working, reinstall Node.js from [nodejs.org](https://nodejs.org/)

### "Port 8081 already in use"

**Problem:** Another Metro bundler is already running.

**Solution:**
```bash
# Kill any running Metro bundlers
killall node  # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Start fresh
npm start
```

### QR Code doesn't work on phone

**Problem:** Phone can't connect to development server.

**Solutions:**
1. **Check WiFi:** Ensure phone and computer are on the same network
2. **Use tunnel mode:** Press `w` in terminal, then scan the new QR code
3. **Manual connection:**
   - Look for the LAN address in terminal (e.g., `exp://192.168.1.5:8081`)
   - In Expo Go, tap "Enter URL manually"
   - Type the address

### "Unable to resolve module" or other dependency errors

**Problem:** Dependencies are corrupted or cache is stale.

**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### App crashes immediately

**Problem:** Could be various issues.

**Solutions:**
1. Check the terminal for error messages (they usually explain the problem)
2. Clear cache: `npm start -- --clear`
3. Try running type-check: `npm run type-check`
4. Reload the app: Shake phone → "Reload"

### Stuck on splash screen

**Problem:** App is loading but not displaying.

**Solution:**
1. Wait 30 seconds (first load can be slow)
2. Check terminal for errors
3. Reload: Shake device → "Reload"
4. Restart Metro: Close terminal, run `npm start` again

## 📁 Project Structure

Understanding where things are:

```
Cupping-app/
├── src/                      # All source code
│   ├── screens/              # App screens (SessionDetail, History, etc.)
│   ├── components/           # Reusable UI components (Button, Card, etc.)
│   ├── navigation/           # Navigation setup and routes
│   ├── services/             # Business logic (database, analytics)
│   ├── store/                # State management (Zustand)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Helper functions
│   ├── hooks/                # Custom React hooks
│   └── theme/                # Design system (colors, typography, spacing)
├── assets/                   # Images, fonts, and data files
│   └── data/                 # Flavor wheel data (flavor-descriptors.json)
├── docs/                     # Documentation
├── App.tsx                   # App entry point
├── app.json                  # Expo configuration
└── package.json              # Dependencies and scripts
```

## 🎓 Learning Resources

New to React Native or mobile development? These resources can help:

- **React Native Basics:** [reactnative.dev/docs/getting-started](https://reactnative.dev/docs/getting-started)
- **Expo Documentation:** [docs.expo.dev](https://docs.expo.dev/)
- **TypeScript Guide:** [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **React Navigation:** [reactnavigation.org/docs](https://reactnavigation.org/docs/getting-started)

## 📝 Quick Reference

### Essential Terminal Commands

```bash
# Start development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Type check (find TypeScript errors)
npm run type-check

# Lint code (check code quality)
npm run lint

# Clear cache
npm start -- --clear

# Reinstall everything
rm -rf node_modules && npm install
```

### Keyboard Shortcuts (Terminal)

When `npm start` is running:

- **`r`** - Reload app
- **`i`** - Run on iOS
- **`a`** - Run on Android
- **`w`** - Open web interface
- **`m`** - Toggle menu
- **`?`** - Show all commands

### On-Device Shortcuts

- **Shake phone** - Open developer menu
- **Reload** - Refresh the app
- **Debug** - Open debugging tools

## 🆘 Getting Help

If you're stuck:

1. **Read error messages carefully** - They usually tell you what's wrong
2. **Check the terminal logs** - Errors appear there first
3. **Search the error message** - Copy/paste into Google
4. **Try the troubleshooting section** - Common issues above
5. **Check Expo forums** - [forums.expo.dev](https://forums.expo.dev/)

## ✅ First Steps Checklist

- [ ] Node.js installed (`node --version` works)
- [ ] Git installed (`git --version` works)
- [ ] Repository cloned (`cd Cupping-app` works)
- [ ] Dependencies installed (`npm install` completed)
- [ ] Dev server started (`npm start` running)
- [ ] App opened (on phone, simulator, or emulator)
- [ ] Created a test cupping session
- [ ] Explored the flavor wheel
- [ ] Viewed session history

## 🎉 You're Ready!

Congratulations! You now have the Cupper app running. Try creating your first cupping session and exploring all the features.

**Happy cupping!** ☕

---

**Need more help?** Check the [README.md](README.md) for technical details or the [Final Polish Checklist](docs/FINAL_POLISH_CHECKLIST.md) for comprehensive feature documentation.
