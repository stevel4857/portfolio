# How to Continue Working on This Project

This portfolio project has been saved with Git so you can easily come back to it later.

## Quick Start (Next Time)

1. Open PowerShell
2. Run these commands:

```powershell
cd "D:\my-portfolio"
code .          # Opens in VS Code (recommended)
# OR
notepad index.html   # If you prefer simple editing
```

## Saving Your Progress

Every time you make meaningful changes, save a new version:

```powershell
git add .
git commit -m "Describe what you changed here"
```

## Connecting to GitHub (stevel4857)

Your GitHub profile is https://github.com/stevel4857

To push this project to GitHub:

1. Go to GitHub and create a **new repository** (recommended name: `portfolio` or `steve-luiting-portfolio`)
2. **Do NOT** initialize it with a README (we already have one).
3. After creating the repo, run these commands:

```powershell
cd "D:\my-portfolio"

# Add your GitHub repo as the remote (replace with your actual repo URL)
git remote add origin https://github.com/stevel4857/YOUR-REPO-NAME.git

# Push everything up
git push -u origin main
```

## Viewing Previous Versions

```powershell
git log --oneline     # See list of saves
git checkout <commit-id>   # Go back to a previous version
```

## Current State

- Last saved: Initial save point with real experience section
- Main files: index.html + 3d-website.html
- Using Avenir font stack
- Location corrected to Westminster, CO
- 3D Lab fully integrated
- Branch: main

You can always come back and ask me to continue working on this project by referencing this folder.
