import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createApiInstance, dev_log } from '../../utils/coreUtils';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Client {
  client_id: number;
  first_name: string;
  last_name: string;
  dob: number;
  base64_sig: string;
}

interface ClientReviewResponse {
  locked_until: number;
  clients_list: Client[];
}

interface ApprovalPayload {
  client_ids: number[];
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClientReviewPage: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { user } = useAuth();
  const api = createApiInstance();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadClientReviewData = useCallback(async () => {
    dev_log('👥 Loading client review data...');
    setIsLoading(true);
    setError('');
    
    try {
      dev_log('📡 Making API call to /validation/client-review');
      const response = await api.get('/validation/client-review');
      const data: ClientReviewResponse = response.data;
      dev_log('✅ Client review data received:', { clientCount: data.clients_list.length, lockedUntil: data.locked_until });
      setClients(data.clients_list);
    } catch (error: unknown) {
      dev_log('💥 Failed to load client review data:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        if (apiError.response?.status === 400 || apiError.response?.status === 401) {
          const customMessage = apiError.response?.data?.responseMsg || 'Failed to load client review data';
          dev_log('🚫 API error with custom message:', customMessage);
          setError(customMessage);
        } else {
          setError('Failed to load client review data. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
      dev_log('🏁 Client review data loading completed');
    }
  }, [api]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (user) {
      dev_log('👤 User authenticated, loading client review data for:', user.user_type);
      loadClientReviewData();
    }
  }, [user, loadClientReviewData]);

  const submitClientAction = async (payload: ApprovalPayload) => {
    dev_log('🔧 Submitting client action:', payload);
    setIsProcessing(true);
    setError('');
    
    try {
      dev_log('📡 Making API call to /validation/client-review with payload');
      await api.post('/validation/client-review', payload);
      
      dev_log('✅ Client action submitted successfully');
      // Remove processed clients from the list
      setClients(prev => prev.filter(client => !payload.client_ids.includes(client.client_id)));
      setSelectedClients(new Set());
      
      // Close modal if it was open
      if (showRejectModal) {
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        if (apiError.response?.status === 400 || apiError.response?.status === 401) {
          setError(apiError.response?.data?.responseMsg || 'Failed to process client action');
        } else {
          setError('Failed to process client action. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectAll = (checked: boolean) => {
    dev_log('📋 Select all clients:', { checked, totalClients: clients.length });
    if (checked) {
      setSelectedClients(new Set(clients.map(client => client.client_id)));
    } else {
      setSelectedClients(new Set());
    }
  };

  const handleSelectClient = (clientId: number, checked: boolean) => {
    dev_log('✅ Client selection changed:', { clientId, checked, totalSelected: selectedClients.size });
    const newSelected = new Set(selectedClients);
    if (checked) {
      newSelected.add(clientId);
    } else {
      newSelected.delete(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleApproveSelected = () => {
    if (selectedClients.size === 0) return;
    
    dev_log('✅ Approving selected clients:', { count: selectedClients.size, clientIds: Array.from(selectedClients) });
    
    const payload: ApprovalPayload = {
      client_ids: Array.from(selectedClients),
      action: 'approve'
    };
    
    submitClientAction(payload);
  };

  const handleRejectSelected = () => {
    if (selectedClients.size === 0) return;
    dev_log('❌ Rejecting selected clients:', { count: selectedClients.size, clientIds: Array.from(selectedClients) });
    setShowRejectModal(true);
  };

  const handleRejectWithReason = () => {
    if (!rejectionReason) return;
    
    dev_log('❌ Rejecting clients with reason:', { 
      count: selectedClients.size, 
      clientIds: Array.from(selectedClients), 
      reason: rejectionReason 
    });
    
    const payload: ApprovalPayload = {
      client_ids: Array.from(selectedClients),
      action: 'reject',
      rejection_reason: rejectionReason
    };
    
    submitClientAction(payload);
  };

  const handleApproveSingle = (clientId: number) => {
    dev_log('✅ Approving single client:', { clientId });
    
    const payload: ApprovalPayload = {
      client_ids: [clientId],
      action: 'approve'
    };
    
    submitClientAction(payload);
  };

  const handleRejectSingle = (clientId: number) => {
    dev_log('❌ Rejecting single client:', { clientId });
    setSelectedClients(new Set([clientId]));
    setShowRejectModal(true);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading client review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Review</h1>
        <p className="text-gray-600">Review and validate client information and signatures</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={handleApproveSelected}
          disabled={selectedClients.size === 0 || isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Approve Selected ({selectedClients.size})</span>
        </button>
        
        <button
          onClick={handleRejectSelected}
          disabled={selectedClients.size === 0 || isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle className="h-5 w-5" />
          <span>Reject Selected ({selectedClients.size})</span>
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedClients.size === clients.length && clients.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.client_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedClients.has(client.client_id)}
                      onChange={(e) => handleSelectClient(client.client_id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.client_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(client.dob)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="min-h-[25px] flex items-center">
                      {client.base64_sig && (
                        <img
                          src={`data:image/png;base64,${client.base64_sig}`}
                          alt="Client Signature"
                          className="max-h-16 max-w-32 object-contain border border-gray-200 rounded"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleApproveSingle(client.client_id)}
                      disabled={isProcessing}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectSingle(client.client_id)}
                      disabled={isProcessing}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </button>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Rejection Reason</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="Hoax Name"
                    checked={rejectionReason === 'Hoax Name'}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mr-2"
                  />
                  Hoax Name
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value="Invalid Signature"
                    checked={rejectionReason === 'Invalid Signature'}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mr-2"
                  />
                  Invalid Signature
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedClients(new Set());
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithReason}
                  disabled={!rejectionReason || isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientReviewPage; 