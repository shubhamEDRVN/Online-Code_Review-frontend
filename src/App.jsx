"use client"

import { useState, useEffect } from "react"
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import Prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from "axios"
import "./App.css"
import "prismjs/components/prism-javascript"


function App() {
  const [code, setCode] = useState(`function sum(a, b) {
return a + b;
}

// Example usage
const result = sum(5, 3);
console.log(result);`)

  const [review, setReview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [copied, setCopied] = useState(false)

  const languages = [
    { value: "javascript", label: "JavaScript", prismLang: "javascript" },
    { value: "typescript", label: "TypeScript", prismLang: "typescript" },
    { value: "python", label: "Python", prismLang: "python" },
    { value: "java", label: "Java", prismLang: "java" },
    { value: "cpp", label: "C++", prismLang: "cpp" },
    { value: "jsx", label: "React JSX", prismLang: "jsx" },
  ]

  useEffect(() => {
    // Dynamically load extra languages on the client
    async function loadLanguages() {
      await Promise.all([
        import("prismjs/components/prism-python"),
        import("prismjs/components/prism-java"),
        import("prismjs/components/prism-cpp"),
        import("prismjs/components/prism-typescript"),
        import("prismjs/components/prism-jsx"),
      ])
      Prism.highlightAll()
    }
    loadLanguages()
  }, [])

  async function reviewCode() {
    if (!code.trim()) {
      setError("Please enter some code to review")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(`https://online-code-reviewer-backend.vercel.app/ai/get-review`, {
        code,
        language,
      })
      setReview(response.data)
    } catch (err) {
      setError("Failed to get code review. Please try again.")
      console.error("Review error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  function clearCode() {
    setCode("")
    setReview("")
    setError("")
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const currentLanguage = languages.find((lang) => lang.value === language)

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <span className="title-icon">🤖</span>
            AI Code Reviewer
          </h1>
          <p className="subtitle">Get intelligent feedback on your code</p>
        </div>
      </header>

      <main className="main">
        <div className="panel left-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">📝</span>
              Code Editor
            </div>
            <div className="controls">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button onClick={clearCode} className="control-btn clear-btn" title="Clear code">
                🗑️
              </button>
              <button onClick={() => copyToClipboard(code)} className="control-btn copy-btn" title="Copy code">
                {copied ? "✅" : "📋"}
              </button>
            </div>
          </div>

          <div className="code-container">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(code) =>
                Prism.highlight(
                  code,
                  Prism.languages[currentLanguage?.prismLang || "javascript"],
                  currentLanguage?.prismLang || "javascript",
                )
              }
              padding={20}
              className="code-editor"
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
                fontSize: 14,
                lineHeight: 1.6,
                height: "100%",
                width: "100%",
                background: "transparent",
              }}
              placeholder="Enter your code here..."
            />
          </div>

          <div className="action-bar">
            <button
              onClick={reviewCode}
              disabled={isLoading || !code.trim()}
              className={`review-btn ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  Review Code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="panel right-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">📊</span>
              AI Review
            </div>
            {review && (
              <button onClick={() => copyToClipboard(review)} className="control-btn copy-btn" title="Copy review">
                {copied ? "✅" : "📋"}
              </button>
            )}
          </div>

          <div className="review-container">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {!review && !error && !isLoading && (
              <div className="placeholder">
                <div className="placeholder-icon">🤖</div>
                <h3>Ready to review your code!</h3>
                <p>Write some code in the editor and click "Review Code" to get AI-powered feedback and suggestions.</p>
                <div className="features">
                  <div className="feature">✨ Code quality analysis</div>
                  <div className="feature">🐛 Bug detection</div>
                  <div className="feature">⚡ Performance suggestions</div>
                  <div className="feature">📚 Best practices</div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <h3>Analyzing your code...</h3>
                <p>Our AI is reviewing your code for quality, bugs, and improvements.</p>
              </div>
            )}

            {review && (
              <div className="review-content">
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Powered by AI • Built with React</p>
      </footer>
    </div>
  )
}

export default App
