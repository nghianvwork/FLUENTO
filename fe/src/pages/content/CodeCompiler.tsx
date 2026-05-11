import { useState } from 'react';
import { Terminal, Play, Save, RotateCcw, Code2, Cpu, Braces, Sparkles } from 'lucide-react';

export default function CodeCompiler() {
  const [code, setCode] = useState(`// Welcome to FLUENTO Code Playground
// Master English while you code!

function welcome() {
  const message = "Hello from FLUENTO!";
  console.log(message);
  
  // Practice tip: Try to name your variables descriptively
  // to improve your technical English vocabulary.
  const motivation = "Coding is the poetry of logic.";
  console.log(motivation);
}

welcome();`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput('Compiling code...\n');
    
    // Simulate compilation and execution with a realistic delay
    setTimeout(() => {
      setOutput(prev => prev + '> node editor.js\n\nHello from FLUENTO!\nCoding is the poetry of logic.\n\n✨ Execution successful.\nProcess finished with exit code 0');
      setIsRunning(false);
    }, 1200);
  };

  const resetCode = () => {
    setCode(`// Resetting playground...\n\nfunction practice() {\n  console.log("Keep practicing!");\n}\n\npractice();`);
    setOutput('');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="card-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: 56, height: 56 }}>
              <Code2 size={28} />
            </div>
            <div>
              <h1 className="page-title">Code Playground</h1>
              <p className="page-subtitle">Refine your technical English through practical coding exercises.</p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="badge badge-primary">
              <Cpu size={14} className="mr-4" /> v8 Engine
            </div>
            <div className="badge badge-cyan">
              <Sparkles size={14} className="mr-4" /> AI Assisted
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, height: 'calc(100vh - 280px)', minHeight: 500 }}>
        {/* Editor Area */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ 
            padding: '12px 20px', 
            background: 'var(--bg-tertiary)', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between'
          }}>
            <div className="flex items-center gap-12 flex-1">
              <Braces size={16} className="text-primary" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>EDITOR.JS</span>
            </div>
            <div className="flex items-center gap-8">
              <button className="btn btn-secondary btn-sm" onClick={resetCode} title="Reset to default">
                <RotateCcw size={14} />
              </button>
              <button className="btn btn-secondary btn-sm">
                <Save size={14} />
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={runCode}
                disabled={isRunning}
                style={{ minWidth: 110 }}
              >
                {isRunning ? (
                  <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Play size={14} /> Run
                  </>
                )}
              </button>
            </div>
          </div>
          
          <textarea
            className="flex-1"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              background: '#080812',
              color: '#E0E0FF',
              fontFamily: '"Fira Code", "Source Code Pro", monospace',
              fontSize: 14,
              padding: '24px 32px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.7,
              letterSpacing: '0.3px',
              caretColor: 'var(--primary)'
            }}
          />
        </div>

        {/* Sidebar/Output Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Console */}
          <div className="card flex-1" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '12px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-8">
                <Terminal size={14} className="text-muted" />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2 }}>TERMINAL</span>
              </div>
            </div>
            <div style={{ 
              flex: 1, 
              padding: 24, 
              background: '#04040C', 
              fontFamily: '"Fira Code", monospace', 
              fontSize: 13, 
              color: isRunning ? 'var(--text-muted)' : '#00F5A0',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              textShadow: isRunning ? 'none' : '0 0 10px rgba(0, 245, 160, 0.3)'
            }}>
              {output || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Ready to execute...</span>}
            </div>
          </div>

          {/* AI Tips */}
          <div className="card admin-hero" style={{ padding: 20 }}>
            <div className="flex items-center gap-8 mb-12">
              <Sparkles size={18} className="text-accent-orange" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Technical English Tip</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use <code style={{ color: 'var(--primary-light)' }}>camelCase</code> for variables and 
              <code style={{ color: 'var(--primary-light)' }}>PascalCase</code> for classes. 
              Clear naming conventions are essential for collaboration in global teams.
            </p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
