import { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  Copy, 
  Folder, 
  FileText,
  Zap,
  Code,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useProjectStore } from '@/store/projectStore';
import { useRouter } from 'next/navigation';

const QuickActions = ({ onCreateProject }) => {
  const router = useRouter();
  const { 
    templates = [], 
    createFromTemplate = async () => {}, 
    importProject = async () => {} 
  } = useProjectStore();
  const [isImporting, setIsImporting] = useState(false);

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsImporting(true);
      try {
        const project = await importProject(file);
        router.push(`/workspace/${project._id}`);
      } catch (error) {
        console.error('Import failed:', error);
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleTemplateCreate = async (templateId, name) => {
    try {
      const project = await createFromTemplate(templateId, name);
      router.push(`/workspace/${project._id}`);
    } catch (error) {
      console.error('Template creation failed:', error);
    }
  };

  const quickTemplates = [
    {
      id: 'react-component',
      name: 'React Component',
      description: 'Basic React functional component',
      icon: Code,
      color: 'primary',
      category: 'component'
    },
    {
      id: 'ui-card',
      name: 'UI Card',
      description: 'Modern card component with variants',
      icon: Layout,
      color: 'success',
      category: 'ui'
    },
    {
      id: 'form-component',
      name: 'Form Component',
      description: 'Complete form with validation',
      icon: Folder,
      color: 'warning',
      category: 'form'
    },
    {
      id: 'mobile-component',
      name: 'Mobile Component',
      description: 'Mobile-first responsive component',
      icon: Smartphone,
      color: 'accent',
      category: 'mobile'
    },
    {
      id: 'dashboard-widget',
      name: 'Dashboard Widget',
      description: 'Analytics dashboard widget',
      icon: Monitor,
      color: 'primary',
      category: 'dashboard'
    },
    {
      id: 'theme-component',
      name: 'Themed Component',
      description: 'Component with dark/light theme support',
      icon: Palette,
      color: 'success',
      category: 'theme'
    }
  ];

  const primaryActions = [
    {
      title: 'New Project',
      description: 'Start from scratch',
      icon: Plus,
      color: 'primary',
      action: onCreateProject
    },
    {
      title: 'Import Project',
      description: 'Upload existing project',
      icon: Upload,
      color: 'secondary',
      action: () => document.getElementById('import-file').click()
    },
    {
      title: 'Browse Templates',
      description: 'Use pre-built templates',
      icon: FileText,
      color: 'accent',
      action: () => router.push('/templates')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
          </div>
          <p className="text-sm text-neutral-600">Get started with your next project</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="p-4 rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 bg-${action.color}-100 rounded-xl flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}>
                      <Icon className={`h-5 w-5 text-${action.color}-600`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 group-hover:text-primary-900">
                    {action.title}
                  </h4>
                  <p className="text-sm text-neutral-600 group-hover:text-primary-700">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-success-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Quick Templates</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/templates')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <p className="text-sm text-neutral-600">Start with popular component templates</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                  onClick={() => handleTemplateCreate(template.id, template.name)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 bg-${template.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 text-${template.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 group-hover:text-primary-900 transition-colors">
                        {template.name}
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 group-hover:text-neutral-700 transition-colors">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${template.color}-100 text-${template.color}-800`}>
                      {template.category}
                    </span>
                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Copy className="h-5 w-5 text-warning-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Recently Used</h3>
          </div>
          <p className="text-sm text-neutral-600">Your recently used templates and components</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickTemplates.slice(0, 3).map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={`recent-${template.id}`}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer group"
                  onClick={() => handleTemplateCreate(template.id, `${template.name} Copy`)}
                >
                  <div className={`w-8 h-8 bg-${template.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 text-${template.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900">{template.name}</h4>
                    <p className="text-sm text-neutral-600">Used 2 days ago</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input for import */}
      <input
        type="file"
        id="import-file"
        accept=".zip,.json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
};

export default QuickActions;