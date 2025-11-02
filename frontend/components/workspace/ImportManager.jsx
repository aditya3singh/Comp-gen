'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, Download, Copy, ExternalLink, 
  Search, Filter, CheckCircle, AlertCircle, Info
} from 'lucide-react';

export default function ImportManager({ imports, onImportsChange, jsx, onCodeUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImports, setSelectedImports] = useState([]);
  const [showAddImport, setShowAddImport] = useState(false);
  const [newImport, setNewImport] = useState({ module: '', imports: '', type: 'named' });

  // Popular React libraries for suggestions
  const popularLibraries = [
    { name: 'react-icons', description: 'Popular icon library', example: "import { FaHome } from 'react-icons/fa'" },
    { name: 'framer-motion', description: 'Animation library', example: "import { motion } from 'framer-motion'" },
    { name: 'react-router-dom', description: 'Routing library', example: "import { BrowserRouter, Route } from 'react-router-dom'" },
    { name: 'styled-components', description: 'CSS-in-JS library', example: "import styled from 'styled-components'" },
    { name: 'axios', description: 'HTTP client', example: "import axios from 'axios'" },
    { name: 'lodash', description: 'Utility library', example: "import _ from 'lodash'" },
    { name: 'moment', description: 'Date library', example: "import moment from 'moment'" },
    { name: 'classnames', description: 'Conditional classes', example: "import classNames from 'classnames'" }
  ];

  const filteredLibraries = popularLibraries.filter(lib =>
    lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lib.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImport = () => {
    if (!newImport.module || !newImport.imports) return;

    const importStatement = newImport.type === 'default'
      ? `import ${newImport.imports} from '${newImport.module}';`
      : `import { ${newImport.imports} } from '${newImport.module}';`;

    const newImportObj = {
      statement: importStatement,
      module: newImport.module,
      imports: newImport.imports,
      type: newImport.type
    };

    const updatedImports = [...imports, newImportObj];
    onImportsChange(updatedImports);

    // Update JSX code with new import
    if (jsx && onCodeUpdate) {
      const updatedJsx = importStatement + '\n' + jsx;
      onCodeUpdate(updatedJsx, '');
    }

    // Reset form
    setNewImport({ module: '', imports: '', type: 'named' });
    setShowAddImport(false);
  };

  const handleRemoveImport = (index) => {
    const updatedImports = imports.filter((_, i) => i !== index);
    onImportsChange(updatedImports);

    // Remove from JSX code
    if (jsx && onCodeUpdate) {
      const importToRemove = imports[index];
      const updatedJsx = jsx.replace(importToRemove.statement, '').trim();
      onCodeUpdate(updatedJsx, '');
    }
  };

  const handleCopyImport = (importStatement) => {
    navigator.clipboard.writeText(importStatement);
    // You could add a toast notification here
  };

  const handleInstallPackage = (packageName) => {
    // This would typically open a terminal or show installation instructions
    const installCommand = `npm install ${packageName}`;
    navigator.clipboard.writeText(installCommand);
    // Show toast: "Install command copied to clipboard"
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Import Manager</h3>
              <p className="text-sm text-gray-600">Manage your component dependencies</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddImport(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Import
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search libraries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Current Imports */}
        <div className="w-1/2 border-r-2 border-black">
          <div className="p-6">
            <h4 className="font-semibold text-black mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Current Imports ({imports.length})
            </h4>
            
            {imports.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No imports detected</p>
                <p className="text-sm text-gray-500">Add imports to enhance your component</p>
              </div>
            ) : (
              <div className="space-y-3">
                {imports.map((imp, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-red-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                            {imp.module}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {imp.type || 'named'}
                          </span>
                        </div>
                        <code className="text-sm text-gray-800 bg-gray-50 p-2 rounded block font-mono">
                          {imp.statement}
                        </code>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => handleCopyImport(imp.statement)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                          title="Copy import"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveImport(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Remove import"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Library Suggestions */}
        <div className="w-1/2">
          <div className="p-6">
            <h4 className="font-semibold text-black mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Popular Libraries
            </h4>
            
            <div className="space-y-3">
              {filteredLibraries.map((lib, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-black">{lib.name}</h5>
                      <p className="text-sm text-gray-600">{lib.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleInstallPackage(lib.name)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Copy install command"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`https://www.npmjs.com/package/${lib.name}`, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                        title="View on npm"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <code className="text-xs text-gray-700 bg-gray-50 p-2 rounded block font-mono">
                    {lib.example}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Import Modal */}
      {showAddImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-black">
            <h3 className="text-lg font-bold text-black mb-4">Add New Import</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., react-icons"
                  value={newImport.module}
                  onChange={(e) => setNewImport({ ...newImport, module: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Type
                </label>
                <select
                  value={newImport.type}
                  onChange={(e) => setNewImport({ ...newImport, type: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                >
                  <option value="named">Named Import</option>
                  <option value="default">Default Import</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newImport.type === 'default' ? 'Import Name' : 'Named Imports'}
                </label>
                <input
                  type="text"
                  placeholder={newImport.type === 'default' ? 'e.g., React' : 'e.g., FaHome, FaUser'}
                  value={newImport.imports}
                  onChange={(e) => setNewImport({ ...newImport, imports: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                />
              </div>
              
              {/* Preview */}
              {newImport.module && newImport.imports && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <code className="text-sm font-mono text-gray-800">
                    {newImport.type === 'default'
                      ? `import ${newImport.imports} from '${newImport.module}';`
                      : `import { ${newImport.imports} } from '${newImport.module}';`
                    }
                  </code>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddImport(false)}
                className="px-4 py-2 text-gray-600 hover:text-black transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImport}
                disabled={!newImport.module || !newImport.imports}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                Add Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}