# Personal T3 fork

This file is the delivery contract for `lmdevv/t3code`. It overrides upstream `AGENTS.md` on one point: **do not ship a change until tests, the desktop build, a Darwin launch, and NUR packaging have all passed.** Upstream's "CI owns the full suite" default does not apply here.

## Skills to read first

Read these before touching machines, releases, or Nix:

| Skill           | Path                                                                            | When                                  |
| --------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| Machine context | `/home/zxcv/.cursor/skills/machine-context/SKILL.md`                            | Always, before SSH or choosing a host |
| Commit          | `/home/zxcv/.cursor/skills/commit/SKILL.md`                                     | When committing                       |
| NUR packager    | `/home/zxcv/Documents/github/nur-packages/.agents/skills/nur-packager/SKILL.md` | When changing `lmdevv/nur-packages`   |

Do not use `test-t3-app` as a substitute for Darwin desktop verification. That skill is the web client.

## Machines

Tailscale MagicDNS:

- `nixos` is this homelab. Prefer it for compile, tests, git, and waiting on GitHub Actions.
- `dawin` is the M4 MacBook Air. Use it to launch the unsigned `.app` and confirm the UI actually works.
- `iphone-14-pro` has no shell.

SSH as `zxcv@dawin` / `zxcv@nixos`. You already have permission to hop. Prefer `nixos` for heavy work. Kill only PIDs you spawned. Never `pkill -f`. Never open `~/.t3` read-write on either machine.

On `nixos`, Node is not on default `PATH`. Put a Node 24 store path first, then `./node_modules/.bin`, before `vp`.

Personal git remotes in the fork worktree:

- `origin` = `pingdotgg/t3code` (upstream, do not push)
- `personal` = `lmdevv/t3code` (this fork)

NUR lives at `/home/zxcv/Documents/github/nur-packages` (`lmdevv/nur-packages`). Darwin Home Manager uses `pkgs.nur.repos.lmdevv.t3code` for the desktop app. Pin NUR from `main`, not `master`.

## Do not finish until all of this is true

1. **Tests.** Run the full repo test suite (`vp test`) plus typecheck for packages you touched (`vp run --filter @t3tools/web typecheck`, `vp run --filter t3 typecheck`, and any other affected package). The personal-release job's 125 focused tests are not enough by themselves.
2. **Build.** Push to `personal` `main` and dispatch `personal-release.yml` with `force=true` if this commit needs a new artifact. Wait until Linux x64, macOS arm64, and macOS x64 builds publish a GitHub release.
3. **Darwin binary.** Over Tailscale, download that arm64 DMG (or the NUR store path after step 4) onto `dawin`. Launch it. Confirm the window gets past loading into real UI. Fail if stderr contains `catalogValueAtom` or the window stays on a spinner.
4. **NUR.** Dispatch `update-t3code.yml` on `lmdevv/nur-packages`. Wait until `pkgs/t3code/default.nix` on `main` shows the new version and hashes, and the workflow's Linux plus both Darwin validate jobs are green.
5. **Push state.** `lmdevv/t3code` and `lmdevv/nur-packages` are both pushed. Tell the human they can update NUR on `dawin` and `darwin-rebuild switch`.

If any step fails, stop. Do not declare the fork "ready to rebuild on Darwin."

## How to run the pipeline

### Tests on nixos

From the personal worktree:

```bash
export PATH="/nix/store/2bg4yn1ccasnw6cscqhgqwzfw8j2xq1m-nodejs-24.4.1/bin:./node_modules/.bin:$PATH"
vp run --filter @t3tools/web typecheck
vp run --filter t3 typecheck
vp test
```

Use a current Node 24 derivation if that store path is gone. Commit only to the personal branch, then:

```bash
git push personal HEAD:main
```

### Unsigned desktop release

```bash
gh workflow run personal-release.yml --repo lmdevv/t3code --ref main -f force=true
gh run watch --repo lmdevv/t3code
gh release view --repo lmdevv/t3code --json tagName,targetCommitish,publishedAt
```

Daily rebase already runs at 04:17 UTC. Still force a release after a fix that Darwin must pick up today.

### Launch the binary on dawin

Do this with an isolated home first so you do not smash the live `T3 Code (Alpha)` session:

```bash
ssh zxcv@dawin
# after copying or nix-building the new arm64 app:
BIN="…/T3 Code (Alpha).app/Contents/MacOS/T3 Code (Alpha)"
HOME=/tmp/t3-iso-home T3CODE_HOME=/tmp/t3-iso-home/.t3 ELECTRON_ENABLE_LOGGING=1 "$BIN"
```

Pass only if:

- logs show `app ready`, `backend ready`, and `main window created`
- there is no `catalogValueAtom` TypeError
- the window is not stuck on a spinner after a few seconds

Kill only the PID you started. Then you may launch the Home Manager app the same way a human would.

### NUR

```bash
gh workflow run update-t3code.yml --repo lmdevv/nur-packages
gh run watch --repo lmdevv/nur-packages
```

That workflow refreshes hashes, `nix build .#t3code` on `x86_64-linux`, `aarch64-darwin`, and `x86_64-darwin`, then commits and notifies central NUR. Packaging rules are AppImage on Linux and `undmg` on Darwin. Unsigned personal DMGs are not notarized. `dontFixup = true` is correct only when a signature exists. These builds are adhoc. A renderer JS crash will still look like a hang. Always do the Darwin launch, not just `nix build`.

On `dawin`, after NUR `main` has the new hashes:

```bash
# update the NUR / flake input your darwin config uses, then
darwin-rebuild switch
```

`nur.repos.lmdevv` is registered on NUR `main`. Direct `github:lmdevv/nur-packages` also works. NUR `master` is stale and has no `lmdevv` entry.

## Overview

The T3 Code fork at `lmdevv/t3code` tracks upstream `main` with personal commits on top. Those commits add editable `Ctrl+P/N` picker navigation across command/file search, model and reasoning pickers, composer suggestions, and right-panel launchers. They also add `modelOptionsPicker.toggle`, direct right-panel commands for terminal, files, pull requests, and agents, move browser preview to `Cmd+Shift+B`, resolve conflicting defaults, delay catalog atom reads until first use, and keep picker shortcuts out of the composer bundle so the packaged desktop renderer can boot. The daily personal-release workflow rebases onto upstream at 04:17 UTC, verifies the patch typechecks plus focused tests, and publishes unsigned Linux x64, macOS arm64, and macOS x64 builds. Releases are tagged `v0.0.37-lmdevv.YYYYMMDD.N`.

The NUR repository at `/home/zxcv/Documents/github/nur-packages` packages those artifacts through its flake. Its 09:17 UTC updater discovers the latest personal release, refreshes hashes, builds natively on Linux and both Darwin architectures, then commits and notifies NUR only after validation passes. `linear-cli` was removed in `9532b1a`. `lmdevv` is on the central NUR registry `main`. Use `main`, not `master`. The public search page can lag. Darwin should install `nur.repos.lmdevv.t3code` and rebuild only after this file's gate has passed for that version.
