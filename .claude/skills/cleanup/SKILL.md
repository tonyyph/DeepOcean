# Cleanup Skill

Cleanup rules:
- Remove unused imports
- Remove unused styles
- Remove unused files when safe
- Remove unused package.json libraries only after verifying
- Remove debug logs
- Remove dead code
- Keep PR focused
- Do not rewrite unrelated architecture

After cleanup:
- Run format
- Run typecheck
- Run lint if available
