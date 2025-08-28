import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, FileText, TrendingUp, BarChart3, Activity, CheckCircle } from 'lucide-react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HomePage: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pageData, setPageData] = useState<{
    type: string;
    totalLeads?: number;
    newLeads?: number;
    conversionRate?: string;
    topSources?: string[];
    activeCases?: number;
    pendingReviews?: number;
    completedTasks?: number;
    recentActivity?: string[];
  } | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await api.get(endpoint);
        // setPageData(response.data);
        
        // Mock data for now
        if (user?.user_type === 'SysAdmin' || user?.user_type === 'Admin') {
          setPageData({
            type: 'lead-gen-summary',
            totalLeads: 156,
            newLeads: 23,
            conversionRate: '12.5%',
            topSources: ['Website', 'Referral', 'Social Media']
          });
        } else {
          setPageData({
            type: 'user-summary',
            activeCases: 8,
            pendingReviews: 3,
            completedTasks: 24,
            recentActivity: ['Case updated', 'Document uploaded', 'Client contacted']
          });
        }
      } catch (error) {
        console.error('Failed to load page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPageData();
    }
  }, [user]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderLeadGenSummary = () => (
    <div className="space-y-6">
      {/* Lead Generation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{pageData?.totalLeads || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Leads (Today)</p>
              <p className="text-2xl font-semibold text-gray-900">{pageData?.newLeads || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{pageData?.conversionRate || '0%'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Lead Sources */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Lead Sources</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {pageData?.topSources?.map((source: string, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{source}</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${100 - (index * 20)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserSummary = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{pageData?.activeCases || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{pageData?.pendingReviews || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{pageData?.completedTasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {pageData?.recentActivity?.map((activity: string, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity}</p>
                  <p className="text-xs text-gray-500">{index + 1} hour{index === 0 ? '' : 's'} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.user_type === 'SysAdmin' || user?.user_type === 'Admin' 
            ? 'Here\'s your lead generation overview for today.'
            : 'Here\'s what\'s happening with your cases today.'
          }
        </p>
      </div>

      {/* Page Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : pageData ? (
        user?.user_type === 'SysAdmin' || user?.user_type === 'Admin' 
          ? renderLeadGenSummary()
          : renderUserSummary()
      ) : (
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default HomePage; 