import PropTypes from 'prop-types';

// material-ui
import { Box, Grid, useMediaQuery } from '@mui/material';

// project import
import AuthFooter from 'components/cards/AuthFooter';
import Logo from 'components/logo';
import AuthCard from './AuthCard';

// assets
import AuthBackground from 'assets/images/auth/AuthBackground';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }) => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
  <Box sx={{ minHeight: { xs: '100vh', sm: 'auto', md: '100vh' } }}>
    <AuthBackground />
    <Grid
      container
      direction="column"
      justifyContent="flex-end"
      sx={{
        minHeight: {sm:'auto',md:'100vh'}
      }}
    >
      <Grid item xs={12} sx={{ px: 2,py:4, bgcolor: matchDownSM?'#2B3467':'' }}>
        <Logo sx={{ filter: matchDownSM?'brightness(0) invert(1)':'' }} width={matchDownSM && '85'} />
      </Grid>
      <Grid item xs={12}>
        <Grid
          item
          xs={12}
          container
          justifyContent="center"
          className='mobile-login-parent'
          alignItems="center"
          sx={{ minHeight: { xs: 'auto', sm: 'auto', md: 'calc(100vh - 112px)' } }}
        >
          <Grid item>
            <AuthCard className="mobile-login">{children}</AuthCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
        <AuthFooter />
      </Grid>
    </Grid>
  </Box>
)}

AuthWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper;
