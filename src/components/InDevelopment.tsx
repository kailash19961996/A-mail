import React from 'react';

interface InDevelopmentProps {
  title?: string;
}

const InDevelopment: React.FC<InDevelopmentProps> = ({ title }) => {
  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="text-4xl">🧰</div>
        <h2 className="text-xl font-semibold text-gray-900">{title || 'This page'}</h2>
        <p className="text-gray-600 max-w-lg">
          In development for the open-source release. Only Tickets is fully functional. Other sections are placeholders.
        </p>
      </div>
    </div>
  );
};

export default InDevelopment;


