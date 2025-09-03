import React from 'react';
import { CreditCard, Clock } from 'lucide-react';

const LendersConfigPageView: React.FC = () => {
  return (
    <div className="p-6 animate-page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lenders Config</h1>
        <p className="text-gray-600">Configure lender information and settings</p>
      </div>
      <div className="glass-card rounded-2xl p-8 text-center shadow-xl">
        <CreditCard className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-blue-900 mb-2">In Development</h2>
        <p className="text-blue-700 mb-4">This page is currently being developed and will be available soon.</p>
        <div className="flex items-center justify-center text-blue-600">
          <Clock className="h-5 w-5 mr-2" />
          <span>Coming soon...</span>
        </div>
      </div>
    </div>
  );
};

export default LendersConfigPageView;


