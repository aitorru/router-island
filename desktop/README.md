# Router Island — Desktop

A small, always-on-top **OpenRouter credits widget** built with Tauri v2 (Rust)
and a Vanilla TS + Vite frontend. Paste your API key on first launch; it's stored
locally and the balance is fetched in Rust (no CORS, key never leaves the machine).

## Develop

```bash
npm install
npm run tauri dev
```

Linux needs the usual Tauri deps (`libwebkit2gtk-4.1-dev`, `libgtk-3-dev`,
`librsvg2-dev`, `libsoup-3.0-dev`, …). See https://tauri.app/start/prerequisites/.

## CI

`.github/workflows/tauri.yml` builds the app on every push for **Windows x64/arm64**
and **Linux x64/arm64** using native GitHub runners (no cross-compilation). TLS is
chosen per platform (SChannel on Windows, rustls on Linux) to keep every target
buildable without extra tooling.

## Releasing

Push a tag and `.github/workflows/release.yml` builds the installers on all four
targets and uploads them to a **draft GitHub Release**:

```bash
# bump version in src-tauri/tauri.conf.json first, then:
git tag v0.1.0
git push origin v0.1.0
```

You can also trigger it manually from the Actions tab (workflow_dispatch) with a tag
input. Artifacts: `.deb` (Linux x64/arm64) and NSIS `.exe` (Windows x64/arm64).
Review the draft release and publish it when ready.
