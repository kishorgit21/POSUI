// React apis
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';

import ScrollX from 'components/ScrollX';
import { FormattedMessage, useIntl } from 'react-intl';

// Material-ui
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputLabel, Stack, OutlinedInput, InputAdornment, FormHelperText } from '@mui/material';

// Third-party package apis
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// Services
import { changePassword } from '_api/auth/auth';

// Project import
import IconButton from 'components/@extended/IconButton';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

// ==============================|| CHANGE PASSWORD ||============================== //

/**
 * Change password form
 */
const ChangePassword = ({setClosePopup, handleLogout, handleDropdownToggle}) => {

    const intl = useIntl();

    const dispatch = useDispatch();

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowOldPassword = () => {
        setShowOldPassword(!showOldPassword);
      };

    const handleClickShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
      };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
      };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // Set change password form initial values
    const getInitialValues = () => {
        const model = {
        old: '',
        new: '',
        confirm: ''
        };
        return model;
    };

    // Cancel the change password operation
    const handleCancel = () => {
        // Reset form
        formik.resetForm();
        // Cancel method call
        setClosePopup(false);
        // Close dropdown
        handleDropdownToggle();
    };

    // Set product form schema
  const changePasswordSchema = Yup.object().shape({
    old: Yup.string('Invalid type')
      .required(<FormattedMessage id="ChangePasswordOldRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="ChangePasswordOldInvalid" /> }),
    new: Yup.string('Invalid type')
      .required(<FormattedMessage id="ChangePasswordNewRequired" />)
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,}$/, { message: <FormattedMessage id="ChangePasswordNewInvalid" /> }),
    confirm: Yup.string('Invalid type')
      .required(<FormattedMessage id="ChangePasswordConfirmRequired" />)
    //   .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="ChangePasswordConfirmInvalid" /> }),
  });

    // Submit change password form
    const formik = useFormik({
        initialValues: getInitialValues(),
        validationSchema: changePasswordSchema,
        onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
          try {
            // Check old and new passwords
            if (values.old.trim() == values.new.trim()) {
                // Handle error
                setFieldError("new", intl.formatMessage({ id: 'ChangePasswordErrorMsgOldNewSamePassword' }));
                // Reset submitting flag
                setSubmitting(false);
                return;
            }

            // Check new and confirm passwords
            if (values.new.trim() != values.confirm.trim()) {
                // Handle error
                setFieldError("confirm", intl.formatMessage({ id: 'ChangePasswordErrorMsgMismatchPassword' }));
                // Reset submitting flag
                setSubmitting(false);
                return;
            }

            // Change password model
            const model = {
              oldPassword: values.old.trim(),
              newPassword: values.new.trim(),
              confirmPassword: values.confirm.trim()
            };

            // Change password api call
            dispatch(changePassword({ model }))
                .unwrap()
                .then((payload) => {
                // Check for error & success
                if (payload && payload.isError) {
                  if (payload.errorCode === "E_INVALID_OLDPASSWORD") {
                    // Handle error
                    setFieldError("old", intl.formatMessage({ id: 'ChangePasswordOldInvalid' }));
                    // Reset submitting flag
                    setSubmitting(false); 
                  }
                }
                else {
                    // Toaster for success
                    dispatch(
                    openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'ChangePasswordSuccessTost' })}`,
                        variant: 'alert',
                        alert: {
                        color: 'success'
                        },
                        close: true
                    })
                    );
                    // Reset submitting flag
                    setSubmitting(true);
                    // Reset product form
                    resetForm();
                    // Cancel method
                    setClosePopup(false);
                    // Logout
                    handleLogout();
                }
                })
                .catch((error) => {
                // Caught error
                if (error && error.code === 'ERR_BAD_REQUEST') {
                    dispatch(
                    openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'ChangePasswordErrorMsg' })}`,
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
            });
          } catch (error) {
            console.error(error);
          }
        }
    });
    
    // Formik form flags, states, events
    const { errors, touched, handleSubmit, isSubmitting, setFieldValue, values } = formik;

    return (
        <>
          <FormikProvider value={formik}>
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <DialogTitle className='model-header'>{intl.formatMessage({ id: 'ChangePassword' })}</DialogTitle>
                <Divider />
                <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={12}>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                          <Stack spacing={1.25}>
                            <InputLabel htmlFor="oldPassword">
                                <FormattedMessage id="OldPassword" />
                            </InputLabel>
                            <OutlinedInput
                            fullWidth
                            id="oldPassword"
                            type={showOldPassword ? 'text' : 'password'}
                            value={values.old || ''}
                            name="oldPassword"
                            onChange={($event) => setFieldValue('old', $event.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowOldPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    color="secondary"
                                >
                                    {showOldPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                                </InputAdornment>
                            }
                            placeholder={intl.formatMessage({ id: 'OldPasswordPlaceholder' })}
                            error={Boolean(touched.old && errors.old)}
                            />
                            {touched.old && errors.old && <FormHelperText error={true}>{errors.old}</FormHelperText>}
                            </Stack>
                        </Grid>
                          <Grid item xs={12}>
                          <Stack spacing={1.25}>
                            <InputLabel htmlFor="newPassword">
                                <FormattedMessage id="NewPassword" />
                            </InputLabel>
                            <OutlinedInput
                            fullWidth
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={values.new || ''}
                            name="newPassword"
                            onChange={($event) => setFieldValue('new', $event.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowNewPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    color="secondary"
                                >
                                    {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                                </InputAdornment>
                            }
                            placeholder={intl.formatMessage({ id: 'NewPasswordPlaceholder' })}
                            error={Boolean(touched.new && errors.new)}
                            />
                            {touched.new && errors.new && <FormHelperText error={true}>{errors.new}</FormHelperText>}
                            </Stack>
                        </Grid>
                          <Grid item xs={12}>
                          <Stack spacing={1.25}>
                              <InputLabel htmlFor="confirmPassword">
                                <FormattedMessage id="ConfirmPassword" />
                              </InputLabel>
                            <OutlinedInput
                            fullWidth
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={values.confirm || ''}
                            name="confirmPassword"
                            onChange={($event) => setFieldValue('confirm', $event.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowConfirmPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    color="secondary"
                                >
                                    {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                                </InputAdornment>
                            }
                            placeholder={intl.formatMessage({ id: 'ConfirmPasswordPlaceholder' })}
                            error={Boolean(touched.confirm && errors.confirm)}
                            />
                            {touched.confirm && errors.confirm && <FormHelperText error={true}>{errors.confirm}</FormHelperText>}
                            </Stack>
                        </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <Divider />
                </ScrollX>
                <DialogActions className='model-footer' sx={{ p: 2.5 }}>
                  <Grid container justifyContent="end" alignItems="center">
                    <Grid item>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button onClick={handleCancel} variant="text" className="gray-outline-btn">
                          <FormattedMessage id="cancel" />
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                        <FormattedMessage id="save" />
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Form>
          </FormikProvider>
        </>
    );

}

ChangePassword.propTypes = {
    setClosePopup: PropTypes.any,
    handleLogout: PropTypes.func,
    handleDropdownToggle: PropTypes.any
};
  
export default ChangePassword;