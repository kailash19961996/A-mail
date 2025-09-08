import React from 'react';
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
  Zap,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, dev_log } from '../utils/coreUtils';
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Sidebar is always expanded - no collapse functionality

  // ============================================================================
  // NAVIGATION CONFIGURATION
  // ============================================================================

  const navigationGroups: NavigationGroup[] = [
    // Workspace
    {
      label: 'Workspace',
      icon: 'Home',
      items: [
        { path: '/home', label: 'Dashboard', icon: 'Home' },
        { path: '/tickets', label: 'Tickets', icon: 'MessageSquare' }
      ]
    },
    
    // Intake & Verification
    {
      label: 'Intake & Verification',
      icon: 'CheckCircle',
      items: [
        { 
          path: '/validate/client-review', 
          label: 'Client Review', 
          icon: 'Users'
        },
        { 
          path: '/validate/id-review', 
          label: 'ID Verification', 
          icon: 'Shield'
        }
      ]
    },
    
    // Matter Review
    {
      label: 'Matter Review',
      icon: 'Eye',
      items: [
        { 
          path: '/review/sar', 
          label: 'SAR Review', 
          icon: 'FileCheck'
        },
        { 
          path: '/review/presub', 
          label: 'Pre-Submission', 
          icon: 'FileCheck'
        },
        { 
          path: '/review/floc', 
          label: 'FLOC Review', 
          icon: 'FileCheck'
        }
      ]
    },
    
    // Data
    {
      label: 'Data',
      icon: 'Database',
      items: [
        { 
          path: '/all-clients', 
          label: 'Clients', 
          icon: 'Users'
        },
        { 
          path: '/all-cases', 
          label: 'Matters', 
          icon: 'Briefcase'
        }
      ]
    },
    
    // Administration
    {
      label: 'Administration',
      icon: 'Cog',
      items: [
        { 
          path: '/admin/config', 
          label: 'General Settings', 
          icon: 'Settings'
        },
        { 
          path: '/admin/templates', 
          label: 'Templates', 
          icon: 'FileText'
        },
        { 
          path: '/admin/lenders', 
          label: 'Lenders', 
          icon: 'CreditCard'
        },
        { 
          path: '/admin/actions', 
          label: 'Automation', 
          icon: 'Zap'
        },
        { 
          path: '/admin/users', 
          label: 'User Management', 
          icon: 'Users'
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
      Zap: <Zap className="h-5 w-5" />,
      MessageSquare: <MessageSquare className="h-5 w-5" />,
      LogOut: <LogOut className="h-5 w-5" />
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
    <div className="text-xs text-gray-700 leading-tight space-y-2">
      <div className="text-center">
        <div className="truncate text-gray-500 text-[11px]">Logged in as</div>
        <div className="truncate">
          <span className="font-semibold text-gray-900">{user.display_name || user.first_name}</span>
          <span className="text-gray-400 mx-1">•</span>
          <span className="capitalize text-gray-600">{user.user_type}</span>
        </div>
      </div>
      <div className="pt-1">
        <button
          onClick={() => logout()}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 text-xs font-medium border border-red-100 hover:border-red-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  ) : null;

  return (
    <SidebarView
      groups={viewGroups}
      footer={footer}
    />
  );
};

export default Sidebar; 