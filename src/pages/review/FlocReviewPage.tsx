import React from 'react';
import { FileText, Clock } from 'lucide-react';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FlocReviewPage: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FLOC Review</h1>
        <p className="text-gray-600">Review and validate FLOC documents</p>
      </div>

      {/* In Development Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-blue-900 mb-2">In Development</h2>
        <p className="text-blue-700 mb-4">
          This page is currently being developed and will be available soon.
        </p>
        <div className="flex items-center justify-center text-blue-600">
          <Clock className="h-5 w-5 mr-2" />
          <span>Coming soon...</span>
        </div>
      </div>
    </div>
  );
};

export default FlocReviewPage; 