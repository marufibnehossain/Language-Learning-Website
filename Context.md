# Context — Duolingo-Inspired Language Learning Web App

**Credits per Attempt System**

---

## What We're Building

A Duolingo-inspired language learning website with:

- **Guided learning path** — Unit → lesson bubbles in a path layout
- **Short, game-like lessons** — Instant feedback and engaging interactions
- **Progression system** — XP, streaks, levels/mastery, practice hub, simple social/leaderboards
- **Credits wallet** — Gating lesson attempts: **credits are spent ONLY when starting an attempt**
- **Free practice modes** — Don't consume credits

### Design Philosophy

We are **NOT** cloning Duolingo assets or copying exact UI; we are implementing the **patterns**:

- Clear guided path with interleaved review and variety (Duolingo's "path" concept)
- Practice integrated into progression
- Quick loops + motivating feedback + playful design

### References

References for product behavior patterns:

- Duolingo's "learning path" redesign rationale and structure (linear path, interleaving, practice built into path)
- Duolingo's typical feature set (XP, streaks, practice hub, currency/shop concepts)

> **Note:** Used only for inspiration, not duplication.

---

## Target User & Promise

### Target Users

- Beginners to intermediate learners
- Prefer short sessions and visible progress
- Need a clear "what to do next" without thinking

### Promise

**"Do one quick lesson, feel progress instantly."**

### Success Metrics

- Lesson completion rate
- Return rate (D1/D7)
- Streak maintenance
- Conversion to paid credits/subscription (optional)

---

## Core Mechanics

### Credits (Attempt Gating)

- Credits are a wallet balance with a cap
- Credits are spent **ONLY** when a user taps "Start Lesson Attempt"
- **No credit deduction** for mistakes during the lesson
- Practice modes are free and designed to keep users learning even when out of credits

#### Default Recommended Numbers

*(Easy to tweak later)*

- **Starting credits:** 50
- **Credit cap:** 100
- **Lesson attempt cost:** 5 credits (per attempt)
- **Practice attempt cost:** 0 credits
- **Daily refill:** +20 credits/day (applied on first activity each day)
- **Optional bonus:** +5 credits "First lesson of the day" (make it feel generous)

### XP + Streak (Habit Loop)

- XP is earned on completion of lessons/practice
- Streak is maintained if user earns ≥ a daily XP goal (e.g., 10 XP)
- Streak screen provides "don't break the chain" motivational copy + friendly reminders

### Path Progression (Duolingo-Style Pattern)

- A single guided path with lesson "bubbles"
- Units are broken into smaller chunks; lesson types are interleaved
- Practice nodes are integrated into the path (e.g., review bubble every few lessons)
- Stories / reading nodes (optional) appear as special nodes

> We use the path pattern because it reduces choice overload and guides learners step-by-step.

---

## Information Architecture

### Marketing Pages (Logged Out)

- **`/`** — Landing: value prop, how it works, social proof, CTA
- **`/login`**, **`/signup`**
- **`/pricing`** (optional)
- **`/faq`**

### App Pages (Logged In)

- **`/learn`** (default home) — Path map view (Unit sections + bubble path)
- **`/lesson/:lessonId`** — Lesson runner (step-by-step questions)
- **`/results/:attemptId`** — Results summary (XP, mistakes review, next step)
- **`/practice`** — Practice hub (free modes)
- **`/leaderboard`** — Weekly XP leaderboard (optional MVP+)
- **`/profile`** — Stats, streak, achievements, settings
- **`/store`** — Buy credits / boosts (optional)
- **`/admin/*`** — Content management (courses, units, lessons, exercises)

### Navigation

- **Desktop:** Left sidebar (Learn, Practice, Leaderboard, Profile) + top header (Credits, Streak, XP)
- **Mobile:** Bottom tab bar with same destinations

---

## Key User Flows

### Onboarding Flow

1. Choose target language (or choose course)
2. Set daily goal (5 / 10 / 15 minutes → maps to XP goal)
3. Optional placement test (skip allowed)
4. Land on `/learn` with "Start your first lesson" highlighted

### Start Lesson Attempt (Credits)

From `/learn`, user taps a lesson bubble:

**Modal opens:**
- Title, short "You'll practice …"
- Reward: XP
- Cost: credits (badge)
- Primary CTA: "Start (spend X credits)"
- Secondary CTA: "Practice instead (free)"

**If credits < cost:**
- Show "Out of credits" modal:
  - Primary CTA: "Free Practice"
  - Secondary CTA: "Come back tomorrow" + next refill hint
  - Optional tertiary: "Buy credits"

### Lesson Runner

- 8–12 questions
- 1 question per screen
- Progress bar at top + step count
- Instant feedback after each answer:
  - **Correct:** green success state + subtle celebration
  - **Incorrect:** show correct answer + short explanation (optional)
- CTA "Continue" to next question
- End: "Finish" → results screen

### Results

- Big header: **"Lesson complete!"**
- XP gained + streak progress (e.g., "8/10 XP to keep streak")
- Mistakes recap: list of wrong items with "Review" micro-action
- Primary CTA: "Continue" (next bubble)
- Secondary CTA: "Practice weak items"

### Practice Hub (Free)

Practice types *(start with 2, expand later)*:

- **"Mistakes Review"** — From last attempts
- **"Vocabulary Match"** — Flashy + quick
- **"Listening"** (optional)
- **"Daily Refresh"** — Short mixed set

> Practice is free and always available (especially important when credits are low).

---

## Design Direction

### Visual Vibe

- Playful, friendly, high-contrast, lots of white space
- Rounded shapes everywhere (cards, buttons, badges)
- Big, legible typography; minimal clutter; one dominant CTA per screen
- Soft shadows and subtle motion to feel "game-like"

### Design System Tokens

> **Important:** Use these tokens—do not hardcode in components.

#### Colors

*(Duolingo-inspired palette style — vivid green + bright accents)*

**Base:**
- `--bg`: `#FFFFFF`
- `--text`: `#1F2937` (near-slate)
- `--muted`: `#6B7280`
- `--border`: `#E5E7EB`

**Primary (green):**
- `--primary`: `#58CC02` (vivid green style commonly associated with Duolingo brand)
- `--primary-strong`: `#43C000`
- `--primary-soft`: `#89E219`

**Accents:**
- `--info`: `#1CB0F6`
- `--warning`: `#FFC800`
- `--danger`: `#FF4B4B`
- `--purple`: `#CE82FF`

**Neutrals:**
- `--panel`: `#F8FAFC`
- `--shadow`: `rgba(0,0,0,0.08)`

#### Typography

- **Headings:** A rounded friendly font (e.g., "Nunito", "Baloo 2", "Fredoka")
- **Body:** "Inter" or "Nunito"
- Large headings, short lines, high readability

#### Radius + Spacing

- `--radius-lg`: `20px`
- `--radius-md`: `14px`
- `--radius-sm`: `10px`
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32`

#### Buttons

- **Primary:** Filled primary + slight shadow, big height (44–52px)
- **Secondary:** Outline
- **Tertiary:** Text-only

### Motion

Use subtle animations (Framer Motion or CSS):

- **Bubble hover:** Scale 1.02 + shadow
- **Correct answer:** Tiny "pop" + checkmark
- **Progress bar:** Smooth transitions
- **End screen:** Gentle confetti (only for major milestones)

---

## UI Components

### Layout

- `AppShell` (sidebar + header)
- `MobileTabBar`

### Common

- `CreditPill` (balance + icon)
- `StreakBadge` (flame icon + count)
- `XpChip`
- `PrimaryButton`, `SecondaryButton`
- `Card`, `Badge`, `ProgressBar`
- `Modal` (Start lesson / Out of credits)

### Learn Path

- `PathMap`
- `UnitHeader`
- `LessonBubble` (states: locked / next / completed / practice / story)
- `BubblePopover` (topic, cost, XP)

### Lesson Runner

- `QuestionFrame`
- `ChoiceOption`
- `AnswerFeedback` (correct/incorrect)
- `KeyboardHints` (optional)
- `LessonProgressTopBar`

### Results

- `ResultsSummary`
- `MistakeList`
- `NextLessonCTA`

### Practice

- `PracticeCard`
- `MatchGame` (flashy)
- `ReviewDeck`

### Admin

- `AdminTable`, `AdminForm`, `ReorderList`

---

## Content Model

Keep lesson content server-driven (JSON schema) so we can:

- Add new exercise types without shipping UI rewrites
- A/B test lesson mixes
- Reuse question components

### Exercise Types for MVP

- `mcq` (single correct)
- `fill_blank`
- `match_pairs` (flashy; MVP+)

### Example Exercise Schema

```json
{
  "id": "ex_123",
  "type": "mcq",
  "prompt": "Choose the correct translation:",
  "question": "Good morning",
  "options": ["Buenos días", "Buenas noches", "Gracias", "Por favor"],
  "answer": "Buenos días",
  "explanation": "'Buenos días' is used in the morning."
}
```
