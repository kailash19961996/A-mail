import React from 'react';

interface UserViewItem {
  user_id: string;
  display_name: string;
  email: string;
  user_type: 'SysAdmin' | 'Admin' | 'CaseHandler';
  user_roles: string[];
  auth_status: 'Active' | 'Inactive' | 'Suspended';
  last_login?: string;
}

interface UserManagementViewProps {
  isLoading: boolean;
  users: UserViewItem[];
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  onSearch: (v: string) => void;
  onTypeFilter: (v: string) => void;
  onStatusFilter: (v: string) => void;
  onAction: (userId: string, action: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ isLoading, users, searchTerm, filterType, filterStatus, onSearch, onTypeFilter, onStatusFilter, onAction }) => {
  return (
    <div className="min-h-screen p-6 animate-page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage system users, permissions, and access controls</p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input type="text" placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <select value={filterType} onChange={(e) => onTypeFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Types</option>
              <option value="SysAdmin">SysAdmin</option>
              <option value="Admin">Admin</option>
              <option value="CaseHandler">CaseHandler</option>
            </select>
            <select value={filterStatus} onChange={(e) => onStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover-lift">Add User</button>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-white/70">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{user.user_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.user_roles.map((role, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">{role}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{user.auth_status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => onAction(user.user_id, 'edit')} className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button onClick={() => onAction(user.user_id, 'suspend')} className="text-yellow-600 hover:text-yellow-900">Suspend</button>
                          <button onClick={() => onAction(user.user_id, 'delete')} className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;


