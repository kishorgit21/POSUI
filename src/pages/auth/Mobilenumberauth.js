import { Grid, Stack, Typography } from '@mui/material';
import { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';

import MobileNumber from 'sections/auth/auth-forms/MobileNumber';
import UserName from 'sections/auth/auth-forms/UserName';

// auth provider
import AuthContext from 'contexts/ottrAuthContext';

import { startAuthentication } from '_api/auth/auth';
import { useDispatch } from 'react-redux';

// ================================|| OTP Varification ||================================ //

const Mobilenumberauth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
        
  const [nextAuthFactor, setNextAuthFactor] = useState();
  const[nextStep,setNextStep]=useState();

  const { isLoggedIn } = useContext(AuthContext);
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!!token || isLoggedIn) {
      navigate('/newdashboard', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }
  },[] );

  useEffect(() => {
      let model = {
        clientId: '22d81cc4-53b4-4db1-b8af-2ca18a4b80e2',
        clientScope: 'ottr-apis'
      };
      dispatch(startAuthentication({ model })).then((response) => {
        console.log('mobile nuber response payload ', response.payload);
        const { authFactorType, currentAuthStep } = response.payload;
        setNextAuthFactor(authFactorType)
        setNextStep(currentAuthStep)
        
        // let model = {
        //   authSessionId: authSessionId,
        //   email: 'string',
        //   userName: 'string',
        //   password: 'string',
        //   phoneNumber: fullPhoneNumber,
        //   pin: '',
        //   authFactorType: authFactorType,
        //   currentAuthStep: currentAuthStep
        // };
        // setmodel({ model });
      });
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3} className='login-sections'>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <Typography variant="h3" mb={2} fontWeight={800}>
              Log In
            </Typography>
          </Stack>
        </Grid>
        {/* <Grid item xs={12}>
        <Typography></Typography>
        </Grid> */}
        <Grid item xs={12}>
          {/* <MobileNumber /> */}
         {nextAuthFactor==1 && (nextStep==1 || nextStep==3)   ? <UserName/> :<MobileNumber/>}
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Mobilenumberauth;
