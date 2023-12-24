// React apis
import PropTypes from 'prop-types';
import 'style.css';
import { useDispatch } from 'store';
import { useIntl } from 'react-intl';

// Material-ui
import { Box, Button, Divider, DialogContent, DialogActions, FormControl, FormHelperText, Grid, InputLabel, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, DialogTitle, OutlinedInput, InputAdornment, Tooltip, Portal, IconButton, Autocomplete } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

import 'style.css';

// Third-party package apis
import * as yup from 'yup';
import { FieldArray, Form, Formik } from "formik";

// Services
import { addPurchaseOrder, updatePurchaseOrder, getFrequentlyPurchasedProducts } from '_api/transactions/purchase-order';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import QuantityInput from './QuantityInput';
import moment from 'moment';

//Auto focus on click of the add product button
let productRef;

//Date picker on focuse outline remove and input boc crop
const StyledDatePicker = styled(DatePicker)({
  '& .MuiInputBase-input': {
    padding: '10.5px 0px 10.5px 12px',
  },
  '& .MuiInputBase-root.Mui-focused': {
    boxShadow: 'none', // Remove focus outline when DatePicker is focused
  },
});

// Get purchase order form initial values
const getInitialValues = (purchaseOrder, purchaseOrderMetadata) => {
  const localStore = localStorage.getItem('store')
  var parsedData;
  if (localStore) {
    try {
       parsedData = JSON.parse(localStore); // Parse the JSON string to a JavaScript object  
    } catch (error) {
      // console.error("Error parsing JSON:", error);
    }
  } else {
    // console.log("Data not found in local storage");
  }

  const newPurchaseOrder = {
    id: '',
    date: new Date(),
    vendorId: '',
    vendor: '',
    store: parsedData || '',
    storeId: parsedData?.id || '',
    isInwardDone: false,
    purchaseDetailList1: [],
    purchaseDetailForm: { productId: '', deliveryDate: new Date(), quantity: '', rate: '' }
  };
  if (purchaseOrder) {
    newPurchaseOrder.date = purchaseOrder.date;
    newPurchaseOrder.vendorId = purchaseOrderMetadata.vendorList.find((item) => item.id === purchaseOrder.vendorId) ? purchaseOrderMetadata.vendorList.find((item) => item.id === purchaseOrder.vendorId) : '';
    newPurchaseOrder.storeId = purchaseOrderMetadata.storeList.find((item) => item.id === purchaseOrder.storeId) ? purchaseOrderMetadata.storeList.find((item) => item.id === purchaseOrder.storeId) : '';
    purchaseOrder.purchaseOrderDetails = purchaseOrder.purchaseOrderDetails.map((product) => {
      const match = purchaseOrderMetadata.productList.find((item) => item.id === product.productId);

      return { ...product, productId: match ? match.id : null };
    });
    newPurchaseOrder.vendor = purchaseOrderMetadata.vendorList.find((item) => item.id === purchaseOrder.vendorId) || ''
    newPurchaseOrder.store = purchaseOrderMetadata.storeList.find((item) => item.id === purchaseOrder.storeId) || ''
 
    newPurchaseOrder.isInwardDone = purchaseOrder.isInwardDone;
    newPurchaseOrder.purchaseDetailList1 = purchaseOrder?.purchaseOrderDetails;
    // newPurchaseOrder.Purchase_detail.purchaseDetailList = purchaseOrder?.purchaseOrderDetails;
    return _.merge({}, newPurchaseOrder, purchaseOrder);
  }

  return newPurchaseOrder;
};

// ==============================|| INVOICE - AddPurchaseOrder ||============================== //

const AddPurchaseOrder = ({ addEditStatus, purchaseOrder, onCancel, setUpdated, purchaseOrderMetadata }) => {
  const dispatch = useDispatch();
  const portalRef = useRef(null);

  const [purchaseDetailsFlag, setPurchaseDetailsFlag] = useState(false);
  // const [deliveryDateFlag, setDeliveryDate] = useState(false);

  const [autoCompleteStoresOpen, setAutoCompleteStoresOpen] = useState(false);
  const [autoCompleteVendorsOpen, setAutoCompleteVendorsOpen] = useState(false);
  const [autoCompleteProductOpen, setAutoCompleteProductOpen] = useState(false);

  // Set purchase order action state
  const [purchaseOrderAction, setPurchaseOrderAction] = useState('');

  //Purchase Order Selection Date
  const [purchaseOrderDate, setPurchaseOrderDate] = useState(purchaseOrder?.date || new Date());

  //set products list 
  const [productList, setProductList] = useState(purchaseOrderMetadata.productList);

  //product isInward flag set
  const isInwardDone = purchaseOrder?.isInwardDone || false

  const intl = useIntl();

  const noOptionsText = intl.formatMessage({ id: 'Norecords' });

  const formikRef = useRef();

  // Cancel the add/ edit purchase order operation
  const handleCancel = () => {
    // Cancel method call
    onCancel('cancel');
  };

  // Validation schema for add product details form
  const validationSchemaForInnerForm = yup.object({
    productId: yup.object().required(<FormattedMessage id="TransactionPurchaseDetailProductNameRequired" />).nullable(),
    quantity: yup.number().positive(<FormattedMessage id="TransactionPurchaseDetailProductQuantityPositive" />)
      .typeError(<FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />).
      test('is-decimal', <FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />, value => {
        if (value === undefined || value === null) {
          return false;
        }
        const decimalRegex = /^\d+(\.\d{1,2})?$/;
        return decimalRegex.test(value.toString());
      })
      .required(<FormattedMessage id="TransactionPurchaseDetailProductQuantityRequired" />),
    rate: yup.number().positive(<FormattedMessage id="TransactionPurchaseDetailProductRatePositive" />).
      typeError(<FormattedMessage id="TransactionPurchaseDetailProductRateValid" />).
      test('is-decimal', <FormattedMessage id="TransactionPurchaseDetailProductRateValid" />, value => {
        if (value === undefined || value === null) {
          return false;
        }
        const decimalRegex = /^\d+(\.\d{1,2})?$/;
        return decimalRegex.test(value.toString());
      }).
      required(<FormattedMessage id="TransactionPurchaseDetailProductRateRequired" />),
    // deliveryDate: yup
    //   .date()
    //   .required(<FormattedMessage id="TransactionPurchaseDetailProductDeliveryDateRequired" />)
    //   .typeError(<FormattedMessage id="TransactionPurchaseDetailProductDeliveryInvalidDateRequired" />)
    //   .test('is-future-or-current-date', <FormattedMessage id="TransactionPurchaseDetailProductDeliveryFutureAndCurrentDateRequired" />, (date) => {
    //     if (!date) return true; // Allow empty date, Yup will handle the required validation
    //     const currentDate = moment().startOf('day');
    //     const selectedDate = moment(date).startOf('day');
    //     return selectedDate.isSameOrAfter(currentDate);
    //   }).test('is-valid-date', <FormattedMessage id="TransactionPurchaseDetailProductDeliveryInvalidDateRequired" />, (date) => {
    //     if (!date || !(date instanceof Date)) return true; // Allow empty date, Yup will handle the required validation
    //     return moment(date, 'DD/MM/YYYY', true).isValid();
    //   }),
    //deliveryDate: yup.date().required(<FormattedMessage id="TransactionPurchaseDetailProductDeliveryDateRequired" />)
  });

  // Validation schema for add/ edit purchase order form
  const validationSchema = yup.object({
    date: yup.date().max(new Date(), <FormattedMessage id="TransactionPurchaseOrderFutureDateValidation" />).required(<FormattedMessage id="TransactionPurchaseOrderRequired" />),
    store: yup.object().required(<FormattedMessage id="TransactionPurchaseOrderStoreNameRequired" />).nullable(),
    vendor: yup.object().required(<FormattedMessage id="TransactionPurchaseOrderVendorNameRequired" />).nullable(),
    purchaseDetailList1: yup.array().of(
      yup.object().shape({
        // productId: yup.object().required(<FormattedMessage id="TransactionPurchaseDetailProductNameRequired" />).nullable(),
        quantity: yup.number().positive(<FormattedMessage id="TransactionPurchaseDetailProductQuantityPositive" />)
          .typeError(<FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />).
          test('is-decimal', <FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />, value => {
            if (value === undefined || value === null) {
              return false;
            }
            const decimalRegex = /^\d+(\.\d{1,2})?$/;
            return decimalRegex.test(value.toString());
          })
          .required(<FormattedMessage id="TransactionPurchaseDetailProductQuantityRequired" />),
      })).test('at-least-one-item', <FormattedMessage id="TransactionPurchaseOrderProductListRequired" />, (list) => {
        return list && list.length > 0; // Check if the list has at least one item
      })
      .required(<FormattedMessage id="TransactionPurchaseOrderProductListRequired" />),
  });

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setPurchaseOrderAction(<FormattedMessage id="AddPurchaseOrder" />);
    } else if (addEditStatus === 'edit') {
      setPurchaseOrderAction(<FormattedMessage id="EditPurchaseOrder" />);
    } else if (addEditStatus === 'view') {
      setPurchaseOrderAction(<FormattedMessage id="ViewPurchaseOrder" />);
    }
  }, []);

  //purchase order validation set
  useEffect(() => {
    if (purchaseOrder?.vendorId) {
      setPurchaseDetailsFlag(true)
    }
  }, [])

  //purchase order validation set
  useEffect(() => {
    if (purchaseOrder?.vendorId) {
      // Set frequently purchased products by vendor id model
      const model = {
        id: purchaseOrder?.vendorId
      };
      if (purchaseOrder?.vendorId) {
        // Get by vendor id frequently purchased products api call
        dispatch(getFrequentlyPurchasedProducts({ model }))
          .unwrap()
          .then((payload) => {
            // Check for error & success
            if (payload && payload.isError) {
              // Handle error

            } else {
              // Set frequently purchased products
              const frequentlyProduct = payload.data.map((val) => {
                return {
                  id: val.productId,
                  name: val.productName,
                  cost: val.cost
                }
              })
              const filteredProductItems = purchaseOrderMetadata.productList?.filter((val) => val.recordStatus === 0).filter(
                (item) => !frequentlyProduct.some((frequentlyAddedItem) => frequentlyAddedItem.id === item.id)
              );

              const groupedOptions = [
                ...frequentlyProduct.map((product) => ({
                  ...product,
                  groupName: "Frequently Added Products"
                })),
                ...filteredProductItems.map((product) => ({
                  ...product,
                  groupName: "Other Products"
                }))
              ];

              setProductList(groupedOptions)
            }
          })
          .catch((error) => {
            if (error && error.code === "ERR_BAD_REQUEST") {
              dispatch(
                openSnackbar({
                  open: true,
                  message: 'Purchase order Get by Id: Validation Error.\nInvalid/ empty purchase order id.',
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
          });
      }
      else {
        // setFieldValue('Purchase_detail.purchaseDetailList', []);
        setFieldValue('purchaseDetailList1', []);
      }
    }
  }, [])

  const onChangeVendorHandle = (values, newValue, setFieldValue) => {
    setFieldValue('vendor', newValue);
    !newValue ? setPurchaseDetailsFlag(false) : setPurchaseDetailsFlag(true)
    // Set frequently purchased products by vendor id model
    const model = {
      id: newValue?.id
    };
    if (newValue) {
      // Get by vendor id frequently purchased products api call
      dispatch(getFrequentlyPurchasedProducts({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError) {
            // Handle error

          } else {
            // Set frequently purchased products
            const frequentlyProduct = payload.data.map((val) => {
              return {
                id: val.productId,
                name: val.productName,
                cost: val.cost
              }
            })
            const filteredProductItems = purchaseOrderMetadata.productList?.filter((val) => val.recordStatus === 0).filter(
              (item) => !frequentlyProduct.some((frequentlyAddedItem) => frequentlyAddedItem.id === item.id)
            );

            const groupedOptions = [
              ...frequentlyProduct.map((product) => ({
                ...product,
                groupName: "Frequently Added Products"
              })),
              ...filteredProductItems.map((product) => ({
                ...product,
                groupName: "Other Products"
              }))
            ];

            setProductList(groupedOptions)
          }
        })
        .catch((error) => {
          if (error && error.code === "ERR_BAD_REQUEST") {
            dispatch(
              openSnackbar({
                open: true,
                message: 'Purchase order Get by Id: Validation Error.\nInvalid/ empty purchase order id.',
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          }
        });
    }
    else {
      // setFieldValue('Purchase_detail.purchaseDetailList', []);
      setFieldValue('purchaseDetailList1', []);
    }
  }

  return (
    <MainCard className="edit-purchase-order">
      <Formik
        initialValues={getInitialValues(purchaseOrder, purchaseOrderMetadata)}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          try {
            // Add/ edit purchase order model
            const updatedList = values.purchaseDetailList1.map((val) => {
              return {
                productId: val.productId.id ? val.productId.id : val.productId,
                quantity: val.quantity,
                rate: val.rate,
                deliveryDate: val.deliveryDate,
              }
            })
            const model = {
              id: purchaseOrder ? purchaseOrder.id : '',
              date: values.date,
              storeId: values.store.id,
              vendorId: values.vendor.id,
              purchaseOrderDetails: updatedList
            };

            if (addEditStatus === 'add') {
              // Add purchase order api call
              dispatch(addPurchaseOrder({ model }))
                .unwrap()
                .then((payload) => {
                  // Check for error & success
                  if (payload && payload.isError) {
                    // Handle error
                  } else {
                    // Toaster for success
                    dispatch(
                      openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'TransactionPurchaseOrderToastAdd' })}`,
                        variant: 'alert',
                        alert: {
                          color: 'success'
                        },
                        close: true
                      })
                    );

                    // Reset updated flag
                    setUpdated(true);
                  }
                })
                .catch((error) => {
                  // Caught error
                  if (error && error.code === 'ERR_BAD_REQUEST') {
                    dispatch(
                      openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'TransactionnPurchaseOrderAddError' })}`,
                        variant: 'alert',
                        alert: {
                          color: 'error'
                        },
                        close: true
                      })
                    );
                  }
                });
            } else if (addEditStatus === 'edit') {
              // Add purchase order api call
              dispatch(updatePurchaseOrder({ model }))
                .unwrap()
                .then((payload) => {
                  // Check for error & success
                  if (payload && payload.isError) {
                    // Handle error
                    if (payload.errorCode === 'E_PERMISSIONDEINED') {
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
                  } else {
                    // Toaster for success
                    dispatch(
                      openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'TransactionPurchaseOrderToastEdit' })}`,
                        variant: 'alert',
                        alert: {
                          color: 'success'
                        },
                        close: true
                      })
                    );

                    // Reset updated flag
                    setUpdated(true);
                  }
                })
                .catch((error) => {
                  // Caught error
                  if (error && error.code === 'ERR_BAD_REQUEST') {
                    dispatch(
                      openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'TransactionnPurchaseOrderEditError' })}`,
                        variant: 'alert',
                        alert: {
                          color: 'error'
                        },
                        close: true
                      })
                    );
                  }
                });
            }

            // Reset submitting flag
            setSubmitting(true);

            // Reset return reason form
            resetForm();

            // Cancel method
            onCancel('cancel');
          } catch (error) {
            console.log('error: ', error);
          }
        }}
      >
        {({ errors, handleSubmit, values, setFieldValue, touched, resetForm }) => {

          // Set purchase details list by giving only added item
          const setPurchaseDetailList = (item) => {
            // Find the index of the existing product in the purchase detail list
            const existingProductIndex = values.purchaseDetailList1.findIndex(
              (existingItem) => existingItem.productId.id === item.productId.id || existingItem.productId === item.productId.id
            );

            if (existingProductIndex !== -1) {
              // Product already exists, show an error message
              dispatch(
                openSnackbar({
                  open: true,
                  message: `${intl.formatMessage({ id: 'ProductExitsInPOLabel' })}`,
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            } else {
              // Product doesn't exist, add it to the list
              const updatedPurchaseDetail = [...values.purchaseDetailList1, item];
              setFieldValue('purchaseDetailList1', updatedPurchaseDetail);
            }
          };

          // handle calendar opened
          // const handleCalendarOpen = () => {

          // Set minDate to current date when calendar is opened to allow only future dates
          // setFieldValue(`purchaseDetailList1.${index}.mindate`, new Date());
          // };

          // handle calendar closed
          // const handleCalendarClose = (index, setFieldValue, deliveryDate) => {

          //   // Create a Date object for the current date and time
          //   const currentDate = new Date();
          //   const delDate = new Date(deliveryDate);

          //   // Remove the time portion to compare only the dates
          //   const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          //   const deliveryDay = new Date(delDate.getFullYear(), delDate.getMonth(), delDate.getDate());

          //   // Compare the delivery Date with the currentDate
          //   if (deliveryDay < currentDay) {
          //     //'The delivery date is in the past.
          //     // Set minDate to current date when calendar is closed to allow only future dates
          //     setFieldValue(`purchaseDetailList1.${index}.mindate`, deliveryDate);
          //   }

          // };
          return (
            <>
              <Form onSubmit={handleSubmit}>
                <DialogTitle className='model-header'>{isInwardDone ? intl.formatMessage({ id: 'ViewPurchaseOrder' }) : purchaseOrderAction}</DialogTitle>
                <Divider />
                <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <DialogContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Stack spacing={1}>
                          <InputLabel>{intl.formatMessage({ id: 'store' })}</InputLabel>
                          <FormControl sx={{ width: '100%' }}>
                            <Autocomplete
                              disablePortal
                              id="store"
                              noOptionsText={noOptionsText}
                              className='disabled-input'
                              sx={{ '& div button': { visibility: 'hidden' } }}
                             // disabled={values.purchaseDetailList1?.length < 1 && !isInwardDone ? false : true}
                             // className={values.purchaseDetailList1?.length < 1 && !isInwardDone ? '' : 'disabled-input'}
                              value={values.store || null}
                              options={purchaseOrderMetadata.storeList?.filter((val) => val.recordStatus === 0) || []}
                              getOptionLabel={(option) => option.name ?? option}
                              onChange={(event, newValue) => {
                                setFieldValue('store', newValue);
                              }}
                              open={autoCompleteStoresOpen}
                              onInputChange={(event, value, reason) => {
                                switch (reason) {
                                  case "input":
                                    setAutoCompleteStoresOpen(!!value);
                                    break;
                                  case "reset":
                                  case "clear":
                                    setAutoCompleteStoresOpen(false);
                                    break;
                                  default:
                                    console.log(reason);
                                }
                              }}
                              isOptionEqualToValue={(option, value) => {
                                if (value === '') {
                                  // Handle the case when the value is an empty string
                                  return option === null || option === '';
                                }
                                return option && value && option.id === value.id;
                              }}
                              // error={Boolean(errors.storeId && touched.storeId)}
                              placeholder={intl.formatMessage({ id: 'Select Store' })}
                              renderInput={(params) => <TextField {...params}
                                aria-label={intl.formatMessage({ id: 'Select Store' })}
                                placeholder={intl.formatMessage({ id: 'Search&SelectStore' })} size='large'
                                error={Boolean(touched.store && errors.store)}
                                helperText={touched.store && errors.store ? errors.store : ''}
                              />}
                            />
                          </FormControl>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4.1}>
                        <Stack spacing={1}>
                          <InputLabel>{intl.formatMessage({ id: 'Vendor' })}</InputLabel>
                          <FormControl sx={{ width: '100%' }}>
                            <Autocomplete
                              disablePortal
                              id="vendor"
                              noOptionsText={noOptionsText}
                              // disabled={!role || !isInwardDone}
                              // disabled={values.Purchase_detail.purchaseDetailList.length < 1 ? false : true}
                              // className={values.Purchase_detail.purchaseDetailList.length < 1 ?'':'disabled-input'}
                              // disabled={!isInwardDone ||addEditStatus === 'view' ? false : true}
                              // className={!isInwardDone ?'' : 'disabled-input'}
                              disabled={addEditStatus === 'view'||isInwardDone?true:false}
                              className={addEditStatus === 'view' || isInwardDone ? 'disabled-input':''}
                              value={values.vendor || null}
                              options={purchaseOrderMetadata.vendorList?.filter((val) => val.recordStatus === 0) || []}
                              getOptionLabel={(option) => option.name ?? option}
                              onChange={(event, newValue) => onChangeVendorHandle(values, newValue, setFieldValue)}
                              open={autoCompleteVendorsOpen}
                              onInputChange={(event, value, reason) => {
                                switch (reason) {
                                  case "input":
                                    setAutoCompleteVendorsOpen(!!value);
                                    break;
                                  case "reset":
                                  case "clear":
                                    // Reset Purchase Details
                                    if (formikRef.current) {
                                      formikRef.current.resetForm();
                                    }
                                    setAutoCompleteVendorsOpen(false);
                                    break;
                                  default:
                                    console.log(reason);
                                }
                              }}
                              isOptionEqualToValue={(option, value) => {
                                if (value === '') {
                                  // Handle the case when the value is an empty string
                                  return option === null || option === '';
                                }
                                return option && value && option.id === value.id;
                              }}
                              placeholder={intl.formatMessage({ id: 'SelectVendor' })}
                              renderInput={(params) => <TextField {...params}
                                autoFocus  // Add this attribute to set initial focus on the input field
                                aria-label={intl.formatMessage({ id: 'SelectVendor' })}
                                placeholder={intl.formatMessage({ id: 'Search&SelectVendor' })} size='large'
                                error={Boolean(touched.vendor && errors.vendor)}
                                helperText={touched.vendor && errors.vendor ? errors.vendor : ''}
                              />}
                            />
                          </FormControl>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6} md={2.1}>
                        <Stack spacing={1}>
                          <InputLabel>{intl.formatMessage({ id: 'Date' })}</InputLabel>
                          <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <StyledDatePicker
                                inputFormat="dd/MM/yyyy"
                                disabled={addEditStatus === 'view' || isInwardDone ? true : false}
                                className={addEditStatus === 'view' || isInwardDone ? 'disabled-input' : ''}
                                maxDate={new Date()}
                                value={values.date}
                                onChange={(newValue) => { 
                                  setFieldValue('date', newValue); 
                                  setPurchaseOrderDate(newValue);
                                  // Reset Purchase Details
                                  if (formikRef.current) {
                                    formikRef.current.resetForm();
                                  } 
                                }}
                                renderInput={(props) => (
                                  <TextField {...props}
                                    error={Boolean(touched.date && errors.date)}
                                    helperText={touched.date && errors.date ? errors.date : ''}
                                    value={moment(values.date).format('DD/MM/YYYY')}
                                    inputProps={{
                                      readOnly: true,
                                      onClick: () => params.inputProps.onClick && params.inputProps.onClick()
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          </FormControl>
                        </Stack>
                      </Grid>

                      {/* <Divider /> */}

                      <Grid item xs={12} mb={0}>
                        <Typography variant="h5">{intl.formatMessage({ id: 'Purchase Detail' })}</Typography>
                      </Grid>
                      {isInwardDone ? null :
                        <Grid item xs={12} md={12} sx={{ marginTop: "-30px !important" }}>
                          {addEditStatus !== 'view' ? <div ref={portalRef} /> : ''}
                        </Grid>}

                      <Grid item xs={12} md={12} mt={isInwardDone ? 2 : 4} sx={{ paddingTop: "5px !important" }}>
                        {touched &&
                          touched.purchaseDetailList1 &&
                          errors?.purchaseDetailList1 && (
                          <FormHelperText error={true} sx={{marginTop:'-15px'}}>{errors?.purchaseDetailList1}</FormHelperText>
                        )}

                        <TableContainer className='ottr-table bucket-new-table' sx={{ marginTop: "2px !important" }}>
                          <Table>
                            <TableHead sx={{ border: '0', width: '100%' }}>
                              <TableRow
                                sx={{
                                  '& > th:first-of-type': { width: '50px' },
                                  '& > th:last-of-type': { width: '50px' },
                                  '& > th:nth-of-type(2)': { width: '200px' },
                                  '& > th:nth-of-type(3)': { width: '150px' },
                                  '& > th:nth-of-type(4)': { width: '100px' },
                                  '& > th:nth-of-type(5)': { width: '160px' },
                                }}
                              // sx={{ background: '#fafafb' }}
                              >
                                <TableCell align="left" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'SR.NO.' })}</TableCell>
                                <TableCell sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Product Name' })}</TableCell>
                                <TableCell align="right" sx={{ textTransform: 'none', marginLeft: '5px' }}>{intl.formatMessage({ id: 'Quantity' })}</TableCell>
                                <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'UNITPRICE' })} (₹)</TableCell>
                                <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Delivery Date' })}</TableCell>
                                {addEditStatus !== 'view' &&  !isInwardDone ? <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'action' })}</TableCell> : ''}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <FieldArray
                                name="purchaseDetailList1"
                                render={() => {
                                  const finalPurchaseOrderList = values.purchaseDetailList1;
                                  return (
                                    <>
                                      {finalPurchaseOrderList && finalPurchaseOrderList.length > 0
                                        ? finalPurchaseOrderList.map((purchaseOrderData, index) => (
                                          <TableRow key={index} sx={{ height: "43px !important" }}>
                                            <TableCell align="left">{index + 1}</TableCell>
                                            <TableCell align="left">
                                              {!purchaseOrderData.productName
                                                ? productList.find((product) => product.id === purchaseOrderData.productId.id).name
                                                : purchaseOrderData.productName}
                                            </TableCell>
                                            <TableCell align="right">
                                              <FormControl>
                                                <QuantityInput
                                                  // disabled={!isInwardDone ||? false : true}
                                                  // className={!isInwardDone ? "" : "disabled-input"}
                                                  disabled={addEditStatus === 'view'||isInwardDone?true:false}
                                                  className={addEditStatus === 'view' || isInwardDone ? 'disabled-input':''}
                                                  value={Number(purchaseOrderData.quantity)}
                                                  id="Purchase_Order"
                                                  error={Boolean(`errors.purchaseDetailList1.${index}.quantity` && `touched.purchaseDetailList1.${index}.quantity`)}
                                                  // error={Boolean(touched.purchaseDetailList1?.[index]?.quantity && errors.purchaseDetailList1?.[index]?.quantity)}
                                                  helperText={errors.purchaseDetailList1?.[index]?.quantity}
                                                  onValueChange={(e) => {
                                                    setFieldValue(
                                                      `purchaseDetailList1.${index}.quantity`,
                                                      e
                                                    );
                                                  }}
                                                />
                                              </FormControl>
                                            </TableCell>
                                            <TableCell align="right">{Number(purchaseOrderData.rate)?.toFixed(2)}</TableCell>
                                            <TableCell align="right">
                                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <StyledDatePicker
                                                  inputFormat="dd/MM/yyyy"
                                                  // disabled={!isInwardDone ? false : true}
                                                  // className={!isInwardDone ? '' : 'disabled-input'}
                                                  disabled={addEditStatus === 'view'||isInwardDone?true:false}
                                                  className={addEditStatus === 'view' || isInwardDone ? 'disabled-input':''}
                                                  // minDate={new Date()}
                                                  // minDate={purchaseOrderData.mindate}
                                                  minDate={purchaseOrderDate}
                                                  name={`purchaseDetailList1.${index}.deliveryDate`} // Update the name prop dynamically
                                                  onChange={(newValue) => {
                                                    setFieldValue(`purchaseDetailList1.${index}.deliveryDate`, newValue); // Update the deliveryDate for the specific purchaseOrderData
                                                  }}
                                                  // onClose={() => handleCalendarClose(index, setFieldValue, purchaseOrderData.deliveryDate)} // Use onClose event
                                                  // onOpen={() => handleCalendarOpen(index, setFieldValue)} // Use onOpen event
                                                  value={purchaseOrderData.deliveryDate}
                                                  renderInput={(params) =>
                                                    <TextField {...params}
                                                      value={moment(purchaseOrderData.deliveryDate).format('DD/MM/YYYY')}
                                                      inputProps={{
                                                        readOnly: true,
                                                        // onClick: () => params.inputProps.onClick && params.inputProps.onClick()
                                                      }}
                                                    />}
                                                />

                                              </LocalizationProvider>
                                              {/* <FormHelperText error={true}>
                                                {errors.purchaseDetailList1?.[index]?.deliveryDate}
                                              </FormHelperText> */}
                                            </TableCell>
                                            {addEditStatus !== 'view' && !isInwardDone && (
                                              <TableCell align="right" className='action-icons'>
                                                <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
                                                  <IconButton
                                                    disabled={!isInwardDone ? false : true}
                                                    className={!isInwardDone ? '' : 'disabled-input'}
                                                    value={Number(purchaseOrderData.quantity)}
                                                    color="error"
                                                    onClick={() => {
                                                      const updatedList = [...finalPurchaseOrderList];
                                                      updatedList.splice(index, 1);
                                                      setFieldValue("purchaseDetailList1", updatedList);
                                                    }}
                                                  >
                                                    {/* <DeleteTwoTone twoToneColor={theme.palette.error.main} /> */}
                                                    <i className='icon-trash ottr-icon inner-delete-icon'></i>
                                                  </IconButton>
                                                </Tooltip>
                                              </TableCell>
                                            )}
                                          </TableRow>
                                        ))
                                        : <TableRow>
                                          <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                                            {intl.formatMessage({ id: 'NoRecord' })}
                                          </TableCell>
                                        </TableRow>}
                                    </>
                                  );
                                }}
                              />
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </ScrollX>
                <Divider />
                <DialogActions sx={{ p: 2.5 }} className='model-footer'>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" justifyContent="end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                      <Button
                        className="gray-outline-btn"
                        onClick={() => {
                          resetForm();
                          handleCancel();
                        }}
                      >
                        {intl.formatMessage({ id: 'cancel' })}
                      </Button>
                      {isInwardDone || addEditStatus === 'view' ? null :
                        <Button
                          // disabled={!isInwardDone ? false : true}
                          // className={!isInwardDone ? "" : "disabled-input"}
                          color="primary" variant="contained" type="submit">
                          {addEditStatus === 'edit' ? intl.formatMessage({ id: 'save' }) : intl.formatMessage({ id: 'create' })}
                        </Button>}
                    </Stack>
                  </Grid>
                </DialogActions>
                {/* </Grid> */}
              </Form>

              <Portal container={portalRef.current}>
                <Formik
                  innerRef={formikRef}
                  initialValues={values.purchaseDetailForm}
                  validationSchema={validationSchemaForInnerForm}
                  onSubmit={(values, { setSubmitting, resetForm }) => {

                    // Reset purchase detail list
                    setPurchaseDetailList(values);

                    // Reset submitting flag
                    setSubmitting(true);

                    // Reset form
                    resetForm();
                    
                    //Focus set to product autocomplete input
                    productRef.focus();
                  }}
                >
                  {({ errors, handleSubmit, values, setFieldValue, touched }) => {
                    return (
                      <>
                        <Form onSubmit={handleSubmit}>
                          <Grid container spacing={3} sx={{ marginTop: "-10px !important" }}>
                            <Grid item xs={12} sm={6} md={4}>
                              <Stack spacing={1}>
                                <InputLabel>{intl.formatMessage({ id: 'Product Name' })}</InputLabel>
                                <FormControl sx={{ width: '100%' }}>
                                  <Autocomplete
                                    disablePortal
                                    id="productId"
                                    autoFocus  // Add this attribute to set initial focus on the input field
                                    noOptionsText={noOptionsText}
                                    disabled={!purchaseDetailsFlag || isInwardDone ? true : false}
                                    className={!purchaseDetailsFlag || isInwardDone ? 'disabled-input' : ''}
                                    value={values.productId || null}
                                    options={productList || []}
                                    groupBy={(option) => option.groupName} // Group options based on groupName property
                                    getOptionLabel={(option) => option.name ?? option}
                                    onChange={(event, newValue) => {
                                      setFieldValue('productId', newValue);
                                      if (newValue) {
                                        const priceOfProduct = productList.filter((val) => val?.id === newValue?.id)
                                        setFieldValue('rate', priceOfProduct[0]?.cost);
                                      }
                                      else {
                                        setFieldValue('rate', '');
                                      }
                                      setPurchaseDetailsFlag(true)
                                    }}
                                    open={autoCompleteProductOpen}
                                    onInputChange={(event, value, reason) => {
                                      switch (reason) {
                                        case "input":
                                          setAutoCompleteProductOpen(!!value);
                                          break;
                                        case "reset":
                                        case "clear":
                                          setAutoCompleteProductOpen(false);
                                          break;
                                        default:
                                          console.log(reason);
                                      }
                                    }}
                                    isOptionEqualToValue={(option, value) => {
                                      if (value === '') {
                                        // Handle the case when the value is an empty string
                                        return option === null || option === '';
                                      }
                                      return option && value && option.id === value.id;
                                    }}
                                    placeholder={intl.formatMessage({ id: 'Select Product' })}
                                    renderInput={(params) => <TextField {...params}
                                      aria-label={intl.formatMessage({ id: 'Select Product' })}
                                      inputRef={input => {
                                        productRef = input;
                                      }}
                                      placeholder={intl.formatMessage({ id: 'Search&SelectProduct' })} size='large'
                                      error={values.productId ? false : (Boolean(touched.productId && errors.productId))}
                                      helperText={values.productId ? '' : (touched.productId && errors.productId ? errors.productId : '')}
                                    />}
                                    renderOption={(props, option, { inputValue }) => {
                                      const matches = option.name
                                        .toLowerCase()
                                        .includes(inputValue.toLowerCase());
                                      return (
                                        <li {...props}>
                                          {matches ? (
                                            <span>
                                              <strong>{option.name.slice(0, inputValue.length)}</strong>
                                              {option.name.slice(inputValue.length)}
                                            </span>
                                          ) : (
                                            option.name
                                          )}
                                        </li>
                                      );
                                    }}
                                  />
                                </FormControl>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <Stack spacing={1}>
                                <InputLabel>{intl.formatMessage({ id: 'Quantity' })}</InputLabel>
                                <FormControl sx={{ width: '100%' }}>
                                  <TextField
                                    disabled={!purchaseDetailsFlag || isInwardDone ? true : false}
                                    className={!purchaseDetailsFlag || isInwardDone ? 'disabled-input' : ''}
                                    name="quantity"
                                    id="filled-number"
                                    placeholder={intl.formatMessage({ id: 'Quantity' })}
                                    onChange={($event) => {
                                      const value = $event.target.value;
                                      // const sanitizedValue = value.replace(/^0+/, ''); // Removes leading '0's
                                      // Removes leading '0's and Remove decimal points from the input
                                      const sanitizedValue = value.replace(/^0+|[^0-9]/g, '');
                                      setFieldValue('quantity', sanitizedValue);
                                    }}
                                    value={values.quantity || ''}
                                    error={Boolean(errors.quantity && touched.quantity)}
                                    helperText={touched.quantity && errors.quantity ? errors.quantity : ''}
                                    inputProps={{
                                      className: 'align-right', // Add the custom class for aligning the text to the right
                                      style: { textAlign: 'right' } // Add inline style for text alignment
                                    }}
                                  />
                                </FormControl>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.1}>
                              <Stack spacing={1}>
                                <InputLabel>{intl.formatMessage({ id: 'UNITPRICE' })}</InputLabel>
                                <FormControl sx={{ width: '100%' }}>
                                  <FormControl variant="outlined">
                                    <OutlinedInput
                                      name="rate"
                                      sx={{ pointerEvents: 'none',
                                        borderColor: '#ccc'}}
                                      readOnly={true} // Set this prop to true to make the input read-only
                                      // disabled={true}
                                      // className='disabled-input'
                                      //disabled={!purchaseDetailsFlag || isInwardDone ? true : false}
                                      //className={!purchaseDetailsFlag || isInwardDone ? 'disabled-input' : ''}
                                      id="outlined-start-adornment"
                                      placeholder='0.0'
                                      startAdornment={<InputAdornment position="start">₹</InputAdornment>}
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
                                        setFieldValue('rate', sanitizedValue);
                                      }}
                                      value={values.rate || ''}
                                      error={Boolean(errors.rate && touched.rate)}
                                      inputProps={{
                                        pattern: '^\\S*$',
                                        className: 'align-right', // Add the custom class for aligning the text to the right
                                        style: { textAlign: 'right' } // Add inline style for text alignment
                                      }}
                                    />
                                  </FormControl>
                                  {touched.rate && errors?.rate && <FormHelperText error={true}>{errors?.rate}</FormHelperText>}
                                </FormControl>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.1}>
                              <Stack spacing={1}>
                                <InputLabel>{intl.formatMessage({ id: 'Delivery Date' })}</InputLabel>
                                <Stack spacing={1}>

                                  <FormControl sx={{ width: '100%' }}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                      <StyledDatePicker
                                        disabled={!purchaseDetailsFlag || isInwardDone ? true : false}
                                        className={!purchaseDetailsFlag || isInwardDone ? 'disabled-input' : ''}
                                        minDate={purchaseOrderDate}
                                        inputFormat="dd/MM/yyyy"
                                        name="deliveryDate"
                                        // renderInput={(params) => <TextField {...params} />} 
                                        onChange={(newValue) => {
                                          setFieldValue('deliveryDate', newValue);
                                        }}
                                        value={values.deliveryDate}
                                        // error={Boolean(errors.deliveryDate && touched.deliveryDate)}
                                        // helperText={touched.deliveryDate && errors.deliveryDate}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            error={Boolean(touched.deliveryDate && errors.deliveryDate)}
                                            helperText={touched.deliveryDate && errors.deliveryDate ? errors.deliveryDate : ''}
                                            value={moment(values.deliveryDate).format('DD/MM/YYYY')}
                                            inputProps={{
                                              readOnly: true,
                                              onClick: () => params.inputProps.onClick && params.inputProps.onClick()
                                            }}
                                          />
                                        )}
                                      />
                                    </LocalizationProvider>
                                  </FormControl>
                                </Stack>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={1} sx={{ marginTop: '28px' }}>
                              <Box>
                                <Button
                                  disabled={!purchaseDetailsFlag || isInwardDone ? true : false}
                                  className={!purchaseDetailsFlag || isInwardDone ? 'disabled-btn' : 'btn-outlined-primary add-product'}
                                  type="submit"
                                  color="primary"
                                  endIcon={<i className='icon-plus ottr-icon icon-size'></i>}
                                  variant="outlined"
                                  sx={{ bgcolor: 'transparent !important', py: "6px !important" }}
                                  size='large'
                                >
                                  {intl.formatMessage({ id: 'Add' })}
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Form>
                      </>
                    );
                  }}
                </Formik>
              </Portal>
            </>
          );
        }}
      </Formik>
    </MainCard>
  );
};

AddPurchaseOrder.propTypes = {
  purchaseOrder: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddPurchaseOrder;