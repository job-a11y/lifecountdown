# CountDown

Build a responsive, single-page Web App called "CountDown" configured as an installable PWA with an ultra-clean, modern Apple/iOS aesthetic.

### 1. Tech Stack & Architecture

* **Framework:** React + Vite + TypeScript

* **Backend & Database:** Supabase (for user authentication and real-time cloud data persistence across devices)

* **Styling:** Tailwind CSS with custom iOS dark mode styling (`bg-zinc-950`, `text-zinc-100`)

* **Components:** `shadcn/ui` (Dialog, Button, Input, Card, Segmented Control / Tabs)

* **Icons:** `lucide-react` (Plus, Trash2, Maximize2, Settings, Clock, Sparkles, Volume2, Grid, List)

* **Animations:** `framer-motion` for spring transitions, full-screen expansion, and layout switches

* **Design Aesthetic:** Apple iOS design language—generous rounded corners (`rounded-3xl`), polished frosted glass (`backdrop-blur-xl bg-white/5 border border-white/10`), crisp typography (Inter / SF Pro feel), and ample white space.

### 2. Core Features & User Experience

**A. Dashboard Layout:**

* **Header:** App title "Countdowns", a segmented control toggle for Grid View vs List View, and a prominent "+" button in the top right.

* **View Options:**

  * **Grid View:** 2-column responsive layout with smooth hover effects.

  * **List View:** Spacious, roomy card layout designed to fit roughly 3 to 4 timers per screen height, giving each timer maximum breathing room and vertical padding.

* **Card Elements:**

  * Custom Event Title / Name.

  * Prominent countdown timer showing Days, Hours, Minutes, and Seconds in high-contrast bold digits.

  * **Target Date Subtitle:** Directly below the countdown digits, display the exact target date (e.g., "Target: Oct 14, 2026 at 18:00") in a subtle, small, muted font (`text-xs text-zinc-400`).

  * User-selected iOS accent color border/glow tint.

  * Action menu to Edit or Delete.

**B. Fullscreen Mode (Tap to Focus):**

* Tapping any countdown card smoothly expands it using Framer Motion (`layoutId`) into an immersive full-screen focus view.

* Fullscreen includes massive typographic digits, ambient glowing background gradients tailored to the card's accent color, and an intuitive close (X) button.

**C. "Zero" Moment (Completion Effects):**

* When a countdown reaches 00:00:00:00:

  1. Play a subtle, pleasant audio chime (using Web Audio API or a soft notification sound).

  2. Trigger a gentle pulsing border/glow animation on the card (`animate-pulse`). Keep this border glow animation until the user disables it by tapping.

  3. Display an "Event Reached!" state.

  4. Trigger a browser/PWA push notification alert (using standard Web Notification API / Service Worker). Make sure it works on android.

**D. Add / Edit Modal & PWA Capabilities:**

* `shadcn/ui` Modal to enter Timer Name, future Target Date/Time, and Accent Color (iOS Blue, Purple, Pink, Orange, Emerald).

* Add standard PWA `manifest.json` configuration and Web Notification permission request button so users can install it to their Home Screen and enable push alerts.

* Authenticate users with Supabase so all timers sync seamlessly in real time across desktop, mobile, and web.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lifecountdown.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/21a69913-ef36-4e2a-a69a-53bf8e6e36fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
