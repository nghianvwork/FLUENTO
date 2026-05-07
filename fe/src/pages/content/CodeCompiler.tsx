import { useState, useEffect } from 'react';
import { Play, Code, Clock, History, Trash2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeExecution {
  id: number;
  language: string;
  code: string;
  input: string;
  output: string;
  error: string;
  executionTime: number;
  status: string;
  createdAt: string;
}

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '📜' },
  { value: 'java', label: 'Java', icon: '☕' }
];

const CODE_TEMPLATES = {
  python: `# Python Code
print("Hello, World!")

# Input example
name = input("Enter your name: ")
print(f"Hello, {name}!")`,
  
  javascript: `// JavaScript Code
console.log("Hello, World!");

// Input example (Node.js)
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your name: ', (name) => {
  console.log(\`Hello, \${name}!\`);
  rl.close();
});`,
  
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Input example
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}`
};

export default function CodeCompiler() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<CodeExecution[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/compiler/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setHistory(data.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(CODE_TEMPLATES[newLanguage as keyof typeof CODE_TEMPLATES]);
    setOutput('');
    setError('');
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setError('');
    setExecutionTime(0);

    try {
      const response = await fetch('/api/compiler/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ language, code, input })
      });

      const data = await response.json();
      if (data.success) {
        const result = data.data;
        setOutput(result.output || '');
        setError(result.error || '');
        setExecutionTime(result.executionTime);
        
        if (result.status === 'SUCCESS') {
          toast.success('Code executed successfully!');
        } else if (result.status === 'TIMEOUT') {
          toast.error('Execution timeout (max 10 seconds)');
        } else {
          toast.error('Execution failed');
        }
        
        loadHistory();
      }
    } catch (error) {
      toast.error('Failed to execute code');
      console.error('Execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const loadFromHistory = (execution: CodeExecution) => {
    setLanguage(execution.language);
    setCode(execution.code);
    setInput(execution.input || '');
    setOutput(execution.output || '');
    setError(execution.error || '');
    setExecutionTime(execution.executionTime);
    setShowHistory(false);
  };

  const copyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Code copied!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Code className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Code Compiler</h1>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
        <p className="text-gray-600">Write and execute code in multiple languages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    onClick={() => handleLanguageChange(lang.value)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      language === lang.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang.icon} {lang.label}
                  </button>
                ))}
              </div>
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 border rounded-lg font-mono text-sm min-h-[400px] bg-gray-50"
              placeholder="Write your code here..."
              spellCheck={false}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Input (stdin)</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 border rounded-lg font-mono text-sm min-h-[100px] bg-gray-50"
              placeholder="Enter input for your program..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Output</h3>
              {executionTime > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {executionTime}ms
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm min-h-[200px] whitespace-pre-wrap">
              {output || (isRunning ? 'Running...' : 'Output will appear here')}
            </div>
          </div>

          {error && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-red-600 mb-3">Error</h3>
              <div className="p-4 bg-red-50 text-red-700 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Execution History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No execution history yet
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((execution) => (
                    <div
                      key={execution.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => loadFromHistory(execution)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {LANGUAGES.find(l => l.value === execution.language)?.icon}
                          </span>
                          <span className="font-semibold">
                            {LANGUAGES.find(l => l.value === execution.language)?.label}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            execution.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-700'
                              : execution.status === 'TIMEOUT'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {execution.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {execution.executionTime}ms
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCode(execution.code, execution.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedId === execution.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                        {execution.code.substring(0, 100)}...
                      </pre>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(execution.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
