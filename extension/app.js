// ===== STATE =====
let selectedBlocks = new Set(
  [...BLOCKS.experience, ...BLOCKS.projects].filter(b => b.active).map(b => b.id)
);
let activeLibItem = null;
let lastOutput = '';
let lastCoverLetter = '';

// ===== SETTINGS =====
async function loadSettings() {
  const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel', 'personalInfo', 'personalContext']);

  if (result.geminiApiKey) {
    document.getElementById('apiKeyInput').value = result.geminiApiKey;
    updateApiStatus(true);
  } else {
    updateApiStatus(false);
  }

  if (result.selectedModel) document.getElementById('modelSelect').value = result.selectedModel;

  if (result.personalInfo) {
    const info = result.personalInfo;
    if (info.email) document.getElementById('settingsEmail').value = info.email;
    if (info.phone) document.getElementById('settingsPhone').value = info.phone;
    if (info.linkedin) document.getElementById('settingsLinkedin').value = info.linkedin;
    if (info.github) document.getElementById('settingsGithub').value = info.github;
    if (info.website) document.getElementById('settingsWebsite').value = info.website;
  }

  if (result.personalContext) document.getElementById('personalContext').value = result.personalContext;
}

async function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) { alert('Enter an API key first.'); return; }
  await chrome.storage.local.set({ geminiApiKey: key });
  updateApiStatus(true);
  flashSave('✓ API key saved');
}

async function savePersonalInfo() {
  const info = {
    email: document.getElementById('settingsEmail').value.trim(),
    phone: document.getElementById('settingsPhone').value.trim(),
    linkedin: document.getElementById('settingsLinkedin').value.trim(),
    github: document.getElementById('settingsGithub').value.trim(),
    website: document.getElementById('settingsWebsite').value.trim()
  };
  await chrome.storage.local.set({ personalInfo: info });
  flashSave('✓ Personal info saved');
}

async function savePersonalContext() {
  const ctx = document.getElementById('personalContext').value.trim();
  await chrome.storage.local.set({ personalContext: ctx });
  flashSave('✓ Context saved');
}

async function saveModel() {
  await chrome.storage.local.set({ selectedModel: document.getElementById('modelSelect').value });
}

function flashSave(msg) {
  const el = document.getElementById('saveMsg');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 2000);
}

function updateApiStatus(connected) {
  const el = document.getElementById('apiStatus');
  el.textContent = connected ? '● gemini connected' : '⚙ configure API key';
  el.className = 'api-status ' + (connected ? 'connected' : 'error');
}

// ===== NAVIGATION =====
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.textContent.trim() === tab || t.textContent.trim() === (tab === 'coverletter' ? 'cover letter' : tab)));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
}

// ===== CAPTURE CURRENT JOB PAGE =====
async function captureCurrentPage() {
  const btn = document.getElementById('captureBtn');
  const urlEl = document.getElementById('captureUrl');
  btn.disabled = true;
  btn.textContent = 'capturing...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    urlEl.textContent = tab.url;
    urlEl.className = 'capture-url';

    // Inject script to extract page text
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobText
    });

    const extracted = results[0]?.result || '';
    if (!extracted) throw new Error('Could not read page content');

    // Auto-detect company from URL
    const company = extractCompanyFromUrl(tab.url, tab.title);

    // Populate JD fields across tabs
    document.getElementById('jdInput').value = extracted;
    document.getElementById('clJD').value = extracted;
    if (company) {
      document.getElementById('clCompany').value = company;
    }

    urlEl.textContent = `captured: ${tab.title || tab.url}`;
    urlEl.className = 'capture-url loaded';
    btn.textContent = 'captured ✓';
    setTimeout(() => { btn.disabled = false; btn.textContent = 'capture job page'; }, 2500);
  } catch (err) {
    urlEl.textContent = 'Error: ' + err.message;
    btn.disabled = false;
    btn.textContent = 'capture job page';
  }
}

// Runs in page context — extracts visible job text, preferring known job board selectors
function extractJobText() {
  const selectors = [
    // Greenhouse
    '#content', '.job-post', '.job__description',
    // Lever
    '.posting-content', '.posting',
    // Workday
    '[data-automation-id="job-posting-details"]',
    // LinkedIn
    '.jobs-description', '.jobs-box__html-content',
    // Ashby
    '.ashby-job-posting-brief-description',
    // Generic
    'main', 'article', '#main-content', '.job-description', '.description'
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.length > 200) return el.innerText.trim();
  }

  // Fallback: full body text (Gemini will filter)
  return document.body.innerText.trim().slice(0, 15000);
}

function extractCompanyFromUrl(url, title) {
  try {
    const host = new URL(url).hostname.replace('www.', '').replace('jobs.', '').replace('careers.', '');
    // Known boards — company is in path or title
    if (host.includes('greenhouse.io') || host.includes('lever.co') || host.includes('ashbyhq.com')) {
      const match = url.match(/\/([\w-]+)\//);
      if (match) return match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    if (host.includes('linkedin.com')) {
      // Title is usually "Company - Role | LinkedIn"
      const parts = (title || '').split(' - ');
      if (parts.length > 1) return parts[0].trim();
    }
    // Use domain as fallback
    return host.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  } catch { return ''; }
}

// ===== BLOCK SELECTORS =====
function renderBlockSelectors() {
  const expContainer = document.getElementById('expBlocks');
  const projContainer = document.getElementById('projBlocks');
  expContainer.innerHTML = '';
  projContainer.innerHTML = '';
  BLOCKS.experience.forEach(b => expContainer.appendChild(makeBlockToggle(b)));
  BLOCKS.projects.forEach(b => projContainer.appendChild(makeBlockToggle(b)));
}

function makeBlockToggle(block) {
  const el = document.createElement('div');
  el.className = 'block-toggle' + (selectedBlocks.has(block.id) ? ' selected' : '');
  el.onclick = () => {
    if (selectedBlocks.has(block.id)) selectedBlocks.delete(block.id);
    else selectedBlocks.add(block.id);
    el.classList.toggle('selected');
    el.querySelector('.block-check').textContent = selectedBlocks.has(block.id) ? '✓' : '';
  };
  el.innerHTML = `
    <div class="block-check">${selectedBlocks.has(block.id) ? '✓' : ''}</div>
    <div class="block-info">
      <div class="block-name">${block.name}</div>
      <div class="block-meta">${block.meta}</div>
    </div>
  `;
  return el;
}

// ===== LIBRARY =====
function renderLibrary() {
  ['Exp', 'Proj', 'Static'].forEach(type => {
    const key = type === 'Exp' ? 'experience' : type === 'Proj' ? 'projects' : 'static';
    const container = document.getElementById('lib' + type + 'List');
    container.innerHTML = '';
    BLOCKS[key].forEach(b => {
      const el = document.createElement('div');
      el.className = 'lib-item' + (activeLibItem === b.id ? ' active' : '');
      el.onclick = () => { activeLibItem = b.id; renderLibrary(); renderLibEditor(); };
      el.innerHTML = `
        <div class="lib-dot ${b.active ? 'active-block' : 'inactive-block'}"></div>
        <div>
          <div class="lib-item-name">${b.name}</div>
          <div class="lib-item-meta">${b.meta}</div>
        </div>
      `;
      container.appendChild(el);
    });
  });
}

function renderLibEditor() {
  const editor = document.getElementById('libEditor');
  const allBlocks = [...BLOCKS.experience, ...BLOCKS.projects, ...BLOCKS.static];
  const block = allBlocks.find(b => b.id === activeLibItem);
  if (!block) return;
  editor.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:13px;font-weight:600">${block.name}</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--muted)">${block.meta}</span>
      <button class="copy-btn" id="libCopyBtn" onclick="copyBlock('${block.id}')">copy</button>
    </div>
    <textarea id="libTexArea" rows="18" style="flex:1;min-height:250px">${escapeHtml(block.tex)}</textarea>
    <button class="btn btn-primary" style="width:auto;padding:7px 16px" onclick="saveBlock('${block.id}')">save changes</button>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveBlock(id) {
  const allBlocks = [...BLOCKS.experience, ...BLOCKS.projects, ...BLOCKS.static];
  const block = allBlocks.find(b => b.id === id);
  if (!block) return;
  block.tex = document.getElementById('libTexArea').value;
  const btn = event.target;
  btn.textContent = 'saved ✓';
  setTimeout(() => btn.textContent = 'save changes', 1500);
}

function copyBlock(id) {
  const allBlocks = [...BLOCKS.experience, ...BLOCKS.projects, ...BLOCKS.static];
  const block = allBlocks.find(b => b.id === id);
  if (!block) return;
  navigator.clipboard.writeText(block.tex);
  const btn = document.getElementById('libCopyBtn');
  btn.textContent = 'copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1500);
}

// ===== GEMINI API =====
async function callGemini(prompt) {
  const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel', 'personalContext']);
  const apiKey = result.geminiApiKey;
  const model = result.selectedModel || 'gemini-2.5-flash';
  const ctx = result.personalContext || '';

  if (!apiKey) throw new Error('No API key configured. Go to Settings tab.');

  if (ctx) prompt = `=== ABOUT ME (use as background for every response) ===\n${ctx}\n=== END ABOUT ME ===\n\n${prompt}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4000, temperature: 0.3 }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini. Try again.');
  return text;
}

// ===== RESUME TAILORING =====
function buildTailorPrompt(jd) {
  const chosenExp = BLOCKS.experience.filter(b => selectedBlocks.has(b.id));
  const chosenProj = BLOCKS.projects.filter(b => selectedBlocks.has(b.id));
  const blocksForPrompt = [...chosenExp, ...chosenProj].map(b => `[BLOCK: ${b.name}]\n${b.tex}`).join('\n\n');
  const staticSkills = BLOCKS.static.find(b => b.id === 'static_skills');

  return `You are a resume tailoring assistant for Jonathan Liang, a CS + EE freshman at University of Michigan (GPA 3.68).

JOB DESCRIPTION:
${jd}

RESUME BLOCKS AVAILABLE (LaTeX):
${blocksForPrompt}

CURRENT SKILLS SECTION:
${staticSkills?.tex || ''}

Your task:
1. Extract the top 10-15 ATS keywords/skills from the JD
2. For each selected block, rewrite bullet points to naturally incorporate relevant keywords without fabricating new experiences. Keep LaTeX structure and metrics intact.
3. Suggest any updates to the skills section.
4. Output the full tailored LaTeX for experience + projects sections.

First write <thinking> tags with your tailoring strategy.

Then output:
KEYWORDS: [comma-separated list]
MISSING: [keywords from JD not in resume]

Then tailored LaTeX blocks:
---BLOCK: [block name]---
[tailored latex]
---END---

Then:
SKILLS_TEX: [updated line or UNCHANGED]`;
}

async function tailorResume() {
  const jd = document.getElementById('jdInput').value.trim();
  if (!jd) { alert('Paste a job description first, or use the capture button.'); return; }
  if (selectedBlocks.size === 0) { alert('Select at least one block.'); return; }

  setTailorLoading(true);
  try {
    const text = await callGemini(buildTailorPrompt(jd));
    lastOutput = text;
    parseTailorOutput(text);
  } catch (err) {
    document.getElementById('outputArea').textContent = 'Error: ' + err.message;
  }
  setTailorLoading(false);
}

function setTailorLoading(on) {
  const btn = document.getElementById('tailorBtn');
  const btn2 = document.getElementById('bothBtn');
  btn.disabled = on;
  btn2.disabled = on;
  btn.innerHTML = on ? '<span class="spinner"></span>tailoring...' : 'tailor resume →';
}

function parseTailorOutput(text) {
  const thinkMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
  if (thinkMatch) {
    const thinkBox = document.getElementById('thinkingBox');
    thinkBox.style.display = 'block';
    thinkBox.innerHTML = `<div class="thinking-strip"><div class="thinking-label">tailoring notes</div>${thinkMatch[1].trim()}</div>`;
  }

  const kwMatch = text.match(/KEYWORDS:\s*(.+?)(?:\n|$)/);
  const missingMatch = text.match(/MISSING:\s*(.+?)(?:\n|$)/);
  if (kwMatch) {
    const kwBox = document.getElementById('keywordsBox');
    kwBox.style.display = 'block';
    const kwList = kwMatch[1].split(',').map(k => k.trim()).filter(Boolean);
    const missingList = missingMatch ? missingMatch[1].split(',').map(k => k.trim()).filter(k => k && k.toLowerCase() !== 'none') : [];
    kwBox.innerHTML = `<div class="keywords-box">
      <div class="keywords-title">extracted keywords</div>
      <div class="keyword-chips">
        ${kwList.map(k => `<span class="chip">${k}</span>`).join('')}
        ${missingList.map(k => `<span class="chip missing">⚠ ${k}</span>`).join('')}
      </div>
    </div>`;
  }

  const blockMatches = [...text.matchAll(/---BLOCK: (.+?)---\n([\s\S]*?)---END---/g)];
  const skillsMatch = text.match(/SKILLS_TEX:\s*([\s\S]+?)(?:\n\n|$)/);

  const tailoredMap = {};
  blockMatches.forEach(m => { tailoredMap[m[1].trim()] = m[2].trim(); });

  const expTex = BLOCKS.experience.filter(b => selectedBlocks.has(b.id)).map(b => tailoredMap[b.name] || b.tex).join('\n\n');
  const projTex = BLOCKS.projects.filter(b => selectedBlocks.has(b.id)).map(b => tailoredMap[b.name] || b.tex).join('\n\n');

  const heading = BLOCKS.static.find(b => b.id === 'static_heading')?.tex || '';
  const education = BLOCKS.static.find(b => b.id === 'static_education')?.tex || '';
  let skillsTex = BLOCKS.static.find(b => b.id === 'static_skills')?.tex || '';
  if (skillsMatch && skillsMatch[1].trim() !== 'UNCHANGED') {
    skillsTex = skillsTex.replace(/\\textbf\{Languages\}.*?(?=\\\\|$)/, skillsMatch[1].trim());
  }

  const fullTex = [
    RESUME_PREAMBLE, '', heading, '',
    '%-----------EDUCATION-----------%', education, '',
    '%-----------EXPERIENCE-----------%', '\\section{Experience}', '\\resumeSubHeadingListStart', expTex, '\\resumeSubHeadingListEnd', '',
    '%-----------PROJECTS-----------%', '\\section{Projects}', '\\resumeSubHeadingListStart', projTex, '\\resumeSubHeadingListEnd', '',
    skillsTex, '', '\\end{document}'
  ].join('\n');

  document.getElementById('outputArea').textContent = fullTex;
}

// ===== COVER LETTER =====
function buildCoverLetterPrompt(company, role, jd, notes, tone, info) {
  return `Write a cover letter for Jonathan Liang applying to this position.

APPLICANT INFO:
Name: Jonathan Liang
Email: ${info.email || 'jonliang@umich.edu'}
Phone: ${info.phone || ''}
Education: B.S.E Computer Science, Minor Electrical Engineering, University of Michigan, GPA 3.68, Expected May 2028

POSITION:
Company: ${company}
Role: ${role}

JOB DESCRIPTION:
${jd}

${notes ? 'APPLICANT NOTES: ' + notes : ''}

REQUIREMENTS:
- 3-4 paragraphs, concise and impactful
- Use specific metrics from Jonathan's background
- Pick the 1-2 most relevant stories from the personal context above
- Don't just repeat the resume — show fit and enthusiasm
- Tone: ${tone}
- Plain text, ready to paste
- Include salutation and sign-off with Jonathan's email`;
}

async function generateCoverLetter() {
  const company = document.getElementById('clCompany').value.trim();
  const role = document.getElementById('clRole').value.trim();
  const jd = document.getElementById('clJD').value.trim();
  const notes = document.getElementById('clNotes').value.trim();
  const tone = document.getElementById('clTone').value;

  if (!company || !role) { alert('Enter company name and role.'); return; }
  if (!jd) { alert('Paste a job description, or use the capture button on a job page.'); return; }

  const btn = document.getElementById('clBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>generating...';
  document.getElementById('clOutput').innerHTML = '<span class="output-placeholder">generating...</span>';

  const result = await chrome.storage.local.get(['personalInfo']);
  const info = result.personalInfo || {};

  try {
    const text = await callGemini(buildCoverLetterPrompt(company, role, jd, notes, tone, info));
    lastCoverLetter = text;
    document.getElementById('clOutput').textContent = text;
  } catch (err) {
    document.getElementById('clOutput').textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  btn.textContent = 'generate cover letter →';
}

// ===== COMBINED ONE-CLICK FLOW =====
async function tailorAndCoverLetter() {
  const jd = document.getElementById('jdInput').value.trim();
  if (!jd) { alert('Paste a job description first, or use the capture button.'); return; }
  if (selectedBlocks.size === 0) { alert('Select at least one block.'); return; }

  const btn = document.getElementById('bothBtn');
  const tailorBtn = document.getElementById('tailorBtn');
  btn.disabled = true;
  tailorBtn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>tailoring...';

  const statusStrip = document.getElementById('statusStrip');
  statusStrip.style.display = 'block';
  statusStrip.textContent = 'step 1/2 — tailoring resume...';

  document.getElementById('outputArea').innerHTML = '<span class="output-placeholder">generating...</span>';

  try {
    // Step 1: tailor resume
    const tailorText = await callGemini(buildTailorPrompt(jd));
    lastOutput = tailorText;
    parseTailorOutput(tailorText);

    // Extract company/role from JD for cover letter
    const company = document.getElementById('clCompany').value.trim() || await extractCompanyRoleFromJD(jd);
    const role = document.getElementById('clRole').value.trim() || '';

    statusStrip.textContent = 'step 2/2 — generating cover letter...';

    // Step 2: cover letter
    const result = await chrome.storage.local.get(['personalInfo']);
    const info = result.personalInfo || {};
    const tone = document.getElementById('clTone').value;
    const notes = document.getElementById('clNotes').value.trim();

    // Sync JD to cover letter tab
    document.getElementById('clJD').value = jd;
    if (company) document.getElementById('clCompany').value = company;

    const clText = await callGemini(buildCoverLetterPrompt(company || 'the company', role || 'the role', jd, notes, tone, info));
    lastCoverLetter = clText;
    document.getElementById('clOutput').textContent = clText;

    statusStrip.textContent = '✓ done — resume + cover letter ready';
    setTimeout(() => { statusStrip.style.display = 'none'; }, 3000);
  } catch (err) {
    statusStrip.textContent = 'Error: ' + err.message;
    document.getElementById('outputArea').textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  tailorBtn.disabled = false;
  btn.textContent = 'tailor + cover letter';
}

async function extractCompanyRoleFromJD(jd) {
  // Quick heuristic: look for "at [Company]" or "[Company] is hiring"
  const match = jd.match(/(?:at|@|join)\s+([A-Z][a-zA-Z0-9\s&]{1,30}?)(?:\s*[,\n]|\s+as\s|\s+for\s)/);
  return match ? match[1].trim() : '';
}

// ===== COPY =====
function copyOutput() {
  const text = document.getElementById('outputArea').textContent;
  if (!text || text.includes('Tailored LaTeX')) return;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById('copyOutputBtn');
  btn.textContent = 'copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'copy .tex'; btn.classList.remove('copied'); }, 1500);
}

function copyCoverLetter() {
  const text = document.getElementById('clOutput').textContent;
  if (!text || text.includes('will appear')) return;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById('copyClBtn');
  btn.textContent = 'copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  renderBlockSelectors();
  renderLibrary();
  document.getElementById('modelSelect').addEventListener('change', saveModel);

  // Show current tab URL in capture banner
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('about:')) {
      document.getElementById('captureUrl').textContent = tab.url;
    }
  });
});
