// react
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Grid, OutlinedInput, Typography, InputAdornment } from '@mui/material';
import '../../../style.css';

import { errorMessage } from "utils/errorMessage";

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';

import { completeAuthentication } from '_api/auth/auth';
import useAuth from 'hooks/useAuth';

// Reducers
// import { openSnackbar } from 'store/reducers/snackbar';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

const UserName = () => {
  const theme = useTheme();

  const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[300];
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const authFactorType = parseInt(localStorage.getItem('nextAuthFactorOTP'));

  const currentAuthStep = parseInt(localStorage.getItem('nextStepOTP'));
  // console.log('currentAuthStep', currentAuthStep);

  const authSessionId = localStorage.getItem('authSessionId');
  // console.log('authSessionId', authSessionId);

  const { handleLogin } = useAuth();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [isError, setisError] = useState({});
  const [modelpayload, setModelpayload] = useState()

  // Check the storage for navigate to mobile page while login process
  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      localStorage.clear();
    }
  }, [])

  useEffect(() => {
    let model = {
      authSessionId: authSessionId,
      email: 'string',
      userName: userName,
      password: password,
      phoneNumber: 'string',
      pin: '',
      authFactorType: authFactorType,
      currentAuthStep: currentAuthStep
    };
    setModelpayload(model)
  }, []);

  const checkUsernamePassword = () => {
    if (userName === '' && password === '') {
      setisError(ev => ({
        ...ev,
        username: errorMessage.UserNameRequired,
        password: errorMessage.PasswordRequired,
      }))
    }
    else if (userName === '') {
      setisError(ev => ({
        ...ev,
        username: errorMessage.UserNameRequired,
      }))
    } else if (password === '') {
      setisError(ev => ({
        ...ev,
        password: errorMessage.PasswordRequired,
      }))
    }
    //  else if (phoneNumber.length < 10) {
    //   setisError(errorMessage.MobileNumberlessthan10digit);
    // } 
    else {

      const model = {
        authSessionId: modelpayload?.authSessionId,
        email: 'string',
        userName: userName,
        password: password,
        phoneNumber: 'string',
        pin: "string",
        authFactorType: modelpayload?.authFactorType,
        currentAuthStep: modelpayload?.currentAuthStep
      };

      dispatch(completeAuthentication({ model }))
        .then((response) => {
          // Check for invalid username or password
          if (response.payload.isError == true) {
            if (response.payload.errorCode == 'E_AUTH_FAIL') {
              setisError(ev => ({
                ...ev,
                password: 'Please enter valid username  or password.'
              }))
            }
            if (response.payload.errorCode == "E_USER_LOCKED") {
              // setisError(errorMessage.UserLocked);
              setisError(ev => ({
                ...ev,
                password: errorMessage.UserLocked
              }))
            }
          } else {

            if (response?.payload?.currentAuthStep === 99 && response?.payload?.token && response?.payload?.token?.token) {
              handleLogin(response.payload.token.token);
              // localStorage.setItem('authToken', response.payload.token);
              localStorage.removeItem('mobile');
              localStorage.removeItem('authSessionId');
              localStorage.removeItem('nextStepOTP');
              localStorage.removeItem('nextAuthFactorOTP');
              // Redirect to dashboard
              window.location.href = '/';
            }

            dispatch(setToken(response.payload.token.token));
          }
        })
        .catch((error) => {
          // handle error response here
          console.log('token error ', error);
        });

    }
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkUsernamePassword();
    }
  };
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} pt={0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <OutlinedInput
              sx={{ borderColor }}
              fullWidth
              value={userName}
              autoFocus // Set autofocus to initially focus on this input field
              onKeyPress={handleKeyPress} // Listen for Enter key press
              onChange={(e) => {
                const input = e.target.value
                setUserName(input);
               
                if (input != '') {
                  if(isError?.password=='Please enter valid username  or password.'){
                    setisError(ev => ({
                      ...ev,
                      password: '',
                    }))
                  }
                  else{
                    setisError(ev => ({
                      ...ev,
                      username: '',
                    }))
                  }
                }
              }}
              id="start-adornment-email"
              placeholder="Enter username"
              startAdornment={<i className='icon-user ottr-icon'style={{color:'#EB455F'}}/>}
            />
            {!!isError?.username && (
              <Typography color="error" mt={1}>
                {isError?.username}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <OutlinedInput
              fullWidth
              id="password-reset"
              type={showPassword ? 'text' : 'password'}
              value={password}
              name="password"
              onKeyPress={handleKeyPress} // Listen for Enter key press
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value != '') {
                  setisError(ev => ({
                    ...ev,
                    password: '',
                  }))
                }
              }}
              startAdornment={<i className='icon-lock ottr-icon' style={{color:'#EB455F'}}/>}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    color="secondary"
                  >
                    {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </IconButton>
                </InputAdornment>
              }
              placeholder="Enter password"
            />
            {!!isError?.password && (
              <Typography color="error" mt={1}>
                {isError?.password}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <AnimateButton>
          <Button
            onClick={() => {
              checkUsernamePassword();
            }}
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            className='btn-outlined-primary'
          >
            Log In
          </Button>
        </AnimateButton>
      </Grid>
    </Grid>
  );
};

export default UserName;