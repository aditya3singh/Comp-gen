'use client';

import { useState, useEffect } from 'react';
import { X, Palette, Type, Maximize, Border } from 'lucide-react';
import { ChromePicker } from 'react-color';

export default function PropertyEditor({ 
  selectedElement, 
  onClose, 
  onPropertyChange,
  position 
}) {
  const [activeTab, setActiveTab] = useState('style');
  const [properties, setProperties] = useState({
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '16',
    padding: '8',
    margin: '0',
    borderRadius: '4',
    borderWidth: '1',
    borderColor: '#e5e7eb',
    textContent: '',
    width: 'auto',
    height: 'auto'
  });
  const [showColorPicker, setShowColorPicker] = useState(null);

  useEffect(() => {
    if (selectedElement) {
      // Extract current styles from selected element
      const computedStyle = window.getComputedStyle(selectedElement);
      setProperties({
        backgroundColor: rgbToHex(computedStyle.backgroundColor) || '#ffffff',
        color: rgbToHex(computedStyle.color) || '#000000',
        fontSize: parseInt(computedStyle.fontSize) || 16,
        padding: parseInt(computedStyle.padding) || 8,
        margin: parseInt(computedStyle.margin) || 0,
        borderRadius: parseInt(computedStyle.borderRadius) || 4,
        borderWidth: parseInt(computedStyle.borderWidth) || 1,
        borderColor: rgbToHex(computedStyle.borderColor) || '#e5e7eb',
        textContent: selectedElement.textContent || '',
        width: computedStyle.width === 'auto' ? 'auto' : parseInt(computedStyle.width),
        height: computedStyle.height === 'auto' ? 'auto' : parseInt(computedStyle.height)
      });
    }
  }, [selectedElement]);

  const handlePropertyChange = (property, value) => {
    const newProperties = { ...properties, [property]: value };
    setProperties(newProperties);
    
    // Apply changes immediately to the element
    if (selectedElement) {
      applyStylesToElement(selectedElement, property, value);
    }
    
    // Notify parent component
    onPropertyChange(property, value, newProperties);
  };

  const applyStylesToElement = (element, property, value) => {
    switch (property) {
      case 'backgroundColor':
        element.style.backgroundColor = value;
        break;
      case 'color':
        element.style.color = value;
        break;
      case 'fontSize':
        element.style.fontSize = `${value}px`;
        break;
      case 'padding':
        element.style.padding = `${value}px`;
        break;
      case 'margin':
        element.style.margin = `${value}px`;
        break;
      case 'borderRadius':
        element.style.borderRadius = `${value}px`;
        break;
      case 'borderWidth':
        element.style.borderWidth = `${value}px`;
        break;
      case 'borderColor':
        element.style.borderColor = value;
        break;
      case 'textContent':
        if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
          element.textContent = value;
        }
        break;
      case 'width':
        element.style.width = value === 'auto' ? 'auto' : `${value}px`;
        break;
      case 'height':
        element.style.height = value === 'auto' ? 'auto' : `${value}px`;
        break;
    }
  };

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const result = rgb.match(/\d+/g);
    if (!result) return '#ffffff';
    return '#' + result.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  };

  if (!selectedElement) return null;

  return (
    <div 
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-80"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '500px',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">Element Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="h-4 w-4 inline mr-1" />
          Style
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'content'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Type className="h-4 w-4 inline mr-1" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'layout'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Maximize className="h-4 w-4 inline mr-1" />
          Layout
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'style' && (
          <>
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border cursor-pointer"
                  style={{ backgroundColor: properties.backgroundColor }}
                  onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
                />
                <input
                  type="text"
                  value={properties.backgroundColor}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
              {showColorPicker === 'bg' && (
                <div className="absolute z-10 mt-2">
                  <ChromePicker
                    color={properties.backgroundColor}
                    onChange={(color) => handlePropertyChange('backgroundColor', color.hex)}
                  />
                </div>
              )}
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border cursor-pointer"
                  style={{ backgroundColor: properties.color }}
                  onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                />
                <input
                  type="text"
                  value={properties.color}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
              </div>
              {showColorPicker === 'text' && (
                <div className="absolute z-10 mt-2">
                  <ChromePicker
                    color={properties.color}
                    onChange={(color) => handlePropertyChange('color', color.hex)}
                  />
                </div>
              )}
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {properties.fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="48"
                value={properties.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding: {properties.padding}px
              </label>
              <input
                type="range"
                min="0"
                max="48"
                value={properties.padding}
                onChange={(e) => handlePropertyChange('padding', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius: {properties.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="24"
                value={properties.borderRadius}
                onChange={(e) => handlePropertyChange('borderRadius', e.target.value)}
                className="w-full"
              />
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <>
            {/* Text Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <textarea
                value={properties.textContent}
                onChange={(e) => handlePropertyChange('textContent', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
                placeholder="Enter text content..."
              />
            </div>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            {/* Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={properties.width}
                  onChange={(e) => handlePropertyChange('width', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  placeholder="auto or px value"
                />
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={properties.height}
                  onChange={(e) => handlePropertyChange('height', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  placeholder="auto or px value"
                />
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margin: {properties.margin}px
              </label>
              <input
                type="range"
                min="0"
                max="48"
                value={properties.margin}
                onChange={(e) => handlePropertyChange('margin', e.target.value)}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-500">
          Element: {selectedElement.tagName.toLowerCase()}
          {selectedElement.className && ` .${selectedElement.className.split(' ')[0]}`}
        </p>
      </div>
    </div>
  );
}