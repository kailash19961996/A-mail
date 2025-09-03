import React, { useEffect } from 'react';
import { dev_log } from '../../utils/coreUtils';
import TemplatesConfigPageView from '../../pages-styling/admin/TemplatesConfigPage-view';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TemplatesConfigPage: React.FC = () => {
  useEffect(() => {
    dev_log('📄 Templates Config page accessed');
  }, []);

  return <TemplatesConfigPageView />;
};

export default TemplatesConfigPage; 