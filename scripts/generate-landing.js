#!/usr/bin/env node

/**
 * Generate landing page for GitHub Pages deployment
 * Creates a comprehensive index with cards for all tools (web apps and CLI tools)
 */

import { readdir, writeFile, readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const docsDir = join(rootDir, 'docs');
const appsDir = join(rootDir, 'apps');

// Comprehensive tool metadata
const toolMetadata = {
  'music-practice': {
    name: 'InstrumentPractice Pro',
    description: 'A comprehensive instrument practice app with MIDI/microphone support for sight reading, scales, and music theory training. Supports Piano, Violin, and Guitar.',
    techStack: ['React', 'TypeScript', 'Vite', 'Web MIDI', 'Web Audio'],
    type: 'web-app',
    hasDeployment: true,
  },
  'instrument-tuner': {
    name: 'Instrument Tuner',
    description: 'Free online instrument tuner with real-time pitch detection. Perfect for guitar, bass, violin, and more. Features visual feedback and multiple tunings.',
    techStack: ['React', 'TypeScript', 'Vite', 'shadcn/ui', 'Tailwind v4'],
    type: 'web-app',
    hasDeployment: true,
  },
  'visual-html-builder': {
    name: 'Visual HTML Builder',
    description: 'A visual HTML editor with real-time preview, inline editing, and full style customization. Build web pages without writing code.',
    techStack: ['Vanilla JS', 'HTML', 'CSS'],
    type: 'web-app',
    hasDeployment: true,
  },
  'ikigai-tool': {
    name: 'Ikigai Tool',
    description: 'Discover your Ikigai - your reason for being. Interactive diagram to map what you love, what you\'re good at, what you can be paid for, and what the world needs.',
    techStack: ['React', 'TypeScript', 'React Flow', 'Vite'],
    type: 'web-app',
    hasDeployment: true,
  },
  'url-content-extractor': {
    name: 'URL Content Extractor',
    description: 'Extract clean, readable text from any URL. Perfect for quickly grabbing article content or blog posts without the clutter. Mobile-optimized with dark mode.',
    techStack: ['React', 'TypeScript', 'Tailwind v4', 'Vite'],
    type: 'web-app',
    hasDeployment: true,
  },
  'local-finance': {
    name: 'Local Finance Analyzer',
    description: 'A privacy-first, local-only personal finance CLI tool with AI-powered transaction categorization and HTML reports. All data stays on your machine.',
    techStack: ['TypeScript', 'Node.js', 'SQLite', 'AI Integration'],
    type: 'cli-tool',
    hasDeployment: false,
  },
};

async function checkDeployment(appName) {
  try {
    const deployPath = join(docsDir, appName, 'index.html');
    await access(deployPath);
    return true;
  } catch {
    return false;
  }
}

async function getAllTools() {
  const entries = await readdir(appsDir, { withFileTypes: true });
  const tools = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'sure')
    .map((entry) => entry.name)
    .filter((name) => toolMetadata[name]) // Only include tools with metadata
    .sort();

  // Check which tools have actual deployments
  const toolsWithDeploymentStatus = await Promise.all(
    tools.map(async (tool) => {
      const hasDeployment = await checkDeployment(tool);
      return {
        dirName: tool, // This is the directory name (kebab-case)
        ...toolMetadata[tool],
        hasDeployment,
      };
    })
  );

  return toolsWithDeploymentStatus;
}

function generateToolCard(tool) {
  const techBadges = tool.techStack.map((tech) => `<span class="tech-badge">${tech}</span>`).join('\n          ');

  // Use the directory name (kebab-case) for URLs
  const dirName = tool.dirName;
  const appUrl = tool.hasDeployment ? `./${dirName}/` : `https://github.com/jonathanhudak/tools/tree/main/apps/${dirName}`;
  const appButtonText = tool.hasDeployment ? 'Launch App' : 'View README';

  // Use the display name from metadata
  const displayName = tool.name;

  return `      <!-- ${displayName} -->
      <div class="tool-card ${tool.type}">
        <span class="tool-type-badge">${tool.type === 'web-app' ? 'Web App' : 'CLI Tool'}</span>
        <h2>${displayName}</h2>
        <p class="description">
          ${tool.description}
        </p>
        <div class="tech-stack">
          ${techBadges}
        </div>
        <div class="actions">
          <a href="${appUrl}" class="btn btn-primary">${appButtonText}</a>
          <a href="https://github.com/jonathanhudak/tools/tree/main/apps/${dirName}" class="btn btn-secondary">View Code</a>
        </div>
      </div>`;
}

function generateHTML(tools) {
  const toolCards = tools.map(generateToolCard).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A collection of small, useful tools built with AI-assisted coding. Each tool is designed to be simple, focused, and practical.">
  <title>Tools Monorepo - AI-Assisted Development</title>
  <style>
    :root {
      --color-primary: #667eea;
      --color-primary-dark: #5568d3;
      --color-secondary: #764ba2;
      --color-success: #10b981;
      --color-bg: #f8f9fa;
      --color-surface: #ffffff;
      --color-text: #2c3e50;
      --color-text-muted: #7f8c8d;
      --color-border: #e1e4e8;
      --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
      --border-radius: 12px;
      --transition: 250ms ease;
    }

    [data-theme="dark"] {
      --color-bg: #1a1a1a;
      --color-surface: #2d2d2d;
      --color-text: #e4e4e7;
      --color-text-muted: #a1a1aa;
      --color-border: #404040;
      --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.4);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
      transition: background-color var(--transition), color var(--transition);
    }

    header {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: var(--shadow);
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    header p {
      font-size: 1.125rem;
      opacity: 0.95;
      max-width: 600px;
      margin: 0 auto;
    }

    .theme-toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all var(--transition);
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .tool-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      padding: 2rem;
      box-shadow: var(--shadow);
      transition: all var(--transition);
      display: flex;
      flex-direction: column;
    }

    .tool-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--color-primary);
    }

    .tool-card h2 {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
      color: var(--color-primary);
    }

    .tool-card .description {
      color: var(--color-text-muted);
      margin-bottom: 1rem;
      flex-grow: 1;
      line-height: 1.5;
    }

    .tool-card .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .tech-badge {
      background: var(--color-bg);
      color: var(--color-text-muted);
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      border: 1px solid var(--color-border);
    }

    .tool-card .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: auto;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all var(--transition);
      font-weight: 500;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      transform: scale(1.02);
    }

    .btn-secondary {
      background: var(--color-bg);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    .tool-card.cli-tool {
      border-left: 4px solid var(--color-secondary);
    }

    .tool-card.web-app {
      border-left: 4px solid var(--color-success);
    }

    .tool-type-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      letter-spacing: 0.5px;
    }

    .cli-tool .tool-type-badge {
      background: rgba(118, 75, 162, 0.1);
      color: var(--color-secondary);
    }

    .web-app .tool-type-badge {
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
    }

    footer {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-muted);
      border-top: 1px solid var(--color-border);
    }

    footer a {
      color: var(--color-primary);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 2rem;
      }

      header p {
        font-size: 1rem;
      }

      .tools-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      main {
        padding: 2rem 1rem;
      }
    }
  </style>
</head>
<body>
  <button class="theme-toggle" onclick="toggleTheme()">
    <span id="theme-icon">🌙</span> Toggle Theme
  </button>

  <header>
    <h1>Tools Monorepo</h1>
    <p>A collection of small, useful tools built with AI-assisted coding. Each tool is designed to be simple, focused, and practical.</p>
  </header>

  <main>
    <div class="tools-grid">
${toolCards}
    </div>
  </main>

  <footer>
    <p>
      Built with AI-assisted development using <a href="https://claude.ai" target="_blank">Claude</a>
      <br>
      <a href="https://github.com/jonathanhudak/tools" target="_blank">View on GitHub</a>
    </p>
  </footer>

  <script>
    // Theme toggle functionality
    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
      const icon = document.getElementById('theme-icon');
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Initialize theme
    function initTheme() {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      updateThemeIcon(theme);
    }

    initTheme();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
      }
    });
  </script>
</body>
</html>
`;
}

async function main() {
  try {
    console.log('🔍 Scanning for all tools...');
    const tools = await getAllTools();

    if (tools.length === 0) {
      console.warn('⚠️  No tools found in apps/ directory');
      return;
    }

    console.log(`✅ Found ${tools.length} tool(s): ${tools.map((t) => t.dirName).join(', ')}`);

    console.log('📝 Generating landing page...');
    const html = generateHTML(tools);

    await writeFile(join(docsDir, 'index.html'), html, 'utf8');
    console.log('✅ Landing page generated at docs/index.html');

    // Ensure .nojekyll exists for GitHub Pages
    const nojekyllPath = join(docsDir, '.nojekyll');
    try {
      await writeFile(nojekyllPath, '', 'utf8');
      console.log('✅ .nojekyll file created');
    } catch (error) {
      console.log('ℹ️  .nojekyll already exists');
    }

    console.log('🎉 Deployment preparation complete!');
  } catch (error) {
    console.error('❌ Error generating landing page:', error);
    process.exit(1);
  }
}

main();
