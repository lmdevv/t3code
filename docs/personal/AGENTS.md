# Personal T3 fork

This file is the contract for `lmdevv/t3code`. It overrides upstream `AGENTS.md`: do not ship, and do not tell the user a change is done, until the `personal-t3-fork` skill checklist is complete.

## Read immediately

1. `/home/zxcv/.cursor/skills/machine-context/SKILL.md`
2. `/home/zxcv/.cursor/skills/personal-t3-fork/SKILL.md` (same text in this repo at `.cursor/skills/personal-t3-fork/SKILL.md`)

Follow that skill as a loop. Copy its checklist. Do not skip Darwin launch because tests or `nix build` passed. Do not use `test-t3-app` instead of launching the unsigned `.app` on `dawin`.

Also read when needed:

- `/home/zxcv/.cursor/skills/commit/SKILL.md` when committing
- `/home/zxcv/Documents/github/nur-packages/.agents/skills/nur-packager/SKILL.md` when changing NUR packaging

## Overview

The T3 Code fork at `lmdevv/t3code` tracks upstream `main` with personal commits on top. Those commits add editable `Ctrl+P/N` picker navigation across command/file search, model and reasoning pickers, composer suggestions, and right-panel launchers. They also add `modelOptionsPicker.toggle`, direct right-panel commands for terminal, files, pull requests, and agents, move browser preview to `Cmd+Shift+B`, resolve conflicting defaults, delay catalog atom reads until first use, and keep picker shortcuts out of the composer bundle so the packaged desktop renderer can boot. The daily personal-release workflow rebases onto upstream at 04:17 UTC, verifies the patches, and publishes unsigned Linux x64, macOS arm64, and macOS x64 builds. Releases are tagged `v0.0.37-lmdevv.YYYYMMDD.N`.

The NUR repository at `/home/zxcv/Documents/github/nur-packages` packages those artifacts through its flake. Its 09:17 UTC updater discovers the latest personal release, refreshes hashes, builds natively on Linux and both Darwin architectures, then commits and notifies NUR only after validation passes. `linear-cli` was removed in `9532b1a`. `lmdevv` is on the central NUR registry `main`. Use `main`, not `master`. The public search page can lag. Darwin should install `nur.repos.lmdevv.t3code` and rebuild only after the skill loop has passed for that version.
