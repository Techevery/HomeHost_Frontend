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
  AccountBalanceWallet,
  VerifiedUser,
  CheckCircle,
  Email,
  Phone,
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
    // Document verification - simplified to just one document status
    documentStatus: "verified", // Can be: "verified", "pending", "rejected", "not_uploaded"
    documentVerifiedAt: "2025-11-15", // Date when document was verified
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

  const getDocumentStatusDisplay = () => {
    switch (personalInfo.documentStatus) {
      case "verified":
        return {
          text: "Document Verified",
          icon: <CheckCircle sx={{ fontSize: 48 }} />,
          color: "success.main",
          bgColor: "success.light",
          chipLabel: "Verified",
          chipColor: "success" as const,
        };
      case "pending":
        return {
          text: "Document Under Review",
          icon: null,
          color: "warning.main",
          bgColor: "warning.light",
          chipLabel: "Pending Review",
          chipColor: "warning" as const,
        };
      case "rejected":
        return {
          text: "Document Rejected",
          icon: null,
          color: "error.main",
          bgColor: "error.light",
          chipLabel: "Rejected",
          chipColor: "error" as const,
        };
      default: // "not_uploaded"
        return {
          text: "No Document Uploaded",
          icon: null,
          color: "grey.500",
          bgColor: "grey.100",
          chipLabel: "Not Uploaded",
          chipColor: "default" as const,
        };
    }
  };

  const docStatus = getDocumentStatusDisplay();

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
                        <Email fontSize="small" sx={{ mr: 0.5 }} />
                        Email:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {personalInfo.email}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        <Phone fontSize="small" sx={{ mr: 0.5 }} />
                        Phone:
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

            {/* Document Verification - Simplified */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <VerifiedUser sx={{ fontSize: 18, mr: 1 }} />
                    Document Verification
                  </Typography>
                  <Box
                    sx={{
                      border: '2px solid',
                      borderColor: docStatus.color,
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: docStatus.bgColor,
                      color: personalInfo.documentStatus === "verified" ? 'white' : 'text.primary',
                      mt: 2
                    }}
                  >
                    <Box>
                      {docStatus.icon}
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        {docStatus.text}
                      </Typography>
                      {personalInfo.documentStatus === "verified" && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
                          Verified on: {personalInfo.documentVerifiedAt}
                        </Typography>
                      )}
                      <Chip
                        icon={personalInfo.documentStatus === "verified" ? <CheckCircle /> : undefined}
                        label={docStatus.chipLabel}
                        color={docStatus.chipColor}
                        size="small"
                        sx={{ 
                          mt: 1, 
                          color: personalInfo.documentStatus === "verified" ? 'white' : 'inherit',
                          borderColor: personalInfo.documentStatus === "verified" ? 'white' : 'inherit'
                        }}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  {/* Additional Info if Document is Rejected */}
                  {personalInfo.documentStatus === "rejected" && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="error.main" fontWeight="medium">
                        Document was rejected. Please ask the agent to upload a valid ID document.
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Additional Info if No Document */}
                  {personalInfo.documentStatus === "not_uploaded" && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        No document has been uploaded yet.
                      </Typography>
                    </Box>
                  )}
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