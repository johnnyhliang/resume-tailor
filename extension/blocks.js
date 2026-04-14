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
\t\t\\textbf{Languages}{: C, C++, Rust, Typescript, Python, Matlab, Solidity} \\\\
\t\t\\textbf{Technologies}{: PyTorch, Scikit-learn, Pydantic, NextJS, gRPC, Docker, OpenCV, AWS, Smart Contracts, Uniswap} \\\\
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

\\begin{document}`;
