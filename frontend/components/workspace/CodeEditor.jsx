'use client';

import { useEffect, useRef } from 'react';
import { Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CodeEditor({ code, language, onChange, readOnly = false }) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Simple syntax highlighting for demo
    if (textareaRef.current) {
      textareaRef.current.value = code || '';
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code || '');
    toast.success('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const extension = language === 'javascript' ? 'jsx' : 'css';
    const filename = `component.${extension}`;
    const blob = new Blob([code || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded!`);
  };

  const handleChange = (e) => {
    if (onChange && !readOnly) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {language === 'javascript' ? 'JSX' : 'CSS'}
          </span>
          <span className="text-xs text-gray-500">
            {code ? `${code.split('\n').length} lines` : '0 lines'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        {code ? (
          <div className="h-full flex">
            {/* Line Numbers */}
            <div className="bg-gray-800 text-gray-500 text-sm font-mono p-4 pr-2 select-none border-r border-gray-700 min-w-[3rem] overflow-hidden">
              {code.split('\n').map((_, index) => (
                <div key={index} className="text-right leading-6 h-6">
                  {index + 1}
                </div>
              ))}
            </div>
            
            {/* Code Content */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none border-0 outline-none focus:outline-none scrollbar-thin"
                value={code}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder={`Enter your ${language === 'javascript' ? 'JSX' : 'CSS'} code here...`}
                style={{
                  fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: '1.5',
                  tabSize: 2,
                  color: '#ffffff',
                  caretColor: '#ffffff',
                  backgroundColor: '#111827'
                }}
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">
                  {language === 'javascript' ? '⚛️' : '🎨'}
                </span>
              </div>
              <p className="text-lg mb-2 text-gray-300">No {language === 'javascript' ? 'JSX' : 'CSS'} code generated yet</p>
              <p className="text-sm text-gray-500">
                Start a conversation with the AI to generate your component
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Line Numbers (Simple Implementation) */}
      {code && (
        <div className="absolute left-0 top-12 bottom-0 w-12 bg-gray-800 border-r border-gray-700 text-gray-500 text-sm font-mono overflow-hidden">
          <div className="p-4 pt-4">
            {code.split('\n').map((_, index) => (
              <div key={index} className="text-right leading-6">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {code && (
        <style jsx>{`
          textarea {
            padding-left: 4rem !important;
          }
        `}</style>
      )}
    </div>
  );
}