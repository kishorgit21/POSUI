// react
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { startAuthentication, completeOTPReq } from '../../../_api/auth/auth';

// import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Grid, OutlinedInput, Typography } from '@mui/material';
import '../../../style.css';
// icon
import { MobileOutlined } from '@ant-design/icons';
import { FormControl, MenuItem, Select } from '@mui/material';

import {errorMessage} from "utils/errorMessage"

//RRD
// import { Link } from 'react-router-dom';

// third party
// import * as Yup from 'yup';
// import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

const MobileNumber = () => {
  const theme = useTheme();

  const [countryCode, setCountryCode] = useState('91');
  const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[300];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isError, setisError] = useState();

  const fullPhoneNumber = countryCode + phoneNumber;

  const [model, setmodel] = useState();

  // Check the storage for navigate to mobile page while login process
  useEffect(()=>{
    if(!localStorage.getItem('authToken')) {
      localStorage.clear();
    }
  }, [])

  useEffect(() => {
    if (phoneNumber.length == 10) {
      setisError(false);
      let model = {
        clientId: '22d81cc4-53b4-4db1-b8af-2ca18a4b80e2',
        clientScope: 'ottr-apis'
      };
      dispatch(startAuthentication({ model })).then((response) => {
        console.log('mobile nuber response payload ', response.payload);
        const { authSessionId, currentAuthStep, authFactorType } = response.payload;
        let model = {
          authSessionId: authSessionId,
          email: 'string',
          userName: 'string',
          password: 'string',
          phoneNumber: fullPhoneNumber,
          pin: '',
          authFactorType: authFactorType,
          currentAuthStep: currentAuthStep
        };
        setmodel({ model });
      });
    }
  }, [phoneNumber]);

  const handleLogin = () => {
    if(phoneNumber.length === 0) {
      setisError(errorMessage.MobileNumberRequired);
    } else if (phoneNumber.length < 10) {
      setisError(errorMessage.MobileNumberlessthan10digit);
    } else {
      dispatch(completeOTPReq(model))
        .then((response) => {
          // Check for user not found
          if (response.payload.isError == true) {
            if (response.payload.errorCode == "E_RECORD_NOTFOUND") {
              setisError(errorMessage.UnregisteredMobileNumber);
            }
          } else {
            localStorage.setItem('mobile', fullPhoneNumber);
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
            setTimeout(() => {
              navigate('/mobileotp');
            }, 1000);
          }
        })
        .catch((error) => {
          console.log('OTPreq error ', error);
        });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} pt={0}>
        {/* <Typography className="red" color="secondary" mb={1}>
          Mobile Number
        </Typography> */}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <FormControl fullWidth>
              <Select
                id="country-code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <MenuItem value="91">+91</MenuItem>
                {/* Add more country codes as needed */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={9}>
            <OutlinedInput
              sx={{ borderColor }}
              fullWidth
              value={phoneNumber}
              // onChange={(e) => setPhoneNumber(e.target.value)}
              onChange={(e) => {
                const input = e.target.value.replace(/\s/g, ''); // Remove spaces from input
                if (/^\d{0,10}$/.test(input)) {
                  // Restrict length to 10 digits
                  setPhoneNumber(input);
                }
              }}
              id="start-adornment-email"
              placeholder="Enter mobile number "
              startAdornment={<MobileOutlined />}
            />
          </Grid>
        </Grid>
        {!!isError && (
          <Typography color="error" mb={1} mt={1}>
            {/* Please enter valid Mobile Number. */}
            {isError}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <AnimateButton>
          <Button
            onClick={() => {
              handleLogin();
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
        {/* <Button
          className="light-pink-btn"
          fullWidth
          sx={{ textAlign: 'center', textTransform: 'normal', mt: 2 }}
          size="large"
          type="submit"
          variant="text"
        >
          Don&apos;t have Account?
        </Button> */}
      </Grid>
    </Grid>
  );
};

export default MobileNumber;
