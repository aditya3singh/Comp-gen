import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Code, 
  Zap,
  Calendar,
  Activity,
  Eye,
  Download,
  Star,
  GitBranch
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';

const ProjectAnalytics = () => {
  const { projects = [], stats = {} } = useProjectStore();
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState({
    projectsCreated: [],
    componentsGenerated: [],
    activeUsers: [],
    popularProjects: [],
  });

  // Mock analytics data - in real app, this would come from API
  useEffect(() => {
    const generateMockData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const projectsData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 10) + 1
      }));
      
      const componentsData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 25) + 5
      }));

      setAnalyticsData({
        projectsCreated: projectsData,
        componentsGenerated: componentsData,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        popularProjects: projects.slice(0, 5).map(p => ({
          ...p,
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 50) + 10,
        }))
      });
    };

    generateMockData();
  }, [timeRange, projects]);

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${
                change > 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(change)}% from last period</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MiniChart = ({ data, color = 'primary' }) => (
    <div className="flex items-end space-x-1 h-16">
      {data.slice(-7).map((point, index) => (
        <div
          key={index}
          className={`bg-${color}-200 rounded-t-sm flex-1 transition-all duration-300 hover:bg-${color}-300`}
          style={{ height: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%` }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Analytics</h2>
          <p className="text-neutral-600">Track your project performance and usage</p>
        </div>
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects || projects.length || 0}
          change={12}
          icon={Code}
          color="primary"
        />
        <StatCard
          title="Components Created"
          value={stats.totalComponents || 0}
          change={8}
          icon={Zap}
          color="success"
        />
        <StatCard
          title="Storage Used"
          value={`${Math.round((stats.storageUsed || 0) / 1024 / 1024)}MB`}
          change={-3}
          icon={BarChart3}
          color="warning"
        />
        <StatCard
          title="Active Sessions"
          value={analyticsData.activeUsers || 0}
          change={15}
          icon={Activity}
          color="accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Created Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Projects Created</h3>
                <p className="text-sm text-neutral-600">Daily project creation over time</p>
              </div>
              <Code className="h-5 w-5 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent>
            <MiniChart data={analyticsData.projectsCreated} color="primary" />
            <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
              <span>
                {analyticsData.projectsCreated.reduce((sum, d) => sum + d.value, 0)} total
              </span>
              <span>Last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        {/* Components Generated Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Components Generated</h3>
                <p className="text-sm text-neutral-600">AI components created daily</p>
              </div>
              <Zap className="h-5 w-5 text-success-600" />
            </div>
          </CardHeader>
          <CardContent>
            <MiniChart data={analyticsData.componentsGenerated} color="success" />
            <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
              <span>
                {analyticsData.componentsGenerated.reduce((sum, d) => sum + d.value, 0)} total
              </span>
              <span>Last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Popular Projects</h3>
              <p className="text-sm text-neutral-600">Your most viewed and liked projects</p>
            </div>
            <Star className="h-5 w-5 text-warning-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.popularProjects.map((project, index) => (
              <div key={project._id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{project.title}</h4>
                    <p className="text-sm text-neutral-600 line-clamp-1">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{project.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
              <p className="text-sm text-neutral-600">Your latest project activities</p>
            </div>
            <Clock className="h-5 w-5 text-neutral-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project._id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900">
                    Updated <span className="font-medium">{project.title}</span>
                  </p>
                  <p className="text-xs text-neutral-600">
                    {new Date(project.lastModified || project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <GitBranch className="h-4 w-4 text-neutral-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;