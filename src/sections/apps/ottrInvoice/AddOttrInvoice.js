import PropTypes from 'prop-types';

// API
import { getBucket } from '_api/Bucket';
import { addInvoice, updateInvoice } from '_api/ottrInvoice';

import {
  Button,
  Divider,
  DialogContent,
  DialogActions,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Select,
  Box,
  MenuItem,
  TableRow,
  TextField,
  Typography,
  DialogTitle,
  Tooltip,
  IconButton
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Third party
import * as yup from 'yup';
import { Form, Formik } from 'formik';

// Project import
import MainCard from 'components/MainCard';

// Assets
import ScrollX from 'components/ScrollX';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import { getCustomer } from '_api/master_Customer';
import { getProduct } from '_api/master_Product';
import { getStore } from '_api/master_Store';
import { FormattedMessage, useIntl } from 'react-intl';

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

// Get customer form initial values
const GetInitialValues = (invoice, invoiceData, customerMobile) => {
  const initialval = {
    date: new Date(),
    customer_Mobile: customerMobile || '',
    Ammount: '',
    storeId: '',
    Purchase_detail: []
  };

  if (invoiceData) {
    (initialval.date = new Date()),
      (initialval.customer_Mobile = customerMobile || ''),
      (initialval.Ammount = ''),
      (initialval.Purchase_detail = invoiceData.detailsDtos),
      (initialval.storeId = invoice.storeId);
    // return _.merge({}, initialval, invoiceData);
  }
  if (invoice && Object.keys(invoice).length) {
    (initialval.Purchase_detail = invoice.details);
    (initialval.storeId = invoice.storeId);
    // (initialval.customerId = invoice.customerId);
  }

  return initialval;
};

// ==============================|| INVOICE - AddOttrInvoice ||============================== //
const AddOttrInvoice = ({ addEditStatus, invoice, onCancel, setUpdated }) => {
  const dispatch = useDispatch();

  // Bucket data state
  const [invoiceData, setBucketData] = useState(null);

  // Customer mobile number state
  const [customerMobile, setCustomerMobile] = useState('');

  // Set product
  const [update, setUpdate] = useState();

  // Set customer not found
  const [isCustomerNotFoundError, setIsCustomerNotFoundError] = useState(false);

  // Product meta data
  const [productMetaData, setproductMetaData] = useState();

  // Store meta data
  const [storeMetaData, setStoreMetaData] = useState();
  // Customer ID state
  const [customerID, setCustomerID] = useState('');

  // set selected product
  const [selectedProduct, setSelectedProduct] = useState(null);

  const formikRef = useRef();

  const intl = useIntl();

  // Validation
  const validationSchema = yup.object({
    date: yup.date().required(<FormattedMessage id='DateVal' />),
    customer_Mobile: yup.string().min(10).max(10).required(<FormattedMessage id="MobileNumberVal" />),
    storeId: yup.string().required(<FormattedMessage id="StoreVal" />),
    Purchase_detail: yup
      .array()
      .required(<FormattedMessage id="InvoiceDeatilVal" />)
      .of(
        yup.object().shape({
          productId: yup.string().required(<FormattedMessage id="ProductIdVal" />),
          quantity: yup.string().required(<FormattedMessage id="QuantityVal" />),
          productName: yup.string().required(<FormattedMessage id="ProductNameVal" />)
        })
      )
      .min(1, <FormattedMessage id="BucketItemVal" />),
    Ammount: yup.string()
  });


  useEffect(() => {
    if (addEditStatus === 'edit') {
      dispatch(getCustomer()).then((res) => {
        // Get customer mobile from customer id
        const customerMobile = res.payload.data.find((customer) => customer.id.toString() === invoice.customerId)?.mobileNumber;
        // Set customer mobile value from formik
        if (formikRef.current) {
          formikRef.current.setFieldValue('customer_Mobile', customerMobile);
          setIsCustomerNotFoundError(false);
          setCustomerMobile(customerMobile.toString());
        }
      })
    }
  }, [addEditStatus])

  // Get cusotomer meta data and find customer id
  useEffect(() => {
    if (customerMobile.length === 10) {
      dispatch(getCustomer()).then((res) => {

        // Get customer id from customer mobile
        const customerId = res.payload.data.find((customer) => customer.mobileNumber.toString() === customerMobile)?.id;
        if (customerId !== undefined) {
          // Reset error
          setIsCustomerNotFoundError(false);
        }
        // Reset customer id
        setCustomerID(customerId);
        // Reset update flag
        setUpdate(true);

      });
    } else {
      setCustomerID("");
      setBucketData([]);// { detailsDtos: [] }
    }
  }, [customerMobile, setCustomerMobile]);

  // API for product meta data
  useEffect(() => {
    dispatch(getProduct()).then((res) => {
      setproductMetaData(res.payload.data);
    });

    dispatch(getStore()).then((res) => {
      setStoreMetaData(res.payload.data);
    });
  }, []);

  // Get invoice by customer mobile number
  useEffect(() => {
    if (addEditStatus === 'add') {
      if (customerID) {
        var paramObj = {
          model: {
            customerId: customerID
          }
        };

        // Get bucket
        dispatch(getBucket(paramObj)).then((response) => {
          // Process edit customer api response
          if ((response.payload && response.payload.isError) || !!response.error) {
            if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
              dispatch(
                openSnackbar({
                  open: true,
                  message: intl.formatMessage({ id: 'InvoiceBucketErrorMsg' }),
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
          } else {
            setBucketData(response.payload.data);
            dispatch(
              openSnackbar({
                open: true,
                message: intl.formatMessage({ id: 'GotInvoiceSuccess' }),
                variant: 'alert',
                alert: {
                  color: 'success'
                },
                close: true
              })
            );
          }
        });
      } else {
        // Reset error
        setIsCustomerNotFoundError(true);

        // Reset bucket list
        setBucketData([]);
      }
    }

  }, [customerID, setCustomerID, update, dispatch]);

  // Cancel add/ edit form
  const handleCancel = () => {
    onCancel();
  };

  return (
    <MainCard className="edit-purchase-order">
      <Formik
        enableReinitialize
        initialValues={React.useMemo(() => GetInitialValues(invoice, invoiceData, customerMobile), [invoiceData, customerMobile])}
        validationSchema={validationSchema}
        innerRef={formikRef}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const invoiceDetails = values.Purchase_detail.map((obj) => {
            return {
              productId: obj.productId,
              quantity: obj.quantity,
              rate: 10
            };
          });

          const model = {
            id: invoice.id,
            customerId: customerID,
            storeId: values.storeId,
            date: values.date,
            amount: 40,
            invoiceDetails: invoiceDetails
          };

          if (addEditStatus === 'add') {

            // Add product api call
            dispatch(addInvoice({ model }))
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
                      message: intl.formatMessage({ id: 'InvoiceTostAdd' }),
                      variant: 'alert',
                      alert: {
                        color: 'success'
                      },
                      close: true
                    })
                  );

                  setUpdated(true);
                }
              })
              .catch((error) => {
                // Caught error
                if (error && error.code === 'ERR_BAD_REQUEST') {
                  dispatch(
                    openSnackbar({
                      open: true,
                      message: intl.formatMessage({ id: 'InvoiceAddErrorMsg' }),
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
            dispatch(updateInvoice({ model }))
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
                      message: intl.formatMessage({ id: 'InvoiceTostEdit' }),
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
                      message: intl.formatMessage({ id: 'InvoiceEditErrorMsg' }),
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
        }
        }
      >
        {({ errors, handleSubmit, values, setFieldValue, touched, resetForm }) => {

          const subtotal = values?.Purchase_detail?.reduce((prev, curr) => {
            if (curr.productName.trim().length > 0) return prev + Number(10 * Math.floor(curr.quantity));
            else return prev;
          }, 0);

          return (
            <Form onSubmit={handleSubmit}>
              <DialogTitle className='model-header'>{intl.formatMessage({ id: 'ViewInvoice' })}</DialogTitle>
              <Divider />

              <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                <DialogContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} md={3}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="customer_Mobile">{intl.formatMessage({ id: 'CustomerMobileNo' })}</InputLabel>
                        <TextField
                          name={`customer_Mobile`}
                          onChange={(e) => {
                            const mobileNumber = e.target.value;
                            if (mobileNumber?.length === 10) {
                              setCustomerMobile(mobileNumber);
                            } else if (mobileNumber.length < 10) {
                              setCustomerMobile(mobileNumber);

                              setBucketData((preValue) => { return { ...preValue, customer_Mobile: mobileNumber, detailsDtos: [] } })
                            }
                            setFieldValue('customer_Mobile', mobileNumber);
                          }}
                          fullWidth
                          id="customer_Mobile"
                          placeholder={intl.formatMessage({ id: 'CustomerMobileNoLabel' })}
                          value={values.customer_Mobile || ''}
                          // {...getFieldProps('customer_Mobile')}
                          error={Boolean(touched.customer_Mobile && errors.customer_Mobile)}
                          helperText={touched.customer_Mobile && errors.customer_Mobile}
                        />
                        {(values.customer_Mobile?.length === 10 && isCustomerNotFoundError) &&
                          <Typography color="error" mb={1} mt={1} fontSize={12}>
                            {intl.formatMessage({ id: 'CustomerMobileNoVal' })}
                          </Typography>}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>{intl.formatMessage({ id: 'Date' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              disabled
                              inputFormat="dd/MM/yyyy"
                              value={values.date || ''}
                              onChange={(newValue) => setFieldValue('date', newValue)}
                              renderInput={(params) => <TextField {...params} />}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Stack>
                      {touched.date && errors.date && <FormHelperText error={true}>{errors.date}</FormHelperText>}
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>{intl.formatMessage({ id: 'Store' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Select
                            displayEmpty
                            name="storeId"
                            onChange={($event) => setFieldValue('storeId', $event.target.value)}
                            value={values.storeId || ''}
                            error={Boolean(errors.storeId && touched.storeId)}
                            className={addEditStatus === 'view' || addEditStatus === 'edit' ? 'pointer-event-none' : ''}
                            MenuProps={MenuProps}
                          >
                            <MenuItem disabled value="">
                              {intl.formatMessage({ id: 'Select Store' })}
                            </MenuItem>

                            {storeMetaData?.map(({ id, name }) => (
                              <MenuItem key={id} value={id} sx={{ whiteSpace: 'normal' }}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                      {touched.storeId && errors.storeId && <FormHelperText error={true}>{errors.storeId}</FormHelperText>}
                    </Grid>


                    <Grid item xs={12} sm={6} md={5}>
                      <Stack spacing={1}>
                      <InputLabel>{intl.formatMessage({ id: 'Product' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Select
                            value={selectedProduct || ''}
                            displayEmpty
                            name="Purchase_detail"
                            renderValue={() => {
                              if (!selectedProduct) {
                                return <Box sx={{ color: '#262626' }}> {intl.formatMessage({ id: 'select' })} {intl.formatMessage({ id: 'product' })}</Box>;
                              }
                              return selectedProduct.name;
                            }}
                            onChange={(event) => {
                              const selectedProductId = event.target.value;
                              const selectedProduct = productMetaData.find((item) => item.id === selectedProductId);
                              setSelectedProduct(selectedProduct);
                            }}
                            MenuProps={MenuProps}
                          // error={Boolean(errors.Purchase_detail && touched.Purchase_detail)}
                          >
                            <MenuItem disabled value="">
                              {intl.formatMessage({ id: 'select' })} {intl.formatMessage({ id: 'product' })}
                            </MenuItem>
                            {productMetaData?.map(({ id, name }) => (
                              <MenuItem key={id} value={id} sx={{ whiteSpace: 'normal' }}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                      {touched.vendor && errors.vendor && <FormHelperText error={true}>{errors.vendor}</FormHelperText>}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{marginTop: "28px !important"}}>
                      <Grid container>
                        <Grid item xs={12} md={8}>
                          <Box>
                            <Button
                              // type="submit"
                              color="primary"
                              className={!!(errors && errors.customer_Mobile && errors.customer_Mobile.length) || isCustomerNotFoundError ? "disabled-btn" : "btn-outlined-primary add-product"}
                              variant="outlined"
                              endIcon={<i className='icon-plus ottr-icon'></i>}
                              onClick={() => {

                                if (selectedProduct !== null) {
                                  const existingProductIndex = values.Purchase_detail.findIndex(
                                    (item) => item.productId === selectedProduct.id
                                  );

                                  if (existingProductIndex !== -1) {
                                    const updatedPurchaseDetail = [...values.Purchase_detail];
                                    updatedPurchaseDetail[existingProductIndex].quantity++;
                                    setFieldValue('Purchase_detail', updatedPurchaseDetail);
                                  } else {
                                    const newProduct = {
                                      productId: selectedProduct.id,
                                      quantity: 1,
                                      productName: selectedProduct.name
                                    };
                                    const updatedPurchaseDetail = [...values.Purchase_detail, newProduct];
                                    setFieldValue('Purchase_detail', updatedPurchaseDetail);
                                    // setSelectedProduct(null);
                                  }
                                }
                              }}
                              sx={{ bgcolor: 'transparent !important', py: "6px !important" }}
                              disabled={!!(errors && errors.customer_Mobile && errors.customer_Mobile.length) || isCustomerNotFoundError}
                              size='large'
                            >
                              {intl.formatMessage({ id: 'Add' })}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>

                    </Grid>

                    <Divider />

                    <Grid item xs={12}>
                      <Typography variant="h5">{intl.formatMessage({ id: 'Purchase Detail' })}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      {touched.Purchase_detail && errors.Purchase_detail && (
                        <FormHelperText error={true}>{errors.Purchase_detail}</FormHelperText>
                      )}
                      <TableContainer className='ottr-table bucket-new-table' sx={{ marginTop: "-15px !important" }}>
                        <Table>
                          <TableHead sx={{ border: '0', paddingTop: "8px !important" }}>
                            <TableRow sx={{ background: '#fafafb', paddingTop: "8px !important" }} className='bucket-table-header'>
                              <TableCell align="left">{intl.formatMessage({ id: 'SR.NO.' })}</TableCell>
                              <TableCell align="left">{intl.formatMessage({ id: 'Discription' })}</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Quantity' })}</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'UNITPRICE' })} (₹)</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'action' })}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {values.Purchase_detail?.length ? values.Purchase_detail?.map((item, index) =>
                              <TableRow key={index} sx={{height: "43px !important"}}>
                                <TableCell align="left">{index + 1}</TableCell>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">{(10).toFixed(2)}</TableCell>
                                <TableCell align="right" className='action-icons'>

                                  <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
                                    <IconButton
                                      color="error"
                                      onClick={() => {
                                        values.Purchase_detail.splice(index, 1);
                                        setFieldValue('Purchase_detail', values.Purchase_detail);
                                      }}
                                    >
                                      {/* <DeleteTwoTone twoToneColor={theme.palette.error.main} /> */}
                                      <i className='icon-trash ottr-icon' style={{ fontSize: "22px" }}></i>
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ) :
                              <TableRow>
                                <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                                  {intl.formatMessage({ id: 'NoRecord' })}
                                </TableCell>
                              </TableRow>
                            }
                          </TableBody>
                        </Table>
                        <Grid
                          container
                          direction="row"
                          py={2}
                          pr={2}
                          sx={{ background: '#fafafb' }}
                          mt={1}
                          justifyContent="flex-end"
                          alignItems="flex-start"
                        >
                          {/* <Typography color={theme.palette.grey[500]}>{intl.formatMessage({ id: 'Amount' })} :</Typography>
                          <Typography variant="h5">{(values.Ammount = subtotal?.toFixed(2))}</Typography> */}

                          <Typography fontWeight={500} fontSize={"14px"} color={'#262626'}>{intl.formatMessage({ id: 'TotalPrice' })} (₹) :</Typography>
                          <Typography variant="h5" color={'#2B3467'}>{(values.Ammount = subtotal ? subtotal.toFixed(2) : "0.00")}</Typography>
                        </Grid>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </DialogContent>
              </ScrollX>
              <Divider />
              <DialogActions className='model-footer'>
                <Grid item pl={5} container direction="row" justifyContent="end" alignItems="flex-start" xs={12} sm={6} my={1} mr={1}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={4} sx={{ height: '100%' }}>
                    <Button
                      className="gray-outline-btn"
                      variant="text"
                      color="secondary"
                      onClick={() => {
                        resetForm();
                        handleCancel();
                      }}
                      sx={{ color: 'secondary.dark' }}
                    >
                      {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button color="primary" variant="contained" type="submit">
                      {intl.formatMessage({ id: 'save' })}
                    </Button>
                  </Stack>
                </Grid>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </MainCard>
  );
};

AddOttrInvoice.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddOttrInvoice;