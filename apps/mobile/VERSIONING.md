# FindEat mobile versioning

`app.json` is the source of truth for the user-facing app version. The version commands keep `apps/mobile/package.json` and the workspace lockfile synchronized with it.

- Patch (`1.0.0` → `1.0.1`): bug fixes and small improvements.
- Minor (`1.0.0` → `1.1.0`): a meaningful group of new features.
- Major (`1.0.0` → `2.0.0`): a major product generation or incompatible change.

Run the appropriate command from the repository root before starting a new public release:

```bash
npm run version:patch
npm run version:minor
npm run version:major
```

Use `npm run version:check` before a production build. To choose an exact version, run `npm run version:set -- 1.2.0`.

Production builds use EAS remote app versions with `autoIncrement`, so every iOS and Android store build receives a new internal build number automatically. Retrying a build does not require another user-facing version bump.
