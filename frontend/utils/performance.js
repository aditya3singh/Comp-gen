// Performance monitoring utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && metric.duration > 1000) {
        console.warn(`⚠️ Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
      
      return metric.duration;
    }
    return null;
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    const results = {};
    for (const [name, metric] of this.metrics.entries()) {
      results[name] = {
        duration: metric.duration,
        startTime: metric.startTime,
        endTime: metric.endTime
      };
    }
    return results;
  }

  clear() {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const perfMonitor = new PerformanceMonitor();

// Auth-specific performance tracking
export const authPerf = {
  trackLogin: () => perfMonitor.startTimer('auth_login'),
  trackLoginComplete: () => perfMonitor.endTimer('auth_login'),
  
  trackRegister: () => perfMonitor.startTimer('auth_register'),
  trackRegisterComplete: () => perfMonitor.endTimer('auth_register'),
  
  trackAuthCheck: () => perfMonitor.startTimer('auth_check'),
  trackAuthCheckComplete: () => perfMonitor.endTimer('auth_check'),
  
  trackTokenRefresh: () => perfMonitor.startTimer('token_refresh'),
  trackTokenRefreshComplete: () => perfMonitor.endTimer('token_refresh'),
  
  getAuthMetrics: () => {
    const metrics = perfMonitor.getAllMetrics();
    return {
      login: metrics.auth_login?.duration || null,
      register: metrics.auth_register?.duration || null,
      authCheck: metrics.auth_check?.duration || null,
      tokenRefresh: metrics.token_refresh?.duration || null
    };
  }
};

// Debounce utility for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility
export function memoize(fn, getKey = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    // Clear cache after 5 minutes to prevent memory leaks
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);
    
    return result;
  };
}

// Fast deep clone for small objects
export function fastClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => fastClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = fastClone(obj[key]);
      }
    }
    return cloned;
  }
}

export default {
  perfMonitor,
  authPerf,
  debounce,
  throttle,
  memoize,
  fastClone
};