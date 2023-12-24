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
import { addProductCategory, updateProductCategory } from '_api/master/product_Category';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { setSearch } from 'store/reducers/searchStateReducer';

// Assets
import { useDispatch } from 'react-redux';

// Get product category form initial values
const getInitialValues = (productCategory) => {
  const newProductCategory = {
    id: '',
    name: ''
  };

  if (productCategory) {
    newProductCategory.name = productCategory.name;

    return _.merge({}, newProductCategory, productCategory);
  }

  return newProductCategory;
};

// ==============================|| PRODUCT CATEGORY ADD / EDIT ||============================== //

/**
 * Add/ Edit product category form
 * @param {*} param0
 * @returns
 */
const AddProductCategory = ({ addEditStatus, productCategory, onCancel, setUpdated }) => {
  // Cancel the add/ edit product category operation
  const handleCancel = () => {
    // Reset form
    formik.resetForm();

    // Cancel method call
    onCancel('cancel');
  };

  const dispatch = useDispatch();


  // Localizations - multilingual
  const intl = useIntl();

  // Set product category form schema
  const ProductCategorySchema = Yup.object().shape({
    name: Yup.string(<FormattedMessage id="MasterProductCategoryValid" />)
      .max(255, <FormattedMessage id="MasterProductCategoryCharLimit" />)
      .required(<FormattedMessage id="MasterProductCategoryRequired" />)
      .matches(/^(?!\s*$).+/, {message: <FormattedMessage id="MasterProductCategoryValid" />})
  });

  const formik = useFormik({
    initialValues: getInitialValues(productCategory),

    validationSchema: ProductCategorySchema,
    onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        // Add/ edit product category model
        const model = {
          id: productCategory?.id||'',
          name: values.name ? values.name.trim() : ''
        };

        if (addEditStatus === 'edit') {
          // Edit product category api call
          dispatch(updateProductCategory({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError && payload.errorCode ==="E_DUPLICATE_RECORD") {
              // Handle error
              setFieldError("name", intl.formatMessage({ id: 'MasterProductCategoryErrorMsgNameExists' }));
              // Reset submitting flag
              setSubmitting(false);
              } 
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterProductCategoryTostEdit' })}`,
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
                // Reset product category form
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
                    message: `${intl.formatMessage({ id: 'MasterProductCategoryEditErrorMsg' })}`,
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
              // Reset product category form
              resetForm();
              // Cancel method
              onCancel('cancel');
            });
        } else {
          // Add product category api call
          dispatch(addProductCategory({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError && payload.errorCode ==="E_DUPLICATE_RECORD") {
                // Handle error
                setFieldError("name", intl.formatMessage({ id: 'MasterProductCategoryErrorMsgNameExists' }));
                // Reset submitting flag
                setSubmitting(false);
              } 
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterProductCategoryTostAdd' })}`,
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
                // Reset product category form
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
                    message: `${intl.formatMessage({ id: 'MasterProductCategoryAddErrorMsg' })}`,
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
              // Reset product category form
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

  // Set product category action state
  const [productCategoryAction, setProductCategoryAction] = useState('');

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setProductCategoryAction(<FormattedMessage id="AddProductCategory"/>);
    } else if (addEditStatus === 'edit') {
      setProductCategoryAction(<FormattedMessage id="EditProductCategory"/>);
    } else {
      setProductCategoryAction(<FormattedMessage id="ViewProductCategory"/>);
    }
  }, []);

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className='model-header'>{productCategoryAction}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="product-category-name">{intl.formatMessage({ id: 'Name' })}</InputLabel>
                          <TextField
                            fullWidth
                            id="product-category-name"
                            placeholder={intl.formatMessage({ id: 'ProductCategoryPlaceholder' })}
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
            <DialogActions className='model-footer' sx={{ p: 2.5 }} >
              <Grid container justifyContent="end" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button className="gray-outline-btn" variant="text" onClick={handleCancel}>
                    <FormattedMessage id="cancel"/>
                    </Button>
                    {addEditStatus !== 'view' && (
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {addEditStatus === 'edit' ?  <FormattedMessage id="save"/> : <FormattedMessage id="AddProductCategory"/>}
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

AddProductCategory.propTypes = {
  onCancel: PropTypes.func
};

export default AddProductCategory;
