// ===== APP LOGIC =====

// State
let selectedBlocks = new Set(
  [...BLOCKS.experience, ...BLOCKS.projects].filter(b => b.active).map(b => b.id)
);
let activeLibItem = null;
let lastOutput = '';
let lastCoverLetter = '';

// ===== SETTINGS =====
async function loadSettings() {
  const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel', 'personalInfo']);
  
  if (result.geminiApiKey) {
    document.getElementById('apiKeyInput').value = result.geminiApiKey;
    updateApiStatus(true);
  } else {
    updateApiStatus(false);
  }

  if (result.selectedModel) {
    document.getElementById('modelSelect').value = result.selectedModel;
  }

  if (result.personalInfo) {
    const info = result.personalInfo;
    document.getElementById('settingsEmail').value = info.email || '';
    document.getElementById('settingsPhone').value = info.phone || '';
    document.getElementById('settingsLinkedin').value = info.linkedin || '';
    document.getElementById('settingsGithub').value = info.github || '';
    document.getElementById('settingsWebsite').value = info.website || '';
  }
}

async function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) { alert('Enter an API key first.'); return; }
  
  await chrome.storage.local.set({ geminiApiKey: key });
  updateApiStatus(true);
  
  const msg = document.getElementById('saveMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2000);
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
  
  const msg = document.getElementById('saveMsg');
  msg.textContent = '✓ Personal info saved';
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2000);
}

async function saveModel() {
  const model = document.getElementById('modelSelect').value;
  await chrome.storage.local.set({ selectedModel: model });
}

function updateApiStatus(connected) {
  const el = document.getElementById('apiStatus');
  if (connected) {
    el.textContent = '● gemini connected';
    el.className = 'api-status connected';
  } else {
    el.textContent = '⚙ configure API key';
    el.className = 'api-status error';
  }
}

// ===== NAVIGATION =====
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.textContent.includes(tab.split(' ')[0])));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  const pageMap = {
    'tailor': 'page-tailor',
    'coverletter': 'page-coverletter',
    'library': 'page-library',
    'settings': 'page-settings'
  };
  
  document.getElementById(pageMap[tab]).classList.add('active');
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
    <div style="display:flex;gap:6px">
      <button class="btn btn-primary" style="width:auto;padding:7px 16px" onclick="saveBlock('${block.id}')">save changes</button>
    </div>
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

// ===== GEMINI API CALL =====
async function callGemini(prompt) {
  const result = await chrome.storage.local.get(['geminiApiKey', 'selectedModel']);
  const apiKey = result.geminiApiKey;
  const model = result.selectedModel || 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('No API key configured. Go to Settings tab to add your Gemini API key.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.3
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('No response from Gemini. Try again.');
  }

  return text;
}

// ===== RESUME TAILORING =====
async function tailorResume() {
  const jd = document.getElementById('jdInput').value.trim();
  if (!jd) { alert('Paste a job description first.'); return; }
  if (selectedBlocks.size === 0) { alert('Select at least one block.'); return; }

  const btn = document.getElementById('tailorBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>tailoring...';

  document.getElementById('keywordsBox').style.display = 'none';
  document.getElementById('thinkingBox').style.display = 'none';
  document.getElementById('outputArea').innerHTML = '<span class="output-placeholder">generating...</span>';

  const chosenExp = BLOCKS.experience.filter(b => selectedBlocks.has(b.id));
  const chosenProj = BLOCKS.projects.filter(b => selectedBlocks.has(b.id));
  const blocksForPrompt = [...chosenExp, ...chosenProj].map(b => `[BLOCK: ${b.name}]\n${b.tex}`).join('\n\n');
  const staticSkills = BLOCKS.static.find(b => b.id === 'static_skills');

  const prompt = `You are a resume tailoring assistant for Jonathan Liang, a CS + EE freshman at University of Michigan (GPA 3.68).

JOB DESCRIPTION:
${jd}

RESUME BLOCKS AVAILABLE (LaTeX):
${blocksForPrompt}

CURRENT SKILLS SECTION:
${staticSkills?.tex || ''}

Your task:
1. Extract the top 10-15 ATS keywords/skills from the JD (both hard skills and soft signals)
2. For each selected block, rewrite the bullet points to:
   - Naturally incorporate relevant keywords from the JD without keyword stuffing
   - Emphasize the most relevant aspects for this specific role
   - Keep the same LaTeX structure and commands exactly
   - Keep numbers/metrics intact
   - Do not fabricate new experiences
3. Suggest any updates to the skills section (add/reorder languages or technologies that appear in the JD)
4. Output the full tailored LaTeX for experience + projects sections (not heading/education)

First write <thinking> tags with: which keywords are most critical, which blocks are most/least relevant, and your tailoring strategy.

Then output:
KEYWORDS: [comma-separated list of extracted keywords]
MISSING: [keywords from JD not currently in resume]

Then the tailored LaTeX blocks, each wrapped like:
---BLOCK: [block name]---
[tailored latex]
---END---

Then a tailored skills line:
SKILLS_TEX: [updated \\textbf{Languages}... line only, or UNCHANGED if no update needed]`;

  try {
    const text = await callGemini(prompt);
    lastOutput = text;
    parseOutput(text);
  } catch (err) {
    document.getElementById('outputArea').textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  btn.textContent = 'tailor resume →';
}

function parseOutput(text) {
  // Extract thinking
  const thinkMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/);
  if (thinkMatch) {
    const thinkBox = document.getElementById('thinkingBox');
    thinkBox.style.display = 'block';
    thinkBox.innerHTML = `<div class="thinking-strip"><div class="thinking-label">tailoring notes</div>${thinkMatch[1].trim()}</div>`;
  }

  // Extract keywords
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
        ${missingList.map(k => `<span class="chip missing" title="missing from resume">⚠ ${k}</span>`).join('')}
      </div>
    </div>`;
  }

  // Extract blocks and assemble full tex
  const blockMatches = [...text.matchAll(/---BLOCK: (.+?)---\n([\s\S]*?)---END---/g)];
  const skillsMatch = text.match(/SKILLS_TEX:\s*([\s\S]+?)(?:\n\n|$)/);

  const chosenExpIds = BLOCKS.experience.filter(b => selectedBlocks.has(b.id)).map(b => b.id);
  const chosenProjIds = BLOCKS.projects.filter(b => selectedBlocks.has(b.id)).map(b => b.id);

  const tailoredMap = {};
  blockMatches.forEach(m => { tailoredMap[m[1].trim()] = m[2].trim(); });

  let expTex = chosenExpIds.map(id => {
    const block = BLOCKS.experience.find(b => b.id === id);
    return tailoredMap[block.name] || block.tex;
  }).join('\n\n');

  let projTex = chosenProjIds.map(id => {
    const block = BLOCKS.projects.find(b => b.id === id);
    return tailoredMap[block.name] || block.tex;
  }).join('\n\n');

  const heading = BLOCKS.static.find(b => b.id === 'static_heading')?.tex || '';
  const education = BLOCKS.static.find(b => b.id === 'static_education')?.tex || '';
  let skillsTex = BLOCKS.static.find(b => b.id === 'static_skills')?.tex || '';
  if (skillsMatch && skillsMatch[1].trim() !== 'UNCHANGED') {
    skillsTex = skillsTex.replace(/\\textbf\{Languages\}.*?(?=\\\\|$)/, skillsMatch[1].trim());
  }

  const fullTex = [
    RESUME_PREAMBLE,
    '',
    heading,
    '',
    '%-----------EDUCATION-----------%',
    education,
    '',
    '%-----------EXPERIENCE-----------%',
    '\\section{Experience}',
    '\\resumeSubHeadingListStart',
    expTex,
    '\\resumeSubHeadingListEnd',
    '',
    '%-----------PROJECTS-----------%',
    '\\section{Projects}',
    '\\resumeSubHeadingListStart',
    projTex,
    '\\resumeSubHeadingListEnd',
    '',
    skillsTex,
    '',
    '\\end{document}'
  ].join('\n');

  document.getElementById('outputArea').textContent = fullTex;
}

function copyOutput() {
  const text = document.getElementById('outputArea').textContent;
  if (!text || text.includes('Tailored LaTeX')) return;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById('copyOutputBtn');
  btn.textContent = 'copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'copy .tex'; btn.classList.remove('copied'); }, 1500);
}

// ===== COVER LETTER GENERATION =====
async function generateCoverLetter() {
  const company = document.getElementById('clCompany').value.trim();
  const role = document.getElementById('clRole').value.trim();
  const jd = document.getElementById('clJD').value.trim();
  const notes = document.getElementById('clNotes').value.trim();
  const tone = document.getElementById('clTone').value;

  if (!company || !role) { alert('Enter at least company name and role.'); return; }
  if (!jd) { alert('Paste a job description or key requirements.'); return; }

  const btn = document.getElementById('clBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>generating...';

  document.getElementById('clOutput').innerHTML = '<span class="output-placeholder">generating...</span>';

  const result = await chrome.storage.local.get(['personalInfo']);
  const info = result.personalInfo || {};

  const prompt = `Write a cover letter for Jonathan Liang applying to this position.

APPLICANT INFO:
Name: Jonathan Liang
Email: ${info.email || 'jonliang@umich.edu'}
Phone: ${info.phone || '(309) 361-7377'}
Education: B.S.E Computer Science, Minor Electrical Engineering, University of Michigan, GPA 3.68, Expected May 2028

POSITION:
Company: ${company}
Role: ${role}

JOB DESCRIPTION / REQUIREMENTS:
${jd}

${notes ? 'APPLICANT NOTES: ' + notes : ''}

RESUME CONTEXT (Jonathan's background):
- Web Development Contractor (Freelance, Mar 2020–Present): 16+ web apps, Next.js, SEO, $10K+ revenue
- Helivox Lead Developer (Jan 2023–May 2025): Next.js, full-stack, 75+ team members, 70% data entry reduction
- MIT Beaver Works (Jul–Aug 2024): Hardware engineering, PCB design, CAD, sensor integration
- Discord App Platform: 40,000+ users, OAuth, Redis, MongoDB, 99.9% uptime
- Celiac Disease CNN Research: Deep learning, NCBI GEO, computational biology
- SemComp: Semantic text classification, 86% accuracy, PyTorch
- Crypto Monte Carlo Simulator: Geometric Brownian Motion, risk analysis, VaR
- Multi-Chain USDC Payment Indexer: Rust, Tokio, PostgreSQL, Ethereum/Base/Polygon
- Skills: C, C++, Rust, TypeScript, Python, MATLAB, Solidity, PyTorch, NextJS, Docker, AWS
- Awards: Google Code Jam Round 2 (2022), USACO Gold (2024)

TONE: ${tone}

Requirements:
- Keep it to 3-4 paragraphs, concise and impactful
- Use specific metrics from Jonathan's experience where relevant
- Don't just repeat the resume — tell a story about why Jonathan is a great fit
- Match the tone requested
- Format as plain text (not LaTeX), ready to paste into email or document
- Include proper salutation and sign-off
- Use Jonathan's email in the sign-off`;

  try {
    const text = await callGemini(prompt);
    lastCoverLetter = text;
    document.getElementById('clOutput').textContent = text;
  } catch (err) {
    document.getElementById('clOutput').textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  btn.textContent = 'generate cover letter →';
}

function copyCoverLetter() {
  const text = document.getElementById('clOutput').textContent;
  if (!text || text.includes('cover letter will appear')) return;
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
  
  // Save model when changed
  document.getElementById('modelSelect').addEventListener('change', saveModel);
});
