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
import { addVendor, updateVendor } from '_api/master_Vendor';

// Hooks
import useNumberInput from 'hooks/useOnlyNumber';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { setSearch } from 'store/reducers/searchStateReducer';

// Assets
import { useDispatch } from 'react-redux';

// Get customer form initial values
const getInitialValues = (vendor) => {
  const newVendor = {
    id: '',
    name: '',
    address: '',
    city: '',
    pin: '',
    email: '',
    mobileNumber: '',
    note: ''
  };

  if (vendor) {
    newVendor.name = vendor.name;
    newVendor.address = vendor.address;
    return _.merge({}, newVendor, vendor);
  }

  return newVendor;
};

// ==============================|| VENDOR ADD / EDIT / DELETE ||============================== //

/**
 * Add/ Edit vendor form
 * @param {*} param0
 * @returns
 */
const AddVendor = ({ addEditStatus, vendor, onCancel, setUpdated }) => {
  // Cancel the add/ edit vendor operation
  const handleCancel = () => {
    // Reset form
    formik.resetForm();

    // Cancel method call
    onCancel('cancel');
  };

  // Localizations - multilingual
  const intl = useIntl();

  const dispatch = useDispatch();

  // Set vendor form schema
  const VendorSchema = Yup.object().shape({
    name: Yup.string('Invalid type')
      .max(255, <FormattedMessage id="MasterVendorNameCharLimit" />)
      .required(<FormattedMessage id="MasterVendorNameRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorNameRequired" /> }),
    city: Yup.string(<FormattedMessage id="MasterVendorCityValid" />)
      .max(255, <FormattedMessage id="MasterVendorCityCharLimit" />)
      .required(<FormattedMessage id="MasterVendorCityRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorCityRequired" /> }),
    pin: Yup.string(<FormattedMessage id="MasterVendorPinValid" />)
      .matches(/^[0-9]+$/, { message: <FormattedMessage id="MasterVendorPinRequired" /> })
      .max(6, <FormattedMessage id="MasterVendorPinCharLimit" />)
      .min(6, <FormattedMessage id="MasterVendorPinCharLimit" />)
      .required(<FormattedMessage id="MasterVendorPinRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorPinValid" /> }),
    mobileNumber: Yup.string('Invalid type')
      .max(10, <FormattedMessage id="MasterVendorMobileCharLimit" />)
      .min(10, <FormattedMessage id="MasterVendorMobileCharLimit" />)
      .required(<FormattedMessage id="MasterVendorMobileRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorMobileRequired" /> })
      .matches(/^[1-9][0-9]{9}$/, { message: <FormattedMessage id="MasterVendorMobileValid" /> }),
    email: Yup.string('Invalid type')
      .max(255, <FormattedMessage id="MasterVendorEmailCharLimit" />)
      .nullable()
      // .required(<FormattedMessage id="MasterVendorEmailRequired" />)
      .trim()
      .email(<FormattedMessage id="MasterVendorEmailNotValid" />),
    address: Yup.string('Invalid type')
      .max(500, <FormattedMessage id="MasterVendorAdressCharLimit" />)
      .required(<FormattedMessage id="MasterVendorAdressRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterVendorAdressRequired" /> }),
    note: Yup.string().max(500, <FormattedMessage id="MasterProductNoteLimit" />)
  });

  // Submit add/ edit vendor form
  const formik = useFormik({
    initialValues: getInitialValues(vendor),
    validationSchema: VendorSchema,
    onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        // Add/ edit vendor model
        const model = {
          id: vendor.id,
          name: values.name ? values.name.trim() : '',
          email: values.email ? values.email.trim() : '',
          address: values.address ? values.address.trim() : '',
          city: values.city ? values.city.trim() : '',
          pin: values.pin ? values.pin.trim() : '',
          mobileNumber: values.mobileNumber,
          note: values.note ? values.note.trim() : ''
        };

        if (addEditStatus === 'edit') {
          // Edit vendor api call
          dispatch(updateVendor({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError) {
                // Name duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_RECORD") {
                  // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterVendorNameAlreadyExists' }));
                }

                // Mobile Number duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_MOBILE_NO") {
                  // Handle error
                  setFieldError("mobileNumber", intl.formatMessage({ id: 'ErrorMsgMobNumberExists' }));
                }

                // Email duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_EMAIL") {
                  // Handle error
                  setFieldError("email", intl.formatMessage({ id: 'ErrorMsgEmailExists' }));
                }

                // Reset submitting flag
                setSubmitting(false);
              }
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterVendorTostEdit' })}`,
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
                // Reset product form
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
                    message: `${intl.formatMessage({ id: 'MasterVendorEditErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
                // Reset submitting flag
                setSubmitting(true);
                // Reset product form
                resetForm();
                // Cancel method
                onCancel('cancel');
              }
            });
        } else {
          // Add vendor api call
          dispatch(addVendor({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError) {
                // Name duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_RECORD") {
                  // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterVendorNameAlreadyExists' }));
                }

                // Mobile Number duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_MOBILE_NO") {
                  // Handle error
                  setFieldError("mobileNumber", intl.formatMessage({ id: 'ErrorMsgMobNumberExists' }));
                }

                // Email Number duplicate error handling
                if (payload.errorCode === "E_DUPLICATE_EMAIL") {
                  // Handle error
                  setFieldError("email", intl.formatMessage({ id: 'ErrorMsgEmailExists' }));
                }

                // Reset submitting flag
                setSubmitting(false);
              }
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterVendorTostAdd' })}`,
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
                // Reset product form
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
                    message: `${intl.formatMessage({ id: 'MasterVendorAddErrorMsg' })}`,
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
              // Reset product form
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

  // Set vendor action state
  const [vendorAction, setVendorAction] = useState('');

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setVendorAction(<FormattedMessage id="AddVendorlabel" />);
    } else if (addEditStatus === 'edit') {
      setVendorAction(<FormattedMessage id="EditVendorlabel" />);
    } else {
      setVendorAction(<FormattedMessage id="ViewVendorlabel" />);
    }

    // Reset is show input flag
    // setShowInput(values.isExpDate ? true : false);
  }, []);

  // Set field value for mobile number field
  const onSetField = (fieldName, inputValue) => {
    if (inputValue.length <= 10) {
      setFieldValue(fieldName, inputValue);
    }
  };

  // Number only hook for mobile number
  const [handleNumberChange] = useNumberInput(onSetField, 'mobileNumber');

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className='model-header' >{vendorAction}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="vendor-name">{intl.formatMessage({ id: 'Name' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-name"
                            placeholder={intl.formatMessage({ id: 'VendorNamePlaceholder' })}
                            // {...getFieldProps('name')}
                            onChange={($event) => setFieldValue('name', $event.target.value)}
                            value={values.name || ''}
                            error={Boolean(touched.name && errors.name)}
                            helperText={touched.name && errors.name}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="vendor-address">{intl.formatMessage({ id: 'Address' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-address"
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

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="vendor-city">{intl.formatMessage({ id: 'City' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-city"
                            placeholder={intl.formatMessage({ id: 'CityPlaceholder' })}
                            // {...getFieldProps('city')}
                            onChange={($event) => setFieldValue('city', $event.target.value)}
                            value={values.city || ''}
                            error={Boolean(touched.city && errors.city)}
                            helperText={touched.city && errors.city}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="vendor-pin">{intl.formatMessage({ id: 'Pin' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-pin"
                            placeholder={intl.formatMessage({ id: 'PinPlaceholder' })}
                            // {...getFieldProps('pin')}
                            onChange={($event) => setFieldValue('pin', $event.target.value)}
                            value={values.pin || ''}
                            error={Boolean(touched.pin && errors.pin)}
                            helperText={touched.pin && errors.pin}
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
                          <InputLabel htmlFor="vendor-mobile-no">{intl.formatMessage({ id: 'MobileNumber' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-mobile-no"
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
                          <InputLabel htmlFor="vendor-notes">{intl.formatMessage({ id: 'Note' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="vendor-notes"
                            multiline
                            rows={5}
                            placeholder={intl.formatMessage({ id: 'NotePlaceholder' })}
                            // {...getFieldProps('note')}
                            onChange={($event) => setFieldValue('note', $event.target.value)}
                            value={values.note || ''}
                            error={Boolean(touched.note && errors.note)}
                            helperText={touched.note && errors.note}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
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
                        {addEditStatus === 'edit' ? <FormattedMessage id="save" /> : <FormattedMessage id="AddVendorlabel" />}
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

AddVendor.propTypes = {
  vendor: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddVendor;
