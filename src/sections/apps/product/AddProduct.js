// React apis
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ScrollX from 'components/ScrollX';
import { FormattedMessage, useIntl } from 'react-intl';

// css
import 'style.css';

// Material-ui
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputLabel, Stack, TextField, FormControlLabel, Checkbox, Select, MenuItem, FormControl, FormHelperText } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Third-party package apis
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// Services
import { addProduct, updateProduct } from '_api/master_Product';
import { getProductCategory } from '_api/master/product_Category';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { setSearch } from 'store/reducers/searchStateReducer';

// Get product form initial values
const getInitialValues = (product) => {
  const newProduct = {
    name: '',
    cost: '0.00',
    ingredients: '',
    notes: '',
    isExpDate: true,
    days: '0',
    categoryId: ''
  };

  if (product) {
    newProduct.name = product.name;
    newProduct.ingredients = product.ingredients;
    newProduct.cost = product.cost;
    newProduct.notes = product.notes;
    newProduct.isExpDate = product.isExpDate;
    newProduct.days = product.days;
    newProduct.categoryId = product.categoryId;
    return _.merge({}, newProduct, product);
  }

  return newProduct;
};

// ==============================|| PRODUCT ADD / EDIT / DELETE ||============================== //

/**
 * Add/ Edit product form
 * @param {*} param0
 * @returns
 */
const AddProduct = ({ addEditStatus, product, onCancel, setUpdated }) => {
  // Set show input flag
  const [showInput, setShowInput] = useState(false);
  const intl = useIntl();

  const dispatch = useDispatch();

  // Cancel the add/ edit product operation
  const handleCancel = () => {
    // Reset form
    formik.resetForm();
    // Cancel method call
    onCancel('cancel');
  };

  // Set product form schema
  const productSchema = Yup.object().shape({
    name: Yup.string('Invalid type')
      .max(255, <FormattedMessage id="MasterProductNameCharLimit" />)
      .required(<FormattedMessage id="MasterProductNameRequired" />)
      .matches(/^(?!\s*$).+/, { message: <FormattedMessage id="MasterProductNameValid" /> }),
    cost: Yup.number('Invalid type')
      .positive(<FormattedMessage id="MasterProductUnitPricePositive" />)
      .max(99999999, <FormattedMessage id="MasterProductUnitPriceLimit" />)
      .typeError(<FormattedMessage id="MasterProductUnitPriceRequired" />)
      .test('is-decimal', <FormattedMessage id="MasterProductUnitPriceRequired" />, value => {
        if (value === undefined || value === null) {
          return false;
        }
        const decimalRegex = /^\d+(\.\d{1,2})?$/;
        return decimalRegex.test(value.toString());
      })
      .required(<FormattedMessage id="MasterProductUnitPriceRequired" />),
    ingredients: Yup.string('Invalid type').max(500, <FormattedMessage id="MasterProductIngredientsLimit" />),
    isExpDate: Yup.boolean(),
    days: Yup.number('Invalid type').when('isExpDate', {
      is: true,
      then: Yup.number('Invalid type')
        .positive(<FormattedMessage id="MasterProductDaysPositive" />)
        .max(9999999999, <FormattedMessage id="MasterProductDaysLimit" />)
        .typeError(<FormattedMessage id="MasterProductDaysValid" />)
        .required(<FormattedMessage id="MasterProductDaysRequired" />)
        .transform((value, originalValue) => {
          originalValue = originalValue.toString();
          if (originalValue && originalValue?.includes('.')) {
            return originalValue;
          }
          return value;
        })
        .test('valid-format', <FormattedMessage id="MasterProductDaysValid" />, value => /^[0-9]+$/.test(value)),

      otherwise: Yup.number('Invalid type')
    }),
    notes: Yup.string().max(500, <FormattedMessage id="MasterProductNoteLimit" />),
    categoryId: Yup.string().required(<FormattedMessage id="MasterProductCategoryIdRequired" />),
  });

  // Submit add/ edit product form
  const formik = useFormik({
    initialValues: getInitialValues(product),
    validationSchema: productSchema,
    onSubmit: (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        // Add/ edit product model
        const model = {
          id: product.id,
          name: values.name ? values.name.trim() : '',
          cost: values.cost,
          ingredients: values.ingredients ? values.ingredients.trim() : '',
          notes: values.notes ? values.notes.trim() : '',
          isExpDate: values.isExpDate ? values.isExpDate : false,
          days: values.isExpDate ? values.days : 0,
          categoryId: values.categoryId
        };

        if (addEditStatus === 'edit') {
          // Edit product api call
          dispatch(updateProduct({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError && payload.errorCode === "E_DUPLICATE_RECORD") {
                // Handle error
                setFieldError("name", intl.formatMessage({ id: 'MasterProductErrorMsgNameExists' }));
                // Reset submitting flag
                setSubmitting(false);
              }
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterProductTostEdit' })}`,
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
                    message: `${intl.formatMessage({ id: 'MasterProductEditErrorMsg' })}`,
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
          // Add product api call
          dispatch(addProduct({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError && payload.errorCode === "E_DUPLICATE_RECORD") {
                // Handle error
                setFieldError("name", intl.formatMessage({ id: 'MasterProductErrorMsgNameExists' }));
                // Reset submitting flag
                setSubmitting(false);
              }
              else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MasterProductTostAdd' })}`,
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
                    message: `${intl.formatMessage({ id: 'MasterProductAddErrorMsg' })}`,
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

  // Set product action state
  const [productAction, setProductAction] = useState('');

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setProductAction(<FormattedMessage id="AddProductlabel" />);
    } else if (addEditStatus === 'edit') {
      setProductAction(<FormattedMessage id="EditProductlabel" />);
    } else {
      setProductAction(<FormattedMessage id="ViewProductlabel" />);
    }

    // Reset is show input flag
    setShowInput(values.isExpDate ? true : false);
  }, []);

  // Product category meta data
  const [productCategoryMetaData, setproductCategoryMetaData] = useState();

  // API for product category meta data
  useEffect(() => {
    dispatch(getProductCategory()).then((res) => {
      const list=res.payload.data.filter((val) => val.recordStatus === 0);
      setproductCategoryMetaData(list);
    });
  }, []);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 200
      }
    }
  };

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className='model-header'>{productAction}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="product-name">
                            <FormattedMessage id="Name" />
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="product-name"
                            placeholder={intl.formatMessage({ id: 'NamePlaceholder' })}
                            // {...getFieldProps('name')}
                            onChange={($event) => setFieldValue('name', $event.target.value)}
                            value={values.name || ''}
                            error={Boolean(touched.name && errors.name)}
                            helperText={touched.name && errors.name}
                            disabled={addEditStatus === 'view'}
                            className={addEditStatus === 'view' ? 'disabled-input' : ''}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="product-cost">
                            <FormattedMessage id="UNITPRICE" />
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="product-cost"
                            placeholder={intl.formatMessage({ id: 'UnitPricePlaceholder' })}
                            onChange={($event) => {
                              const value = $event.target.value;

                              // Remove spaces and leading zeroes from the input
                              const sanitizedValue = value.replace(/\s/g, '');

                              // Allow up to 6 digits before the decimal point and up to 2 digits after the decimal point
                              // Allow up to 8 digit integer only
                              if (!/^\d{0,7}(\.\d{0,1})?$/.test(sanitizedValue) && !/^\d{0,6}(\.\d{0,2})?$/.test(sanitizedValue) && !/^\d{0,8}$/.test(sanitizedValue)) {
                                return;
                              }

                              // Check for the specific case of a decimal point without any digits before it or with only one decimal point
                              if (sanitizedValue === '.' || (sanitizedValue.endsWith('.') && sanitizedValue.length === 9)) {
                                return;
                              }

                              // Update the field value
                              setFieldValue('cost', sanitizedValue);
                            }}
                            value={values.cost || ''}
                            error={Boolean(touched.cost && errors.cost)}
                            helperText={touched.cost && errors.cost}
                            disabled={addEditStatus === 'view'}
                            inputProps={{ pattern: '^\\S*$' }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="product-ingredients">
                            <FormattedMessage id="Ingredients" />
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="product-ingredients"
                            multiline
                            rows={2}
                            placeholder={intl.formatMessage({ id: 'IngredientsPlaceholder' })}
                            // {...getFieldProps('ingredients')}
                            onChange={($event) => setFieldValue('ingredients', $event.target.value)}
                            value={values.ingredients || ''}
                            error={Boolean(touched.ingredients && errors.ingredients)}
                            helperText={touched.ingredients && errors.ingredients}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="product-notes">
                            <FormattedMessage id="Note" />
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="product-notes"
                            multiline
                            rows={5}
                            placeholder={intl.formatMessage({ id: 'NotePlaceholder' })}
                            // {...getFieldProps('note')}
                            onChange={($event) => setFieldValue('notes', $event.target.value)}
                            value={values.notes || ''}
                            disabled={addEditStatus === 'view'}
                            error={Boolean(touched.notes && errors.notes)}
                            helperText={touched.notes && errors.notes}
                            className={addEditStatus === 'view' ? 'disabled-input' : ''}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <FormControlLabel
                            onChange={($event) => {
                              setShowInput(!showInput);
                              setFieldValue('isExpDate', $event.target.checked ? true : false);
                            }}
                            value={values.isExpDate}
                            className="size-large"
                            control={<Checkbox  id="isExpProductDateChecked" value={values.isExpDate} style={{ padding: 0, marginRight: 10 }} />}
                            label={<FormattedMessage id="ExpiresIn" />}
                            checked={values.isExpDate}
                            labelPlacement="end"
                            sx={{ ml: 0 }}
                            disabled={addEditStatus === 'view'}
                          />
                        </Stack>
                      </Grid>

                      {showInput && (
                        <Grid item xs={12}>
                          <Stack spacing={1.25}>
                            <InputLabel htmlFor="product-expire-days">
                              <FormattedMessage id="Days" />
                            </InputLabel>
                            <TextField
                              required
                              fullWidth
                              id="product-expire-days"
                              placeholder={intl.formatMessage({ id: 'DaysPlaceholder' })}
                              // {...getFieldProps('days')}
                              onChange={($event) => {
                                const value = $event.target.value;
                                // Remove spaces from the input
                                const sanitizedValue = value.replace(/\s/g, '');
                                // Update the field value
                                setFieldValue('days', sanitizedValue);
                              }}
                              value={values.days || ''}
                              error={Boolean(touched.days && errors.days)}
                              helperText={touched.days && errors.days}
                              disabled={addEditStatus === 'view'}
                            />
                          </Stack>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="product-category">
                            <FormattedMessage id="productCategory" />
                          </InputLabel>
                          <FormControl sx={{ width: '100%' }}>
                            <Select
                              displayEmpty
                              name="categoryId"
                              id="product-category"
                              onChange={($event) => setFieldValue('categoryId', $event.target.value)}
                              value={values.categoryId || ''}
                              error={Boolean(errors.categoryId && touched.categoryId)}
                              className={addEditStatus === 'view' || addEditStatus === 'edit' ? 'pointer-event-none' : ''}
                              MenuProps={MenuProps}
                            >
                              <MenuItem disabled value="">
                                {intl.formatMessage({ id: 'SelectProductCategory' })}
                              </MenuItem>
                              {productCategoryMetaData?.map(({ id, name }) => (
                                <MenuItem key={id} value={id} sx={{ whiteSpace: 'normal' }}>
                                  {name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                        {touched.categoryId && errors.categoryId && <FormHelperText error={true}>{errors.categoryId}</FormHelperText>}
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
                    {addEditStatus !== 'view' && (
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {addEditStatus === 'edit' ? <FormattedMessage id="save" /> : <FormattedMessage id="AddProductlabel" />}
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

AddProduct.propTypes = {
  product: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddProduct;
