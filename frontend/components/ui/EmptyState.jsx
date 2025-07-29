import { Sparkles, Plus } from 'lucide-react';
import Button from './Button';
import { Card } from './Card';

const EmptyState = ({ 
  icon: Icon = Sparkles,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-20 ${className}`}>
      <Card className="p-12 max-w-md mx-auto">
        <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mb-6 mx-auto">
          <Icon className="h-10 w-10 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-3">
          {title}
        </h3>
        <p className="text-neutral-600 mb-8">
          {description}
        </p>
        {action && (
          <Button
            onClick={onAction}
            size="lg"
            className="interactive"
          >
            <Plus className="h-5 w-5 mr-2" />
            {actionLabel}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default EmptyState;