'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Maximize2, Smartphone, Tablet, Monitor, Edit } from 'lucide-react';
import PropertyEditor from './PropertyEditor';

export default function ComponentPreview({ jsx, css, onCodeUpdate }) {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [propertyEditorPosition, setPropertyEditorPosition] = useState({ x: 0, y: 0 });
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const iframeRef = useRef(null);

  const previewSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const generatePreviewHTML = (jsxCode, cssCode) => {
    // Clean and prepare JSX for preview
    let cleanJSX = jsxCode || '';
    
    // Remove imports and exports
    cleanJSX = cleanJSX
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
      .replace(/export\s+(default\s+)?/g, '');

    // If no JSX provided, show placeholder
    if (!cleanJSX.trim()) {
      cleanJSX = `function Component() {
        return React.createElement("div", {
          style: {
            padding: "40px",
            textAlign: "center",
            color: "#6b7280",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "2px dashed #d1d5db"
          }
        }, "No component generated yet. Start by describing what you want to create!");
      }`;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f9fafb;
            min-height: 100vh;
        }
        #root {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 40px);
        }
        .error {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            margin: 20px;
            max-width: 500px;
        }
        ${cssCode || ''}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        try {
            // Component code
            ${cleanJSX}
            
            // Find the component function
            let ComponentToRender;
            
            // Try to find any defined function component
            if (typeof Component !== 'undefined') {
                ComponentToRender = Component;
            } else if (typeof Button !== 'undefined') {
                ComponentToRender = Button;
            } else if (typeof Card !== 'undefined') {
                ComponentToRender = Card;
            } else if (typeof LoginForm !== 'undefined') {
                ComponentToRender = LoginForm;
            } else if (typeof Navigation !== 'undefined') {
                ComponentToRender = Navigation;
            } else if (typeof TestComponent !== 'undefined') {
                ComponentToRender = TestComponent;
            } else {
                // Create a fallback component
                ComponentToRender = function FallbackComponent() {
                    return React.createElement("div", {
                        style: {
                            padding: "40px",
                            textAlign: "center",
                            color: "#ef4444",
                            background: "#fef2f2",
                            borderRadius: "12px",
                            border: "1px solid #fecaca",
                            fontFamily: "Arial, sans-serif"
                        }
                    }, "Component could not be rendered. Please try generating a new component.");
                };
            }
            
            // Render the component
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(ComponentToRender));
            
        } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = \`
                <div class="error">
                    <h3>Preview Error</h3>
                    <p>\${error.message}</p>
                    <details style="margin-top: 10px;">
                        <summary style="cursor: pointer;">Show Details</summary>
                        <pre style="margin-top: 10px; font-size: 12px; overflow: auto;">\${error.stack}</pre>
                    </details>
                </div>
            \`;
        }
    </script>
</body>
</html>`;
  };

  const refreshPreview = () => {
    setIsRefreshing(true);
    setError(null);
    
    if (iframeRef.current) {
      try {
        const html = generatePreviewHTML(jsx, css);
        console.log('Generated HTML:', html); // Debug log
        
        // Write HTML directly to iframe
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
  };

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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Preview Controls */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-900">Component Preview</h3>
          
          {/* Device Size Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-md ${
                previewMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 rounded-md ${
                previewMode === 'tablet'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Tablet View"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-md ${
                previewMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center px-3 py-2 text-sm rounded-md ${
              isEditMode 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditMode ? 'Exit Edit' : 'Edit Mode'}
          </button>
          
          <button
            onClick={refreshPreview}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative">
        {error ? (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-900 mb-2">Preview Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={refreshPreview}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 relative ${
              isEditMode ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              width: previewSizes[previewMode].width,
              height: previewSizes[previewMode].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
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
                transition: 'opacity 0.3s ease',
                pointerEvents: isEditMode ? 'auto' : 'auto'
              }}
            />
            
            {isRefreshing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="flex items-center space-x-2 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Refreshing preview...</span>
                </div>
              </div>
            )}

            {isEditMode && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                Edit Mode: Click elements to modify
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

      {/* Preview Info */}
      <div className="bg-white border-t px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} Preview
            {previewMode !== 'desktop' && (
              <span className="ml-2">
                {previewSizes[previewMode].width} × {previewSizes[previewMode].height}
              </span>
            )}
          </span>
          <span>
            {jsx ? 'Component loaded' : 'No component'}
          </span>
        </div>
      </div>
    </div>
  );
}