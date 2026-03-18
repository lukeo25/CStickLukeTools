# LukeTools Fork of Candlestick — Deployment Files
Generated for lukeo25 — LukeTools v2.8.10 + Bridge embedded

=======================================================
FILES IN THIS PACKAGE
=======================================================

1. index.html
   Drop this into the public/ folder of your Candlestick fork,
   REPLACING the existing public/index.html

2. netlify.toml
   Drop this into the ROOT of your Candlestick fork
   (same level as package.json)

3. _redirects
   Drop this into the public/ folder of your Candlestick fork

=======================================================
STEP BY STEP — GitHub Desktop + Netlify
=======================================================

STEP 1 — Fork Candlestick on GitHub
  Go to: https://github.com/Candlestickers/Candlestick
  Click Fork → fork to your lukeo25 account

STEP 2 — Clone in GitHub Desktop
  Open GitHub Desktop
  File → Clone Repository → find lukeo25/Candlestick
  Clone it to your computer

STEP 3 — Drop in the files
  Copy index.html    →  into the public/ folder  (replace existing)
  Copy netlify.toml  →  into the ROOT folder      (new file)
  Copy _redirects    →  into the public/ folder   (new file)

STEP 4 — Commit and Push in GitHub Desktop
  You will see 3 changed/new files listed
  Add commit message: "Add LukeTools v2.8.10 + Netlify config"
  Click: Commit to development
  Click: Push origin

STEP 5 — Connect to Netlify
  Go to: https://app.netlify.com
  Click: Add new site → Import from Git
  Connect your GitHub account
  Select your lukeo25/Candlestick fork
  Branch: development
  Netlify will auto-detect netlify.toml — no manual settings needed
  Click: Deploy site
  Build takes ~3-5 minutes
  Your site goes live at a *.netlify.app URL

STEP 6 — Set a custom name (optional)
  In Netlify: Site settings → General → Site name
  Change to something like: luketools-candlestick.netlify.app

=======================================================
UPDATING LUKETOOLS IN FUTURE
=======================================================

When you update LukeTools:
  1. Replace public/index.html with a new version
  2. Commit + Push in GitHub Desktop
  3. Netlify auto-redeploys within ~3 minutes

=======================================================
IMPORTANT — WickTools Repo Must Be Public
=======================================================

LukeTools loads its tool configs and SVG icons at runtime from:
  https://raw.githubusercontent.com/lukeo25/WickTools/main/

Make sure your lukeo25/WickTools GitHub repo is set to PUBLIC.
If it is private, the panel icons and tool configs will not load
on the live hosted site.

=======================================================
