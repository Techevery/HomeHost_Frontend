import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Close,
  Person,
  Fingerprint,
  // Email,
  // Phone,
  AccountBalanceWallet,
  VerifiedUser,
  CheckCircle,
} from "@mui/icons-material";
import useAdminStore from "../../../../../stores/admin";

interface AgentPersonalInfoModalProps {
  open: boolean;
  agent: any;
  onClose: () => void;
}

const AgentPersonalInfoModal: React.FC<AgentPersonalInfoModalProps> = ({ open, agent, onClose }) => {
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAdminStore();

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agent?.id || !token) return;

      try {
        setLoading(true);
        setError(null);
        // Mock API call - replace with actual endpoint
        setTimeout(() => {
          setAgentDetails({
            ...agent,
            profilePicture: null,
          });
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agent details');
        setLoading(false);
      }
    };

    if (open && agent) {
      fetchAgentDetails();
    }
  }, [open, agent, token]);

  const personalInfo = {
    profilePicture: null,
    frontId: "uploaded",
    backId: "uploaded",
    frontIdStatus: true,
    backIdStatus: true,
    account: agent?.account || 'N/A',
    email: agent?.email,
    phone: agent?.phone_number || 'N/A',
    slug: agent?.slug || 'N/A',
    status: agent?.status || 'Unknown',
    createdAt: agent?.createdAt,
    // Personal Information
    fullName: "Andy palace",
    gender: "male",
    personalUrl: "https://homeyhost.ng/shortlet/ephicx-jlvnum",
    address: "69 A.T.C Road, port harcourt",
    // Next of Kin Information
    nextOfKinName: "Frank Sime",
    nextOfKinEmail: "Franksime@gmail.com",
    // Bank Information
    bankName: "Access Bank",
    accountNumber: "12345678956"
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
      case 'rejected':
      case 'unverified':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
              src={agentDetails?.profilePicture || undefined}
            >
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {agent?.name || 'Unnamed Agent'} - Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agent ID: {agent?.id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={3}>
            {/* Profile Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Avatar
                      sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                      src={personalInfo.profilePicture || undefined}
                    >
                      <Person sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h5" fontWeight="bold">
                        {personalInfo.fullName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Agent ID: {agent?.id}
                      </Typography>
                      <Chip
                        label={personalInfo.status}
                        color={getStatusColor(personalInfo.status) as any}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <Fingerprint sx={{ fontSize: 18, mr: 1 }} />
                    Personal Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Full Name:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.fullName}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Gender:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.gender}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Personal URL:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.personalUrl}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Email Address:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.email}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Phone Number:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.phone}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Address:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.address}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Next of Kin Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <Person sx={{ fontSize: 18, mr: 1 }} />
                    Next of Kin Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Full Name:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.nextOfKinName}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Email Address:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.nextOfKinEmail}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Bank Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <AccountBalanceWallet sx={{ fontSize: 18, mr: 1 }} />
                    Bank Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Bank Name:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.bankName}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Account Number:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.accountNumber}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Document Verification */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <VerifiedUser sx={{ fontSize: 18, mr: 1 }} />
                    Document Verification
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          border: '2px solid',
                          borderColor: 'success.main',
                          borderRadius: 2,
                          p: 3,
                          textAlign: 'center',
                          bgcolor: 'success.light',
                          color: 'white'
                        }}
                      >
                        <Box>
                          <CheckCircle sx={{ fontSize: 48 }} />
                          <Typography variant="body1" fontWeight="medium" mt={1}>
                            ID Uploaded and Verified
                          </Typography>
                          <Chip
                            icon={<CheckCircle />}
                            label="Verified"
                            color="success"
                            size="small"
                            sx={{ mt: 1, color: 'white', borderColor: 'white' }}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentPersonalInfoModal;