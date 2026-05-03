# Mobile & Desktop Shortcuts — resume-tailor

---

## A) iOS Shortcut — "Send to resume-tailor"

### Version 1: Clipboard Copy (works today)

**Goal:** Share any job URL → URL lands on clipboard → paste into resume-tailor.

**Setup in Shortcuts app:**

1. Open **Shortcuts** → tap **+** (new shortcut)
2. Tap **Add Action** → search **"Receive"** → select **Receive Input from Share Sheet**
   - Input type: **URLs**
   - If no input: **Continue** (or Stop)
3. Add Action → search **"Copy"** → select **Copy to Clipboard**
   - Input: **Shortcut Input** (tap the variable chip)
4. Add Action → search **"Show Notification"** → select **Show Notification**
   - Body: `URL copied — paste into resume-tailor`
   - Show When Run: **On**
5. Tap the shortcut name at top → rename to **"Send to resume-tailor"**
6. Tap the **ⓘ** icon → enable **Show in Share Sheet** → set Receive as **URLs, Text**

**To use:** On any job page in Safari/LinkedIn/Chrome → tap **Share** → scroll to **"Send to resume-tailor"** → tap → notification fires → switch to laptop tab, paste into JD field.

---

### Version 2: Deep Link (for when `#ingest=` ships)

**Same steps, replace steps 3–4 with:**

3. Add Action → search **"URL"** → select **URL**
   - URL value: `file:///Users/[YOUR_USERNAME]/Documents/Resumes/resume-tailor/index.html#ingest=`
   - (Replace `[YOUR_USERNAME]` with your macOS username)
4. Add Action → search **"Combine"** → select **Combine Text**
   - **First item:** the URL variable from step 3
   - **Second item:** Add Action → **URL Encode** → input: Shortcut Input
5. Add Action → search **"Open URLs"** → select **Open URLs**
   - Input: Combined Text variable

> Note: `file://` URLs only open in Safari on macOS, not iOS. For cross-device use, host the app on `localhost` and replace with `http://localhost:PORT/index.html#ingest=`.

---

## B) Android — "Send to resume-tailor"

### Version 1: Clipboard Copy via Share (works today)

Android doesn't support custom share targets as easily — use an intent-based approach:

**Option A — HTTP Shortcut app (free, no root):**

1. Install **HTTP Shortcuts** from Play Store
2. Open app → **+** → **Regular Shortcut**
3. Name: **"Send to resume-tailor"**
4. Method: **GET** (dummy URL — won't actually fire)
5. Scroll to **Scripting** → **Pre-Request Actions** → **Run Script**
6. Paste this script:
   ```javascript
   const url = text; // 'text' is populated from Share Sheet
   setClipboardContent(url);
   showToast("URL copied — paste into resume-tailor");
   ```
7. Back in shortcut settings → **Trigger** → enable **Include in Share Sheet**
8. Input variable name: `text`

**Option B — Manual (zero setup):**  
On any job page, long-press the URL bar → **Copy** → switch to laptop tab → paste.

---

### Version 2: Deep Link Intent (for when `#ingest=` ships)

**Using HTTP Shortcuts app:**

1. Create shortcut as above
2. Change Method to **GET**
3. URL field: `http://localhost:PORT/index.html#ingest={text}`
4. Enable **URL encode** on the `{text}` variable
5. In **Scripting → Post-Request**: `openUrl(url)` (optional auto-open)

---

### Bonus: Tasker Profile (power users)

1. **Profile:** Event → **Intent Received** → Action: `android.intent.action.SEND`, Type: `text/plain`
2. **Task:**
   - Action 1: **Variable Set** `%JOB_URL` = `%SEND_TEXT`
   - Action 2: **Clipboard** → Set → `%JOB_URL`
   - Action 3: **Flash** → "Job URL copied — paste into resume-tailor"
3. Long-press any link → **Share** → **Tasker** → profile fires

---

## C) Desktop Bookmarklet

### The Bookmarklet

Create a new bookmark, paste this as the URL:

```javascript
javascript:(function(){var t=document.body.innerText.replace(/\s+/g,' ').trim();var out='URL: '+location.href+'\n---\n'+t;navigator.clipboard.writeText(out).then(function(){alert('Copied! Paste into resume-tailor JD field.')},function(){prompt('Copy this:',out)});})();
```

**What it copies:**
```
URL: https://jobs.example.com/posting/12345
---
[full visible page text]
```

### Setup (drag-to-bar)

1. Show your bookmarks bar: **Ctrl+Shift+B** (Chrome/Edge) or **Ctrl+B** (Firefox)
2. Right-click the bookmarks bar → **Add Page** (Chrome) or **New Bookmark** (Firefox)
3. Name: `📋 JD Copy`
4. URL: paste the `javascript:(function()...` line above
5. Save

**To use:** Navigate to any job posting → click `📋 JD Copy` in bar → switch to resume-tailor tab → paste into JD field.

> Tip: Some pages (LinkedIn, Greenhouse) block clipboard access. If the alert fires but paste is empty, the fallback `prompt()` box will appear with the text — select all, copy manually.

---

## D) Chrome / Firefox Keyboard Shortcut for the Extension

### Chrome / Edge

1. Go to `chrome://extensions/shortcuts`
2. Find **resume-tailor** extension
3. Click the input box next to the action (e.g., "Activate the extension")
4. Press your desired combo — recommended: **Ctrl+Shift+R**
5. Set scope to **Global** if you want it to work in any tab

To pin the extension icon: click the **puzzle piece** icon in toolbar → find resume-tailor → click the **pin** icon.

### Firefox

1. Go to `about:addons`
2. Click the **gear icon** → **Manage Extension Shortcuts**
3. Find resume-tailor → set shortcut → recommended: **Ctrl+Shift+R**

> Firefox does not support global shortcuts for extensions (only works when browser is focused).
