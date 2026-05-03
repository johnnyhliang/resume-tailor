// ===== UTILITIES =====

function stripLatex(tex) {
  // Remove LaTeX commands, keep content
  return tex
    .replace(/\\resumeItem\{/g, '')
    .replace(/\\resumeSubheading\{/g, '')
    .replace(/\\resumeProjectHeading\{/g, '')
    .replace(/\\resumeItemListStart/g, '')
    .replace(/\\resumeItemListEnd/g, '')
    .replace(/\\resumeSubHeadingListStart/g, '')
    .replace(/\\resumeSubHeadingListEnd/g, '')
    .replace(/\\textbf\{/g, '')
    .replace(/\\textit\{/g, '')
    .replace(/\\emph\{/g, '')
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+\{?/g, '')
    .replace(/\}/g, '')
    .replace(/[$\\{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBulletText(tex) {
  // Extract only the text inside \resumeItem{...}
  const items = [];
  const regex = /\\resumeItem\{([\s\S]*?)\}/g;
  let match;
  while ((match = regex.exec(tex)) !== null) {
    items.push(stripLatex(match[1]).trim());
  }
  return items;
}

function reconstructLatexItems(blockName, bulletTexts) {
  const block = [...BLOCKS.experience, ...BLOCKS.projects].find(b => b.name === blockName);
  if (!block) return '';
  
  // Detect heading command type
  const isProject = block.tex.includes('\\resumeProjectHeading');
  const headingMatch = isProject 
    ? block.tex.match(/(\\resumeProjectHeading[\s\S]*?)(\\resumeItemListStart)/)
    : block.tex.match(/(\\resumeSubheading[\s\S]*?)(\\resumeItemListStart)/);
  
  if (!headingMatch) return block.tex;
  
  const heading = headingMatch[1];
  const reconstructed = bulletTexts.map(t => `        \\resumeItem{${t}}`).join('\n');
  return `${heading}\n\\resumeItemListStart\n${reconstructed}\n    \\resumeItemListEnd`;
}

function formatLatexInline(text) {
  return text
    .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
    .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '<a href="#">$1</a>')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\$/g, '$');
}

// Minimal markdown renderer for dossier / outreach output
function renderMarkdownLite(text) {
  const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  let html = esc(text);
  html = html.replace(/^## (.+)$/gm, '<h3 style="font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin:16px 0 6px 0">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 style="font-family:var(--display);font-size:16px;margin:14px 0 6px 0">$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^- (.+)$/gm, '<div style="margin-left:12px">• $1</div>');
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  return `<div style="font-family:var(--display);font-size:13px;line-height:1.55;padding:4px 2px">${html}</div>`;
}

function escAttr(s) { return (s||'').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function bulletKey(text) {
  // Stable hash-ish key from first 60 chars normalized
  return text.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 60);
}

function parseCsvLine(line) {
  const out = []; let inQ = false; let cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === ',') { out.push(cur); cur = ''; }
      else if (c === '"') inQ = true;
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
