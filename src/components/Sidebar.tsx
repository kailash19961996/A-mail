import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Users, 
  Settings, 
  FileText, 
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
import { hasPermission, ROLES, dev_log } from '../utils/coreUtils';
import SidebarView, { type SidebarViewGroup } from './Sidebar-view';

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
        { 
          path: '/validate/client-review', 
          label: 'Client Review', 
          icon: 'Users',
          userRoles: [ROLES.REVIEW_CLIENT]
        },
        { 
          path: '/validate/id-review', 
          label: 'ID Review', 
          icon: 'Shield',
          userRoles: [ROLES.REVIEW_ID]
        }
      ]
    },
    
    // Review Screens
    {
      label: 'Review Screens',
      icon: 'Eye',
      items: [
        { 
          path: '/review/sar', 
          label: 'SAR Review', 
          icon: 'FileCheck',
          userRoles: [ROLES.REVIEW_SAR]
        },
        { 
          path: '/review/presub', 
          label: 'PreSub Review', 
          icon: 'FileCheck',
          userRoles: [ROLES.REVIEW_PRE_SUB]
        },
        { 
          path: '/review/floc', 
          label: 'FLOC Review', 
          icon: 'FileCheck',
          userRoles: [ROLES.REVIEW_FLOC]
        }
      ]
    },
    
    // All Data
    {
      label: 'All Data',
      icon: 'Database',
      items: [
        { 
          path: '/all-clients', 
          label: 'All Clients', 
          icon: 'Users',
          userRoles: [ROLES.CLIENTS_ALL, ROLES.CLIENTS_ALL_VIEW_ONLY]
        },
        { 
          path: '/all-cases', 
          label: 'All Cases', 
          icon: 'Briefcase',
          userRoles: [ROLES.CASES_ALL, ROLES.CASES_ALL_VIEW_ONLY]
        }
      ]
    },
    
    // Admin Section - Role-based access
    {
      label: 'Admin',
      icon: 'Cog',
      items: [
        { 
          path: '/admin/config', 
          label: 'General Config', 
          icon: 'Settings',
          userRoles: [ROLES.ADMIN_CONFIG]
        },
        { 
          path: '/admin/templates', 
          label: 'Templates Config', 
          icon: 'FileText',
          userRoles: [ROLES.ADMIN_TEMPLATES]
        },
        { 
          path: '/admin/lenders', 
          label: 'Lenders Config', 
          icon: 'CreditCard',
          userRoles: [ROLES.ADMIN_LENDERS]
        },
        { 
          path: '/admin/actions', 
          label: 'Actions Config', 
          icon: 'Zap',
          userRoles: [ROLES.ADMIN_ACTIONS]
        },
        { 
          path: '/admin/users', 
          label: 'User Management', 
          icon: 'Users',
          userRoles: ['*'] // Only SysAdmin can access user management
        }
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
    
    // Check if item has role restrictions
    if (item.userRoles) {
      return item.userRoles.some(role => hasPermission(user, role));
    }
    
    // Check user type restrictions (legacy support)
    if (item.userTypes && !item.userTypes.includes(user.user_type)) {
      return false;
    }
    
    return true;
  };

  const handleNavigation = (path: string) => {
    dev_log('🧭 Navigation requested to:', path);
    navigate(path);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredNavigationGroups = navigationGroups.filter(hasAccess);
  
  dev_log('🔐 User access level:', user?.user_type);
  dev_log('📋 Available navigation groups:', filteredNavigationGroups.map(g => g.label));

  // ============================================================================
  // RENDER
  // ============================================================================

  const viewGroups: SidebarViewGroup[] = filteredNavigationGroups.map((group) => ({
    key: group.label,
    label: group.label,
    icon: getIconComponent(group.icon),
    items: group.items.filter(hasAccess).map((item) => ({
      key: item.path,
      label: item.label,
      icon: getIconComponent(item.icon),
      active: location.pathname === item.path,
      onClick: () => handleNavigation(item.path),
    }))
  }));

  const footer = user ? (
    <div className="text-xs text-gray-700 leading-tight">
      <div className="truncate"><span className="text-gray-600">Logged in as</span></div>
      <div className="truncate"><span className="font-semibold text-gray-900">{user.first_name}</span> <span className="text-gray-600">-</span> <span className="capitalize">{user.user_type}</span></div>
    </div>
  ) : null;

  return (
    <SidebarView
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      groups={viewGroups}
      footer={footer}
    />
  );
};

export default Sidebar; 