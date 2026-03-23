
# Contributing to ui-secinci

Thanks for contributing to `ui-secinci`, also known as `Track`.

## Branch model

- `main` = stable release branch
- `dev` = active integration branch
- `feature/*`, `fix/*`, `docs/*`, `chore/*` = working branches

## For contributors

Contributors should open pull requests against `dev`, not `main`.

Typical flow:

1. Fork the repository.
2. Create a branch from `dev`.
3. Make your changes.
4. Push the branch to your fork.
5. Open a pull request into `spokanepubliclibrary/ui-secinci:dev`.

Example local flow:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/short-name
# make changes
git add .
git commit -m "feat: short description"
git push -u origin feature/short-name
```

Then open a PR with:

- base branch: `dev`
- compare branch: your feature branch

## For maintainers

### When a contributor submits code

1. Review the PR into `dev`.
2. Confirm checks pass.
3. Approve and merge into `dev`.
4. Pull the latest `dev` locally and run any needed sanity checks:

```bash
git checkout dev
git pull --rebase origin dev
```

5. If the changes are release-bound, prepare the next version bump on a small branch from `dev`:

```bash
git checkout -b chore/bump-version-1.0.23
# update package.json
git add package.json
git commit -m "chore: bump version to 1.0.23"
git push -u origin chore/bump-version-1.0.23
```

6. Open a PR from that branch into `dev`.
7. Merge the version bump PR.
8. Open a PR from `dev` to `main`.
9. Merge `dev` to `main`.
10. GitHub Actions publishes the npm package and creates GitHub Release assets.

### When maintainer makes changes directly

1. Start from updated `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/short-name
```

2. Make changes on the feature branch.
3. Commit and push the feature branch:

```bash
git add .
git commit -m "feat: short description"
git push -u origin feature/short-name
```

4. Open a PR into `dev`.
5. Use maintainer review/override only when appropriate.
6. Ensure `package.json` has the next release version before the release PR.
7. Open a PR from `dev` to `main`.
8. Merge to `main` to trigger the release workflow.

## Release notes

- The release workflow does not auto-increment the version.
- `package.json` must already contain the new version before merging `dev` to `main`.
- `main` builds the npm package and creates GitHub Release assets.
- GitHub Release assets include `module-descriptor.json` and the package tarball.

## Simple rule of thumb

Branch off `dev`, PR back into `dev`, and only merge `dev` into `main` when releasing.
