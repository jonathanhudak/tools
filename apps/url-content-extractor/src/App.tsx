import { useState, useEffect } from 'react';
import { Moon, Sun, Copy, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const extractTextFromElement = (element: Element): string => {
    // Block-level elements that should have newlines before/after
    const blockElements = new Set([
      'P', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'MAIN',
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'UL', 'OL', 'LI',
      'BLOCKQUOTE', 'PRE',
      'HR', 'BR',
      'TABLE', 'TR', 'TD', 'TH'
    ]);

    const getText = (node: Node): string => {
      // If it's a text node, return its content
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      // If it's an element node
      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        const tagName = elem.tagName;

        // Skip script, style, and hidden elements
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tagName)) {
          return '';
        }

        // Handle line breaks
        if (tagName === 'BR') {
          return '\n';
        }

        // Process children
        let text = '';
        for (const child of Array.from(node.childNodes)) {
          text += getText(child);
        }

        // Add newlines around block elements
        if (blockElements.has(tagName)) {
          // Add newline before and after block elements
          // Trim the text inside to avoid excess whitespace
          const trimmedText = text.trim();
          if (trimmedText) {
            return `\n${trimmedText}\n`;
          }
          return '\n';
        }

        // For list items, add a bullet or number indicator
        if (tagName === 'LI') {
          const trimmedText = text.trim();
          if (trimmedText) {
            return `\n• ${trimmedText}\n`;
          }
        }

        return text;
      }

      return '';
    };

    const rawText = getText(element);

    // Clean up the extracted text
    return rawText
      // Replace multiple consecutive newlines with double newline
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      // Ensure there's proper spacing after punctuation followed by a newline
      .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
      .trim();
  };

  const extractContent = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setContent('');

    try {
      const encodedUrl = encodeURIComponent(url);
      const proxyUrl = `https://api.allorigins.win/get?url=${encodedUrl}`;

      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }

      const data = await response.json();

      if (!data.contents) {
        throw new Error('No content received');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      // Try to find main content area
      const main = doc.querySelector('main');
      const article = doc.querySelector('article');
      const contentDiv = doc.querySelector('[class*="content"]');
      const postBody = doc.querySelector('[class*="post-body"], [class*="article-body"], [class*="entry-content"]');

      const targetElement = main || article || postBody || contentDiv || doc.body;

      // Remove unwanted elements
      const unwanted = targetElement.querySelectorAll(
        'script, style, nav, header, footer, aside, .navigation, .menu, .sidebar, .comments, .related, .share, .social, .advertisement, .ad, [role="complementary"], [role="navigation"]'
      );
      unwanted.forEach(el => el.remove());

      // Extract text with proper spacing
      const extractedText = extractTextFromElement(targetElement);

      if (!extractedText || extractedText.length < 50) {
        throw new Error('Could not extract readable content from this page');
      }

      setContent(extractedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    extractContent();
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">URL Content Extractor</h1>
            <p className="text-sm text-muted-foreground mt-1">Extract clean, readable text from any URL</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-secondary hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-card rounded-3xl shadow-lg border border-border p-6 sm:p-8 space-y-4">
            <label htmlFor="url-input" className="block text-sm font-medium text-foreground">
              Enter URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1 px-5 py-4 rounded-2xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    <span>Extract Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-destructive/10 border-2 border-destructive/20 rounded-3xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error</h3>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        )}

        {/* Content Display */}
        {content && (
          <div className="bg-card rounded-3xl shadow-lg border border-border p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Extracted Content</h2>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-accent transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-muted/50 rounded-2xl p-6 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-foreground leading-relaxed">
                {content}
              </pre>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!content && !error && !loading && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <ExternalLink className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to extract</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Paste any URL above and click "Extract Content" to get clean, readable text from the page
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
        <p>Works best with article pages and blog posts. Privacy-first - no data is stored.</p>
      </footer>
    </div>
  );
}
