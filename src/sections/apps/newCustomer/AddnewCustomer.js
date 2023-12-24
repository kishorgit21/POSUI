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
import { addCustomer, updateCustomer } from '_api/master_Customer';

// Hooks
import useNumberInput from '../../../hooks/useOnlyNumber';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { setSearch } from 'store/reducers/searchStateReducer';

// Assets
import { useDispatch } from 'react-redux';

// Get customer form initial values
const GetInitialValues = (customer) => {
  const newCustomer = {
    id: '',
    name: '',
    mobileNumber: 0
  };

  if (customer) {
    newCustomer.id = customer.id;
    newCustomer.name = customer.name;
    newCustomer.mobileNumber = customer.mobileNumber;

    return _.merge({}, newCustomer, customer);
  }

  return newCustomer;
};

// ==============================|| CUSTOMER ADD / EDIT / DELETE ||============================== //

/**
 * Add/ Edit customer form
 * @param {*} param0
 * @returns
 */
const AddNewCustomer = ({ addEditStatus, customer, onCancel, setUpdated }) => {
  // Cancel the add/ edit customer operation
  const handleCancel = () => {
    // Reset form
    formik.resetForm();

    // Cancel method call
    onCancel('cancel');
  };

  const intl = useIntl();

  const dispatch = useDispatch();

  // Set customer form schema
  const CustomerSchema = Yup.object().shape({
    name: Yup.string(<FormattedMessage id="MasterCustomerNameValid" />)
      .max(255, <FormattedMessage id="MasterCustomerNameCharLimit" />)
      .required(<FormattedMessage id="MasterCustomerNameRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterCustomerNameRequired" /> }),
    mobileNumber: Yup.string(<FormattedMessage id="MasterVendorMobileValid" />)
      .required(<FormattedMessage id="MasterCustomerMobileRequired" />)
      .max(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
      .min(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
      .matches(/^[1-9][0-9]{9}$/, { message: <FormattedMessage id="MasterVendorMobileValid" /> })
  });

  // Submit add/ edit customer form
  const formik = useFormik({
    initialValues: GetInitialValues(customer),
    validationSchema: CustomerSchema,
    onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        // Add/ edit customer model
        const model = {
          id: customer?.id,
          name: values.name ? values.name.trim() : '',
          mobileNumber: values.mobileNumber
        };

        if (addEditStatus === 'edit') {
          // Edit customer api call
          dispatch(updateCustomer({ model })).then((response) => {
            // Process edit customer api response
            if ((response.payload && response.payload.isError) || !!response.error) {
              if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterCustomerEditErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
                // Reset return reason form
                resetForm();
                // Reset submitting flag
                setSubmitting(true);
                // Cancel method
                onCancel('cancel');
              }
              // Check for error & success
              if (response.payload && response.payload.isError) {

                // Name duplicate error handling
                if (response.payload.errorCode === "E_DUPLICATE_RECORD") {
                  // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterCustomerNameAlreadyExists' }));
                }

                // Mobile number duplicate error handling
                if (response.payload.errorCode === "E_DUPLICATE_MOBILE_NO") {
                  // Handle error
                  setFieldError("mobileNumber", intl.formatMessage({ id: 'ErrorMsgMobNumberExists' }));
                }

                // Reset submitting flag
                setSubmitting(false);
              }
            } else {
              dispatch(
                openSnackbar({
                  open: true,
                  message: `${intl.formatMessage({ id: 'MasterCustomerTostEdit' })}`,
                  variant: 'alert',
                  alert: {
                    color: 'success'
                  },
                  close: true
                })
              );
              // Reset updated flag
              setUpdated(true);
              // Reset return reason form
              resetForm();
              // Reset submitting flag
              setSubmitting(true);
              // Cancel method
              onCancel('cancel');
            }
          });
        } else {
          // Add customer api call
          dispatch(addCustomer({ model })).then((response) => {
            // Process add customer api response
            if ((response.payload && response.payload.isError) || !!response.error) {
              if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterCustomerAddErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
                // Reset return reason form
                resetForm();
                // Reset submitting flag
                setSubmitting(true);
                // Cancel method
                onCancel('cancel', values.mobileNumber);
              }
              // Check for error & success
              if (response.payload && response.payload.isError) {

                // Name duplicate error handling
                if (response.payload.errorCode === "E_DUPLICATE_RECORD") {
                  // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterCustomerNameAlreadyExists' }));
                }

                // Mobile number duplicate error handling
                if (response.payload.errorCode === "E_DUPLICATE_MOBILE_NO") {
                  // Handle error
                  setFieldError("mobileNumber", intl.formatMessage({ id: 'ErrorMsgMobNumberExists' }));
                }

                // Reset submitting flag
                setSubmitting(false);
              }
            } else {
              dispatch(
                openSnackbar({
                  open: true,
                  message: `${intl.formatMessage({ id: 'MasterCustomerTostAdd' })}`,
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
              // Reset return reason form
              resetForm();
              // Reset submitting flag
              setSubmitting(true);
              // Cancel method
              onCancel('cancel', values.mobileNumber);
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  // Formik form flags, states, events
  const { errors, touched, handleSubmit, isSubmitting, setFieldValue, values } = formik;

  // Set customer action state
  const [customerAction, setCustomerAction] = useState('');

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setCustomerAction(<FormattedMessage id="AddCustomer" />);
    } else if (addEditStatus === 'edit') {
      setCustomerAction(<FormattedMessage id="EditCustomer" />);
    } else {
      setCustomerAction(<FormattedMessage id="ViewCustomer" />);
    }
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
            <DialogTitle className='model-header' >{customerAction}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="customer-name">{intl.formatMessage({ id: 'Name' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="customer-name"
                            placeholder={intl.formatMessage({ id: 'CustomerNamePlaceholder' })}
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
                          <InputLabel htmlFor="customer-mobile-no">{intl.formatMessage({ id: 'MobileNumber' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="customer-mobile-no"
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
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
            </ScrollX>
            <Divider />
            <DialogActions className='model-footer' sx={{ p: 2.5 }}>
              <Grid justifyContent="end" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="right">
                    <Button className="gray-outline-btn" variant="outlined-gray" onClick={handleCancel}>
                      <FormattedMessage id="cancel" />
                    </Button>
                    {addEditStatus !== 'view' && (
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {addEditStatus === 'edit' ? <FormattedMessage id="save" /> : <FormattedMessage id="AddCustomer" />}
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

AddNewCustomer.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddNewCustomer;
