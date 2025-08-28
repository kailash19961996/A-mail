import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export interface ClientItemView {
  client_id: number;
  first_name: string;
  last_name: string;
  dob: string;
  base64_sig: string;
}

interface ClientReviewPageViewProps {
  error: string;
  isProcessing: boolean;
  selectedCount: number;
  clients: ClientItemView[];
  onSelectAll: (checked: boolean) => void;
  onSelect: (clientId: number, checked: boolean) => void;
  onApproveSelected: () => void;
  onRejectSelected: () => void;
  renderRejectModal: () => React.ReactNode;
}

const ClientReviewPageView: React.FC<ClientReviewPageViewProps> = ({
  error,
  isProcessing,
  selectedCount,
  clients,
  onSelectAll,
  onSelect,
  onApproveSelected,
  onRejectSelected,
  renderRejectModal,
}) => {
  return (
    <div className="p-6 animate-page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Review</h1>
        <p className="text-gray-600">Review and validate client information and signatures</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        <button onClick={onApproveSelected} disabled={selectedCount === 0 || isProcessing} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover-lift disabled:opacity-50">
          <CheckCircle className="h-5 w-5" />
          <span>Approve Selected ({selectedCount})</span>
        </button>
        <button onClick={onRejectSelected} disabled={selectedCount === 0 || isProcessing} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover-lift disabled:opacity-50">
          <XCircle className="h-5 w-5" />
          <span>Reject Selected ({selectedCount})</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" onChange={(e) => onSelectAll(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.client_id} className="hover:bg-white/70">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" onChange={(e) => onSelect(client.client_id, e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.client_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.dob}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="min-h-[25px] flex items-center">
                      {client.base64_sig && (
                        <img src={`data:image/png;base64,${client.base64_sig}`} alt="Client Signature" className="max-h-16 max-w-32 object-contain border border-gray-200 rounded" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">Approve</button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found for review</p>
          </div>
        )}
      </div>

      {renderRejectModal()}
    </div>
  );
};

export default ClientReviewPageView;


