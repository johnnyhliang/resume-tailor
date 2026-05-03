// ===== BLOCK LIBRARY =====
const BLOCKS = {
  experience: [
    {
      id: 'exp_freelance',
      name: 'Web Dev Contractor',
      meta: 'Mar 2020 – Present',
      active: true,
      tex: `\\resumeSubheading
    {Web Development Contractor \\& Consulting}{March 2020 -- Present}
    {Freelance}{}
    \\resumeItemListStart
        \\resumeItem{Delivered 16+ custom web applications and landing pages for small businesses across retail, healthcare, and professional services, generating \\$10,000+ in revenue}
        \\resumeItem{Achieved 90+ Google PageSpeed scores through lazy-loading, image compression, server-side rendering, and SEO implementation, generating a 150\\% average increase in client web engagement}
        \\resumeItem{Managed client acquisition, project scoping/development, technical delivery, and ongoing maintenance contracts}
    \\resumeItemListEnd`
    },
    {
      id: 'exp_helivox',
      name: 'Helivox — Lead Developer',
      meta: 'Jan 2023 – May 2025',
      active: true,
      tex: `\\resumeSubheading
    {Helivox}{Jan 2023 -- May 2025}
    {Lead Developer}{}
    \\resumeItemListStart
        \\resumeItem{Architected and deployed responsive web applications using Next.js from ground up, managing complete hosting infrastructure and deployment pipeline at zero cost and supported organizational growth to 75+ team members}
        \\resumeItem{Built outreach tracking and communication platforms for branches across Michigan and Georgia, enabling staff to manage more community contacts while reducing manual data entry by 70\\%}
        \\resumeItem{Facilitated communication between executive and operational teams for donation drives, educational seminars, successfully delivering 11+ major initiatives on schedule despite varying volunteer availability}
    \\resumeItemListEnd`
    },
    {
      id: 'exp_mit',
      name: 'MIT Beaver Works',
      meta: 'Jul – Aug 2024',
      active: true,
      tex: `\\resumeSubheading
    {MIT Beaver Works Summer Institute}{July -- August 2024}
    {Hardware Engineering | Cambridge, MA}{}
    \\resumeItemListStart
        \\resumeItem{Co-designed, prototyped, and built an electronically assisted walking cane with team of 4 students, developing CAD models, PCB circuit schematics, and user-friendly interface for the visually impaired}
        \\resumeItem{Optimized and implemented microelectronic circuits for real-time sensor integration and obstacle detection}
        \\resumeItem{Presented prototype to 200+ audience members including MIT staff and industry professionals}
    \\resumeItemListEnd`
    },
    {
      id: 'exp_synthesis',
      name: 'Synthesis.trade — Core Engineer',
      meta: 'Jan 2026 – Present',
      active: true,
      tex: `\\resumeSubheading
    {Synthesis.trade}{Jan 2026 -- Present}
    {Core Engineer}{}
    \\resumeItemListStart
        \\resumeItem{Building prediction market infrastructure and terminals covering Polymarket and Kalshi, developing MCP server with 38 tools for AI agent integration}
        \\resumeItem{Implemented two-tier API system with in-memory caching (60s TTL, 1000-entry LRU), achieving $\\sim$93\\% token reduction through response trimming}
        \\resumeItem{Designed HTTP mode with CORS support, rate limiting (60 req/min), and retry logic (3 retries with exponential backoff), validated by 40+ test assertions}
    \\resumeItemListEnd`
    },
    {
      id: 'exp_spark',
      name: 'Spark Electric Motorcycle — Controls',
      meta: 'Sep 2025 – Present',
      active: true,
      tex: `\\resumeSubheading
    {Spark Electric Motorcycle — Controls Team}{Sep 2025 -- Present}
    {Controls Engineering}{University of Michigan}
    \\resumeItemListStart
        \\resumeItem{Developing vehicle control systems for student-built electric motorcycle, integrating sensor data and real-time feedback loops}
        \\resumeItem{Collaborating with cross-functional mechanical and electrical teams to optimize power delivery and safety protocols}
    \\resumeItemListEnd`
    }
  ],
  projects: [
    {
      id: 'proj_discord',
      name: 'Discord App Platform (Magic Bot)',
      meta: 'NextJS, Redis, MongoDB',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{Discord Application Platform} $|$ \\emph{NextJS, Prisma, Discord API, Redis, MongoDB}}{March 2020 -- Nov 2024}
    \\resumeItemListStart
        \\resumeItem{Built and scaled multi-purpose Discord bot that served up to 40,000+ concurrent users with 99.9\\% uptime}
        \\resumeItem{Implemented OAuth authentication system with web dashboard, Redis caching for sub-100ms response times, and database optimization reducing query times by 60\\%}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_celiac',
      name: 'Celiac Disease CNN Research',
      meta: 'CNNs, NCBI GEO',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{Celiac Disease Research - Computational Biology Analysis} $|$ \\emph{CNNs}}{Nov 2023 -- Feb 2024}
    \\resumeItemListStart
        \\resumeItem{Independently researched Ubiquitin-proteasome system correlations in Celiac Disease using NCBI GEO datasets and convolutional neural networks to identify gene expression patterns}
        \\resumeItem{Analyzed gene interaction networks with StringDB and GeneCards database for comprehensive pathway mapping}
        \\resumeItem{Earned Honorable Mention at University of Michigan GIDAS High School Research Conference}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_semcomp',
      name: 'SemComp — Text Classification',
      meta: 'PyTorch, 86% accuracy',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{SemComp - Semantic Text Classification Analysis} $|$ \\emph{Pytorch, zstd}}{April 2024}
    \\resumeItemListStart
        \\resumeItem{Developed semantic compression algorithm achieving sub-millisecond inference on 10,000-entry news dataset with 86\\% accuracy based on pattern matching in compressor states without the need for neural networks}
        \\resumeItem{Created production-ready pipeline with automated preprocessing and evaluation metrics}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_crypto',
      name: 'Crypto Monte Carlo Simulator',
      meta: 'Python, Matplotlib',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{Crypto Price Simulation \\& Risk Analysis} $|$ \\emph{Python, Matplotlib}}{October 2025}
    \\resumeItemListStart
        \\resumeItem{Simulated asset prices using Geometric Brownian Motion and Monte Carlo methods (200,000+ paths)}
        \\resumeItem{Modeled portfolio risk using correlation matrices, Cholesky decomposition, matrix algebra, and statistical methods}
        \\resumeItem{Calculated Value at Risk (VaR), loss probabilities; visualized path simulations and distribution}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_usdc',
      name: 'USDC Payment Indexer',
      meta: 'Rust, Tokio, PostgreSQL — inactive',
      active: false,
      tex: `\\resumeProjectHeading
    {\\textbf{Multi-Chain USDC Payment Indexer} $|$ \\emph{Rust, Tokio, PostgreSQL, Ethers-rs}}{Nov 2024}
    \\resumeItemListStart
        \\resumeItem{Built high-performance stablecoin transaction indexer in Rust using Tokio async runtime and ethers-rs, concurrently monitoring USDC transfers across Ethereum, Base, and Polygon with 12-block confirmation depth for reorg safety}
        \\resumeItem{Implemented type-safe event parsing with strongly-typed ABI bindings, preventing runtime deserialization errors and ensuring accurate tracking of Transfer events with sender, receiver, and amount validation}
        \\resumeItem{Designed PostgreSQL integration with SQLx compile-time query verification and connection pooling, handling RPC provider failover with exponential backoff retry logic across multiple endpoints}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_mcp',
      name: 'MCP Server — Prediction Markets (npm)',
      meta: 'TypeScript, MCP SDK, 38 tools',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{MCP Server for Prediction Markets} $|$ \\emph{TypeScript, Node.js, MCP SDK, Zod}}{Jan 2026}
    \\resumeItemListStart
        \\resumeItem{Published npm package (mcp-server-synthesis) providing 38 tools for Polymarket \\& Kalshi data, wallet management, and trading via Model Context Protocol}
        \\resumeItem{Implemented caching layer and response optimization achieving $\\sim$93\\% token reduction for LLM API efficiency}
        \\resumeItem{Built with comprehensive testing (40+ assertions), multi-user isolation, and production-grade error handling with exponential backoff}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_defi',
      name: 'DeFi Lending Risk Dashboard',
      meta: 'Next.js, Wagmi, GraphQL, multi-chain',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{DeFi Lending Risk Dashboard} $|$ \\emph{Next.js, Wagmi, Viem, GraphQL, TypeScript}}{2025}
    \\resumeItemListStart
        \\resumeItem{Built Next.js dashboard aggregating lending risk across Aave V3 and Compound III on Ethereum, Arbitrum, Optimism, Polygon, and Base}
        \\resumeItem{Implemented parallel position fetching with wallet connect via Wagmi + ConnectKit, real reserve pricing from Aave subgraphs}
        \\resumeItem{Designed portfolio risk scoring with weighted liquidation threshold and per-network health factor calculations; tested with 40+ Vitest assertions}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_gainz',
      name: 'Prediction Market Arbitrage Engine',
      meta: 'Python, DuckDB, LLM, RAG',
      active: true,
      tex: `\\resumeProjectHeading
    {\\textbf{Prediction Market Arbitrage Engine} $|$ \\emph{Python, DuckDB, Claude/GPT APIs, RAG}}{2025}
    \\resumeItemListStart
        \\resumeItem{Built cross-platform prediction market meta-game covering Kalshi, Polymarket, Manifold, Metaculus with LLM forecasting engine and RAG pipeline}
        \\resumeItem{Implemented arbitrage detection across platforms including cross-market, partition, and conditional arbitrage opportunities with Kelly criterion position sizing}
        \\resumeItem{Integrated news APIs, Reddit PRAW, FRED economic data, and yfinance for multi-source forecasting model training}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_cprof',
      name: 'cprof — C/C++ Complexity Profiler',
      meta: 'Go, Valgrind, LD_PRELOAD',
      active: false,
      tex: `\\resumeProjectHeading
    {\\textbf{cprof — C/C++ Complexity Profiler} $|$ \\emph{Go, Valgrind, LD\_PRELOAD}}{2025}
    \\resumeItemListStart
        \\resumeItem{Built Go CLI tool measuring time and space complexity of C/C++ programs deterministically using Valgrind instruction counting and LD\_PRELOAD malloc interception}
        \\resumeItem{Implemented curve fitting against complexity classes with R-squared confidence scores for automated algorithm analysis}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_paramgolf',
      name: 'OpenAI Parameter Golf — LLM Compression',
      meta: 'PyTorch, MLX, quantization',
      active: false,
      tex: `\\resumeProjectHeading
    {\\textbf{OpenAI Parameter Golf — LLM Compression Research} $|$ \\emph{Python, PyTorch, MLX}}{2025}
    \\resumeItemListStart
        \\resumeItem{Competed in OpenAI's Parameter Golf challenge: train best LLM in 16MB artifact under 10 minutes on 8$\\times$H100s; submitted research on depth recurrence + mixed precision quantization}
        \\resumeItem{Ran 4 days of experiments on RTX 3070 with 15 parallel research agents, evaluated 26 models across GPT-5, Gemini 3.1 Pro, Claude Opus achieving 1.5630 bpb with looped 6.1M param model}
    \\resumeItemListEnd`
    },
    {
      id: 'proj_agentinfra',
      name: 'agentinfra — Self-Hosted AI Agent',
      meta: 'Go, Docker, Terraform-style',
      active: false,
      tex: `\\resumeProjectHeading
    {\\textbf{agentinfra — Self-Hosted AI Agent} $|$ \\emph{Go, Docker}}{2025}
    \\resumeItemListStart
        \\resumeItem{Built open-source self-hosted AI agent for Docker and homelab management with plan-confirm-execute security model inspired by Terraform}
        \\resumeItem{Designed tiered security system (read/safe\_write/destructive/critical) with configurable confirmation behavior for safe autonomous operation}
    \\resumeItemListEnd`
    }
  ],
  static: [
    {
      id: 'static_heading',
      name: 'Heading',
      meta: 'Jonathan Liang',
      active: true,
      tex: `\\begin{center}
    \\textbf{\\Huge \\scshape Jonathan Liang} \\\\ \\vspace{1pt}
    \\small (309) 361-7377 $|$ \\href{mailto:jonliang @umich.edu}{\\underline{jonliang @umich.edu}} $|$
    \\href{https://linkedin.com/in/johnnyhliang}{\\underline{linkedin.com/in/johnnyhliang}} $|$
    \\href{https://github.com/johnnyhliang}{\\underline{github.com/johnnyhliang}} $|$
    \\href{https://johnnyliang.me}{\\underline{johnnyliang.me}}
\\end{center}`
    },
    {
      id: 'static_education',
      name: 'Education',
      meta: 'UMich CS+EE, 3.68',
      active: true,
      tex: `\\section{Education}
    \\resumeSubHeadingListStart
    \\resumeSubheading
    {University of Michigan, College of Engineering}{Expected Graduation: May 2028}
    {B.S.E Major in Computer Science, Minor in Electrical Engineering}{Cumulative GPA: 3.68/4.0}
    \\resumeSubHeadingListEnd`
    },
    {
      id: 'static_skills',
      name: 'Technical Skills',
      meta: 'Languages, frameworks',
      active: true,
      tex: `\\section{Technical Skills}
    \\begin{itemize}[leftmargin=0.15in, label={}]
\t\\small{\\item{
\t\t\\textbf{Languages}{: C, C++, Rust, Go, Typescript, Python, Matlab, Solidity, Pine Script, Verilog} \\\\
\t\t\\textbf{Technologies}{: PyTorch, Scikit-learn, MCP SDK, Next.js, gRPC, Docker, Redis, MongoDB, PostgreSQL, Wagmi, FastAPI, Valgrind, AWS, Smart Contracts, Uniswap} \\\\
        \\textbf{Campus Involvements}{: Spark Electric Motorcycle Controls Team, Michigan Blockchain, Michigan Fabrication, Michigan Algorithmic Traders}
\t}}
    \\end{itemize}`
    },
    {
      id: 'static_awards',
      name: 'Awards',
      meta: 'USACO Gold, Code Jam',
      active: false,
      tex: `\\section{Awards}
    \\begin{itemize}[leftmargin=0.15in, label={}]
\t\\small{\\item{
\t\t\\textbf{Google Code Jam (2022)}{: Round 2 Qualifier (Top $\\sim$3000 Contestants)} \\\\
\t\t\\textbf{USA Computing Olympiad (2024)}{: Gold Division Contestant} \\\\
\t}}
    \\end{itemize}`
    }
  ]
};

const RESUME_PREAMBLE = `%-------------------------
% Resume — Jonathan Liang (auto-tailored)
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{fontawesome5}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}
\\usepackage[semibold]{raleway}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule\\vspace{-5pt}]
\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
\\newcommand{\\resumeSubheading}[4]{\\vspace{-2pt}\\item\\begin{tabular*}{0.97\\textwidth}[t]{l @{\\extracolsep{\\fill}}r}\\textbf{#1} & #2 \\\\\\textit{\\small#3} & \\textit{\\small #4} \\\\\\end{tabular*}\\vspace{-7pt}}
\\newcommand{\\resumeProjectHeading}[2]{\\item\\begin{tabular*}{0.97\\textwidth}{l @{\\extracolsep{\\fill}}r}\\small#1 & #2 \\\\\\end{tabular*}\\vspace{-7pt}}
\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}
\\definecolor{Black}{RGB}{0, 0, 0}

\\begin{document}\`;
