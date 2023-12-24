// React apis
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ScrollX from 'components/ScrollX';
import { FormattedMessage, useIntl } from 'react-intl';

// Material-ui
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Third-party package apis
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// Services
import { addStore, updateStore } from '_api/master_Store';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { setSearch } from 'store/reducers/searchStateReducer';

// Assets
import { useDispatch } from 'react-redux';

// Hooks
import useNumberInput from 'hooks/useOnlyNumber';

// Get customer form initial values
const getInitialValues = (store) => {
  const newStore = {
    id: '',
    name: '',
    longName: '',
    address: '',
    email: '',
    foodLicenseNumber: ''
  };

  if (store) {
    newStore.name = store.name;
    newStore.longName = store.longName;
    newStore.mobileNumber = store.mobileNumber;
    newStore.phoneNumber = store.phoneNumber;
    newStore.address = store.address;
    newStore.foodLicenseNumber = store.foodLicenseNumber;
    newStore.email = store.email
    return _.merge({}, newStore, store);
  }

  return newStore;
};

// ==============================|| VENDOR ADD / EDIT / DELETE ||============================== //

/**
 * Add/ Edit store form
 * @param {*} param0
 * @returns
 */
const AddStore = ({ addEditStatus, store, onCancel, setUpdated }) => {

  // Cancel the add/ edit store operation
  const handleCancel = () => {
    // Reset form
    formik.resetForm();

    // Cancel method call
    onCancel('cancel');
  };

  const dispatch = useDispatch();

  // Localizations - multilingual
  const intl = useIntl();

  // Set store form schema
  const StoreSchema = Yup.object().shape({
    name: Yup.string(<FormattedMessage id="MasterStoreNameValid" />)
      .max(255, <FormattedMessage id="MasterStoreNameCharLimit" />)
      .required(<FormattedMessage id="MasterStoreNameRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterStoreNameRequired" /> }),
    longName: Yup.string(<FormattedMessage id="MasterStoreLongNameValid" />)
      .max(255, <FormattedMessage id="MasterStoreLongNameCharLimit" />)
      .required(<FormattedMessage id="MasterStoreLongNameRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterStoreLongNameRequired" /> }),
    mobileNumber: Yup.string('Invalid type')
      .max(10, <FormattedMessage id="MasterVendorMobileCharLimit" />)
      .min(10, <FormattedMessage id="MasterVendorMobileCharLimit" />)
      .required(<FormattedMessage id="MasterVendorMobileRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorMobileRequired" /> })
      .matches(/^[1-9][0-9]{9}$/, { message: <FormattedMessage id="MasterVendorMobileValid" /> }),
    phoneNumber: Yup.string('Invalid type')
      // .required(<FormattedMessage id="PhoneNumberRequired" />)
      .max(11, <FormattedMessage id="PhoneNumberCharLimit" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="PhoneNumberRequired" /> })
      .matches(/^[0-9]+$/, { message: <FormattedMessage id="PhoneNumberValid" /> }),
    address: Yup.string('Invalid type')
      .max(500, <FormattedMessage id="MasterVendorAdressCharLimit" />)
      .required(<FormattedMessage id="MasterVendorAdressRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorAdressRequired" /> }),
    email: Yup.string('Invalid type')
      .max(255, <FormattedMessage id="MasterVendorEmailCharLimit" />)
      .required(<FormattedMessage id="MasterVendorEmailRequired" />)
      .trim()
      .email(<FormattedMessage id="MasterVendorEmailNotValid" />),
    foodLicenseNumber: Yup.string(<FormattedMessage id="MasterVendorFoodLicenseNumberNotValid" />)
      .matches(/^[0-9]+$/, { message: <FormattedMessage id="MasterVendorFoodLicenseNumberNotValid" /> })
      .max(14, <FormattedMessage id="FoodLicenceCharLimit" />)
      .min(14, <FormattedMessage id="FoodLicenceCharLimit" />)
      .required(<FormattedMessage id="MasterVendorFoodLicenseNumberRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorFoodLicenseNumberNotValid" /> }),
  });

  // Submit add/ edit store form
  const formik = useFormik({
    initialValues: getInitialValues(store),

    validationSchema: StoreSchema,
    onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        // Add/ edit store model
        const model = {
          id: store.id,
          name: values.name ? values.name.trim() : '',
          address: values.address ? values.address.trim() : '',
          mobileNumber: Number(values.mobileNumber),
          longName: values.longName ? values.longName.trim() : '',
          phoneNumber: values.phoneNumber ? Number(values.phoneNumber) : 0,
          foodLicenseNumber: values.foodLicenseNumber,
          email: values.email
        };

        if (addEditStatus === 'edit') {
          // Edit store api call
          dispatch(updateStore({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError) {
                // Name duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_RECORD") {
                  // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterStoreErrorMsgNameExists' }));
                }

                // Long name duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_LONGNAME") {
                  // Handle error
                  setFieldError("longName", intl.formatMessage({ id: 'MasterStoreErrorMsgLongNameExists' }));
                }

                // Mobile Number duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_MOBILE_NO") {
                  // Handle error
                  setFieldError("mobileNumber", intl.formatMessage({ id: 'ErrorMsgMobNumberExists' }));
                }

                // Phone Number duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_PHONENUMBER") {
                  // Handle error
                  setFieldError("phoneNumber", intl.formatMessage({ id: 'MasterStoreErrorMsgPhoneNumberExists' }));
                }

                // Email duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_EMAIL") {
                  // Handle error
                  setFieldError("email", intl.formatMessage({ id: 'ErrorMsgEmailExists' }));
                }

                // Food license number duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_FOODLICENSENUMBER") {
                  // Handle error
                  setFieldError("foodLicenseNumber", intl.formatMessage({ id: 'MasterStoreErrorMsgFoodLicenseNumberExists' }));
                }

                // Reset submitting flag
                setSubmitting(false);
              } else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterStoreTostEdit' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );

                // Reset updated flag
                setUpdated(true);
                // Reset submitting flag
                setSubmitting(true);
                // Reset store form
                resetForm();
                // Cancel method
                onCancel('cancel');
              }
            })
            .catch((error) => {
              // Caught error
              if (error && error.code === 'ERR_BAD_REQUEST') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterStoreEditErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
              // Reset submitting flag
              setSubmitting(true);
              // Reset store form
              resetForm();
              // Cancel method
              onCancel('cancel');
            });
        } else {
          // Add store api call
          dispatch(addStore({ model }))
            // .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload.payload && payload.payload.isError) {

                // Name duplicate error handling
                if (payload.payload.errorCode === "E_DUPLICATE_RECORD") {
                  // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterStoreErrorMsgNameExists' }));
                }

                // Long name duplicate error handling
                if (payload.payload.errorCode === "E_DUPLICATE_LONGNAME") {
                  // Handle error
                  setFieldError("longName", intl.formatMessage({ id: 'MasterStoreErrorMsgLongNameExists' }));
                }

                // Mobile Number duplicate error handling
                if (payload.payload.errorCode === "E_DUPLICATE_MOBILE_NO") {
                  // Handle error
                  setFieldError("mobileNumber", intl.formatMessage({ id: 'ErrorMsgMobNumberExists' }));
                }

                // Phone Number duplicate error handling
                if (payload.payload.errorCode === "E_DUPLICATE_PHONENUMBER") {
                  // Handle error
                  setFieldError("phoneNumber", intl.formatMessage({ id: 'MasterStoreErrorMsgPhoneNumberExists' }));
                }

                // Email duplicate error handling
                if (payload.payload.errorCode === "E_DUPLICATE_EMAIL") {
                  // Handle error
                  setFieldError("email", intl.formatMessage({ id: 'ErrorMsgEmailExists' }));
                }

                // Food license number duplicate error handling
                if (payload.payload.errorCode === "E_DUPLICATE_FOODLICENSENUMBER") {
                  // Handle error
                  setFieldError("foodLicenseNumber", intl.formatMessage({ id: 'MasterStoreErrorMsgFoodLicenseNumberExists' }));
                }

                // Reset submitting flag
                setSubmitting(false);
              }
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterStoreTostAdd' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );

                // Search input set to be null
                dispatch(setSearch(''));
                // Reset updated flag
                setUpdated(true);
                // Reset submitting flag
                setSubmitting(true);
                // Reset store form
                resetForm();
                // Cancel method
                onCancel('cancel');
              }
            })
            .catch((error) => {
              // Caught error
              if (error && error.code === 'ERR_BAD_REQUEST') {

                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterStoreAddErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
              // Reset submitting flag
              setSubmitting(true);
              // Reset store form
              resetForm();
              // Cancel method
              onCancel('cancel');
            });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  // Formik form flags, states, events
  const { errors, touched, handleSubmit, isSubmitting, setFieldValue, values } = formik;

  // Set store action state
  const [storeAction, setStoreAction] = useState('');

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setStoreAction(<FormattedMessage id="AddStore" />);
    } else if (addEditStatus === 'edit') {
      setStoreAction(<FormattedMessage id="EditStore" />);
    } else {
      setStoreAction(<FormattedMessage id="ViewStore" />);
    }
  }, []);

  // Set field value for mobile number field
  const onSetField = (fieldName, inputValue) => {
    if (inputValue.length <= 10) {
      setFieldValue(fieldName, inputValue);
    }
  };

  // Set field value for phone number field
  const onSetPhoneField = (fieldName, inputValue) => {
    if (inputValue.length <= 11) {
      setFieldValue(fieldName, inputValue);
    }
  };

  // Set field value for food license number field
  const onSetFoodLicenseField = (fieldName, inputValue) => {
    if (inputValue.length <= 14) {
      setFieldValue(fieldName, inputValue);
    }
  };

  // Number only hook for mobile number
  const [handleNumberChange] = useNumberInput(onSetField, 'mobileNumber');
  
  // Number only hook for phone number
  const [handlePhoneNumberChange] = useNumberInput(onSetPhoneField, 'phoneNumber');

  // Number only hook for food license number
  const [handleFoodLicenseNumberChange] = useNumberInput(onSetFoodLicenseField, 'foodLicenseNumber');

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className='model-header' >{storeAction}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="store-name">{intl.formatMessage({ id: 'Name' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="store-name"
                            placeholder={intl.formatMessage({ id: 'StoreNamePlaceholder' })}
                            // {...getFieldProps('name')}
                            onChange={($event) => setFieldValue('name', $event.target.value)}
                            value={values.name || ''}
                            error={Boolean(touched.name && errors.name)}
                            helperText={touched.name && errors.name}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="store-long-name">{intl.formatMessage({ id: 'LongName' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="store-long-name"
                            placeholder={intl.formatMessage({ id: 'StoreLongNamePlaceholder' })}
                            // {...getFieldProps('name')}
                            onChange={($event) => setFieldValue('longName', $event.target.value)}
                            value={values.longName || ''}
                            error={Boolean(touched.longName && errors.longName)}
                            helperText={touched.longName && errors.longName}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="store-mobile-no">{intl.formatMessage({ id: 'MobileNumber' })}</InputLabel>
                      <TextField
                        fullWidth
                        id="store-mobile-no"
                        placeholder={intl.formatMessage({ id: 'MobilePlaceholder' })}
                        // {...getFieldProps('mobileNumber')}
                        onChange={($event) => handleNumberChange($event)}
                        value={values.mobileNumber || ''}
                        error={Boolean(touched.mobileNumber && errors.mobileNumber)}
                        helperText={touched.mobileNumber && errors.mobileNumber}
                        disabled={addEditStatus === 'view'}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="store-phone-no">{intl.formatMessage({ id: 'PhoneNumber' })}</InputLabel>
                      <TextField
                        fullWidth
                        id="store-pbone-no"
                        placeholder={intl.formatMessage({ id: 'PhonePlaceholder' })}
                        onChange={($event) => handlePhoneNumberChange($event)}
                        value={values.phoneNumber || ''}
                        error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                        disabled={addEditStatus === 'view'}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="vendor-email">{intl.formatMessage({ id: 'Email' })}</InputLabel>
                      <TextField
                        fullWidth
                        id="vendor-email"
                        placeholder={intl.formatMessage({ id: 'EmailPlaceholder' })}
                        // {...getFieldProps('email')}
                        onChange={($event) => setFieldValue('email', $event.target.value)}
                        value={values.email || ''}
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={addEditStatus === 'view'}
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="vendor-foodLicenseNumber">{intl.formatMessage({ id: 'FoodLicenseNumber' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-foodLicenseNumber"
                            placeholder={intl.formatMessage({ id: 'FoodLicenseNumberPlaceholder' })}
                            // {...getFieldProps('pin')}
                            onChange={($event) => handleFoodLicenseNumberChange($event)}
                            value={values.foodLicenseNumber || ''}
                            error={Boolean(touched.foodLicenseNumber && errors.foodLicenseNumber)}
                            helperText={touched.foodLicenseNumber && errors.foodLicenseNumber}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="store-address">{intl.formatMessage({ id: 'Address' })}</InputLabel>
                      <TextField
                        fullWidth
                        id="store-address"
                        multiline
                        rows={2}
                        placeholder={intl.formatMessage({ id: 'AddressPlaceholder' })}
                        // {...getFieldProps('Address')}
                        onChange={($event) => setFieldValue('address', $event.target.value)}
                        value={values.address || ''}
                        error={Boolean(touched.address && errors.address)}
                        helperText={touched.address && errors.address}
                        disabled={addEditStatus === 'view'}
                      />
                    </Stack>
                  </Grid>

                </Grid>
              </DialogContent>
            </ScrollX>
            <Divider />
            <DialogActions className='model-footer' sx={{ p: 2.5 }}>
              <Grid container justifyContent="end" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button className="gray-outline-btn" variant="outlined-gray" onClick={handleCancel}>
                      <FormattedMessage id="cancel" />
                    </Button>
                    {addEditStatus !== 'view' && (
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {addEditStatus === 'edit' ? <FormattedMessage id="save" /> : <FormattedMessage id="AddStore" />}
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
    </>
  );
};

AddStore.propTypes = {
  store: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddStore;