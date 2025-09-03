import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
/* Loader no longer used directly in container; remains in view */
import { dev_log } from '../../utils/coreUtils';
import UserManagementView from '../../pages-styling/admin/UserManagement-view';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  user_type: 'SysAdmin' | 'Admin' | 'CaseHandler';
  user_roles: string[];
  auth_status: 'Active' | 'Inactive' | 'Suspended';
  created_date: string;
  last_login?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserManagement: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Simulate loading users data
    const loadUsers = async () => {
      dev_log('👥 Loading user management data...');
      setIsLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for now
      const mockUsers: User[] = [
        {
          user_id: '1',
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          email: 'john.doe@bluelionclaims.co.uk',
          user_type: 'Admin',
          user_roles: ['User Management', 'Case Review'],
          auth_status: 'Active',
          created_date: '2024-01-15',
          last_login: '2024-01-20'
        },
        {
          user_id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          display_name: 'Jane Smith',
          email: 'jane.smith@bluelionclaims.co.uk',
          user_type: 'CaseHandler',
          user_roles: ['Case Review'],
          auth_status: 'Active',
          created_date: '2024-01-10',
          last_login: '2024-01-19'
        }
      ];
      
      dev_log('✅ Mock users loaded:', mockUsers);
      setUsers(mockUsers);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || user.user_type === filterType;
    const matchesStatus = filterStatus === 'all' || user.auth_status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUserAction = (userId: string, action: string) => {
    dev_log('🔧 User action requested:', { userId, action });
    // TODO: Implement user actions (edit, suspend, delete, etc.)
    console.log(`Action ${action} for user ${userId}`);
  };

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  if (!currentUser || (currentUser.user_type !== 'Admin' && currentUser.user_type !== 'SysAdmin')) {
    dev_log('🚫 Access denied to User Management - User type:', currentUser?.user_type);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <UserManagementView
      isLoading={isLoading}
      users={filteredUsers}
      searchTerm={searchTerm}
      filterType={filterType}
      filterStatus={filterStatus}
      onSearch={setSearchTerm}
      onTypeFilter={setFilterType}
      onStatusFilter={setFilterStatus}
      onAction={handleUserAction}
    />
  );
};

export default UserManagement; 