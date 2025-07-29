import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projectAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export const useProjectStore = create()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      recentProjects: [],
      templates: [],
      isLoading: false,
      searchQuery: '',
      sortBy: 'lastModified',
      filterBy: 'all',
      viewMode: 'grid',
      
      // Project statistics
      stats: {
        totalProjects: 0,
        totalComponents: 0,
        storageUsed: 0,
        storageLimit: 1024 * 1024 * 100, // 100MB
        collaborators: 0,
      },

      // Fetch all projects
      fetchProjects: async (page = 1, limit = 20) => {
        set({ isLoading: true });
        try {
          const response = await projectAPI.getProjects(page, limit, get().searchQuery, get().sortBy, get().filterBy);
          set({
            projects: page === 1 ? response.projects : [...get().projects, ...response.projects],
            stats: {
              ...get().stats,
              totalProjects: response.total,
              totalComponents: response.totalComponents,
              storageUsed: response.storageUsed,
            },
            isLoading: false
          });
          return response;
        } catch (error) {
          set({ isLoading: false });
          toast.error('Failed to load projects');
          throw error;
        }
      },

      // Create new project
      createProject: async (projectData) => {
        set({ isLoading: true });
        try {
          const response = await projectAPI.createProject(projectData);
          const newProject = response.project;
          
          set(state => ({
            projects: [newProject, ...state.projects],
            recentProjects: [newProject, ...state.recentProjects.slice(0, 4)],
            stats: {
              ...state.stats,
              totalProjects: state.stats.totalProjects + 1,
            },
            isLoading: false
          }));
          
          toast.success(`Project "${newProject.name}" created successfully!`, {
            icon: '🎉',
            duration: 4000,
          });
          
          return newProject;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Failed to create project');
          throw error;
        }
      },

      // Load specific project
      loadProject: async (projectId) => {
        set({ isLoading: true });
        try {
          const response = await projectAPI.getProject(projectId);
          const project = response.project;
          
          set(state => ({
            currentProject: project,
            recentProjects: [
              project,
              ...state.recentProjects.filter(p => p._id !== projectId).slice(0, 4)
            ],
            isLoading: false
          }));
          
          return project;
        } catch (error) {
          set({ isLoading: false });
          toast.error('Failed to load project');
          throw error;
        }
      },

      // Update project
      updateProject: async (projectId, updates) => {
        try {
          const response = await projectAPI.updateProject(projectId, updates);
          const updatedProject = response.project;
          
          set(state => ({
            projects: state.projects.map(p => 
              p._id === projectId ? updatedProject : p
            ),
            currentProject: state.currentProject?._id === projectId ? updatedProject : state.currentProject,
            recentProjects: state.recentProjects.map(p => 
              p._id === projectId ? updatedProject : p
            ),
          }));
          
          if (updates.name) {
            toast.success('Project updated successfully');
          }
          
          return updatedProject;
        } catch (error) {
          toast.error(error.message || 'Failed to update project');
          throw error;
        }
      },

      // Delete project
      deleteProject: async (projectId) => {
        try {
          await projectAPI.deleteProject(projectId);
          
          set(state => ({
            projects: state.projects.filter(p => p._id !== projectId),
            recentProjects: state.recentProjects.filter(p => p._id !== projectId),
            currentProject: state.currentProject?._id === projectId ? null : state.currentProject,
            stats: {
              ...state.stats,
              totalProjects: Math.max(0, state.stats.totalProjects - 1),
            }
          }));
          
          toast.success('Project deleted successfully', {
            icon: '🗑️',
          });
          
          return true;
        } catch (error) {
          toast.error(error.message || 'Failed to delete project');
          throw error;
        }
      },

      // Duplicate project
      duplicateProject: async (projectId) => {
        set({ isLoading: true });
        try {
          const response = await projectAPI.duplicateProject(projectId);
          const duplicatedProject = response.project;
          
          set(state => ({
            projects: [duplicatedProject, ...state.projects],
            stats: {
              ...state.stats,
              totalProjects: state.stats.totalProjects + 1,
            },
            isLoading: false
          }));
          
          toast.success(`Project duplicated as "${duplicatedProject.name}"`, {
            icon: '📋',
          });
          
          return duplicatedProject;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Failed to duplicate project');
          throw error;
        }
      },

      // Share project
      shareProject: async (projectId, shareSettings) => {
        try {
          const response = await projectAPI.shareProject(projectId, shareSettings);
          
          set(state => ({
            projects: state.projects.map(p => 
              p._id === projectId ? { ...p, sharing: response.sharing } : p
            ),
            currentProject: state.currentProject?._id === projectId 
              ? { ...state.currentProject, sharing: response.sharing }
              : state.currentProject,
          }));
          
          toast.success('Project sharing settings updated', {
            icon: '🔗',
          });
          
          return response.sharing;
        } catch (error) {
          toast.error(error.message || 'Failed to update sharing settings');
          throw error;
        }
      },

      // Export project
      exportProject: async (projectId, format = 'zip') => {
        try {
          const response = await projectAPI.exportProject(projectId, format);
          
          // Create download link
          const blob = new Blob([response.data], { type: response.contentType });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.success('Project exported successfully', {
            icon: '📦',
          });
          
          return true;
        } catch (error) {
          toast.error(error.message || 'Failed to export project');
          throw error;
        }
      },

      // Import project
      importProject: async (file) => {
        set({ isLoading: true });
        try {
          const response = await projectAPI.importProject(file);
          const importedProject = response.project;
          
          set(state => ({
            projects: [importedProject, ...state.projects],
            stats: {
              ...state.stats,
              totalProjects: state.stats.totalProjects + 1,
            },
            isLoading: false
          }));
          
          toast.success(`Project "${importedProject.name}" imported successfully!`, {
            icon: '📥',
          });
          
          return importedProject;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Failed to import project');
          throw error;
        }
      },

      // Load templates
      loadTemplates: async () => {
        try {
          const response = await projectAPI.getTemplates();
          set({ templates: response.templates });
          return response.templates;
        } catch (error) {
          toast.error('Failed to load templates');
          throw error;
        }
      },

      // Create project from template
      createFromTemplate: async (templateId, projectName) => {
        set({ isLoading: true });
        try {
          const response = await projectAPI.createFromTemplate(templateId, projectName);
          const newProject = response.project;
          
          set(state => ({
            projects: [newProject, ...state.projects],
            recentProjects: [newProject, ...state.recentProjects.slice(0, 4)],
            stats: {
              ...state.stats,
              totalProjects: state.stats.totalProjects + 1,
            },
            isLoading: false
          }));
          
          toast.success(`Project "${newProject.name}" created from template!`, {
            icon: '🎨',
          });
          
          return newProject;
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.message || 'Failed to create project from template');
          throw error;
        }
      },

      // Search and filter
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setSortBy: (sortBy) => {
        set({ sortBy });
      },

      setFilterBy: (filterBy) => {
        set({ filterBy });
      },

      setViewMode: (viewMode) => {
        set({ viewMode });
      },

      // Get filtered and sorted projects
      getFilteredProjects: () => {
        const { projects, searchQuery, sortBy, filterBy } = get();
        
        let filtered = projects;
        
        // Apply search filter
        if (searchQuery) {
          filtered = filtered.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        // Apply category filter
        if (filterBy !== 'all') {
          filtered = filtered.filter(project => {
            switch (filterBy) {
              case 'recent':
                return new Date(project.lastModified) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              case 'shared':
                return project.sharing?.isPublic || project.sharing?.collaborators?.length > 0;
              case 'templates':
                return project.isTemplate;
              case 'favorites':
                return project.isFavorite;
              default:
                return project.category === filterBy;
            }
          });
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'created':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'lastModified':
              return new Date(b.lastModified) - new Date(a.lastModified);
            case 'size':
              return (b.size || 0) - (a.size || 0);
            default:
              return 0;
          }
        });
        
        return filtered;
      },

      // Clear current project
      clearCurrentProject: () => {
        set({ currentProject: null });
      },

      // Update project stats
      updateStats: (statUpdates) => {
        set(state => ({
          stats: { ...state.stats, ...statUpdates }
        }));
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        recentProjects: state.recentProjects,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        filterBy: state.filterBy,
      }),
    }
  )
);