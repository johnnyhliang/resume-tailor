// ===== STATE =====
let leadsPage = 0;
let selectedBlocks = new Set(
  [...BLOCKS.experience, ...BLOCKS.projects].filter(b => b.active).map(b => b.id)
);
// Include new active blocks by default
selectedBlocks.add('exp_synthesis');
selectedBlocks.add('exp_spark');
selectedBlocks.add('proj_mcp');
selectedBlocks.add('proj_defi');
selectedBlocks.add('proj_gainz');
let activeLibItem = null;
let extractedKeywords = new Set();
let blockScores = {};
let tailoredContent = {}; // Stores tailored bullets for preview

// ===== PWA SHARE TARGET HANDLING =====
function handleShareTarget() {
  const urlParams = new URLSearchParams(window.location.search);
  const text = urlParams.get('text') || '';
  const url = urlParams.get('url') || '';
  const title = urlParams.get('title') || '';

  if (text || url || title) {
    const jd = `${title}\n\n${text}\n\n${url}`.trim();
    document.getElementById('jdInput').value = jd;
    updateKeywordDisplay();
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ===== RESUME KEYWORD EXTRACTION (Feature C) =====
function getResumeKeywords() {
  const activeExp = BLOCKS.experience.filter(b => selectedBlocks.has(b.id));
  const activeProj = BLOCKS.projects.filter(b => selectedBlocks.has(b.id));
  const skills = BLOCKS.static.find(b => b.id === 'static_skills')?.tex || '';
  
  const allText = [...activeExp, ...activeProj].map(b => b.tex).join(' ') + ' ' + skills;
  return extractKeywords(allText);
}

function calculateFitScore(lead, resumeKeywords) {
  if (!resumeKeywords || resumeKeywords.size === 0) return 0;
  const leadText = `${lead.company} ${lead.role} ${lead.location} ${lead.what_they_do} ${lead.outreach_angle}`.toLowerCase();
  let matches = 0;
  for (const kw of resumeKeywords) {
    if (leadText.includes(kw.toLowerCase())) matches++;
  }
  // Normalize to 0-100 (cap at 100)
  return Math.min(100, Math.round((matches / 10) * 100)); 
}

// ===== WEEKLY DIGEST (Feature D) =====
async function runWeeklyDigest() {
  const rows = loadTracker();
  const leads = loadLeads();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7*86400000);
  const today = now.toISOString().slice(0, 10);
  
  const inWeek = rows.filter(r => r.date && new Date(r.date) >= weekAgo);
  const RESPONSE = new Set(['recruiter_screen','technical','onsite','offer']);
  const responseRate = arr => arr.length ? Math.round(100 * arr.filter(r => RESPONSE.has(r.status)).length / arr.length) : 0;
  const thisRate = responseRate(inWeek);
  
  const prompt = `You are a career coach reviewing Jonathan Liang's job search progress for the past week.
  
STATS:
- Apps sent this week: ${inWeek.length}
- Response rate: ${thisRate}%
- Leads in queue: ${leads.filter(l => l.status === 'new').length}
- Total tracked apps: ${rows.length}

Generate a concise "Weekly Digest" email draft in Markdown.
Include:
1. Performance summary (be encouraging but honest).
2. 3-4 specific action items for next week.
3. A "Wins" section if any offers or interviews happened.
4. A "Focus Area" (e.g. "volume is low, apply more" or "response rate is low, refine resume").

Output Markdown only.`;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = '<div style="color:white;font-family:var(--mono)">Generating digest with Gemini...</div>';
  document.body.appendChild(overlay);

  try {
    const text = await callGemini(prompt);
    overlay.innerHTML = `
      <div style="background:var(--bg);max-width:700px;width:100%;max-height:90vh;overflow:auto;padding:24px;border:1px solid var(--border2);border-radius:8px;position:relative">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span style="font-family:var(--display);font-size:18px;font-weight:600">Weekly Digest</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(this.dataset.md);this.textContent='copied!'" data-md="${text.replace(/"/g,'&quot;')}">copy markdown</button>
          <button class="copy-btn" style="margin-left:auto" onclick="this.closest('[style*=\\'position:fixed\\']').remove()">close</button>
        </div>
        <div style="white-space:pre-wrap;font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--text)">${text.replace(/[<>&]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>
      </div>
    `;
  } catch (err) {
    overlay.innerHTML = `<div style="background:white;padding:20px;border-radius:8px;color:var(--warn)">Error: ${err.message} <button onclick="this.closest('[style*=\\'position:fixed\\']').remove()">close</button></div>`;
  }
}

// ===== KEYWORD EXTRACTION =====
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','is','are',
  'was','were','be','been','being','have','has','had','do','does','did','will','would','could',
  'should','may','might','shall','can','need','must','it','its','this','that','these','those',
  'i','you','he','she','we','they','me','him','her','us','them','my','your','his','our','their',
  'what','which','who','whom','where','when','how','why','not','no','nor','so','if','then','than',
  'too','very','just','about','up','out','into','over','after','before','between','through','during',
  'above','below','again','further','once','here','there','all','each','every','both','few','more',
  'most','other','some','such','only','own','same','as','also','back','get','go','make','know',
  'take','see','come','want','look','use','find','give','tell','work','call','try','ask','seem',
  'feel','bec','well','way','even','new','because','able','via','yet','while','ability','across',
  'against','along','among','area','around','based','both','case','change','city','company','day',
  'develop','does','done','down','early','effect','end','enough','example','experience','fact',
  'family','following','form','forms','general','given','good','great','group','hand','high','hold',
  'however','important','include','including','instead','involved','keep','kind','large','later',
  'least','less','likely','line','little','long','low','main','maintain','many','matter','mean',
  'member','members','money','month','move','much','must','name','near','next','often','order',
  'part','past','people','per','place','plan','point','position','possible','present','problem',
  'process','product','professional','program','provide','public','real','related','report',
  'required','requirements','result','role','run','school','second','set','several','show','side',
  'similar','since','small','social','specific','state','still','strong','student','study','success',
  'support','sure','system','team','than','thing','things','those','thought','three','throughout',
  'time','today','together','type','under','understand','usually','various','version','view',
  'want','water','week','within','without','won','world','within','writing','year','years','yourself'
]);

function extractKeywords(jdText) {
  if (!jdText) return new Set();
  
  const tokens = jdText.toLowerCase()
    .replace(/[^a-z0-9\s\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));
  
  const keywords = new Set();
  const freq = {};
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.length >= 3) {
      freq[token] = (freq[token] || 0) + 1;
    }
    // Bigrams
    if (i < tokens.length - 1) {
      const bigram = token + ' ' + tokens[i + 1];
      if (bigram.length >= 5 && !STOP_WORDS.has(token) && !STOP_WORDS.has(tokens[i + 1])) {
        freq[bigram] = (freq[bigram] || 0) + 1;
      }
    }
  }
  
  for (const [term, count] of Object.entries(freq)) {
    if (term.includes(' ') && count >= 1) {
      keywords.add(term);
    } else if (count >= 2) {
      keywords.add(term);
    }
  }
  
  const techPatterns = ['javascript','typescript','python','react','next','node','sql','database',
    'aws','docker','kubernetes','api','rest','graphql','machine','learning','data','analysis',
    'frontend','backend','fullstack','agile','scrum','ci/cd','git','linux','cloud','web',
    'mobile','test','testing','design','system','performance','security','type','safety',
    'rust','cpp','cxx','java','ruby','swift','kotlin','flutter','react','angular','vue',
    'mongodb','postgres','mysql','redis','elastic','microservice','serverless','devops'];
  
  const lower = jdText.toLowerCase();
  for (const tech of techPatterns) {
    if (lower.includes(tech)) {
      keywords.add(tech);
    }
  }
  
  const sorted = [...keywords].sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
  return new Set(sorted.slice(0, 20));
}

function scoreBlock(block, keywords) {
  if (!keywords || keywords.size === 0) return 0;
  const text = stripLatex(block.tex).toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) {
      matches++;
    }
  }
  return matches;
}

function updateKeywordDisplay() {
  const jd = document.getElementById('jdInput').value.trim();
  extractedKeywords = extractKeywords(jd);
  
  blockScores = {};
  [...BLOCKS.experience, ...BLOCKS.projects].forEach(b => {
    blockScores[b.id] = scoreBlock(b, extractedKeywords);
  });
  
  const kwBox = document.getElementById('keywordsBox');
  if (extractedKeywords.size > 0) {
    kwBox.style.display = 'block';
    const topKeywords = [...extractedKeywords].slice(0, 15);
    kwBox.innerHTML = `<div class="keywords-box">
      <div class="keywords-title">top jd keywords</div>
      <div class="keyword-chips">
        ${topKeywords.map(k => `<span class="chip">${k}</span>`).join('')}
      </div>
    </div>`;
  } else {
    kwBox.style.display = 'none';
    kwBox.innerHTML = '';
  }
  
  renderBlockSelectors();
}

// ===== RESUME HTML RENDERER =====
function renderResumeHTML() {
  const heading = BLOCKS.static.find(b => b.id === 'static_heading')?.tex || '';
  const education = BLOCKS.static.find(b => b.id === 'static_education')?.tex || '';
  const skills = BLOCKS.static.find(b => b.id === 'static_skills')?.tex || '';
  
  const info = getPersonalInfo();
  
  const nameMatch = heading.match(/\\textbf\{\\Huge \\scshape (.+?)\}/);
  const name = nameMatch ? nameMatch[1] : 'Jonathan Liang';
  
  let html = `<div class="preview-header">
    <div class="preview-name">${name}</div>
    <div class="preview-contact">
      ${info.phone || '(309) 361-7377'} | 
      <a href="mailto:${info.email || 'jonliang@umich.edu'}">${info.email || 'jonliang@umich.edu'}</a> | 
      <a href="https://${info.linkedin || ''}">${info.linkedin || 'linkedin.com/in/johnnyhliang'}</a> | 
      <a href="https://${info.github || ''}">${info.github || 'github.com/johnnyhliang'}</a>
    </div>
  </div>`;
  
  const eduLines = education.split('\n').filter(l => l.trim());
  const eduTitle = eduLines.find(l => l.includes('\\resumeSubheading')) || '';
  const schoolMatch = eduTitle.match(/\\resumeSubheading\s*\{([^}]*)\}/);
  const detailsMatch = eduTitle.match(/\{([^}]*)\}\{([^}]*)\}\s*$/);
  
  if (schoolMatch) {
    html += `<div class="preview-section">
      <div class="preview-section-title">Education</div>
      <div class="preview-edu">
        <div class="preview-edu-school">${schoolMatch[1]}</div>
        ${detailsMatch ? `<div class="preview-edu-details">${detailsMatch[1]} | ${detailsMatch[2]}</div>` : ''}
      </div>
    </div>`;
  }
  
  const chosenExp = BLOCKS.experience.filter(b => selectedBlocks.has(b.id));
  const chosenProj = BLOCKS.projects.filter(b => selectedBlocks.has(b.id));
  
  if (chosenExp.length > 0) {
    html += `<div class="preview-section">
      <div class="preview-section-title">Experience</div>`;
    chosenExp.forEach(b => {
      html += renderBlockPreview(b);
    });
    html += `</div>`;
  }
  
  if (chosenProj.length > 0) {
    html += `<div class="preview-section">
      <div class="preview-section-title">Projects</div>`;
    chosenProj.forEach(b => {
      html += renderBlockPreview(b);
    });
    html += `</div>`;
  }
  
  const skillsClean = stripLatex(skills);
  if (skillsClean) {
    html += `<div class="preview-section">
      <div class="preview-section-title">Technical Skills</div>
      <div class="preview-skills">${skillsClean}</div>
    </div>`;
  }
  
  document.getElementById('previewPanel').innerHTML = html;
}

function renderBlockPreview(block) {
  const hasTailored = tailoredContent[block.name];
  const tex = hasTailored || block.tex;
  
  let html = '<div class="preview-block">';
  
  if (tex.includes('\\resumeSubheading')) {
    const titleMatch = tex.match(/\\resumeSubheading\s*\{([^}]*)\}/);
    if (titleMatch) {
      const parts = titleMatch[1].split('\\&');
      html += `<div class="preview-block-title">${parts[0]?.trim() || titleMatch[1]}</div>`;
      if (parts[1]) html += `<div class="preview-block-sub">${parts[1].trim()}</div>`;
    }
  } else if (tex.includes('\\resumeProjectHeading')) {
    const titleMatch = tex.match(/\\resumeProjectHeading\s*\{([^}]*)\}/);
    if (titleMatch) {
      html += `<div class="preview-block-title">${stripLatex(titleMatch[1])}</div>`;
    }
  }
  
  const bullets = extractBulletText(tex);
  if (bullets.length > 0) {
    html += '<ul class="preview-bullets">';
    bullets.forEach(b => {
      html += `<li>${formatLatexInline(b)}</li>`;
    });
    html += '</ul>';
  }
  
  if (hasTailored) {
    html += '<div class="preview-tailored-badge">✓ tailored</div>';
  }
  
  html += '</div>';
  return html;
}

// ===== PDF DOWNLOAD =====
async function downloadPDF() {
  const texContent = document.getElementById('outputArea').textContent;
  if (!texContent || texContent.includes('Tailored LaTeX')) {
    alert('Tailor your resume first to generate a PDF.');
    return;
  }

  const btn = document.getElementById('downloadPdfBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>compiling...';
  document.getElementById('pdfError').style.display = 'none';

  try {
    const encodedTex = encodeURIComponent(texContent);
    const url = `https://latexonline.cc/compile?tex=${encodedTex}&command=pdflatex&force=1`;
    const newTab = window.open(url, '_blank');
    if (!newTab) throw new Error('Popup blocked.');
    setTimeout(() => downloadTexFallback(texContent), 500);
  } catch (err) {
    document.getElementById('pdfError').textContent = 'Error: ' + err.message;
    document.getElementById('pdfError').style.display = 'block';
    setTimeout(() => { document.getElementById('pdfError').style.display = 'none'; }, 5000);
  }

  btn.disabled = false;
  btn.innerHTML = '↓ download PDF';
}

function downloadTexFallback(texContent) {
  const blob = new Blob([texContent], { type: 'application/x-latex' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jonathan_liang_resume.tex';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== SETTINGS =====
function getApiKey() { return localStorage.getItem('gemini_api_key') || ''; }
function getModel() { return localStorage.getItem('gemini_model') || 'gemini-2.5-flash'; }

function saveSettingsToUI() {
  const key = getApiKey();
  if (key) {
    document.getElementById('apiKeyInput').value = key;
    updateApiStatus(true);
  } else {
    updateApiStatus(false);
  }
  document.getElementById('modelSelect').value = getModel();

  const info = getPersonalInfo();
  if (info.email) document.getElementById('settingsEmail').value = info.email;
  if (info.phone) document.getElementById('settingsPhone').value = info.phone;
  if (info.linkedin) document.getElementById('settingsLinkedin').value = info.linkedin;
  if (info.github) document.getElementById('settingsGithub').value = info.github;
  if (info.website) document.getElementById('settingsWebsite').value = info.website;
  document.getElementById('personalContext').value = getPersonalContext();
}

function updateApiStatus(connected) {
  const el = document.getElementById('apiStatus');
  if (connected) {
    el.textContent = '● gemini connected';
    el.className = 'api-status connected';
  } else {
    el.textContent = '⚙ set API key';
    el.className = 'api-status error';
  }
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) { alert('Enter an API key first.'); return; }
  localStorage.setItem('gemini_api_key', key);
  updateApiStatus(true);
  const msg = document.getElementById('saveMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2000);
}

function saveModel() {
  localStorage.setItem('gemini_model', document.getElementById('modelSelect').value);
}

function getPersonalInfo() {
  try { return JSON.parse(localStorage.getItem('personal_info') || '{}'); } catch { return {}; }
}

function savePersonalInfo() {
  const info = {
    email: document.getElementById('settingsEmail').value.trim(),
    phone: document.getElementById('settingsPhone').value.trim(),
    linkedin: document.getElementById('settingsLinkedin').value.trim(),
    github: document.getElementById('settingsGithub').value.trim(),
    website: document.getElementById('settingsWebsite').value.trim()
  };
  localStorage.setItem('personal_info', JSON.stringify(info));
  const msg = document.getElementById('saveMsg');
  msg.textContent = '✓ Personal info saved';
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; msg.textContent = '✓ API key saved'; }, 2000);
}

function getPersonalContext() { return localStorage.getItem('personal_context') || ''; }

function savePersonalContext() {
  const ctx = document.getElementById('personalContext').value.trim();
  localStorage.setItem('personal_context', ctx);
  const msg = document.getElementById('saveMsg');
  msg.textContent = '✓ Context saved';
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; msg.textContent = '✓ API key saved'; }, 2000);
}

// ===== NAVIGATION =====
function switchTab(tab) {
  const map = { 'tailor': 'tailor', 'cover letter': 'coverletter', 'dossier': 'dossier', 'outreach': 'outreach', 'ats check': 'ats', 'tracker': 'tracker', 'interview prep': 'prep', 'email parser': 'email', 'leads': 'leads', 'block library': 'library', 'settings': 'settings' };
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', map[t.textContent.trim()] === tab);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  if (tab === 'tracker') renderTracker();
  if (tab === 'leads') renderLeads();
  if (tab === 'library') { renderLibrary(); setTimeout(renderBlockStats, 0); }
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
  const score = blockScores[block.id] || 0;
  const hasScore = Object.keys(blockScores).length > 0;
  
  const el = document.createElement('div');
  el.className = 'block-toggle' + (selectedBlocks.has(block.id) ? ' selected' : '') + 
    (!hasScore || score === 0 ? ' muted-block' : '');
  el.onclick = () => {
    if (selectedBlocks.has(block.id)) selectedBlocks.delete(block.id);
    else selectedBlocks.add(block.id);
    el.classList.toggle('selected');
    el.querySelector('.block-check').textContent = selectedBlocks.has(block.id) ? '✓' : '';
    renderResumeHTML();
  };
  el.innerHTML = `
    <div class="block-check">${selectedBlocks.has(block.id) ? '✓' : ''}</div>
    <div class="block-info">
      <div class="block-name">${block.name}</div>
      <div class="block-meta">${block.meta}</div>
      ${hasScore ? `<div class="block-badge">${score} matches</div>` : ''}
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
      const showStat = key === 'experience' || key === 'projects';
      el.innerHTML = `
        <div class="lib-dot ${b.active ? 'active-block' : 'inactive-block'}"></div>
        <div style="flex:1">
          <div class="lib-item-name">${b.name}</div>
          <div class="lib-item-meta">${b.meta}</div>
          ${showStat ? `<div data-blockstat-id="${b.id}" style="font-family:var(--mono);font-size:10px;margin-top:2px">—</div>` : ''}
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

  const isContent = block.id.startsWith('static') ? false : true;
  const bulletStatsHtml = isContent ? renderBulletStats(block) : '';
  editor.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:14px;font-weight:600">${block.name}</span>
      <span style="font-family:var(--mono);font-size:11px;color:var(--muted)">${block.meta}</span>
      <button class="copy-btn" id="libCopyBtn" onclick="copyBlock('${block.id}')">copy</button>
    </div>
    ${bulletStatsHtml}
    <textarea id="libTexArea" rows="20" style="flex:1;min-height:300px">${block.tex.replace(/</g, '&lt;')}</textarea>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" style="width:auto;padding:8px 20px" onclick="saveBlock('${block.id}')">save changes</button>
    </div>
  `;
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

// ===== RESUME TAILORING =====
async function fetchJdFromUrl() {
  const url = document.getElementById('jdUrl').value.trim();
  if (!url) { alert('Enter a URL first.'); return; }
  
  const btn = event.target;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'fetching...';
  
  try {
    // Note: Direct browser fetch will likely fail due to CORS. 
    // In a real extension/app, this would go through a background script or proxy.
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not fetch URL. CORS might be blocking this request.');
    const html = await res.text();
    
    // Simple text extraction from HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Remove scripts/styles
    doc.querySelectorAll('script, style').forEach(el => el.remove());
    const text = doc.body.innerText.replace(/\s+/g, ' ').trim();
    
    document.getElementById('jdInput').value = text;
    updateKeywordDisplay();
  } catch (err) {
    alert('Error: ' + err.message + '\n\nTry pasting the JD manually if CORS is blocking.');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function tailorResume() {
  const jd = document.getElementById('jdInput').value.trim();
  if (!jd) { alert('Paste a job description first.'); return; }
  if (selectedBlocks.size === 0) { alert('Select at least one block.'); return; }

  const btn = document.getElementById('tailorBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>tailoring...';

  document.getElementById('keywordsBox').style.display = 'none';
  document.getElementById('thinkingBox').style.display = 'none';
  document.getElementById('scorecardBox').style.display = 'none';
  document.getElementById('outputArea').innerHTML = '<span class="output-placeholder">generating...</span>';

  const chosenExp = BLOCKS.experience.filter(b => selectedBlocks.has(b.id));
  const chosenProj = BLOCKS.projects.filter(b => selectedBlocks.has(b.id));
  
  const blocksForPrompt = [...chosenExp, ...chosenProj].map(b => {
    const bullets = extractBulletText(b.tex);
    return `[BLOCK: ${b.name}]\n${bullets.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
  }).join('\n\n');
  
  const staticSkills = BLOCKS.static.find(b => b.id === 'static_skills');
  const skillsPlain = stripLatex(staticSkills?.tex || '');

  const prompt = `You are a resume tailoring assistant for Jonathan Liang, a CS + EE freshman at University of Michigan (GPA 3.68).

JOB DESCRIPTION:
${jd}

RESUME BLOCKS (plain text bullets):
${blocksForPrompt}

CURRENT SKILLS:
${skillsPlain}

Your task:
1. Extract the top 10-15 ATS keywords/skills from the JD.
2. For each selected block, rewrite the bullet points to incorporate JD keywords and emphasize relevance.
3. Suggest skills section updates.
4. Provide an ATS SCORECARD with:
   - match_score: 0-100 percentage based on keyword overlap and role relevance
   - critical_gaps: list of keywords/skills in JD but missing in resume
   - smart_suggestions: 3-4 actionable tips to further improve this specific application

First write <thinking> tags with strategy.

Then output:
KEYWORDS: [comma-separated list]
MISSING: [keywords from JD not in resume]

SCORECARD_JSON:
{
  "match_score": 85,
  "critical_gaps": ["distributed systems", "gRPC"],
  "smart_suggestions": ["Mention your gRPC experience in the multi-chain indexer block", "Highlight scale metrics for the Discord bot"]
}

Then the tailored bullets wrapped like:
---BLOCK: [block name]---
1. [rewritten bullet]
...
---END---

Then skills update:
SKILLS: [updated skills line, or UNCHANGED]

Then truthfulness audit:
TRUTHFULNESS: [flags or NONE]`;

  try {
    const text = await callGemini(prompt);
    parseOutput(text);
  } catch (err) {
    document.getElementById('outputArea').textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  btn.textContent = 'tailor resume →';
}

function parseOutput(text) {
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

  // Parse Scorecard
  const scorecardMatch = text.match(/SCORECARD_JSON:\s*(\{[\s\S]*?\})/);
  if (scorecardMatch) {
    try {
      const data = JSON.parse(scorecardMatch[1]);
      renderScorecard(data);
    } catch (e) { console.error('Scorecard parse error', e); }
  }

  const truthMatch = text.match(/TRUTHFULNESS:\s*([\s\S]+?)(?:\n\n|$)/);
  const truthBox = document.getElementById('truthBox');
  if (truthMatch) {
    const content = truthMatch[1].trim();
    truthBox.style.display = 'block';
    if (/^none$/i.test(content)) {
      truthBox.innerHTML = `<div class="truth-strip clean"><div class="truth-label">truthfulness: clean</div>No novel claims detected.</div>`;
    } else {
      const lines = content.split('\n').filter(l => l.trim()).map(l => '• ' + l.replace(/^[-•*]\s*/, '')).join('\n');
      truthBox.innerHTML = `<div class="truth-strip"><div class="truth-label">⚠ truthfulness flags</div>${lines}</div>`;
    }
  }

  const blockMatches = [...text.matchAll(/---BLOCK: (.+?)---\n([\s\S]*?)---END---/g)];
  const skillsMatch = text.match(/SKILLS:\s*([\s\S]+?)(?:\n\n|\nTRUTHFULNESS:|$)/);

  const tailoredMap = {};
  blockMatches.forEach(m => {
    const blockName = m[1].trim();
    const bulletText = m[2].trim();
    const bullets = [...bulletText.matchAll(/^\d+\.\s+(.+?)(?=\n\d+\.|$)/gm)].map(m => m[1].trim());
    if (bullets.length > 0) {
      tailoredMap[blockName] = reconstructLatexItems(blockName, bullets);
    }
  });

  const chosenExpIds = BLOCKS.experience.filter(b => selectedBlocks.has(b.id)).map(b => b.id);
  const chosenProjIds = BLOCKS.projects.filter(b => selectedBlocks.has(b.id)).map(b => b.id);

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
    const newSkills = skillsMatch[1].trim();
    const skillsReplaceRegex = /(\\textbf\{Languages\}\{?:.*?)(?=\\\\|\})/;
    if (skillsReplaceRegex.test(skillsTex)) {
      skillsTex = skillsTex.replace(skillsReplaceRegex, newSkills);
    } else {
      skillsTex += '\n% Updated: ' + newSkills;
    }
  }

  const fullTex = [
    RESUME_PREAMBLE, '', heading, '',
    '%-----------EDUCATION-----------%', education, '',
    '%-----------EXPERIENCE-----------%', '\\section{Experience}', '\\resumeSubHeadingListStart', expTex, '\\resumeSubHeadingListEnd', '',
    '%-----------PROJECTS-----------%', '\\section{Projects}', '\\resumeSubHeadingListStart', projTex, '\\resumeSubHeadingListEnd', '',
    skillsTex, '', '\\end{document}'
  ].join('\n');

  document.getElementById('outputArea').textContent = fullTex;
  updatePreviewWithTailoredContent(tailoredMap);
}

function renderScorecard(data) {
  const box = document.getElementById('scorecardBox');
  box.style.display = 'block';
  
  box.innerHTML = `
    <div class="scorecard">
      <div class="scorecard-header">
        <span class="scorecard-title">ATS Scorecard</span>
        <div>
          <span class="match-score">${data.match_score}%</span>
          <span class="score-label">match</span>
        </div>
      </div>
      
      <div class="scorecard-section">
        <div class="scorecard-section-title">Critical Gaps</div>
        <div class="keyword-chips">
          ${data.critical_gaps.map(g => `<span class="chip missing">${g}</span>`).join('')}
        </div>
      </div>
      
      <div class="scorecard-section">
        <div class="scorecard-section-title">Smart Suggestions</div>
        <div class="smart-suggestions">
          ${data.smart_suggestions.map(s => `<div class="smart-suggestion-item">• ${s}</div>`).join('')}
        </div>
      </div>
    </div>
  `;
}


function updatePreviewWithTailoredContent(tailoredMap) {
  tailoredContent = tailoredMap;
  renderResumeHTML();
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

// ===== COVER LETTER =====
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

  const info = getPersonalInfo();
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
- Format as plain text, ready to paste into email or document
- Include proper salutation and sign-off
- Use Jonathan's email in the sign-off`;

  try {
    const text = await callGemini(prompt);
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

// ===== DOSSIER =====
async function generateDossier() {
  const company = document.getElementById('dsCompany').value.trim();
  const role = document.getElementById('dsRole').value.trim();
  const ctx = document.getElementById('dsContext').value.trim();
  if (!company) { alert('Enter a company name'); return; }

  const btn = document.getElementById('dsBtn');
  btn.disabled = true; btn.textContent = 'researching...';
  const out = document.getElementById('dsOutput');
  out.textContent = 'Generating dossier...';

  const prompt = `You are a research assistant producing a job-search dossier on a company. Use only reliable knowledge. Clearly label anything that might be stale. Prefer short, concrete, decision-useful bullets over fluff.

COMPANY: ${company}
${role ? 'TARGET ROLE: ' + role : ''}
${ctx ? 'EXTRA CONTEXT PROVIDED BY USER:\n' + ctx : ''}

Produce a dossier with markdown headers: What they do, Signals of momentum, Likely tech stack, Who to target, Three smart interview questions, Three tailoring angles, Risks / red flags.

End with a single line: "Verify all time-sensitive facts before citing in an application."`;

  try {
    const text = await callGemini(prompt);
    out.innerHTML = renderMarkdownLite(text);
  } catch (err) {
    out.textContent = 'Error: ' + err.message;
  }
  btn.disabled = false; btn.textContent = 'generate dossier →';
}

function copyDossier() {
  const text = document.getElementById('dsOutput').innerText;
  if (!text || text.includes('Dossier will appear')) return;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById('copyDsBtn');
  btn.textContent = 'copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1500);
}

// ===== OUTREACH =====
async function generateOutreach() {
  const type = document.getElementById('orType').value;
  const recipient = document.getElementById('orRecipient').value.trim();
  const company = document.getElementById('orCompany').value.trim();
  const hook = document.getElementById('orHook').value.trim();
  let pitch = document.getElementById('orPitch').value.trim();

  if (!hook) { alert('Specific hook is required.'); return; }
  if (!pitch) {
    const exp = BLOCKS.experience.slice(0, 2).map(b => extractBulletText(b.tex).slice(0, 2).join(' ')).join(' | ');
    pitch = `UMich CS + EE student. Highlights: ${exp}`.slice(0, 600);
  }

  const btn = document.getElementById('orBtn');
  btn.disabled = true; btn.textContent = 'drafting...';
  const out = document.getElementById('orOutput');
  out.textContent = 'Drafting message...';

  const prompt = `You are drafting a ${type.replace('_',' ')} message for Jonathan Liang.
HOOK: ${hook}
SENDER PITCH: ${pitch}
COMPANY: ${company}
RECIPIENT: ${recipient}

Draft a message under 150 words. Output format: SUBJECT: ... [message body] --- NOTES: ...`;

  try {
    const text = await callGemini(prompt);
    out.innerHTML = renderMarkdownLite(text);
  } catch (err) {
    out.textContent = 'Error: ' + err.message;
  }
  btn.disabled = false; btn.textContent = 'draft message →';
}

function copyOutreach() {
  const raw = document.getElementById('orOutput').innerText;
  if (!raw || raw.includes('Draft will appear')) return;
  const body = raw.split(/^-{3,}$/m)[0].trim();
  navigator.clipboard.writeText(body);
  const btn = document.getElementById('copyOrBtn');
  btn.textContent = 'copied!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1800);
}

// ===== ATS CHECK =====
let atsLastReportText = '';
async function runAtsCheck() {
  const fileInput = document.getElementById('atsPdfInput');
  const file = fileInput.files[0];
  const out = document.getElementById('atsOutput');
  if (!file) { alert('Upload PDF first.'); return; }
  const btn = document.getElementById('atsBtn');
  btn.disabled = true; btn.textContent = 'parsing...';
  out.textContent = 'Extracting text...';

  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(it => it.str).join(' ') + '\n\n';
    }
    const report = buildAtsReport(fullText, document.getElementById('atsJd').value.trim(), pdf.numPages);
    atsLastReportText = report.plain;
    out.innerHTML = report.html;
  } catch (err) { out.textContent = 'Error: ' + err.message; }
  btn.disabled = false; btn.textContent = 'run ATS check →';
}

function buildAtsReport(text, jd, numPages) {
  const findings = [];
  const push = (level, msg) => findings.push({ level, msg });
  const lower = text.toLowerCase();
  push('info', `PDF parsed: ${numPages} page(s), ${text.split(/\s+/).length} words`);

  ['Education', 'Experience', 'Projects', 'Skills'].forEach(s => {
    if (new RegExp(s, 'i').test(text)) push('ok', `Section found: ${s}`);
    else push('warn', `Missing section: ${s}`);
  });

  if (text.includes('@')) push('ok', 'Email found'); else push('fail', 'No email found');
  
  let kwBlock = null;
  if (jd) {
    const jdKeywords = [...extractKeywords(jd)].slice(0, 25);
    const present = jdKeywords.filter(k => lower.includes(k.toLowerCase()));
    const missing = jdKeywords.filter(k => !lower.includes(k.toLowerCase()));
    const coverage = Math.round(100 * present.length / jdKeywords.length);
    kwBlock = { coverage, present, missing };
    push(coverage >= 70 ? 'ok' : 'warn', `Keyword coverage: ${coverage}%`);
  }

  const preview = text.slice(0, 1000).replace(/\s+/g, ' ').trim();
  const colorFor = l => l === 'ok' ? 'var(--accent)' : l === 'warn' ? 'var(--warn)' : '#c62828';
  let html = findings.map(f => `<div style="color:${colorFor(f.level)}"><strong>${f.level === 'ok' ? '✓' : '⚠'}</strong> ${f.msg}</div>`).join('');
  if (kwBlock) {
    html += `<div style="margin-top:10px">Missing: ${kwBlock.missing.map(k=>`<span class="chip missing">${k}</span>`).join('')}</div>`;
  }
  html += `<div style="background:var(--surface2);padding:10px;margin-top:10px;font-size:11px">${preview}...</div>`;

  return { html, plain: findings.map(f => f.msg).join('\n') + '\n\n' + preview };
}

function copyAtsReport() {
  if (!atsLastReportText) return;
  navigator.clipboard.writeText(atsLastReportText);
  const btn = document.getElementById('atsCopyBtn');
  btn.textContent = 'copied!';
  setTimeout(() => btn.textContent = 'copy text', 1500);
}

// ===== TRACKER =====
const TRACKER_KEY = 'resume_tracker_v1';
const TRACKER_STATUSES = ['applied', 'followup_sent', 'recruiter_screen', 'technical', 'onsite', 'offer', 'rejected', 'ghosted', 'withdrew'];
function loadTracker() { try { return JSON.parse(localStorage.getItem(TRACKER_KEY) || '[]'); } catch { return []; } }
function saveTracker(rows) { localStorage.setItem(TRACKER_KEY, JSON.stringify(rows)); }

function addTrackerRow() {
  const rows = loadTracker();
  rows.unshift({ id: 't_'+Date.now(), date: new Date().toISOString().slice(0,10), company: '', role: '', status: 'applied', followup: '', notes: '' });
  saveTracker(rows); renderTracker();
}

function updateTrackerField(id, field, value) {
  const rows = loadTracker();
  const r = rows.find(x => x.id === id); if (!r) return;
  r[field] = value; saveTracker(rows);
  if (field === 'status' || field === 'followup') renderTracker(); else updateTrackerStats();
}

function renderTracker() {
  const rows = loadTracker();
  const tbody = document.getElementById('trackerBody');
  if (!tbody) return;
  tbody.innerHTML = rows.map(r => `
    <tr style="border-bottom:1px solid var(--border)">
      <td style="padding:4px"><input type="date" value="${r.date||''}" onchange="updateTrackerField('${r.id}','date',this.value)" style="border:none;background:transparent;font-size:11px"></td>
      <td style="padding:4px"><input type="text" value="${escAttr(r.company)}" onblur="updateTrackerField('${r.id}','company',this.value)" style="border:none;background:transparent;font-size:11px"></td>
      <td style="padding:4px"><input type="text" value="${escAttr(r.role)}" onblur="updateTrackerField('${r.id}','role',this.value)" style="border:none;background:transparent;font-size:11px"></td>
      <td style="padding:4px"><select onchange="updateTrackerField('${r.id}','status',this.value)" style="border:none;background:transparent;font-size:11px">${TRACKER_STATUSES.map(s=>`<option value="${s}" ${s===r.status?'selected':''}>${s}</option>`).join('')}</select></td>
      <td style="padding:4px"><input type="date" value="${r.followup||''}" onchange="updateTrackerField('${r.id}','followup',this.value)" style="border:none;background:transparent;font-size:11px"></td>
      <td style="padding:4px"><input type="text" value="${escAttr(r.notes)}" onblur="updateTrackerField('${r.id}','notes',this.value)" style="width:100%;border:none;background:transparent;font-size:11px"></td>
      <td style="padding:4px"><button class="copy-btn" onclick="deleteTrackerRow('${r.id}')">✕</button></td>
    </tr>
  `).join('');
  updateTrackerStats();
}

function deleteTrackerRow(id) {
  if (!confirm('Delete?')) return;
  saveTracker(loadTracker().filter(r => r.id !== id)); renderTracker();
}

function updateTrackerStats() {
  const rows = loadTracker();
  const el = document.getElementById('trackerStats');
  if (el) el.textContent = `${rows.length} apps • offers: ${rows.filter(r=>r.status==='offer').length}`;
}

// ===== PREP PACK =====
async function generatePrepPack() {
  const company = document.getElementById('prepCompany').value.trim();
  const role = document.getElementById('prepRole').value.trim();
  if (!company) { alert('Company required.'); return; }
  const btn = document.getElementById('prepBtn');
  btn.disabled = true; btn.textContent = 'generating...';
  const out = document.getElementById('prepOutput');
  out.textContent = 'Generating...';

  const prompt = `Interview prep for ${role} at ${company}. JD: ${document.getElementById('prepJd').value}. Round: ${document.getElementById('prepRound').value}.`;
  try {
    const text = await callGemini(prompt);
    out.innerHTML = renderMarkdownLite(text);
  } catch (err) { out.textContent = 'Error: ' + err.message; }
  btn.disabled = false; btn.textContent = 'generate prep pack →';
}

function copyPrepPack() {
  navigator.clipboard.writeText(document.getElementById('prepOutput').innerText);
  const btn = document.getElementById('copyPrepBtn');
  btn.textContent = 'copied!';
  setTimeout(() => btn.textContent = 'copy', 1500);
}

// ===== EMAIL PARSER =====
async function parseEmail() {
  const raw = document.getElementById('emInput').value.trim();
  if (!raw) { alert('Paste email.'); return; }
  const btn = document.getElementById('emBtn');
  btn.disabled = true; btn.textContent = 'parsing...';
  const out = document.getElementById('emOutput');
  out.textContent = 'Parsing...';

  const prompt = `Parse recruiting email: ${raw}. Return JSON with fields: company, role, intent, summary, suggested_status, suggested_action, draft_reply.`;
  try {
    const text = await callGemini(prompt);
    const json = JSON.parse(text.replace(/^```json|```$/g, '').trim());
    out.innerHTML = `<pre>${JSON.stringify(json, null, 2)}</pre>`;
  } catch (err) { out.textContent = 'Error: ' + err.message; }
  btn.disabled = false; btn.textContent = 'parse →';
}

// ===== LEADS =====
const LEADS_KEY = 'resume_leads_v1';
function loadLeads() { try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); } catch { return []; } }
function saveLeads(arr) { localStorage.setItem(LEADS_KEY, JSON.stringify(arr)); }

async function ingestLeads() {
  const raw = document.getElementById('leadsRaw').value.trim();
  if (!raw) { alert('Paste source.'); return; }
  const btn = document.getElementById('leadsIngestBtn');
  btn.disabled = true; btn.textContent = 'extracting...';
  const prompt = `Extract hiring leads from: ${raw}. Return JSON {leads: [{company, what_they_do, signal_strength, outreach_angle}]}`;
  try {
    const text = await callGemini(prompt);
    const json = JSON.parse(text.replace(/^```json|```$/g, '').trim());
    saveLeads([...json.leads, ...loadLeads()]);
    renderLeads();
  } catch (err) { alert('Error: ' + err.message); }
  btn.disabled = false; btn.textContent = 'extract leads →';
}

function leadToOutreach(id) {
  const lead = loadLeads().find(l => l.id === id);
  if (!lead) return;
  if (typeof draftOutreach === 'function') {
    draftOutreach(lead.company, lead.role);
  } else {
    alert('Draft outreach for: ' + lead.company + ' — ' + lead.role);
  }
}

function leadToDossier(id) {
  const lead = loadLeads().find(l => l.id === id);
  if (!lead) return;
  if (typeof runDossier === 'function') {
    runDossier(lead.company);
  } else {
    alert('Run dossier for: ' + lead.company);
  }
}

function markLead(id, status) {
  const leads = loadLeads().map(l => l.id === id ? Object.assign({}, l, {status}) : l);
  saveLeads(leads);
  renderLeads();
}

function renderLeads() {
  const PAGE_SIZE = 50;
  const esc = s => (s||'').toString().replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const allLeads = loadLeads();
  const resumeKeywords = getResumeKeywords();

  const kw = (document.getElementById('leadsSearch')||{}).value || '';
  const sig = (document.getElementById('leadsSignal')||{}).value || 'all';
  const st = (document.getElementById('leadsStatus')||{}).value || 'all';
  const src = (document.getElementById('leadsSourceFilter')||{}).value || 'all';

  const kwLower = kw.toLowerCase();
  const filtered = allLeads.filter(l => {
    if (kwLower && !((l.company||'').toLowerCase().includes(kwLower) ||
                     (l.role||'').toLowerCase().includes(kwLower) ||
                     (l.location||'').toLowerCase().includes(kwLower))) return false;
    if (sig !== 'all' && l.signal_strength !== sig) return false;
    if (st !== 'all' && l.status !== st) return false;
    if (src !== 'all' && l.source !== src) return false;
    return true;
  });

  // Calculate fit score for each lead
  filtered.forEach(l => {
    l.fitScore = calculateFitScore(l, resumeKeywords);
  });

  // Sort by fit score desc
  filtered.sort((a, b) => b.fitScore - a.fitScore);

  const statsEl = document.getElementById('leadsStats');
  if (statsEl) statsEl.innerHTML = 'total: ' + allLeads.length + ' | filtered: ' + filtered.length;

  const container = document.getElementById('leadsList');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);padding:20px 0">No leads match the current filters.</div>';
    return;
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (leadsPage < 0) leadsPage = 0;
  if (leadsPage >= totalPages) leadsPage = totalPages - 1;

  const start = leadsPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const page = filtered.slice(start, end);

  const signalStyle = {
    strong: 'background:#d4edda;color:#2d6a2d',
    medium: 'background:#fff3cd;color:#856404',
    weak:   'background:#f8d7da;color:#721c24'
  };
  const statusStyle = {
    new:       'background:var(--accent);color:#fff',
    approached:'background:#6c757d;color:#fff',
    dropped:   'background:var(--warn);color:#fff'
  };
  const badgeBase = 'padding:2px 6px;border-radius:3px;font-size:11px;display:inline-block;margin-left:6px';

  const paginationHtml = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px;font-family:var(--mono)">
      <button class="copy-btn" onclick="leadsPage--;renderLeads()" ${leadsPage===0?'disabled':''}>← prev</button>
      <span style="color:var(--muted)">showing ${start+1}–${end} of ${filtered.length} leads</span>
      <button class="copy-btn" onclick="leadsPage++;renderLeads()" ${leadsPage>=totalPages-1?'disabled':''}>next →</button>
    </div>`;

  const cardsHtml = page.map(l => {
    const id = esc(l.id);
    const company = l.link
      ? `<a href="${esc(l.link)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${esc(l.company)}</a>`
      : esc(l.company);
    const sigBadge = l.signal_strength
      ? `<span style="${signalStyle[l.signal_strength]||''};${badgeBase}">${esc(l.signal_strength)}</span>`
      : '';
    const stBadge = l.status
      ? `<span style="${statusStyle[l.status]||'background:#999;color:#fff'};${badgeBase}">${esc(l.status)}</span>`
      : '';
    const fitBadge = `<span style="background:var(--accent-light);color:var(--accent);border:1px solid var(--accent);${badgeBase}">fit: ${l.fitScore}%</span>`;
    const angle = l.outreach_angle
      ? `<div style="font-style:italic;font-size:11px;color:var(--muted);margin-top:4px">${esc(l.outreach_angle)}</div>`
      : '';
    return `<div style="background:var(--surface);border:1px solid var(--border);padding:12px;margin-bottom:8px;border-radius:4px">
      <div style="margin-bottom:6px">
        <strong>${company}</strong>
        <span style="color:var(--muted)"> — </span>${esc(l.role)}
        <span style="color:var(--muted)"> — </span><span style="font-size:12px">${esc(l.location)}</span>
        ${sigBadge}${stBadge}${fitBadge}
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:4px">source: ${esc(l.source)}</div>
      ${angle}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="copy-btn" onclick="leadToOutreach('${id}')">→ draft outreach</button>
        <button class="copy-btn" onclick="leadToDossier('${id}')">→ run dossier</button>
        <button class="copy-btn" onclick="markLead('${id}','approached')">mark approached</button>
        <button class="copy-btn" onclick="markLead('${id}','dropped')" style="color:var(--warn)">drop</button>
        <button class="copy-btn" onclick="deleteLead('${id}')" style="color:var(--warn)">✕ delete</button>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = paginationHtml + cardsHtml;
}

function deleteLead(id) { saveLeads(loadLeads().filter(l => l.id !== id)); renderLeads(); }

function importLeadsJson(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) { alert('Expected a JSON array.'); return; }
      const today = new Date().toISOString().slice(0, 10);
      const existing = loadLeads();
      const existingKeys = new Set(existing.map(l => (l.company + '|' + l.role).toLowerCase()));
      const newLeads = parsed
        .filter(l => l.company && l.role)
        .filter(l => !existingKeys.has((l.company + '|' + l.role).toLowerCase()))
        .map(l => ({
          id: 'l_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          company: l.company || '',
          role: l.role || '',
          location: l.location || '',
          link: l.link || '',
          what_they_do: '',
          signal_strength: 'medium',
          signal_reason: 'aggregated from ' + (l.source || 'leads.json'),
          fit_for_swe_intern: 'unknown',
          outreach_angle: l.link ? 'Apply directly: ' + l.link : '',
          verify_facts: [],
          added: l.added || today,
          source: l.source || 'leads.json',
          status: l.status || 'new'
        }));
      saveLeads([...newLeads, ...existing]);
      renderLeads();
      input.value = '';
      alert(`Imported ${newLeads.length} new leads (${parsed.length - newLeads.length} duplicates skipped).`);
    } catch (err) {
      alert('Failed to parse JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ===== APP LOGIC & TRACKER LOGGING =====
function logCurrentToTracker() {
  const company = document.getElementById('trCompany').value;
  const role = document.getElementById('trRole').value;
  const rows = loadTracker();
  rows.unshift({ id: 't_'+Date.now(), date: new Date().toISOString().slice(0,10), company, role, status: 'applied', followup: '', notes: '', resumeTex: document.getElementById('outputArea').textContent });
  saveTracker(rows);
  const btn = document.getElementById('logTrackerBtn'); btn.textContent = '✓ logged';
  setTimeout(() => btn.textContent = '+ log to tracker', 2000);
}

function renderBlockStats() { /* Placeholder */ }
function renderBulletStats(_block) { return ''; }
function computeBlockResponseStats() { return {}; }
function computeBulletStats() { return {}; }

// ===== INIT =====
let jdDebounceTimer = null;
document.addEventListener('DOMContentLoaded', () => {
  saveSettingsToUI(); renderBlockSelectors(); renderLibrary(); renderResumeHTML();
  handleShareTarget();
  document.getElementById('modelSelect').addEventListener('change', saveModel);
  document.getElementById('jdInput').addEventListener('input', () => {
    clearTimeout(jdDebounceTimer);
    jdDebounceTimer = setTimeout(() => { updateKeywordDisplay(); renderResumeHTML(); }, 300);
  });
});
