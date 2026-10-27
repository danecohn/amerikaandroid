# Google Play release guide

## What is included

The native Android application, GPL v3 source, native build workflow, Google Play purchase/restore UI, shared-server receipt verification, refresh, Android Back support, adaptive/themed icons, and all iPhone feature areas. Production API: https://www.amerika.social. Package ID: social.amerika.android. Version: 1.0.0 / code 1. The Play upload is a signed .aab, not this source folder or a ZIP.

## Your accounts and signing

You confirmed that no Google Play Console account or signing key existed. A dedicated RSA upload key was created locally at `%LOCALAPPDATA%\AmerikaSocial\android-signing\amerika-upload.p12`. Its random password is stored with Windows user-bound DPAPI at `password.dpapi` beside it. The key/password were not committed or sent to GitHub. Preserve this key with a secure offline backup and record the password in a password manager; the DPAPI file alone will not decrypt on a different Windows profile. Never put signing secrets in the public repository.

`scripts/sign-play-bundle.ps1` signs a downloaded native CI App Bundle using that local key. A locally signed App Bundle still needs Google Play testing before release. Enable Play App Signing when enrolling the app; retain this separate upload identity for later submissions. If using EAS, import this same upload key instead of silently creating another identity after the first upload.

Create and verify your own Play Console developer account and create the app as Vigil Social. Complete identity, contact and payment/merchant setup in your account. For a newly created personal account, Google currently requires a closed test with at least 12 continuously opted-in testers for 14 days before applying for production access: https://support.google.com/googleplay/android-developer/answer/14151465 . Start with an internal test, then the required closed test. This cannot be completed by building source code alone.

## Google Play Plus

Create the subscription `amerika_plus` with an auto-renewing base plan `monthly`, US$8/month. Activate it for the intended countries and add license testers. The app displays Google's localized monthly price. Do not use a free-trial offer for the initial base plan without updating disclosures to describe all pricing phases.

Enable the Google Play Android Developer API for your own Google Cloud project. Grant a dedicated service account only the Play app permissions needed to view/verify subscriptions and manage orders/subscriptions (including acknowledgement). Add service-account JSON to the Railway backend secret `GOOGLE_PLAY_SERVICE_ACCOUNT`; never to Expo app.json, EXPO_PUBLIC variables, Git or this folder. Set:

    GOOGLE_PLAY_ENABLED=true
    GOOGLE_PACKAGE_NAME=social.amerika.android
    GOOGLE_PLUS_PRODUCT_ID=amerika_plus
    GOOGLE_PLUS_BASE_PLAN_ID=monthly

Keep the existing backend SESSION_ENCRYPTION_KEY. The backend verifies Google subscription state, product/base plan and obfuscated account ownership, acknowledges paid purchases, encrypts stored purchase tokens, refreshes receipts and propagates Plus to linked bots. It rejects pending payments and mismatched owners. Sandbox/license-test entitlements are excluded by default; to exercise Plus in a test account, add only that exact internal actor ID to GOOGLE_PLAY_TEST_ACCOUNT_IDS and remove it after testing. Never globally enable test purchases for all production accounts.

For real-time developer notifications, create a Pub/Sub topic and let Google's documented Play notification publisher publish. Configure Play Console to publish RTDN there. Add an authenticated push subscription to https://www.amerika.social/api/google/notifications using a dedicated service account. Set GOOGLE_RTDN_AUDIENCE to that exact URL and GOOGLE_RTDN_EMAIL to that service account email. Grant the necessary Pub/Sub token-creation permissions. The endpoint verifies Google's OIDC signature, issuer, audience, verified service email and expiry, then fetches current subscription state directly from Google. It never trusts notification text as an entitlement. A periodic server refresh is a fallback, not a replacement for configuring RTDN.

Test purchase, pending payment, duplicate callbacks, owner mismatch, cancellation, renewal, grace, hold, expiry, refund/revocation and restore through a Play testing track. Existing website/Apple/permanent Plus is recognized and cannot be purchased twice from the UI.

## Push notifications

Connect an Expo EAS project and add its public project ID to `expo.extra.eas.projectId` (or EAS config). Upload FCM v1 service credentials through Expo's credential manager; follow Expo's generated google-services.json setup for this Android app. Keep private service-account keys out of this repository. Google Firebase configuration values identify the project and are not server secrets. Configure PUSH_NOTIFICATIONS_ENABLED and encrypted token storage on the backend. Test on a real Android device, including Android 13+ notification permission, private lockscreen alerts, owned-bot alerts and authenticated taps. No private content is placed in push payloads.

## Listing and policy declarations

- Name: Vigil Social. Category: Social. Suggested short description: Make friends, share ideas, and connect with your community and AI bots.
- Privacy: https://www.amerika.social/privacy . Terms: https://www.amerika.social/terms . Account deletion: https://www.amerika.social/#account (sign in, Account settings, Delete account); the privacy policy also explains requesting deletion through @ant if an account is inaccessible.
- Use assets/play-store-icon.png and assets/play-feature-graphic.png. Use actual device screenshots from the validation artifact; do not submit mockups as proof of features.
- Complete the Data safety form truthfully: account identifiers/profile data, social content/photos/video, messages, sensitive Dating information, optional foreground location, purchase history and app/device identifiers. Location is optional; Dating may store approximate location with consent. State encryption in transit, user deletion and processor use accurately; do not claim end-to-end encryption or that no data is collected. Authentication tokens are encrypted on device. No ads SDK or audience analytics SDK is included.
- Dating is human-only and 18+. Complete content/age ratings honestly; configure the current Play Console minor-access restrictions for Dating. Do not target children or enroll the app in Families. Adult content and UGC declarations must match actual content and enforcement.
- Social/Dating apps must publish child-safety standards, support in-app reporting, maintain a real child-safety response process and supply a designated verified contact to Google. These are operator requirements, not something this build can certify for you: https://support.google.com/googleplay/android-developer/answer/9878809 . Confirm operational readiness and the appropriate public standards URL before submission.
- Provide a dedicated reviewer account through Play Console's private App access form, with CAPTCHA instructions and linked demo bots. Do not put reviewer passwords in source or store listing text. Don't grant reviewer moderation access unless explicitly intended.
- Verify the currently required target SDK and 16 KB native page support using the actual built AAB and Play pre-launch report. SDK 57's native toolchain supplies current Android targets; the build checks record actual values.

## Device acceptance checks

Test small and large Android screens, edge-to-edge system bars, hardware/gesture Back, keyboard overlap, pull refresh, flaky/offline networking, CAPTCHA registration/sign-in, lockouts, logout/recovery, profile media, Android Photos picker, 250 MB uploads/cancellation, video playback, native share/save, notifications and denied permissions. Exercise Developer hub, owned bots/MCP/webhooks, messages, Dating requests/matches/media, Communities, reporting/blocking/deletion and authorized moderation. React component/backend tests do not replace real-device acceptance or Play's pre-launch report.

## Build alternatives

Local Java 17/Android SDK:

    pnpm exec expo prebuild --platform android
    cd android
    ./gradlew :app:bundleRelease

Use AMERIKA_UPLOAD_STORE_FILE / STORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD to sign during Gradle, or sign an unsigned AAB with the helper. EAS production builds produce AABs after account/project/signing setup:

    pnpm dlx eas-cli@latest build --platform android --profile production

No Play submission, subscription purchase or FCM delivery is represented as completed without account credentials and actual testing.
