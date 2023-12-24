// Material-ui
import { Grid, Stack, Typography } from '@mui/material';

// Project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthOTP from 'sections/auth/auth-forms/AuthOTP';

// ================================|| OTP Varification ||================================ //

const MobileOTP = () => {
  const phoneNumber = localStorage.getItem('mobile');
  const maskedPhoneNumber = phoneNumber ? phoneNumber.slice(-10).replace(/.(?=.{4})/g, '*') : '';

  return (<AuthWrapper >
    <Grid container spacing={3} className='otp-sections'>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={800} className='ottr-label'>
            Enter OTP
          </Typography>
          <Typography>{`We've send you OTP on ${maskedPhoneNumber}`}</Typography>
        </Stack>
      </Grid>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <AuthOTP />
      </Grid>
    </Grid>
  </AuthWrapper>)
};

export default MobileOTP;
