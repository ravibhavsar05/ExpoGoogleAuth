# Expo Auth Example

A minimal [Expo](https://expo.dev) app demonstrating **Google Sign-In** using `expo-auth-session` and file-based routing with [Expo Router](https://docs.expo.dev/router/introduction).

## Demo Video

Upload a video to GitHub (edit this file on GitHub and drag & drop the video into the editor). GitHub will insert a `user-attachments` link here and show an inline player automatically.

## Table of contents

- [Demo Video](#demo-video)
- [Features](#features)
- [Project flow](#project-flow)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Google Sign-In setup](#google-sign-in-setup)
- [Environment variables](#environment-variables)
- [Get started](#get-started)
- [Scripts](#scripts)
- [App config](#app-config)
- [Troubleshooting](#troubleshooting)
- [Learn more](#learn-more)

---

## Features

- **Google OAuth 2.0** sign-in with Web, Android, and iOS client IDs
- **Auth context** – `AuthProviderWithGoogle` wraps the app and exposes `signIn`, `user`, and `isLoading`
- **File-based routing** – Expo Router with index redirect to `/login` and a dedicated login screen
- **User profile** – after sign-in, user `email`, `name`, and `picture` are fetched from Google’s userinfo API

---

## Project flow

### 1. App entry and layout

- **`app/_layout.tsx`** – Root layout. It wraps the entire app in `AuthProviderWithGoogle` and renders the Expo Router `Stack`. All screens have access to the auth context (`user`, `signIn`, `isLoading`).

### 2. Initial route

- **`app/index.tsx`** – Entry route. It immediately redirects to `/login` using `<Redirect href="/login" />`. You can later change this to redirect to a home screen when `user` is set, or to `/login` when not authenticated.

### 3. Login screen

- **`app/login.tsx`** – Login UI. It uses `useAuth()` from the provider and shows a “Sign in with Google” button. On press it calls `signIn()` and shows a loading state via `isLoading`.

### 4. Auth provider (Google OAuth)

- **`src/auth/AuthProviderWithGoogle.tsx`** – Central auth logic:
  1. Uses `Google.useAuthRequest()` from `expo-auth-session/providers/google` with your Web, iOS, and Android client IDs and a **redirect URI** (from `AuthSession.makeRedirectUri({ scheme: "expoauthexample" })`).
  2. When the user taps “Sign in with Google”, it calls `promptAsync()`, which opens the system browser (or in-app browser) for Google’s OAuth consent screen.
  3. After the user signs in, Google redirects back to your app using the redirect URI. The provider receives an **authorization code** (or tokens, depending on flow).
  4. The provider exchanges this for an **access token** and then calls Google’s `https://www.googleapis.com/userinfo/v2/me` API with that token to fetch the user’s email, name, and picture.
  5. The user object is stored in React state and exposed via context so the rest of the app can show the logged-in user or protect routes.

### 5. Flow summary

```
App loads → _layout wraps app with AuthProviderWithGoogle
    → index.tsx redirects to /login
        → User sees login screen
            → User taps “Sign in with Google”
                → promptAsync() opens Google OAuth in browser
                    → User signs in with Google
                        → Google redirects back to app (expoauthexample://...)
                            → Provider gets token, fetches user info, updates context
                                → App can now use user / redirect to home
```

---

## Project structure

```
ExpoGoogleAuth/
├── app/
│   ├── _layout.tsx          # Root layout; wraps app with AuthProviderWithGoogle, Stack
│   ├── index.tsx            # Redirects to /login (or home when authenticated)
│   └── login.tsx            # Login screen with “Sign in with Google” button
├── src/
│   └── auth/
│       └── AuthProviderWithGoogle.tsx   # Google OAuth provider + useAuth() hook
├── assets/
│   └── images/              # App icons, splash, favicon
├── .vscode/                 # Editor settings (optional)
├── .env                     # Google OAuth client IDs (do not commit)
├── .gitignore
├── app.json                 # Scheme, bundle ID, package name for OAuth redirect
├── eslint.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## Prerequisites

- **Node.js** (LTS)
- **npm** or **yarn**
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (or use `npx expo`)
- For native builds: **Xcode** (iOS) and/or **Android Studio** (Android)
- A **Google Cloud** project (see below)

---

## Google Sign-In setup

Follow these steps to configure Google OAuth for this app.

### Step 1: Create or select a Google Cloud project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in and create a new project (or select an existing one).
3. Note the **project name**; you’ll use it for all credentials below.

### Step 2: Configure the OAuth consent screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**.
2. Choose **External** (or Internal for Google Workspace only).
3. Fill in **App name**, **User support email**, and **Developer contact email**.
4. Add **scopes** if needed (e.g. `email`, `profile`, `openid` – often added by default for “Sign in with Google”).
5. Add **Test users** if the app is in “Testing” mode (your Google account and any test accounts).
6. Save and continue until the consent screen is configured.

### Step 3: Enable required APIs (optional but recommended)

1. Go to **APIs & Services** → **Library**.
2. Enable **Google+ API** or **Google Identity** (or ensure the OAuth consent screen is set up so “Sign in with Google” works).

### Step 4: Create OAuth 2.0 credentials

Go to **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.

Create **three** OAuth client IDs (one per platform):

#### 4a. Web client (for web and development)

1. Application type: **Web application**.
2. Name: e.g. `Expo Auth Web`.
3. **Authorized redirect URIs**: add the redirect your app uses on web (e.g. `https://auth.expo.io/@your-username/your-app-slug` if using Expo proxy, or your custom URL). For **development build** with custom scheme, you may use a redirect like `https://localhost` or the exact redirect URI printed by the app when running.
4. Copy the **Client ID** → use as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`.

#### 4b. Android client

1. Application type: **Android**.
2. Name: e.g. `Expo Auth Android`.
3. **Package name**: must match `app.json` → `expo.android.package` → `com.test.expoauth`.
4. **SHA-1 certificate fingerprint**:  
   - Debug: run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android` (or get it from Android Studio).  
   - Add the SHA-1 for the keystore you use to run the app.
5. Copy the **Client ID** → use as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in `.env`.

#### 4c. iOS client

1. Application type: **iOS**.
2. Name: e.g. `Expo Auth iOS`.
3. **Bundle ID**: must match `app.json` → `expo.ios.bundleIdentifier` → `com.test.expoauth`.
4. Copy the **Client ID** → use as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `.env`.

### Step 5: Redirect URI (custom scheme – development build)

This app uses a **custom scheme** for the redirect (no Expo proxy):

- In code: `AuthSession.makeRedirectUri({ scheme: "expoauthexample" })`.
- Typical result: `expoauthexample://redirect` or similar (scheme + path).

For **Web** client in Google Cloud, if you run on web, add the exact redirect URI that the app prints in the console when you start sign-in. For **native (iOS/Android)**, the redirect is handled by the OS via the scheme; you usually **do not** add the custom scheme URL to Google Console for the native clients – the bundle ID (iOS) and package name + SHA-1 (Android) identify your app.

### Step 6: Summary checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured (External/Internal, scopes, test users)
- [ ] Web OAuth client created → Client ID in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- [ ] Android OAuth client created (package `com.test.expoauth`, SHA-1) → Client ID as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- [ ] iOS OAuth client created (bundle ID `com.test.expoauth`) → Client ID as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- [ ] `.env` created and dev server restarted after editing

---

## Environment variables

Create a `.env` file in the project root. **Do not commit** real production secrets; use `.env.example` as a template and add `.env` to `.gitignore`.

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

- Variable names must start with `EXPO_PUBLIC_` to be available in the Expo app.
- Restart the Expo dev server after changing `.env`.

---

## Get started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Google Sign-In**

   - Complete [Google Sign-In setup](#google-sign-in-setup) above.
   - Create `.env` with the three client IDs.

3. **Start the app**

   ```bash
   npx expo start
   ```

   Then run on:

   - **Development build** (recommended for custom scheme redirect): `npm run ios` or `npm run android`
   - **iOS Simulator** / **Android emulator** from the Expo dev tools
   - **Expo Go** may have limitations with custom redirect URIs; development build is more reliable for Google Sign-In.

---

## Scripts

| Command            | Description                    |
|-------------------|--------------------------------|
| `npm start`       | Start Expo dev server          |
| `npm run android` | Run on Android (dev build)    |
| `npm run ios`     | Run on iOS (dev build)         |
| `npm run web`     | Start for web                  |
| `npm run lint`    | Run ESLint                     |
| `npm run reset-project` | Reset starter app (see Expo docs) |

---

## App config

In **`app.json`**:

- **`scheme`**: `expoauthexample` – used for OAuth redirect (deep link back into the app).
- **iOS `bundleIdentifier`**: `com.test.expoauth` – must match the iOS OAuth client in Google Cloud.
- **Android `package`**: `com.test.expoauth` – must match the Android OAuth client in Google Cloud.

Plugins used: `expo-router`, `expo-splash-screen`, `expo-web-browser`.

---

## Troubleshooting

### “Redirect URI does not match” / “invalid authorization grant”

- Ensure the **Web** client in Google Cloud has the **exact** redirect URI your app uses (e.g. for web, the URL shown in the browser or printed by the app).
- For **Android**: package name and **SHA-1** must match the keystore you use to run the app.
- For **iOS**: bundle ID must match the iOS OAuth client.
- Use a **development build** (not Expo Go) when using custom scheme redirect.

### “useAuth must be used inside AuthProviderWithGoogle”

- Wrap your app (or the part that uses `useAuth()`) with `AuthProviderWithGoogle` in `app/_layout.tsx`.

### Google Sign-In opens browser but app doesn’t get the token

- Confirm `scheme` in `app.json` is `expoauthexample` and that you’re running a development build so the OS can open your app via that scheme.

---

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [expo-auth-session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo community](https://chat.expo.dev)
