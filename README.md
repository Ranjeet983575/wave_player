# Wave Player

**Your videos. Your experience.**

Wave Player is a dark, mobile-first video player for iOS and Android. Its visual language follows the charcoal surfaces and restrained, high-contrast accents in the companion Wave Music app, adapted to an original purple-and-aqua wave/play identity.

## What is included

- Five Expo Router destinations: Home, Videos, Folders, YouTube, and Settings.
- Browse device videos after explicitly requesting video-library access.
- Import a video through the system document picker and keep a private app copy for later playback.
- Single-session local playback with play/pause, seeking, skip interval, speed, landscape fullscreen with the native exit-fullscreen control, Picture-in-Picture, and saved resume position.
- Closing either player returns Home; local playback remains available in the mini-player.
- Local favorites, recent playback, preferences, and recent YouTube searches stored on-device.
- YouTube Data API search when configured, with playback through YouTube's official embedded player.
- Clear setup and error states; no sample videos or fake search results.

## Requirements

- Node.js 22.13 or newer (the Expo SDK selected by the current template requires it).
- npm.
- Xcode and CocoaPods for local iOS native builds, or Android Studio for local Android native builds.
- A physical or simulated device for validating media-library access, import, playback, and Picture-in-Picture.

Install and start:

```sh
npm install
npx expo start
```

Expo Go can run the core app in supported scenarios. Rebuild a development client after changing native plugins or app identifiers:

```sh
npx expo run:ios
npx expo run:android
```

Production builds can be created with EAS after configuring the project's EAS credentials and signing:

```sh
npx eas-cli build --platform ios
npx eas-cli build --platform android
```

## YouTube API setup

1. Create a Google Cloud project and enable **YouTube Data API v3**.
2. Create an API key, restrict it to YouTube Data API v3, and apply appropriate application restrictions and quota limits.
3. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_YOUTUBE_API_KEY`.
4. Restart Expo after changing the environment file.

The key is embedded in the mobile application and can be extracted. Do not use this client key as a security boundary. Use a small backend that protects credentials and enforces quotas if stronger protection is required. Search requests send the query to Google. Search requires network access; local playback does not.

Video playback uses the YouTube-hosted `youtube-nocookie.com` embed. It does not extract streams, remove ads, or offer background YouTube playback.

## Native configuration

- App display name: **Wave Player**.
- The app is configured for native iOS and Android only; no web target or browser route is included.
- iOS bundle identifier and Android application ID: `com.ranjeet983575.waveplayer`.
- The iOS video-library purpose string explains why Wave Player requests video access.
- The media-library plugin requests video access only.
- Picture-in-Picture is enabled through `expo-video` config; it is available only on compatible OS versions/devices and needs a native build to validate.
- No broad Android media permission is requested for ordinary file imports. Android media-library scanning is subject to current Google Play photo/video access policies.
- Generated `ios/` and `android/` projects are intentionally not checked in. Expo config plugins remain the source of native configuration.
- This project targets iOS and Android only; it is not configured as a web app.

## Platform support

| Feature | iOS | Android | Notes |
| --- | --- | --- | --- |
| Local library browsing | Supported | Supported | Requires user permission; this project currently loads the first 100 items. |
| File import | Supported | Supported | Uses the system picker and copies the selected file into app documents. |
| Local playback | Supported | Supported | Uses `expo-video`; test codecs and large files on physical devices. |
| Fullscreen | Supported | Supported | Uses the native video view's fullscreen API. |
| Picture-in-Picture | Device dependent | Device dependent | Native config enabled; physical-device verification is still required. |
| Background playback | Not enabled | Not enabled | Wave Player does not claim background audio playback. |
| YouTube search | Supported with key | Supported with key | API key is optional; search is unavailable until configured. |
| YouTube embedded playback | Supported | Supported | Official embedded player only; internet required. |

## Testing checklist

- Run `npx tsc --noEmit` and `npx expo-doctor`.
- On both platforms, allow and deny video access and confirm the explanation/recovery state.
- Import a video from Files, force-close/reopen the app, and confirm it remains playable.
- Verify play/pause, seeking, skip interval, speed, fullscreen, resume, and PiP on physical devices.
- Configure a restricted YouTube API key, search, open a result, and confirm playback remains in the official player.
- Try an invalid API key, no network, and an empty result set.

## Release work still required

- Add a real public privacy-policy URL and legal review before release.
- Configure app-store signing, developer accounts, EAS project credentials, and store metadata.
- Validate media permissions, codecs, fullscreen behavior, and Picture-in-Picture on supported physical iOS and Android devices.
- Consider pagination for libraries over 100 videos.
