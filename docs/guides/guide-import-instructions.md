# Automated Linear Import Instructions

This guide will help you use the Python script to automatically import your CSV into Linear.

## Option 1: Python Script (Automated) ⚡

### Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests python-dotenv
```

### Step 2: Get Your Linear API Key

1. Go to https://linear.app/settings/api
2. Click "Create API Key"
3. Give it a name (e.g., "CSV Import")
4. Copy the API key (you won't see it again!)

### Step 3: Set Up Environment Variables

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

2. Open `.env` in a text editor and add your API key:
   ```
   LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
   ```

3. (Optional) Add your Team ID to skip team selection:
   ```
   LINEAR_TEAM_ID=your_team_id_here
   ```

### Step 4: Run the Import Script

```bash
python linear_import.py
```

The script will:
- ✅ Connect to your Linear workspace
- ✅ Let you select a team (if not set in .env)
- ✅ Map CSV statuses to Linear workflow states
- ✅ Import all 66 issues
- ✅ Show progress and summary

### Troubleshooting

**Error: "LINEAR_API_KEY not found"**
- Make sure you created a `.env` file (not `.env.example`)
- Check that the file is in the same directory as `linear_import.py`

**Error: "No teams found"**
- Make sure you're using the correct API key
- Check that you have access to at least one team in Linear

**Error: "Status 'done' not found"**
- The script tries to map: Done→Done/Completed, Ready→In Progress/Todo, Backlog→Backlog
- If your Linear workspace uses different status names, you may need to edit the script or create matching statuses in Linear

**Import is slow**
- The script includes a 0.5 second delay between requests to be respectful to Linear's API
- For 66 issues, expect ~30-40 seconds total

---

## Option 2: Linear CLI Tool (Alternative)

If you prefer using Linear's official CLI:

### Step 1: Install Linear Import CLI

```bash
npm install --global @linear/import
```

### Step 2: Run the Importer

```bash
linear-import
```

Follow the prompts to:
1. Authenticate with Linear
2. Select your team
3. Choose your CSV file
4. Map columns to Linear fields

---

## Option 3: Manual Import via Linear UI

If you prefer the web interface:

1. Go to Linear → Settings → Import / Export
2. Select "CSV" as import source
3. Upload `linear-import-full-roadmap.csv`
4. Map columns manually
5. Review and confirm

See `LINEAR_IMPORT_GUIDE.md` for detailed manual import instructions.

---

## Which Option Should I Use?

- **Python Script (Option 1)**: Best for automation, handles mapping automatically, shows progress
- **Linear CLI (Option 2)**: Official tool, interactive, good if you prefer npm tools
- **Manual UI (Option 3)**: Most control, visual interface, good for one-time imports

---

## Need Help?

- Check `LINEAR_IMPORT_GUIDE.md` for detailed troubleshooting
- Linear API Docs: https://developers.linear.app/docs
- Linear Support: https://linear.app/docs

