import React, { useEffect } from 'react';
import { dev_log } from '../../utils/coreUtils';
import GeneralConfigPageView from './GeneralConfigPage-view';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GeneralConfigPage: React.FC = () => {
  useEffect(() => {
    dev_log('⚙️ General Config page accessed');
  }, []);

  return <GeneralConfigPageView />;
};

export default GeneralConfigPage; 