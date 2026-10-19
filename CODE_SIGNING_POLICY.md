# Code Signing Policy

Rz GameBooster is a free and open source project (GPL-3.0). Windows release
binaries are code-signed with a certificate donated by the
[SignPath Foundation](https://signpath.org/).

## Project

- **Repository:** https://github.com/renzobraga/cs-boost (public)
- **License:** GPL-3.0-or-later (OSI-approved), no proprietary components
- **Artifact signed:** the Windows NSIS installer
  `Rz GameBooster_<version>_x64-setup.exe`

## Build and release process

- Releases are built only from the `main` branch by the GitHub Actions workflow
  `.github/workflows/release.yml`, from source, on GitHub-hosted Windows runners.
- The workflow is triggered manually (`workflow_dispatch`) by a repository
  maintainer. No third party can start a release.
- Every version number is bumped in `app/package.json`,
  `app/src-tauri/tauri.conf.json` and `app/src-tauri/Cargo.toml` before release.
- The installer's SHA256 hash and a VirusTotal link are published in each
  release's notes.

## Signing

- Code signing requests are submitted to SignPath from the release workflow and
  are **manually approved** by a maintainer before signing.
- The signing certificate's private key is held on SignPath's HSM and is never
  exposed to the CI or to maintainers.
- The updater signature (Tauri) uses a separate key, stored as an encrypted
  GitHub Actions secret, and is unrelated to the code-signing certificate.

## Security

- Maintainer GitHub accounts require multi-factor authentication (MFA).
- All CI secrets are stored as GitHub Actions encrypted secrets.
- The application never injects into games, reads process memory, or modifies
  game files, it only changes Windows settings and the user's own config files,
  and every change is reversible.
