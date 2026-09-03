# Muddakir (مُدَّكِر) — Hifz Progress Tracker

Muddakir is a beautiful, distraction-free, privacy-first Single Page Application (SPA) designed to help you track your Quran memorization (Hifz) journey. It provides visual insights, streak counting, and pacing calculations to help you stay consistent and hit your monthly goals.

## Core Features

- **Pacing & Buffer Tracking**: Understand exactly how many pages you need to complete daily, taking Sundays (rest days) and flex buffer days into account.
- **Task-Level Sabaq Skip**: Skip a new memorization task (`Sabaq`) while completing revision pairs (`Sabqi` and `Manzil`) without breaking your Hifz streak.
- **Multi-page Sabaq Log**: Check in multiple sabaq pages at once using custom ranges (e.g. Pages 9–10).
- **Juz Drawer Mapping**: Toggle memorized pages page-by-page directly inside an interactive visual map of all 30 Juz.
- **Weak Spot Logging**: Ticking "Hard" on any page check-in automatically logs it as a weak spot for targeted revision.
- **Interactive Graphs**: View planned target lines vs. actual progress graphs starting dynamically from your active study dates.
- **Log History Editor**: Modify any logged day's performance metrics directly from the Stats page.
- **Local-first Backup**: Export all progress records to JSON and restore them instantly.

## Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 Variables & Flexbox/Grid
- **Database**: In-browser local storage (`localStorage`)

## Installation & Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/muhammadsaad391391/Mudakkir.git
   ```
2. Open `index.html` in any web browser. No compilation, local server, or installation required!
