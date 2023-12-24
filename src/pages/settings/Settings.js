import React, { useState, useEffect } from 'react';
import "../../style.css";

// MUI components
import { List, ListItem, ListItemText, ListItemSecondaryAction, Typography, TextField, FormControlLabel, Switch } from '@mui/material';

// API
import { getSettings, updateSetting, getByRole } from '_api/settings/settings';

//store
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';

//Multi
import { useIntl } from 'react-intl';

// project imports
import MainCard from 'components/MainCard';

export default function Settings() {

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  const dispatch = useDispatch();

  const intl = useIntl();

  // Get settings list, loading flag & another parameters
  const { settings } = useSelector((state) => state.settingsSlice);

  //Set role state
  const [role, setRole] = useState(false);

  // UPI pay Integration Toggle state
  const [UPIPayIntegration, setUPIPayIntegration] = useState(false);

  //Get serviceAmount to return to pay state
  const [serviceAmount, setServiceAmount] = useState('')

  //Comapny name state
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    // Get settings list api call
    dispatch(getSettings())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error

        } else {
          // Reset updated flag
          setUpdated(false);
        }
      })
      .catch((error) => {
        if (error && error.code === "ERR_BAD_REQUEST") {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'SettingErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
        setUpdated(false);
      })
  }, [updated]);

  useEffect(() => {
    // Get role data api call
    dispatch(getByRole())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          // console.log('role', payload.data)
          const getEditSetting = payload.data.filter((val) => val.featureName == 'EditSettingValues')
          const getEditSettingPermission = getEditSetting.filter((val) => val.hasPermission == true)
          // console.log('getEditSettingPermission', getEditSettingPermission)
          const hasPermission = getEditSettingPermission.length == 0 ? false : getEditSettingPermission[0].hasPermission;
          // console.log('hasPermission', hasPermission)
          setRole(hasPermission)
          // Reset updated flag
          setUpdated(false);
        }
      })
      .catch((error) => {
        if (error && error.code === "ERR_BAD_REQUEST") {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'SettingErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
        setUpdated(false);
      })
  }, [updated]);

  useEffect(() => {
    const serviceAmountObj = settings.find(
      (setting) => setting.settingType === 'Service_Amt'
    );
    const value = serviceAmountObj?.settingValue
    setServiceAmount(value || '')

    const UPIPayIntegrationObj = settings.find(
      (setting) => setting.settingType === 'UPI_Pay_Integration'
    );
    const UPIValue = UPIPayIntegrationObj?.settingValue
    setUPIPayIntegration(UPIValue === 'true' ? true : false)

    const company_Name_Obj = settings.find(
      (setting) => setting.settingType === 'Company_Name'
    );
    const namevalue = company_Name_Obj?.settingValue
    setCompanyName(namevalue || '')
  }, [settings])

  const updateSettingHandle = (val, value) => {
    // model for update settings
    const model = {
      id: val?.id,
      settingValue: value?.toString()
    };

    // Update setting api call
    dispatch(updateSetting({ model })).then((response) => {
      // Process for update setting api response
      if ((response.payload && response.payload.isError) || !!response.error) {
        if (response.payload.errorCode === 'E_PERMISSIONDEINED') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'SettingRoleErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
        else {
          setUpdated(true)
        }
      } else {
        //
      }
    });
  }
  return (

    <MainCard title={intl.formatMessage({ id: 'Settings' })}>
      <List sx={{ '& .MuiListItem-root': { p: 2 } }}>
        {settings.map((val, index) => (
          <ListItem divider key={index}>
            <ListItemText
              id="switch-list-label-oc"
              primary={<Typography variant="body1"> {val?.settingType === 'Service_Amt' ? 'Service Amount' : (val?.settingType)?.replace(/_/g, ' ')}</Typography>}
            />
            <ListItemSecondaryAction>
              {val.settingType == 'Service_Amt' &&
                <TextField
                  id="service_amt"
                  disabled={!role}
                  className={role == true ? '' : 'disabled-input'}
                  sx={{ width: '100%', marginTop: '10px' }}
                  value={serviceAmount?.toString()} // Ensure the value is a string to display it correctly
                  // placeholder={intl.formatMessage({ id: 'Amount' })}
                  placeholder='0.00'
                  onChange={($event) => {
                    const value = $event.target.value;

                    // Remove spaces and leading zeroes from the input
                    const sanitizedValue = value.replace(/\s/g, '');

                    // Allow up to 3 digits before the decimal point and up to 2 digits after the decimal point
                    if (!/^\d{0,3}(\.\d{0,2})?$/.test(sanitizedValue)) {
                      return;
                    }

                    // Check for the specific case of a decimal point without any digits before it
                    if (sanitizedValue === '.') {
                      return;
                    }

                    // Update the field value
                    setServiceAmount(sanitizedValue || '');
                    if (sanitizedValue !== '') {
                      updateSettingHandle(val, sanitizedValue);
                    }
                  }}
                  inputProps={{
                    style: { textAlign: 'right' },
                  }}
                />}
              {val.settingType == 'UPI_Pay_Integration' &&
                <FormControlLabel
                  // className='show-toggle'
                  disabled={!role}
                  value={UPIPayIntegration}
                  onChange={(event) => {
                    const checkValue = event.target.checked
                    setUPIPayIntegration(event.target.checked);
                    updateSettingHandle(val, checkValue)
                  }}
                  style={{ pointerEvents: "none" }}
                  control={<Switch checked={UPIPayIntegration} color="primary" style={{ pointerEvents: "auto" }} />}
                  sx={{ mr: 0 }}
                />}
              {val.settingType == 'Company_Name' &&
                <TextField
                  id="company_name"
                  disabled={!role}
                  // size='large'
                  className={role == true ? '' : 'disabled-input'}
                  sx={{ width: '100%', marginTop: '10px' }}
                  value={companyName?.toString()} // Ensure the value is a string to display it correctly
                  placeholder={intl.formatMessage({ id: 'CompanyName' })}
                  // placeholder='0.00'
                  onChange={($event) => {
                    const value = $event.target.value;

                    // Update the field value
                    setCompanyName(value || '');
                    if (value !== '') {
                      updateSettingHandle(val, value);
                    }
                  }}
                  inputProps={{
                    style: { textAlign: 'right' },
                  }}
                />}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}