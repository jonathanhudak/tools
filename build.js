import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const deployDir = path.join(__dirname, 'docs');

// Clean and create deploy directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);

// Add .nojekyll to prevent Jekyll processing
fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');

// Get all directories in the root
const items = fs.readdirSync(__dirname, { withFileTypes: true });

items.forEach(item => {
  if (!item.isDirectory()) return;

  const dirName = item.name;
  const dirPath = path.join(__dirname, dirName);

  // Skip special directories
  if (dirName.startsWith('.') || dirName === 'node_modules' || dirName === 'docs') {
    return;
  }

  const packageJsonPath = path.join(dirPath, 'package.json');
  const indexHtmlPath = path.join(dirPath, 'index.html');

  // Check if this is a buildable app (has package.json with build script)
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.scripts && packageJson.scripts.build) {
      console.log(`Building ${dirName}...`);
      try {
        // Install dependencies and build
        execSync('npm ci', { cwd: dirPath, stdio: 'inherit' });
        execSync('npm run build', { cwd: dirPath, stdio: 'inherit' });

        // Copy dist to docs
        const distPath = path.join(dirPath, 'dist');
        const appDeployPath = path.join(deployDir, dirName);

        if (fs.existsSync(distPath)) {
          fs.cpSync(distPath, appDeployPath, { recursive: true });

          // Also copy HTML files and other static assets from root if they exist
          const staticFiles = ['index.html', 'styles.css', 'favicon.ico', 'assets', 'css', 'images', 'fonts', 'public'];
          staticFiles.forEach(file => {
            const srcFile = path.join(dirPath, file);
            if (fs.existsSync(srcFile)) {
              const destFile = path.join(appDeployPath, file);
              fs.cpSync(srcFile, destFile, { recursive: true });
            }
          });

          console.log(`✓ ${dirName} built and copied to docs/${dirName}/`);
        } else {
          console.warn(`⚠ ${dirName} built but no dist/ directory found`);
        }
      } catch (error) {
        console.error(`✗ Failed to build ${dirName}:`, error.message);
        process.exit(1);
      }
    } else {
      console.log(`⊘ ${dirName} has package.json but no build script, skipping`);
    }
  }
  // Check if this is a static HTML app (has index.html)
  else if (fs.existsSync(indexHtmlPath)) {
    console.log(`Copying static app ${dirName}...`);
    const appDeployPath = path.join(deployDir, dirName);
    fs.mkdirSync(appDeployPath, { recursive: true });

    // Copy only specific files, not node_modules or other build artifacts
    const filesToCopy = fs.readdirSync(dirPath);
    filesToCopy.forEach(file => {
      if (file === 'node_modules' || file.startsWith('.')) return;
      const srcPath = path.join(dirPath, file);
      const destPath = path.join(appDeployPath, file);
      fs.cpSync(srcPath, destPath, { recursive: true });
    });

    console.log(`✓ ${dirName} copied to docs/${dirName}/`);
  }
});

// Create a landing page with links to all apps
const appDirs = fs.readdirSync(deployDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tools Collection</title>
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
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        .apps-list {
            list-style: none;
        }
        .app-link {
            display: block;
            padding: 15px 20px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-bottom: 10px;
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
        }
        .app-name {
            font-size: 18px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tools Collection</h1>
        <p class="subtitle">Select a tool to get started</p>
        <ul class="apps-list">
${appDirs.map(app => `            <li><a href="./${app}/" class="app-link"><span class="app-name">${app.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></a></li>`).join('\n')}
        </ul>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(deployDir, 'index.html'), landingPage);
console.log('✓ Landing page created at docs/index.html');

console.log('\nBuild complete! Apps ready for deployment:');
appDirs.forEach(app => console.log(`  - ${app}`));
