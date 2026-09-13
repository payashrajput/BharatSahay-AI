BharatSahay Create Profile Fix

Fixed:
- Create Profile no longer remounts on every keystroke, so the input keeps focus and users can type continuously.
- ProfilePage was moved outside App and now receives profile/setProfile/t/findSchemes as props.
- Profile updates use functional setState to avoid stale state.
- Added polished profile header, completion progress, private & secure badge, helper card, responsive spacing, and improved focus states.
- Added basic completion validation: Find Matching Schemes stays disabled until name, age, income, state and occupation are usable.
- Income field now has min=0 and numeric input mode.

Run:
1. npm install
2. npm run dev
