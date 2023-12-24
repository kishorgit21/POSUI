import React, { useRef } from 'react';

// material-ui
import {
  Box,
} from '@mui/material';

// RRD
import { Link } from 'react-router-dom';

// project import
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { SettingOutlined } from '@ant-design/icons';

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const Settings = () => {

  const anchorRef = useRef(null);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{
          color: 'text.primary',
          marginLeft: '0.75rem', // Adjust margin as needed
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-haspopup="true"
        component={Link} // Use the component prop
        to="/settings" // Specify the target URL
        // target="_blank" // This opens the link in a new tab
        target="_self" // This opens the link in the same page (current tab)
      >
        <AnimateButton type="rotate">
          <SettingOutlined />
        </AnimateButton>
      </IconButton>
    </Box>
  );
};

export default Settings;