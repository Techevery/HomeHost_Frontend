import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Check, Close, Person } from '@mui/icons-material';
import useAdminStore from "../../../../../stores/admin";

interface Agent {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  phone_number?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED';
  licenseNumber?: string;
  agencyName?: string;
  yearsOfExperience?: number;
  specialization?: string;
  createdAt: string;
  documents?: string[];
  front_id_status?: boolean;
  back_id_status?: boolean;
}

const VerifyAgentTable: React.FC = () => {
  const { 
    token, 
    isLoading: storeLoading, 
    verifyAgent, 
    listAgents,
    clearError 
  } = useAdminStore();
  
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPendingAgents = React.useCallback(async () => {
    try {
      setLoading(true);
     
      const result = await listAgents(1, 100); 
      
    

      const allAgents = result?.data?.agents || [];
  
      
   
      const pending = allAgents.filter((agent: Agent) => 
        agent.status === 'PENDING' || agent.status === 'UNVERIFIED'
      );
      
    
      
      setPendingAgents(pending);
      setError(null);
    } catch (err: any) {
    
      setError(err.message || 'Failed to fetch pending agents');
    } finally {
      setLoading(false);
    }
  }, [listAgents]);

  useEffect(() => {
    if (token) {
      fetchPendingAgents();
    }
  }, [token, fetchPendingAgents]);

  const handleVerification = async (agentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
     
      const mappedStatus = status === 'VERIFIED' ? 'VERIFIED' : 'UNVERIFIED';
      await verifyAgent(agentId, mappedStatus);
      setSuccess(`Agent ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully`);
      setError(null);
      fetchPendingAgents(); 
    } catch (err: any) {
      setError(err?.message || 'Failed to update agent status');
      setSuccess(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'inactive':
      case 'unverified':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading || storeLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" fontWeight="bold">
              Agent Verification
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Person sx={{ fontSize: 32 }} />
              <Typography variant="h6">
                {pendingAgents.length} Pending Verification
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Review and verify agent registration requests
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {
          setError(null);
          clearError();
        }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {pendingAgents.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No pending agent verifications
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            All agents have been processed or there are no pending verification requests.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent Information</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Current Status</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingAgents.map((agent) => (
                <TableRow key={agent.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {agent.name || 'Unnamed Agent'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {agent.agencyName || 'Independent Agent'}
                      </Typography>
                      {agent.licenseNumber && (
                        <Typography variant="caption" color="textSecondary">
                          License: {agent.licenseNumber}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{agent.email}</Typography>
                      <Typography variant="body2">
                        {agent.phoneNumber || agent.phone_number || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={agent.status} 
                      color={getStatusColor(agent.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Check />}
                        onClick={() => handleVerification(agent.id, 'VERIFIED')}
                        fullWidth
                      >
                        Verify
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Close />}
                        onClick={() => handleVerification(agent.id, 'REJECTED')}
                        fullWidth
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default VerifyAgentTable;