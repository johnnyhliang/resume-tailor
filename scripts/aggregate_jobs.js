const fs = require('fs');

const REPOS = [
  {
    name: 'SimplifyJobs-Internships',
    url: 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md'
  },
  {
    name: 'SimplifyJobs-NewGrad',
    url: 'https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md'
  },
  {
    name: 'Pitt-CSC',
    url: 'https://raw.githubusercontent.com/pittcsc/Summer2026-Internships/dev/README.md'
  },
  {
    name: 'speedyapply',
    url: 'https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/README.md'
  }
];

async function fetchAndParse() {
  const allLeads = [];

  for (const repo of REPOS) {
    console.log(`Fetching from ${repo.name}...`);
    try {
      const res = await fetch(repo.url);
      const text = await res.text();

      let repoLeads = [];

      if (text.includes('<tr>')) {
        // HTML table parsing
        console.log(`  -> detected HTML table`);
        repoLeads = parseHtmlTable(text, repo.name);
      } else {
        // Markdown pipe table parsing
        console.log(`  -> detected Markdown table`);
        repoLeads = parseMarkdownTable(text, repo.name);
      }

      console.log(`  -> ${repoLeads.length} leads from ${repo.name}`);
      allLeads.push(...repoLeads);
    } catch (err) {
      console.error(`Error fetching ${repo.name}: ${err.message}`);
    }
  }

  // Deduplicate by company+role+link
  const seen = new Set();
  const deduped = allLeads.filter(l => {
    const key = (l.company + '|' + l.role + '|' + l.link).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  console.log(`Found ${deduped.length} unique leads (${allLeads.length - deduped.length} duplicates removed).`);
  fs.writeFileSync('leads.json', JSON.stringify(deduped, null, 2));
  console.log('Saved to leads.json');
}

function parseHtmlTable(text, sourceName) {
  const leads = [];
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let match;
  let lastCompany = '';

  while ((match = rowRegex.exec(text)) !== null) {
    const rowContent = match[1];
    if (rowContent.includes('<th>')) continue; // Skip header

    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      cells.push(cellMatch[1].trim());
    }

    if (cells.length >= 4) {
      let company = stripHtml(cells[0]);
      const role = stripHtml(cells[1]);
      const location = stripHtml(cells[2]);
      const applicationHtml = cells[3];

      const linkMatch = applicationHtml.match(/href="([^"]*)"/);
      const link = linkMatch ? linkMatch[1] : '';

      // Handle nested roles (↳)
      if (company === '↳' || company === '&rdsh;' || company === '↳') {
        company = lastCompany;
      } else {
        lastCompany = company;
      }

      if (company && role && link) {
        leads.push({
          company,
          role,
          location,
          link,
          source: sourceName,
          added: new Date().toISOString().slice(0, 10),
          status: 'new'
        });
      }
    }
  }

  return leads;
}

function parseMarkdownTable(text, sourceName) {
  const leads = [];
  const lines = text.split('\n');
  let lastCompany = '';
  let headerSkipped = false;
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is a pipe-table line
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
      // Reset header tracking when we leave a table
      if (inTable) {
        inTable = false;
        headerSkipped = false;
      }
      continue;
    }

    // Separator line (e.g. |---|---|---|)
    if (/^\|[-:\s|]+\|$/.test(trimmed)) {
      // After separator, mark that header has been skipped
      headerSkipped = true;
      inTable = true;
      continue;
    }

    // First pipe row before separator = header, skip it
    if (!headerSkipped) {
      inTable = true;
      continue;
    }

    // Data row
    const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);

    if (cells.length < 4) continue;

    let company = stripHtml(cells[0]);
    const role = stripHtml(cells[1]);
    const location = stripHtml(cells[2]);
    const appCell = cells[3];

    // Extract Markdown link [text](url) or HTML href
    let link = '';
    const mdLink = appCell.match(/\[([^\]]*)\]\(([^)]+)\)/);
    if (mdLink) {
      link = mdLink[2];
    } else {
      const htmlLink = appCell.match(/href="([^"]*)"/);
      if (htmlLink) link = htmlLink[1];
    }

    // Handle continuation rows (↳)
    if (company === '↳' || company === '↳' || company === '') {
      company = lastCompany;
    } else {
      lastCompany = company;
    }

    if (company && role && link) {
      leads.push({
        company,
        role,
        location,
        link,
        source: sourceName,
        added: new Date().toISOString().slice(0, 10),
        status: 'new'
      });
    }
  }

  return leads;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

fetchAndParse();
