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

## Easy Way to Update Your Portfolio

The easiest way to push updates is to use the included script.

### Method 1: Use the Update Script (Recommended)

1. Open PowerShell
2. Navigate to the folder:
   ```powershell
   cd "D:\my-portfolio"
   ```
3. Run the update script:
   ```powershell
   .\update-portfolio.ps1
   ```
4. When prompted, type a short message describing what you changed (or just press Enter to use the default message).
5. The script will automatically commit and push your changes. GitHub Actions will then update your live website.

### Method 2: Manual Git Commands

If you prefer doing it manually:

```powershell
cd "D:\my-portfolio"
git add .
git commit -m "Your description of changes"
git push
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
