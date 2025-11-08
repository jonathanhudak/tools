#!/usr/bin/env node

/**
 * Generate landing page for GitHub Pages deployment
 * Scans docs/ directory for deployed apps and creates index.html
 */

import { readdir, writeFile, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const docsDir = join(rootDir, 'docs');

// App metadata
const appMetadata = {
  'music-practice': {
    name: 'Music Practice',
    description: 'Interactive sight-reading practice with MIDI support',
    icon: '🎹',
  },
  'instrument-tuner': {
    name: 'Instrument Tuner',
    description: 'Real-time guitar tuner with pitch detection',
    icon: '🎸',
  },
  'visual-html-builder': {
    name: 'Visual HTML Builder',
    description: 'Visual editor for HTML pages',
    icon: '🎨',
  },
};

async function getDeployedApps() {
  const entries = await readdir(docsDir, { withFileTypes: true });
  const apps = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .filter((name) => appMetadata[name]) // Only include apps with metadata
    .sort();

  return apps;
}

function generateHTML(apps) {
  const appLinks = apps
    .map(
      (app) => `
            <li>
                <a href="./${app}/" class="app-link">
                    <span class="app-icon">${appMetadata[app].icon}</span>
                    <div class="app-info">
                        <span class="app-name">${appMetadata[app].name}</span>
                        <span class="app-desc">${appMetadata[app].description}</span>
                    </div>
                </a>
            </li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tools Collection - Web-Based Utilities</title>
    <meta name="description" content="Collection of useful web-based tools and utilities">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 700px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .apps-list {
            list-style: none;
        }
        .app-link {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            margin-bottom: 12px;
            text-decoration: none;
            color: #2c3e50;
            transition: all 0.3s;
            border: 2px solid transparent;
        }
        .app-link:hover {
            background: #667eea;
            color: white;
            transform: translateX(5px);
            border-color: #5568d3;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .app-link:hover .app-desc {
            color: rgba(255, 255, 255, 0.9);
        }
        .app-icon {
            font-size: 40px;
            flex-shrink: 0;
        }
        .app-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .app-name {
            font-size: 20px;
            font-weight: 600;
            line-height: 1.2;
        }
        .app-desc {
            font-size: 14px;
            color: #7f8c8d;
            transition: color 0.3s;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            h1 {
                font-size: 28px;
            }
            .app-icon {
                font-size: 32px;
            }
            .app-link {
                padding: 16px;
                gap: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tools Collection</h1>
        <p class="subtitle">Useful web-based tools and utilities</p>
        <ul class="apps-list">${appLinks}
        </ul>
        <div class="footer">
            Built with ❤️ and AI assistance<br>
            <a href="https://github.com/jonmumm/tools" target="_blank" rel="noopener">View on GitHub</a>
        </div>
    </div>
</body>
</html>
`;
}

async function main() {
  try {
    console.log('🔍 Scanning for deployed apps...');
    const apps = await getDeployedApps();

    if (apps.length === 0) {
      console.warn('⚠️  No apps found in docs/ directory');
      return;
    }

    console.log(`✅ Found ${apps.length} app(s): ${apps.join(', ')}`);

    console.log('📝 Generating landing page...');
    const html = generateHTML(apps);

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
