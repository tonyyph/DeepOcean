# Live Activities Skill

Live Activities must:
- Reflect current Dive Session state
- Stop when session completes
- Clear stale sessions when app is killed
- Avoid creating duplicate sessions
- Navigate to the correct screen
- Avoid pushing the same screen twice
- Keep UI synchronized with app state

Always test:
- Foreground
- Background
- Killed app
- Session completed
- Session cancelled
