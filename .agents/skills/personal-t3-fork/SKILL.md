---
name: personal-t3-fork
description: >-
  Runs the lmdevv T3 Code personal-fork delivery loop until it is actually
  done. Full tests, unsigned desktop CI build, Tailscale launch on dawin, then
  NUR hash update. Use when changing lmdevv/t3code, personal releases, NUR
  t3code packaging, picker shortcuts, the Darwin desktop app, dawin, or before
  telling the user a fork change is finished or safe to darwin-rebuild.
---

# Personal T3 fork loop

Read `/home/zxcv/.cursor/skills/machine-context/SKILL.md` first. Then copy this checklist and do not tell the user the work is done until every box is checked. If a step fails, stop and report the failure. Do not skip Darwin launch because `nix build` passed.

```
- [ ] 0. Machine context read. Host known. Using nixos for heavy work, dawin for the .app.
- [ ] 1. Code on the personal worktree. Push only to personal (lmdevv/t3code) main, never origin/pingdotgg.
- [ ] 2. Typecheck every package touched.
- [ ] 3. Full test suite passed (`vp test`). Focused 125 tests are not enough.
- [ ] 4. Pushed to lmdevv/t3code main.
- [ ] 5. personal-release.yml published Linux x64, macOS arm64, and macOS x64. Tag matches this commit.
- [ ] 6. That arm64 binary launched on dawin over Tailscale. Isolated HOME. UI past spinner. No catalogValueAtom.
- [ ] 7. update-t3code.yml green on linux + both Darwin. pkgs/t3code/default.nix on NUR main has the new version and hashes.
- [ ] 8. Both remotes pushed. User can update NUR on dawin and darwin-rebuild switch.
```

Web `test-t3-app` is not this loop. Do not `pkill -f`. Do not write the live `~/.t3`.

## 0. Machines

- `nixos`: compile, tests, git, Actions.
- `dawin`: M4 MacBook Air. SSH `zxcv@dawin`. Launch the unsigned app here.
- `iphone-14-pro`: no shell.

On nixos, Node 24 is not on default PATH. Prefix a Node 24 store path and `./node_modules/.bin` before `vp`.

## 1–3. Tests

Personal worktree remotes: `origin` = pingdotgg (do not push), `personal` = `lmdevv/t3code`.

```bash
export PATH="/nix/store/2bg4yn1ccasnw6cscqhgqwzfw8j2xq1m-nodejs-24.4.1/bin:./node_modules/.bin:$PATH"
vp run --filter @t3tools/web typecheck
vp run --filter t3 typecheck
# plus every other package you touched
vp test
```

Use a current Node 24 derivation if that store path is gone.

## 4–5. Push and unsigned build

```bash
git push personal HEAD:main
gh workflow run personal-release.yml --repo lmdevv/t3code --ref main -f force=true
gh run watch --repo lmdevv/t3code --exit-status
gh release view --repo lmdevv/t3code --json tagName,targetCommitish,publishedAt
```

Daily rebase is 04:17 UTC. Still force a release when Darwin must pick up this commit today.

## 6. Darwin binary (required)

Download the new arm64 DMG from the GitHub release, or use the NUR store path after step 7. Isolated home first:

```bash
ssh zxcv@dawin
BIN="…/T3 Code (Alpha).app/Contents/MacOS/T3 Code (Alpha)"
rm -rf /tmp/t3-iso-home
mkdir -p /tmp/t3-iso-home
HOME=/tmp/t3-iso-home T3CODE_HOME=/tmp/t3-iso-home/.t3 ELECTRON_ENABLE_LOGGING=1 "$BIN"
```

Pass only if logs show `app ready`, `backend ready`, and `main window created`, there is no `catalogValueAtom` TypeError, and the window is not stuck on a spinner. Kill only the PID you started.

Then launch the real Home Manager app the way a human would and confirm the thread UI loads.

## 7. NUR

```bash
gh workflow run update-t3code.yml --repo lmdevv/nur-packages
gh run watch --repo lmdevv/nur-packages --exit-status
```

Must refresh hashes, `nix build .#t3code` on `x86_64-linux`, `aarch64-darwin`, and `x86_64-darwin`, then commit `pkgs/t3code/default.nix` on `main`. Packaging notes: `/home/zxcv/Documents/github/nur-packages/.agents/skills/nur-packager/SKILL.md`. Pin NUR `main`, not `master`. `nix build` is not a substitute for step 6.

## 8. Reply only after the loop

The reply must name: test command results, release tag, dawin launch evidence (ready logs, no spinner), NUR version and hashes. Then tell the user to update NUR on dawin and `darwin-rebuild switch`.

If you cannot finish a box, say which box failed. Do not imply Darwin is ready.
