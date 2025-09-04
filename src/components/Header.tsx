import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dev_log } from '../utils/coreUtils';
import HeaderView from './Header-view';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Header: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { logout, user } = useAuth();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleLogout = async () => {
    dev_log('🚪 User initiated logout from header');
    await logout();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <HeaderView userFirstName={user?.first_name} onLogout={handleLogout} />
  );
};

export default Header; 