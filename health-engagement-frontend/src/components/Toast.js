import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const toastTypes = {
  success: {
    icon: SuccessIcon,
    color: 'success'
  },
  error: {
    icon: ErrorIcon,
    color: 'error'
  },
  info: {
    icon: InfoIcon,
    color: 'info'
  },
  warning: {
    icon: WarningIcon,
    color: 'warning'
  }
};

function Toast({ open, type = 'info', title, message, duration = 6000, onClose }) {
  const toastConfig = toastTypes[type] || toastTypes.info;
  const IconComponent = toastConfig.icon;

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbar-root': {
          top: 24,
          right: 24
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={toastConfig.color}
        variant="filled"
        icon={<IconComponent />}
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Toast; 