# AI Data Guardian — start here (absolute beginner guide)

This guide assumes **Windows 10 or 11**, because it is common for students. Mac instructions are noted where they differ. You do **not** need a paid code editor. Set aside roughly 60–90 minutes for your first setup, depending on downloads.

## 0. Know the four tools

Imagine building a school scrapbook:

| Tool | Very simple meaning | Why you need it |
|---|---|---|
| **GitHub** | An online shelf for your project | Keeps backup copies and lets Eelyn and Nabila work together |
| **Git** | The tool that remembers changes | Makes commits: named checkpoints of the project |
| **VS Code** | Your editing desk | Opens and edits the React code |
| **Node.js / npm** | The engine and package downloader | Runs the frontend and installs React dependencies |

GitHub is a **website/account**; Git is a **program** installed on your computer. They are different.

## 1. Create your GitHub account

1. Open [github.com/signup](https://github.com/signup) in your browser.
2. Enter your email, choose a password, and create a username. For a team project, each teammate should have **their own account**.
3. Verify your email when GitHub asks.
4. Set up two-factor authentication when prompted.
5. Keep the tab open. You will create a repository in Step 9.

**Checkpoint:** You can sign in to `github.com` and see your profile picture.

## 2. Install Git (the version-control program)

**Windows**

1. Visit [git-scm.com/install/windows](https://git-scm.com/install/windows).
2. Download the Windows installer for your computer.
3. Double-click the installer. Most beginners can leave the defaults and press **Next** until **Install**.
4. Restart VS Code later if it was already open, so it detects Git.

**Mac**: Visit [git-scm.com/install/mac](https://git-scm.com/install/mac) and follow its supported installation option. If Git is already available through Apple Command Line Tools, you can use that.

**Checkpoint:** After Step 5, `git --version` shows a version number.

## 3. Install Visual Studio Code

1. Visit [code.visualstudio.com/Download](https://code.visualstudio.com/Download).
2. On Windows, download **User Installer** for your computer. On Mac, download the Mac package and move the app to Applications.
3. Run the installer. Leave recommended defaults selected.
4. Open **Visual Studio Code** from the Start menu or Applications.
5. On the Welcome screen, note these areas:
   - Left **Explorer** icon = the files in your project.
   - Left **Source Control** branching icon = Git changes.
   - Top menu **Terminal → New Terminal** = where you type commands.

You do not need a paid VS Code extension. Optional helpful extensions: **ESLint**, **Prettier**, **Python**, and **Pylance**. Install only after you have the starter running.

## 4. Install Node.js (with npm)

1. Visit [nodejs.org/en/download](https://nodejs.org/en/download).
2. Choose the clearly labelled **LTS** (Long Term Support) release suitable for your computer, not an experimental/current version.
3. Run the installer and accept the standard options, including npm.
4. Close and reopen VS Code after the installer finishes.

**Checkpoint:** In VS Code, choose **Terminal → New Terminal**. Type these commands one at a time and press Enter after each:

```bash
node --version
npm --version
git --version
```

Each should print a version number. If Windows says a command is not recognized, close/reopen VS Code, then restart your computer if necessary. If PowerShell blocks `npm.ps1`, open a **Command Prompt** terminal in VS Code (Terminal dropdown → Select Default Profile → Command Prompt) and retry.

## 5. Download and unzip your starter project

1. Download the **AI Data Guardian Starter ZIP** supplied with this guide.
2. Open your Windows **Downloads** folder (Mac: Finder Downloads).
3. Right-click the ZIP and choose **Extract All…** (Mac: double-click the ZIP).
4. Choose a simple folder, for example:
   - Windows: `Documents\Projects\ai-data-guardian-starter`
   - Mac: `Documents/Projects/ai-data-guardian-starter`
5. Open the extracted folder in File Explorer/Finder. You should see `package.json`, `src`, `datasets`, `policies` and `docs`.

**Common mistake:** Do not open only the `src` folder in VS Code. Open the **whole** `ai-data-guardian-starter` folder containing `package.json`.

## 6. Open the project in VS Code

1. Open VS Code.
2. Click **File → Open Folder** (Mac: **File → Open…**).
3. Choose the extracted `ai-data-guardian-starter` folder.
4. If asked whether you trust the folder, confirm **Yes** only if it is the starter you downloaded from this conversation.
5. On the left, expand `src/`. You should see `App.tsx`, `demoData.ts` and `styles.css`.

**Checkpoint:** The VS Code Explorer lists `package.json` at the top level.

## 7. Install the frontend's code packages

1. In VS Code, click **Terminal → New Terminal**.
2. The terminal path should end with `ai-data-guardian-starter`.
3. Type:

```bash
npm install
```

4. Wait until installation finishes. This downloads React, TypeScript, Vite and icon packages according to `package.json`/lockfile.
5. A new `node_modules` folder will appear; it contains downloaded tools. Do **not** manually edit this folder or upload it to GitHub.

**Checkpoint:** There is no red error at the end and the terminal gives you a new prompt. Some non-fatal notices may appear.

## 8. Start your first website

In the same VS Code terminal, type:

```bash
npm run dev
```

Vite prints a local URL, usually:

`http://127.0.0.1:5173`

1. Hold **Ctrl** and click the URL in the terminal (Mac: Command-click), or copy it into Chrome/Edge/Safari.
2. The AI Data Guardian dashboard should appear.
3. **Keep the terminal running** while you browse the site.
4. To stop it later, click inside the terminal and press **Ctrl+C** (on Mac, Control+C in the terminal).

**Checkpoint:** You see a dark blue sidebar with **Overview**, **Data imports**, **Departments** and **Issue center**.

## 9. Try the actual frontend functions (no coding yet)

1. On **Overview**, look at the four data cards. Those figures are **illustrative**.
2. Select **Finance** in the department filter. Click a department bar to drill down.
3. Open **Employees**; click the arrow by **Nur Iman** to view the mock employee record quality.
4. Open **Data imports**; click **Load example**. The demo reads a built-in 7-row CSV.
5. Scroll down to **CSV document review**. Click a red cell. The right drawer shows the exact row, field, masked value, policy and advice.
6. Click **Issue center** to filter findings by severity.
7. Open a finding for **Nur Iman (EMP-103)** and click **Request correction**.
8. At the top-right profile control, change the demo role from **HR Manager** to **Employee**.
9. Open **My corrections** and click **Submit correction (demo)**. The request changes to waiting for HR review.
10. Switch back to **HR Manager**, open Issue center, open that case and click **Mark resolved**.
11. Open **AI assistant**, enter a question and click **Generate demo guidance**. The response is a **preset simulation**, not Gemini.

**Checkpoint:** You completed an example HR correction flow on your own computer. The changes reset when the page reloads because there is no database yet.

## 10. Try the real synthetic CSV files

1. In the project Explorer, expand `datasets/`.
2. Find `hr_train.csv` and `hr_test.csv`.
3. Go back to the browser → **Data imports** → **Browse files**.
4. Select `datasets/hr_test.csv` from the project folder.
5. The browser checks the CSV locally and highlights some missing IDs, duplicates, suspicious bank-like strings and amount/date issues.
6. Compare the findings with `datasets/evaluation_answer_key.json` (open it in VS Code). The answer key lists **deliberately injected** problems; the simple frontend does not implement every future Python rule.

**Important:** These datasets contain made-up records. Do not upload actual employee files to this prototype.

## 11. Put the starter on GitHub (beginner-friendly route)

### Option A: VS Code Source Control

1. In VS Code, click the **Source Control** icon (looks like a branching line).
2. Click **Initialize Repository** if prompted.
3. Under Changes, look through files. Make sure `.env`, passwords, actual employee data and `node_modules` are **not** listed.
4. In the message box, type `Initial AI Data Guardian frontend starter`.
5. Click **Commit** (or the checkmark icon). If prompted, set your Git username and email.
6. Find **Publish Branch** or **Publish to GitHub**. Sign in to GitHub if VS Code asks.
7. Choose **Private repository** initially, especially for an HR-related project.
8. Use repository name `ai-data-guardian` or `AI-Data-Guardian-HR`.
9. Finish publishing. Open GitHub in your browser to verify the files appear.
10. Go to repository **Settings → Collaborators** (wording may vary) and invite your teammate's own GitHub account.

### Option B: terminal commands (if the VS Code button is unavailable)

First create an **empty** repository at [github.com/new](https://github.com/new). Do not pre-populate it with a README, license or `.gitignore`, because this starter already contains files. Choose **Private**. Then in your VS Code terminal, enter:

```bash
git init
git add .
git commit -m "Initial AI Data Guardian frontend starter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-data-guardian.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username and match the repository name you created. GitHub may prompt you to authenticate through your browser. If you see `Author identity unknown`, run:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use your own name and GitHub-linked email. Then retry the commit and push. Never paste a password or token into a source file.

**Checkpoint:** Your teammate can see the private repository after accepting the invitation.

## 12. How Eelyn and Nabila can work together

1. Decide who works on the frontend page and who works on the quality engine or backend.
2. Each person downloads/clones the same private repository.
3. Before starting work, **pull** the latest changes (VS Code Source Control menu or `git pull`).
4. Create a new branch for a task; for example `feature/employee-portal`.
5. Make a small change and confirm `npm run build` passes.
6. Commit with a clear message such as `Add employee correction form`.
7. Push the branch and open a **Pull Request** on GitHub.
8. The teammate reviews before merging into `main`.
9. Pull again to synchronize.

Do not both edit the same large file at the same time without agreeing on responsibilities.

## 13. Your first coding experiment

1. In VS Code, open `src/App.tsx`.
2. Search for `Good morning, Eelyn`.
3. Change the heading to your preferred text.
4. Press **Ctrl+S** to save. Vite should refresh your browser automatically.
5. If you like it, commit the change in Source Control.

To change brand colors, open `src/styles.css`. Do not replace the whole file at once; start with small tweaks.

## 14. What we build next, after the UI is familiar

1. Connect **Supabase Auth** for real HR login and employee identities.
2. Create PostgreSQL tables from the specification and apply department-based authorization/RLS.
3. Build a **Node.js/Express** API that verifies user sessions and handles workflows.
4. Build a **Python/FastAPI** analysis service with reproducible validation tests.
5. Connect private **Google Cloud Storage** CSV uploads.
6. Get organizational approval for **Gemini Enterprise API access**, then connect policy-grounded recommendations.
7. Make employee notifications, approvals and quality scores persistent.
8. Write integration/security tests and deploy a protected staging environment.

Open `docs/NEXT_BACKEND_STEPS.md` for the technical sequence.

## 15. Help! Common beginner errors

| What you see | Try this |
|---|---|
| `node is not recognized` | Install Node.js LTS, then close/reopen VS Code |
| `npm.ps1 cannot be loaded` | Select a **Command Prompt** terminal in VS Code; retry `npm install` |
| `package.json not found` | You opened the wrong folder; use the root folder containing `package.json` |
| `Port 5173 is in use` | Check the URL that Vite prints; it may select another port |
| `Failed to resolve import` | Stop dev server, run `npm install` in the project root, start again |
| `git: command not found` | Install Git, reopen terminal, run `git --version` |
| GitHub asks you to authenticate | Follow the browser/VS Code login flow; do not share tokens |
| CSV shows zero records | Ensure the file has `record_type` column and at least one data row |
| Changes vanished on reload | Expected in the UI prototype; database persistence comes later |
| Cannot send real email | Expected; notifications are local simulations until backend integration |

## Official links

- GitHub account/repository: https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account
- Git installation: https://git-scm.com/install/
- VS Code setup: https://code.visualstudio.com/docs/getstarted/overview
- Node.js LTS: https://nodejs.org/en/download
- React learning: https://react.dev/learn
- Vite guide: https://vite.dev/guide/

**Next task after this guide:** Read `docs/FRONTEND_UI_UX.md` so you understand what each screen is for before modifying the layout.
