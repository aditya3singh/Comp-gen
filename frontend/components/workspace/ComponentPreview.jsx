'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Maximize2, Smartphone, Tablet, Monitor, Edit, 
  Download, Copy, Package, FileCode, Eye, Settings,
  Import, ExternalLink, Code2, Palette
} from 'lucide-react';
import PropertyEditor from './PropertyEditor';
import ImportManager from './ImportManager';

export default function ComponentPreview({ jsx, css, onCodeUpdate }) {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [propertyEditorPosition, setPropertyEditorPosition] = useState({ x: 0, y: 0 });
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showImportManager, setShowImportManager] = useState(false);
  const [activePanel, setActivePanel] = useState('preview'); // 'preview', 'imports', 'settings'
  const [imports, setImports] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  const previewSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  // Memoize HTML generation for better performance
  const generatePreviewHTML = useCallback((jsxCode, cssCode) => {
    // Clean and prepare JSX for preview
    let cleanJSX = jsxCode || '';
    
    // Extract and store imports for the import manager
    const importMatches = cleanJSX.match(/import\s+.*?from\s+['"].*?['"];?\s*/g) || [];
    const extractedImports = importMatches.map(imp => {
      const match = imp.match(/import\s+(.*?)\s+from\s+['"](.+?)['"];?/);
      return match ? { statement: imp.trim(), module: match[2], imports: match[1] } : null;
    }).filter(Boolean);
    
    // Update imports state if different
    if (JSON.stringify(extractedImports) !== JSON.stringify(imports)) {
      setImports(extractedImports);
    }
    
    // Remove imports and exports for preview
    cleanJSX = cleanJSX
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
      .replace(/export\s+(default\s+)?/g, '');

    // If no JSX provided, show modern placeholder
    if (!cleanJSX.trim()) {
      cleanJSX = `function Component() {
        return React.createElement("div", {
          style: {
            padding: "60px 40px",
            textAlign: "center",
            color: "#1f2937",
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            borderRadius: "16px",
            border: "2px solid #e5e7eb",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }
        }, [
          React.createElement("div", {
            style: {
              width: "64px",
              height: "64px",
              background: "#dc2626",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
            }
          }, React.createElement("span", {
            style: { fontSize: "24px", color: "white" }
          }, "⚡")),
          React.createElement("h2", {
            style: {
              margin: "0 0 16px 0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#111827"
            }
          }, "AI Component Generator"),
          React.createElement("p", {
            style: {
              margin: "0 0 32px 0",
              color: "#6b7280",
              fontSize: "16px",
              lineHeight: "1.5",
              maxWidth: "400px"
            }
          }, "Start creating amazing React components by describing what you want in the chat panel."),
          React.createElement("div", {
            style: {
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center"
            }
          }, [
            React.createElement("button", {
              key: "start",
              style: {
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)"
              }
            }, "Start Creating"),
            React.createElement("button", {
              key: "examples",
              style: {
                background: "white",
                color: "#374151",
                border: "2px solid #e5e7eb",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }
            }, "View Examples")
          ])
        ]);
      }`;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #ffffff;
            min-height: 100vh;
            color: #1f2937;
            line-height: 1.6;
        }
        #root {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 40px);
        }
        .error {
            color: #dc2626;
            background: #ffffff;
            border: 2px solid #dc2626;
            border-radius: 12px;
            padding: 24px;
            margin: 20px;
            max-width: 500px;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
        }
        .error h3 {
            margin: 0 0 12px 0;
            font-weight: 600;
            font-size: 18px;
        }
        .error p {
            margin: 0 0 16px 0;
            font-size: 14px;
        }
        .error details {
            font-size: 12px;
        }
        .error summary {
            cursor: pointer;
            font-weight: 500;
            padding: 8px 0;
        }
        .error pre {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            overflow: auto;
            border: 1px solid #e5e7eb;
            margin-top: 8px;
        }
        
        /* Custom component styles */
        ${cssCode || ''}
        
        /* Performance optimizations */
        * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Smooth animations */
        * {
            transition: all 0.2s ease;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        try {
            // Component code
            ${cleanJSX}
            
            // Enhanced component detection
            let ComponentToRender;
            
            // Try to find any defined function component with better detection
            const possibleComponents = [
                'Component', 'Button', 'Card', 'LoginForm', 'Navigation', 
                'TestComponent', 'App', 'Main', 'Layout', 'Header', 'Footer',
                'Sidebar', 'Modal', 'Form', 'Input', 'Select', 'Checkbox'
            ];
            
            for (const name of possibleComponents) {
                if (typeof window[name] !== 'undefined' && typeof window[name] === 'function') {
                    ComponentToRender = window[name];
                    break;
                }
            }
            
            // If no component found, create enhanced fallback
            if (!ComponentToRender) {
                ComponentToRender = function FallbackComponent() {
                    return React.createElement("div", {
                        style: {
                            padding: "48px",
                            textAlign: "center",
                            color: "#dc2626",
                            background: "#ffffff",
                            borderRadius: "16px",
                            border: "2px solid #dc2626",
                            fontFamily: "'Inter', sans-serif",
                            maxWidth: "500px",
                            margin: "0 auto",
                            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)"
                        }
                    }, [
                        React.createElement("div", {
                            key: "icon",
                            style: {
                                width: "48px",
                                height: "48px",
                                background: "#dc2626",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                                color: "white",
                                fontSize: "20px"
                            }
                        }, "⚠"),
                        React.createElement("h3", {
                            key: "title",
                            style: {
                                margin: "0 0 12px 0",
                                fontSize: "18px",
                                fontWeight: "600"
                            }
                        }, "Component Render Error"),
                        React.createElement("p", {
                            key: "message",
                            style: {
                                margin: "0 0 20px 0",
                                fontSize: "14px",
                                color: "#6b7280",
                                lineHeight: "1.5"
                            }
                        }, "The component could not be rendered. Please check your code and try generating a new component."),
                        React.createElement("button", {
                            key: "retry",
                            style: {
                                background: "#dc2626",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: "pointer"
                            },
                            onClick: () => window.location.reload()
                        }, "Retry")
                    ]);
                };
            }
            
            // Render with error boundary
            const ErrorBoundary = class extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { hasError: false, error: null };
                }
                
                static getDerivedStateFromError(error) {
                    return { hasError: true, error };
                }
                
                render() {
                    if (this.state.hasError) {
                        return React.createElement("div", {
                            className: "error"
                        }, [
                            React.createElement("h3", { key: "title" }, "Component Error"),
                            React.createElement("p", { key: "message" }, this.state.error?.message || "An error occurred"),
                            React.createElement("details", { key: "details" }, [
                                React.createElement("summary", { key: "summary" }, "Show Details"),
                                React.createElement("pre", { key: "stack" }, this.state.error?.stack || "No stack trace available")
                            ])
                        ]);
                    }
                    
                    return this.props.children;
                }
            };
            
            // Render the component with error boundary
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
                React.createElement(ErrorBoundary, null,
                    React.createElement(ComponentToRender)
                )
            );
            
        } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = \`
                <div class="error">
                    <h3>Preview Error</h3>
                    <p>\${error.message}</p>
                    <details>
                        <summary>Show Details</summary>
                        <pre>\${error.stack}</pre>
                    </details>
                </div>
            \`;
        }
    </script>
</body>
</html>`;
  };

  // Optimized refresh with debouncing
  const refreshPreview = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      setIsRefreshing(true);
      setError(null);
      
      if (iframeRef.current) {
        try {
          const html = generatePreviewHTML(jsx, css);
          
          // Write HTML directly to iframe with better error handling
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
          
          setIsRefreshing(false);
        } catch (error) {
          console.error('Preview generation error:', error);
          setError('Failed to generate preview');
          setIsRefreshing(false);
        }
      } else {
        setIsRefreshing(false);
      }
    }, 150); // Debounce for 150ms
  }, [jsx, css, generatePreviewHTML]);

  useEffect(() => {
    console.log('🔄 ComponentPreview useEffect triggered with:', { 
      jsx: jsx?.substring(0, 100) + '...', 
      css: css?.substring(0, 50) + '...',
      jsxLength: jsx?.length,
      cssLength: css?.length
    });
    
    // Force refresh with a small delay to ensure DOM is ready
    setTimeout(() => {
      refreshPreview();
    }, 100);
  }, [jsx, css]);

  // Add a test component for debugging
  useEffect(() => {
    if (!jsx && !css) {
      // Show a test component when no JSX is provided
      const testJSX = `function TestComponent() {
        return React.createElement("div", {
          style: {
            padding: "40px",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "16px",
            fontFamily: "Arial, sans-serif"
          }
        }, [
          React.createElement("h2", { 
            style: { margin: "0 0 16px 0", fontSize: "24px" } 
          }, "🚀 AI Component Generator"),
          React.createElement("p", { 
            style: { margin: "0 0 20px 0", opacity: 0.9 } 
          }, "Generate your first component by typing a prompt in the chat!"),
          React.createElement("button", {
            style: {
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }
          }, "Start Creating")
        ]);
      }`;
      
      setTimeout(() => {
        if (iframeRef.current) {
          const html = generatePreviewHTML(testJSX, '');
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
        }
      }, 100);
    }
  }, []);

  const handleIframeError = () => {
    setError('Failed to load component preview');
    setIsRefreshing(false);
  };

  const setupElementSelection = () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;

    const iframeDoc = iframeRef.current.contentDocument;
    const elements = iframeDoc.querySelectorAll('*');

    elements.forEach(element => {
      // Skip html, head, body, script elements
      if (['HTML', 'HEAD', 'BODY', 'SCRIPT'].includes(element.tagName)) return;

      element.style.cursor = 'pointer';
      element.style.transition = 'all 0.2s ease';

      element.addEventListener('mouseenter', () => {
        element.style.outline = '2px solid #3b82f6';
        element.style.outlineOffset = '2px';
      });

      element.addEventListener('mouseleave', () => {
        if (element !== selectedElement) {
          element.style.outline = 'none';
        }
      });

      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Clear previous selection
        if (selectedElement) {
          selectedElement.style.outline = 'none';
        }

        // Set new selection
        setSelectedElement(element);
        element.style.outline = '2px solid #ef4444';
        element.style.outlineOffset = '2px';

        // Calculate position for property editor
        const rect = element.getBoundingClientRect();
        const iframeRect = iframeRef.current.getBoundingClientRect();
        
        setPropertyEditorPosition({
          x: iframeRect.left + rect.right + 10,
          y: iframeRect.top + rect.top
        });

        setShowPropertyEditor(true);
      });
    });
  };

  const handlePropertyChange = (property, value, allProperties) => {
    // Update the component code based on property changes
    if (onCodeUpdate) {
      // Generate updated CSS based on property changes
      const updatedCSS = generateUpdatedCSS(css, selectedElement, allProperties);
      onCodeUpdate(jsx, updatedCSS);
    }
  };

  const generateUpdatedCSS = (originalCSS, element, properties) => {
    // This is a simplified implementation
    // In a real application, you'd want more sophisticated CSS parsing and updating
    const elementClass = element.className || element.tagName.toLowerCase();
    
    const newStyles = `
.${elementClass} {
  background-color: ${properties.backgroundColor};
  color: ${properties.color};
  font-size: ${properties.fontSize}px;
  padding: ${properties.padding}px;
  margin: ${properties.margin}px;
  border-radius: ${properties.borderRadius}px;
  border: ${properties.borderWidth}px solid ${properties.borderColor};
  width: ${properties.width === 'auto' ? 'auto' : properties.width + 'px'};
  height: ${properties.height === 'auto' ? 'auto' : properties.height + 'px'};
}
`;

    return originalCSS + '\n' + newStyles;
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'bg-white'}`}>
      {/* Enhanced Header with Tabs */}
      <div className="bg-white border-b-2 border-black">
        {/* Main Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-black">Component Preview</h3>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActivePanel('preview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activePanel === 'preview'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                Preview
              </button>
              <button
                onClick={() => setActivePanel('imports')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activePanel === 'imports'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                <Package className="h-4 w-4 mr-2 inline" />
                Imports ({imports.length})
              </button>
              <button
                onClick={() => setActivePanel('settings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activePanel === 'settings'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                <Settings className="h-4 w-4 mr-2 inline" />
                Settings
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Device Size Controls */}
            {activePanel === 'preview' && (
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mr-4">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md transition-all ${
                    previewMode === 'desktop'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded-md transition-all ${
                    previewMode === 'tablet'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md transition-all ${
                    previewMode === 'mobile'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Action Buttons */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-all"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center px-3 py-2 text-sm rounded-md font-medium transition-all ${
                isEditMode 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditMode ? 'Exit Edit' : 'Edit Mode'}
            </button>
            
            <button
              onClick={refreshPreview}
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-100 disabled:opacity-50 rounded-md font-medium transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'preview' && (
          <div className="h-full flex flex-col">
            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto relative bg-gray-50">
              {error ? (
                <div className="text-center max-w-md">
                  <div className="bg-white border-2 border-red-600 rounded-xl p-8 shadow-lg">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">⚠</span>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">Preview Error</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                      onClick={refreshPreview}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 relative ${
                    isEditMode ? 'ring-4 ring-red-500 ring-opacity-50' : ''
                  }`}
                  style={{
                    width: previewSizes[previewMode].width,
                    height: previewSizes[previewMode].height,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    minHeight: '400px'
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 rounded-xl"
                    title="Component Preview"
                    sandbox="allow-scripts allow-same-origin"
                    onError={handleIframeError}
                    onLoad={() => {
                      if (isEditMode && iframeRef.current) {
                        setupElementSelection();
                      }
                    }}
                    style={{
                      opacity: isRefreshing ? 0.5 : 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  
                  {isRefreshing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
                      <div className="flex flex-col items-center space-y-3 text-gray-600">
                        <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
                        <span className="font-medium">Refreshing preview...</span>
                      </div>
                    </div>
                  )}

                  {isEditMode && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                      🎯 Edit Mode: Click elements to modify
                    </div>
                  )}
                </div>
              )}

              {/* Property Editor */}
              {showPropertyEditor && selectedElement && (
                <PropertyEditor
                  selectedElement={selectedElement}
                  position={propertyEditorPosition}
                  onClose={() => {
                    setShowPropertyEditor(false);
                    setSelectedElement(null);
                  }}
                  onPropertyChange={handlePropertyChange}
                />
              )}
            </div>

            {/* Preview Status Bar */}
            <div className="bg-white border-t-2 border-black px-6 py-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-black">
                    {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} Preview
                  </span>
                  {previewMode !== 'desktop' && (
                    <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {previewSizes[previewMode].width} × {previewSizes[previewMode].height}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    jsx ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {jsx ? '✓ Component loaded' : '○ No component'}
                  </span>
                  {jsx && (
                    <span className="text-gray-600 text-xs">
                      {jsx.split('\n').length} lines
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'imports' && (
          <ImportManager 
            imports={imports}
            onImportsChange={setImports}
            jsx={jsx}
            onCodeUpdate={onCodeUpdate}
          />
        )}

        {activePanel === 'settings' && (
          <div className="h-full p-6 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-black mb-6">Preview Settings</h3>
              
              <div className="space-y-6">
                {/* Performance Settings */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h4 className="font-semibold text-black mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-red-600" />
                    Performance
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Auto-refresh on code changes</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Enable hot reload</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Debounce refresh (ms)</span>
                      <input type="number" defaultValue="150" className="w-20 px-2 py-1 border rounded" />
                    </label>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <h4 className="font-semibold text-black mb-4 flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-red-600" />
                    Display
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Show grid overlay</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Show rulers</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Background color</span>
                      <select className="px-2 py-1 border rounded">
                        <option>White</option>
                        <option>Light Gray</option>
                        <option>Dark Gray</option>
                        <option>Transparent</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}