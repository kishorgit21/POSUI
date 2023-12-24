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
import { addReturnReason, updateReturnReason } from '_api/master_ReturnReason';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { setSearch } from 'store/reducers/searchStateReducer';
// Assets
import { useDispatch } from 'react-redux';

// Get return reason form initial values
const getInitialValues = (returnReason) => {
  const newReturnReason = {
    id: '',
    name: ''
  };

  if (returnReason) {
    newReturnReason.name = returnReason.name;

    return _.merge({}, newReturnReason, returnReason);
  }

  return newReturnReason;
};

// ==============================|| RETURN REASON ADD / EDIT / DELETE ||============================== //

/**
 * Add/ Edit return reason form
 * @param {*} param0
 * @returns
 */
const AddReturnReason = ({ addEditStatus, returnReason, onCancel, setUpdated }) => {
  // Cancel the add/ edit vendor operation
  const handleCancel = () => {
    // Reset form
    formik.resetForm();

    // Cancel method call
    onCancel('cancel');
  };

  const dispatch = useDispatch();

  // Localizations - multilingual
  const intl = useIntl();

  // Set return reason form schema
  const ReturnReasonSchema = Yup.object().shape({
    name: Yup.string(<FormattedMessage id="MasterReturnReasonValid" />)
      .max(255, <FormattedMessage id="MasterReturnReasonCharLimit" />)
      .required(<FormattedMessage id="MasterReturnReasonRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterReturnReasonRequired" /> })
  });

  const formik = useFormik({
    initialValues: getInitialValues(returnReason),

    validationSchema: ReturnReasonSchema,
    onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        // Add/ edit vendor model
        const model = {
          id: returnReason.id,
          name: values.name ? values.name.trim() : ''
        };

        if (addEditStatus === 'edit') {
          // Edit return reason api call
          dispatch(updateReturnReason({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError && payload.errorCode ==="E_DUPLICATE_RECORD") {
                // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterReturnReasoneErrorMsgNameExists' }));
                // Reset submitting flag
                  setSubmitting(false);
              } 
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterReturnReasoneTostEdit' })}`,
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
            })
            .catch((error) => {
              // Caught error
              if (error && error.code === 'ERR_BAD_REQUEST') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterReturnReasonEditErrorMsg' })}`,
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
        } else {
          // Add return reason api call
          dispatch(addReturnReason({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError && payload.errorCode ==="E_DUPLICATE_RECORD") {
                // Handle error
                  setFieldError("name", intl.formatMessage({ id: 'MasterReturnReasoneErrorMsgNameExists' }));
                // Reset submitting flag
                  setSubmitting(false);
              } 
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterReturnReasoneTostAdd' })}`,
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
                  onCancel('cancel');
              }
            })
            .catch((error) => {
              // Caught error
              if (error && error.code === 'ERR_BAD_REQUEST') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterReturnReasonAddErrorMsg' })}`,
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

  // Set return reason action state
  const [returnReasonAction, setReturnReasoAction] = useState('');

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setReturnReasoAction(<FormattedMessage id="AddReturnReasone"/>);
    } else if (addEditStatus === 'edit') {
      setReturnReasoAction(<FormattedMessage id="EditReturnReasone"/>);
    } else {
      setReturnReasoAction(<FormattedMessage id="ViewReturnReasone"/>);
    }
  }, []);

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className='model-header'>{returnReasonAction}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="return-reason-name">{intl.formatMessage({ id: 'Name' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="return-reason-name"
                            placeholder={intl.formatMessage({ id: 'ReturnReasonPlaceholder' })}
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
                </Grid>
              </DialogContent>
            </ScrollX>
            <Divider />
            <DialogActions className='model-footer' sx={{ p: 2.5 }}>
              <Grid container justifyContent="end" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button className="gray-outline-btn" variant="text" onClick={handleCancel}>
                    <FormattedMessage id="cancel"/>
                    </Button>
                    {addEditStatus !== 'view' && (
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {addEditStatus === 'edit' ?  <FormattedMessage id="save"/> : <FormattedMessage id="AddReturnReasone"/>}
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

AddReturnReason.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddReturnReason;
