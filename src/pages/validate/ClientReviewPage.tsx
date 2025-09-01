import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createApiInstance, dev_log } from '../../utils/coreUtils';
import { Loader } from 'lucide-react';
import ClientReviewPageView from './ClientReviewPage-view';

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
    <ClientReviewPageView
      error={error}
      isProcessing={isProcessing}
      selectedCount={selectedClients.size}
      clients={clients.map((c) => ({ client_id: c.client_id, first_name: c.first_name, last_name: c.last_name, dob: formatDate(c.dob), base64_sig: c.base64_sig }))}
      onSelectAll={(checked) => handleSelectAll(checked)}
      onSelect={(id, checked) => handleSelectClient(id, checked)}
      onApproveSelected={handleApproveSelected}
      onRejectSelected={handleRejectSelected}
      renderRejectModal={() => (
        showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Rejection Reason</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="radio" name="rejectionReason" value="Hoax Name" checked={rejectionReason === 'Hoax Name'} onChange={(e) => setRejectionReason(e.target.value)} className="mr-2" />
                    Hoax Name
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="rejectionReason" value="Invalid Signature" checked={rejectionReason === 'Invalid Signature'} onChange={(e) => setRejectionReason(e.target.value)} className="mr-2" />
                    Invalid Signature
                  </label>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); setSelectedClients(new Set()); }} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  <button onClick={handleRejectWithReason} disabled={!rejectionReason || isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">{isProcessing ? 'Processing...' : 'Reject'}</button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    />
  );
};

export default ClientReviewPage; 