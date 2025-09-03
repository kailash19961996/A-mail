import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dev_log } from '../utils/coreUtils';
import HomePageView from '../pages-styling/HomePage-view';

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
      dev_log('🏠 Loading home page data for user:', user?.user_type);
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await api.get(endpoint);
        // setPageData(response.data);
        
        // Mock data for now
        if (user?.user_type === 'SysAdmin' || user?.user_type === 'Admin') {
          dev_log('📊 Loading admin/sysadmin dashboard data');
          setPageData({
            type: 'lead-gen-summary',
            totalLeads: 156,
            newLeads: 23,
            conversionRate: '12.5%',
            topSources: ['Website', 'Referral', 'Social Media']
          });
        } else {
          dev_log('📋 Loading case handler dashboard data');
          setPageData({
            type: 'user-summary',
            activeCases: 8,
            pendingReviews: 3,
            completedTasks: 24,
            recentActivity: ['Case updated', 'Document uploaded', 'Client contacted']
          });
        }
        dev_log('✅ Home page data loaded successfully');
      } catch (error) {
        dev_log('💥 Failed to load home page data:', error);
        console.error('Failed to load page data:', error);
      } finally {
        setIsLoading(false);
        dev_log('🏁 Home page data loading completed');
      }
    };

    if (user) {
      loadPageData();
    }
  }, [user]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================


  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <HomePageView
      userFirstName={user?.first_name}
      isLoading={isLoading}
      pageData={pageData as any}
      userType={user?.user_type}
      onViewCases={() => {}}
    />
  );
};

export default HomePage; 