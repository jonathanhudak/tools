import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Copy, ExternalLink, Loader2, AlertCircle, CheckCircle2, FileText, BookOpen, Upload } from 'lucide-react';
import RSVPReader from './RSVPReader';

type InputMode = 'url' | 'text' | 'file';

export default function App() {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const blockElements = new Set([
      'P', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'MAIN',
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'UL', 'OL', 'LI',
      'BLOCKQUOTE', 'PRE',
      'HR', 'BR',
      'TABLE', 'TR', 'TD', 'TH'
    ]);

    const getText = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        const tagName = elem.tagName;

        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tagName)) {
          return '';
        }

        if (tagName === 'BR') {
          return '\n';
        }

        let text = '';
        for (const child of Array.from(node.childNodes)) {
          text += getText(child);
        }

        if (blockElements.has(tagName)) {
          const trimmedText = text.trim();
          if (trimmedText) {
            return `\n${trimmedText}\n`;
          }
          return '\n';
        }

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

    return rawText
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
      .trim();
  };

  const extractFromURL = async () => {
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

      const main = doc.querySelector('main');
      const article = doc.querySelector('article');
      const contentDiv = doc.querySelector('[class*="content"]');
      const postBody = doc.querySelector('[class*="post-body"], [class*="article-body"], [class*="entry-content"]');

      const targetElement = main || article || postBody || contentDiv || doc.body;

      const unwanted = targetElement.querySelectorAll(
        'script, style, nav, header, footer, aside, .navigation, .menu, .sidebar, .comments, .related, .share, .social, .advertisement, .ad, [role="complementary"], [role="navigation"]'
      );
      unwanted.forEach(el => el.remove());

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

  const handlePastedText = () => {
    if (!pastedText.trim()) {
      setError('Please paste some text');
      return;
    }

    setContent(pastedText);
    setError('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept text files
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      setError('Please upload a text file (.txt)');
      return;
    }

    setLoading(true);
    setError('');
    setContent('');

    try {
      const text = await file.text();
      if (!text.trim()) {
        throw new Error('File is empty');
      }
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
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
    if (inputMode === 'url') {
      extractFromURL();
    } else if (inputMode === 'text') {
      handlePastedText();
    }
  };

  if (showRSVP && content) {
    return <RSVPReader text={content} onClose={() => setShowRSVP(false)} />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">RSVP Reader</h1>
            <p className="text-sm text-muted-foreground mt-1">Speed reading with zero-jiggle ORP highlighting</p>
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
        {/* Input Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setInputMode('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              inputMode === 'url'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>URL</span>
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Text</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              inputMode === 'file'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-card rounded-3xl shadow-lg border border-border p-6 sm:p-8 space-y-4">
            {inputMode === 'url' && (
              <>
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
                        <span>Extract</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {inputMode === 'text' && (
              <>
                <label htmlFor="text-input" className="block text-sm font-medium text-foreground">
                  Paste Text
                </label>
                <textarea
                  id="text-input"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your text here..."
                  rows={8}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-base resize-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !pastedText.trim()}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Load Text</span>
                </button>
              </>
            )}
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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-foreground">Ready to Read</h2>
              <div className="flex items-center gap-2">
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
                <button
                  onClick={() => setShowRSVP(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read with RSVP</span>
                </button>
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-6 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-foreground leading-relaxed">
                {content}
              </pre>
            </div>
            <div className="text-sm text-muted-foreground">
              {content.split(/\s+/).length} words • Estimated reading time: {Math.ceil(content.split(/\s+/).length / 400)} min at 400 WPM
            </div>
          </div>
        )}

        {/* Empty State */}
        {!content && !error && !loading && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to speed read</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Extract text from URLs, paste directly, or upload a file. Then read at up to 3x your normal speed with RSVP technology.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
        <p>RSVP (Rapid Serial Visual Presentation) helps you read faster by displaying one word at a time. Privacy-first - no data is stored.</p>
      </footer>
    </div>
  );
}
