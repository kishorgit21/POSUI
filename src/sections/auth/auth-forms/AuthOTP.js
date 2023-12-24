import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { completeAuthentication, resendOTPReq} from '../../../_api/auth/auth';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Grid, Stack, Typography } from '@mui/material';

// third-party
import OtpInput from 'react18-input-otp';

import { Link } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';
import AnimateButton from 'components/@extended/AnimateButton';
import { setToken } from 'store/reducers/authReducer';

import { errorMessage } from "utils/errorMessage";
// Reducers
import { openSnackbar } from 'store/reducers/snackbar';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

const AuthOTP = () => {
  const theme = useTheme();

  const [otp, setOtp] = useState('');

  const { handleLogin } = useAuth();
  const [isError, setisError] = useState();

  // console.log('islogged in in AuthOtp : ', isLoggedIn);

  const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[300];

  const authFactorType = parseInt(localStorage.getItem('nextAuthFactorOTP'));
  // console.log('authFactorType', authFactorType , typeof authFactorType);

  const currentAuthStep = parseInt(localStorage.getItem('nextStepOTP'));
  // console.log('currentAuthStep', currentAuthStep);

  const authSessionId = localStorage.getItem('authSessionId');
  // console.log('authSessionId', authSessionId);

  const phoneNumber = localStorage.getItem('mobile');

  // Check the storage for navigate to mobile page while login process
  useEffect(() => {
    if(phoneNumber === undefined || phoneNumber === null) {
      window.location.href = '/';
    }
  }, [])

  // console.log('phoneNumber', phoneNumber);

  useEffect(() => {
    if (otp.length == 6) {
      setisError(false)

    }

  }, [otp])


  const dispatch = useDispatch();
  const handleOTP = () => {

    if (otp.length === 0) {
      setisError(errorMessage.BlankOTP)
      return
    }


    if (otp.length < 6) {
      setisError(errorMessage.UserEnterlessthan6digitOTP)
      return
    }

    const model = {
      authSessionId: authSessionId,
      email: 'string',
      userName: 'string',
      password: 'string',
      phoneNumber: phoneNumber,
      pin: otp,
      authFactorType: authFactorType,
      currentAuthStep: currentAuthStep
    };
    dispatch(completeAuthentication({ model }))
      .then((response) => {
        // Check for invalid otp
        if (response.payload.isError == true) {
          if (response.payload.errorCode == "E_INVALID_PIN") {
            setisError(errorMessage.InvalidOTP);
          }
          if (response.payload.errorCode == "E_USER_LOCKED") {
            setisError(errorMessage.UserLocked);
          }
        } else {
          if (response?.payload?.currentAuthStep === 99 && response?.payload?.token && response?.payload?.token?.token) {
            handleLogin(response.payload.token.token);

            // localStorage.setItem('authToken', response.payload.token);
            localStorage.removeItem('mobile');
            localStorage.removeItem('authSessionId');
            localStorage.removeItem('nextStepOTP');
            localStorage.removeItem('nextAuthFactorOTP');
          }
          dispatch(setToken(response.payload.token.token));
        }
      })
      .catch((error) => {
        // handle error response here
        console.log('token error ', error);
      });
  };

  const handleResendOTP =()=>{
    setOtp('')
    const model = {
      authSessionId: authSessionId,
    }
    
    dispatch(resendOTPReq({model}))
    .then((response) => {
      // Check for user not found
      if (response.payload.isError == true) {
        if (response.payload.errorCode == "E_RECORD_NOTFOUND") {
          setisError(errorMessage.UnregisteredMobileNumber);
        }
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: errorMessage.OTPsent,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
      }
    })
    .catch((error) => {
      console.log('OTPreq error ', error);
    });
  }
  // console.log('value of is logged in AuthOTP ', isLoggedIn);
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography color="secondary" mb={1} className='ottr-label'>
          Enter OTP
        </Typography>
        <OtpInput
          value={otp}
          onChange={(e) => setOtp(e)}
          numInputs={6}
          containerStyle={{ justifyContent: 'space-between' }}
          inputStyle={{
            width: '100%',
            marginRight: '8px',
            marginBottom: '8px',
            padding: '10px',
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            ':hover': {
              borderColor: theme.palette.primary.main
            }
          }}
          focusStyle={{
            outline: 'none',
            boxShadow: theme.customShadows.primary,
            border: `1px solid ${theme.palette.primary.main}`
          }}
          isInputNum={true}
          shouldAutoFocus={true}

        />
        {!!isError && (
          <Typography color="error" mb={1}>
            {isError}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <AnimateButton>
          <Button
            onClick={() => {
              handleOTP();
            }}
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            className='btn-outlined-primary'
          >
            Continue
          </Button>
        </AnimateButton>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          {/* <Button
            LinkComponent={Link}
            to={'/'}
            className="light-pink-btn"
            variant="body1"
            sx={{ minWidth: 85, textDecoration: 'none', cursor: 'pointer' }}
          >
            Cancel
          </Button>
          <Button className="" variant="outlined" sx={{ minWidth: 85, ml: 2, textDecoration: 'none', cursor: 'pointer' }}>
            Resend code
          </Button> */}
          <Button
            LinkComponent={Link}
            to={'/'}
            className="light-pink-btn"
            variant="body1"
            sx={{ minWidth: 85, textDecoration: 'none', cursor: 'pointer' }}
          >
            Cancel
          </Button>
          <Button className="" variant="outlined" sx={{ minWidth: 85, ml: 2, textDecoration: 'none', cursor: 'pointer' }}
          onClick={()=>handleResendOTP()}
          >
            Resend code
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AuthOTP;
