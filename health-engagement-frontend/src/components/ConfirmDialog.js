import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Report as ReportIcon
} from '@mui/icons-material';

const dialogTypes = {
  delete: {
    icon: DeleteIcon,
    color: 'error',
    title: 'Confirm Delete',
    defaultMessage: 'Are you sure you want to delete this item? This action cannot be undone.'
  },
  report: {
    icon: ReportIcon,
    color: 'warning',
    title: 'Confirm Report',
    defaultMessage: 'Are you sure you want to report this content?'
  },
  warning: {
    icon: WarningIcon,
    color: 'warning',
    title: 'Warning',
    defaultMessage: 'Are you sure you want to proceed?'
  }
};

function ConfirmDialog({
  open,
  type = 'warning',
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  loading = false
}) {
  const dialogConfig = dialogTypes[type] || dialogTypes.warning;
  const IconComponent = dialogConfig.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1
      }}>
        <IconComponent 
          sx={{ 
            color: `${dialogConfig.color}.main`,
            fontSize: 28
          }} 
        />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {title || dialogConfig.title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {message || dialogConfig.defaultMessage}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          disabled={loading}
          sx={{
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main'
            }
          }}
        >
          {cancelText || 'Cancel'}
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          color={dialogConfig.color}
          sx={{
            background: type === 'delete' 
              ? 'linear-gradient(45deg, #f44336, #d32f2f)'
              : type === 'report'
              ? 'linear-gradient(45deg, #ff9800, #f57c00)'
              : 'linear-gradient(45deg, #2196f3, #1976d2)',
            '&:hover': {
              background: type === 'delete'
                ? 'linear-gradient(45deg, #d32f2f, #c62828)'
                : type === 'report'
                ? 'linear-gradient(45deg, #f57c00, #ef6c00)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)'
            }
          }}
        >
          {loading ? 'Processing...' : (confirmText || 'Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog; 