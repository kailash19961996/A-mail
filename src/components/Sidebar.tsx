import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Users, 
  Settings, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Shield,
  Eye,
  CheckCircle,
  AlertTriangle,
  Database,
  Cog,
  FileCheck,
  CreditCard,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  userTypes?: string[];
  userRoles?: string[];
  isAdminSection?: boolean;
}

interface NavigationGroup {
  label: string;
  icon: string;
  items: NavigationItem[];
  userTypes?: string[];
  userRoles?: string[];
  isAdminSection?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ============================================================================
  // NAVIGATION CONFIGURATION
  // ============================================================================

  const navigationGroups: NavigationGroup[] = [
    // Main Section - All Users
    {
      label: 'Main',
      icon: 'Home',
      items: [
        { path: '/home', label: 'Home', icon: 'Home' }
      ]
    },
    
    // Validation Screens
    {
      label: 'Validation Screens',
      icon: 'CheckCircle',
      items: [
        { path: '/validate/client-review', label: 'Client Review', icon: 'Users' },
        { path: '/validate/id-review', label: 'ID Review', icon: 'Shield' }
      ]
    },
    
    // Review Screens
    {
      label: 'Review Screens',
      icon: 'Eye',
      items: [
        { path: '/review/sar', label: 'SAR Review', icon: 'FileCheck' },
        { path: '/review/presub', label: 'PreSub Review', icon: 'FileCheck' },
        { path: '/review/floc', label: 'FLOC Review', icon: 'FileCheck' }
      ]
    },
    
    // All Data
    {
      label: 'All Data',
      icon: 'Database',
      items: [
        { path: '/all-clients', label: 'All Clients', icon: 'Users' },
        { path: '/all-cases', label: 'All Cases', icon: 'Briefcase' }
      ]
    },
    
    // Admin Section - Only Admin or SysAdmin
    {
      label: 'Admin',
      icon: 'Cog',
      userTypes: ['Admin', 'SysAdmin'],
      isAdminSection: true,
      items: [
        { path: '/admin/config', label: 'General Config', icon: 'Settings' },
        { path: '/admin/templates', label: 'Templates Config', icon: 'FileText' },
        { path: '/admin/lenders', label: 'Lenders Config', icon: 'CreditCard' },
        { path: '/admin/actions', label: 'Actions Config', icon: 'Zap' }
      ]
    }
  ];

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Home: <Home className="h-5 w-5" />,
      Briefcase: <Briefcase className="h-5 w-5" />,
      FileText: <FileText className="h-5 w-5" />,
      Users: <Users className="h-5 w-5" />,
      Settings: <Settings className="h-5 w-5" />,
      Building2: <Building2 className="h-5 w-5" />,
      Shield: <Shield className="h-5 w-5" />,
      Eye: <Eye className="h-5 w-5" />,
      CheckCircle: <CheckCircle className="h-5 w-5" />,
      AlertTriangle: <AlertTriangle className="h-5 w-5" />,
      Database: <Database className="h-5 w-5" />,
      Cog: <Cog className="h-5 w-5" />,
      FileCheck: <FileCheck className="h-5 w-5" />,
      CreditCard: <CreditCard className="h-5 w-5" />,
      Zap: <Zap className="h-5 w-5" />
    };
    return iconMap[iconName] || <Home className="h-5 w-5" />;
  };

  const hasAccess = (item: NavigationItem | NavigationGroup): boolean => {
    if (!user) return false;
    
    // SysAdmin has access to everything
    if (user.user_type === 'SysAdmin') return true;
    
    // Check user type restrictions
    if (item.userTypes && !item.userTypes.includes(user.user_type)) {
      return false;
    }
    
    // Check user role restrictions
    if (item.userRoles && !item.userRoles.some(role => user.user_roles.includes(role))) {
      return false;
    }
    
    return true;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredNavigationGroups = navigationGroups.filter(hasAccess);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-4 space-y-6">
          {filteredNavigationGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {/* Group Header */}
              {!isCollapsed && (
                <div className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {getIconComponent(group.icon)}
                  <span>{group.label}</span>
                </div>
              )}
              
              {/* Group Items */}
              <ul className="space-y-1">
                {group.items.filter(hasAccess).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <span className="flex-shrink-0">
                          {getIconComponent(item.icon)}
                        </span>
                        {!isCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Info (when expanded) */}
        {!isCollapsed && user && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm">
              <p className="text-gray-300">Logged in as</p>
              <p className="font-medium text-white truncate">{user.first_name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {user.user_type}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {user.user_roles.slice(0, 3).join(', ')}
                {user.user_roles.length > 3 && '...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 