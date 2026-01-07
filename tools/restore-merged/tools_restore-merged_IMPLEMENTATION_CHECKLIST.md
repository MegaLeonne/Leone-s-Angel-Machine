```text
Restoration Implementation Checklist (branch: restore)

1) Prepare branch
  - git checkout restore

2) Add scripts:
  - tools/restore-merged/find-merged-files.py
  - tools/restore-merged/map-backups.py
  - tools/restore-merged/restore-files.py
  - tools/restore-merged/verify-restoration.py
  - tools/restore-merged/*reports will be created on run

3) Make executable:
  - chmod +x tools/restore-merged/*.py

4) Commit & push:
  - git add tools/restore-merged/
  - git commit -m "chore: add atomic-safe restore scripts and reporting"
  - git push origin restore

5) Create PR to main (do not merge yet)
  - gh pr create --base main --head restore --title "restore: add atomic-safe recovery scripts + CI" --body "Add discovery/mapping/atomic restore scripts (dry-run default). CI performs dry-run and uploads reports. Canary recommended."

6) CI & Canary
  - Run discovery & mapping in CI / locally:
    - python tools/restore-merged/find-merged-files.py
    - python tools/restore-merged/map-backups.py
  - Review tools/restore-merged/MERGED_FILES_REPORT.json and BACKUP_MAPPING.json
  - Dry-run restore:
    - python tools/restore-merged/restore-files.py --mapping tools/restore-merged/BACKUP_MAPPING.json
  - Create subset file for canary (tools/restore-merged/CANARY_LIST.txt)
  - Live canary:
    - python tools/restore-merged/restore-files.py --mapping tools/restore-merged/BACKUP_MAPPING.json --subset tools/restore-merged/CANARY_LIST.txt --apply
  - Verify:
    - python tools/restore-merged/verify-restoration.py

7) If canary OK: run full apply (after sign-off)
  - python tools/restore-merged/restore-files.py --mapping tools/restore-merged/BACKUP_MAPPING.json --apply

8) Post-restore:
  - regenerate manifest
  - run full site build locally; run link-check
  - open PR with restored files (if not already in restore branch) and request review

9) Keep .merged-backup files for at least 7 days before cleaning.

```