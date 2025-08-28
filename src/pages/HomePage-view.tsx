import React from 'react';
import { Briefcase, FileText, TrendingUp, BarChart3, Activity, CheckCircle } from 'lucide-react';

export interface LeadGenData {
  type: 'lead-gen-summary';
  totalLeads: number;
  newLeads: number;
  conversionRate: string;
  topSources: string[];
}

export interface UserSummaryData {
  type: 'user-summary';
  activeCases: number;
  pendingReviews: number;
  completedTasks: number;
  recentActivity: string[];
}

export type HomePageData = LeadGenData | UserSummaryData;

interface HomePageViewProps {
  userFirstName?: string;
  isLoading: boolean;
  pageData: HomePageData | null;
  userType?: 'SysAdmin' | 'Admin' | 'CaseHandler' | string;
  onViewCases: () => void;
}

const HomePageView: React.FC<HomePageViewProps> = ({ userFirstName, isLoading, pageData, userType, onViewCases }) => {
  const isAdmin = userType === 'SysAdmin' || userType === 'Admin';

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Card */}
      <div className="glass-card rounded-xl p-4 shadow-lg slide-in-left border border-white/20">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userFirstName}</h1>
        <p className="text-gray-600 mt-1 text-sm">
          {isAdmin
            ? 'Here\'s your lead generation overview for today.'
            : 'Here\'s what\'s happening with your cases today.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : pageData ? (
        isAdmin ? (
          <div className="space-y-4">
            {/* Stats Row - Compact Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-panel rounded-lg p-3 shadow border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Leads</p>
                    <p className="text-lg font-bold text-gray-900">{(pageData as LeadGenData).totalLeads}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="glass-panel rounded-lg p-3 shadow border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Leads (Today)</p>
                    <p className="text-lg font-bold text-gray-900">{(pageData as LeadGenData).newLeads}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-green-500/20">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="glass-panel rounded-lg p-3 shadow border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conversion Rate</p>
                    <p className="text-lg font-bold text-gray-900">{(pageData as LeadGenData).conversionRate}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Lead Sources */}
            <div className="glass-card rounded-xl shadow-lg border border-white/20">
              <div className="px-4 py-3 border-b border-white/30">
                <h2 className="text-lg font-bold text-gray-900">Top Lead Sources</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {(pageData as LeadGenData).topSources.map((source: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                      <span className="text-gray-800 font-medium text-sm">{source}</span>
                      <div className="w-24 bg-gray-300 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${100 - (index * 20)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Stats Row - Compact Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-panel rounded-lg p-3 shadow border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Cases</p>
                    <p className="text-lg font-bold text-gray-900">{(pageData as UserSummaryData).activeCases}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="glass-panel rounded-lg p-3 shadow border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Reviews</p>
                    <p className="text-lg font-bold text-gray-900">{(pageData as UserSummaryData).pendingReviews}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-yellow-500/20">
                    <FileText className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="glass-panel rounded-lg p-3 shadow border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed Tasks</p>
                    <p className="text-lg font-bold text-gray-900">{(pageData as UserSummaryData).completedTasks}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-xl shadow-lg border border-white/20">
              <div className="px-4 py-3 border-b border-white/30">
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {(pageData as UserSummaryData).recentActivity.map((activity: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity}</p>
                        <p className="text-xs text-gray-600">{index + 1} hour{index === 0 ? '' : 's'} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={onViewCases} 
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md text-sm"
                >
                  View All Cases
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default HomePageView;


