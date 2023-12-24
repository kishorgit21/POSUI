// React apis
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// material-ui
import {
  Button, Divider, DialogContent, DialogActions, FormControl, FormHelperText, Grid, InputLabel, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, Select, Box, MenuItem, TableRow, TextField, Typography, DialogTitle, Tooltip, IconButton
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as yup from 'yup';
import { Form, Formik } from 'formik';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

//store
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';

// API
import { getBucket, addBucket } from '_api/Bucket';
import { getCustomer } from '_api/master_Customer';
import { getProduct } from '_api/master_Product';

// Validation
const validationSchema = yup.object({
  date: yup.date().required(<FormattedMessage id="DateVal" />),
  customer_Mobile: yup.string().min(10).max(10).required(<FormattedMessage id="CustomerMobileNumberVal" />),
  Purchase_detail: yup
    .array()
    .required(<FormattedMessage id='InvoiceVal' />)
    .of(
      yup.object().shape({
        productId: yup.string().required(<FormattedMessage id="ProductIdVal" />),
        quantity: yup.string().required(<FormattedMessage id="QuantityVal" />),
        productName: yup.string().required(<FormattedMessage id="ProductNameVal" />)
      })
    )
    .min(1, <FormattedMessage id="BucketVal" />),
  Ammount: yup.string()
});

// ==============================|| INVOICE - AddBucket ||============================== //

const AddBucket = () => {
  const dispatch = useDispatch();

  // Bucket data state
  const [bucketData, setBucketData] = useState(null);

  // Customer mobile number state
  const [customerMobile, setCustomerMobile] = useState('');

  // Customer ID state
  const [customerID, setCustomerID] = useState('');

  // Product meta data
  const [productMetaData, setproductMetaData] = useState();

  // Set updated flag
  const [update, setUpdate] = useState();

  // set selected product
  const [selectedProduct, setSelectedProduct] = useState(null);

  const intl = useIntl();

  // Set customer not found
  const [isCustomerNotFoundError, setIsCustomerNotFoundError] = useState(false);

  // Set customer invalid
  const [isCustomerInvalidError, setIsCustomerInvalidError] = useState(false);

  // Get cusotomer meta data and find customer id
  useEffect(() => {
    if (customerMobile.length === 10) {
      dispatch(getCustomer()).then((res) => {
        const customerId = res.payload.data.find((customer) => customer.mobileNumber.toString() === customerMobile)?.id;

        if (customerId !== undefined) {
          // Reset error
          setIsCustomerNotFoundError(false);
        }

        setCustomerID(customerId);
      });
    } else {
      setCustomerID("");
      setBucketData({ detailsDtos: [] });
    }
  }, [customerMobile, setCustomerMobile]);

  // API for product meta data
  useEffect(() => {
    dispatch(getProduct()).then((res) => {
      setproductMetaData(res.payload.data);
    });
  }, []);

  // get bucket by customer mobile number
  useEffect(() => {
    if (customerID) {
      var paramObj = {
        model: {
          customerId: customerID
        }
      };

      dispatch(getBucket(paramObj)).then((response) => {
        // Process edit customer api response
        if ((response.payload && response.payload.isError) || !!response.error) {
          if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'BucketListErrorMsg' })}`,
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
              message: `${intl.formatMessage({ id: 'GetBucketToast' })}`,
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: true
            })
          );
        }
      });
    }
    else {
      // Reset error
      setIsCustomerNotFoundError(true);

      setBucketData({ detailsDtos: [] })
    }
  }, [customerID, setCustomerID, update, dispatch]);

  const handleCancel = () => {
    setCustomerMobile("");
  };

  // Get customer form initial values
  const GetInitialValues = (bucketData, customerMobile) => {
    const initialval = {
      date: new Date(),
      customer_Mobile: customerMobile || '',
      Ammount: '',
      Purchase_detail: []
    };

    if (bucketData) {
      (initialval.date = new Date()),
        (initialval.customer_Mobile = customerMobile || ''),
        (initialval.Ammount = ''),
        (initialval.Purchase_detail = bucketData.detailsDtos);
      return _.merge({}, initialval, bucketData);
    }

    return initialval;
  };

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
    <MainCard className="ottr-table-section bucket-table">
      <Formik
        enableReinitialize
        initialValues={React.useMemo(() => GetInitialValues(bucketData, customerMobile), [bucketData, customerMobile])}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          const bucketdetail = values.Purchase_detail.map((obj) => {
            return {
              productId: obj.productId,
              quantity: obj.quantity
            };
          });

          const model = {
            customerId: customerID,
            date: values.date,
            bucketDetails: bucketdetail
          };

          // Add bucket api call
          dispatch(addBucket({ model }))
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
                    message: `${intl.formatMessage({ id: 'BucketTostAdd' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );

                setUpdate(true);
              }
            })
            .catch((error) => {
              // Caught error
              if (error && error.code === 'ERR_BAD_REQUEST') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'BucketAddErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
            });
          // Reset submitting flag
          setSubmitting(true);
        }}
      >
        {({ errors, handleSubmit, values, setFieldValue, touched, resetForm }) => {

          const subtotal = values?.Purchase_detail?.reduce((prev, curr) => {
            if (curr.productName.trim().length > 0) return prev + Number(10 * Math.floor(curr.quantity));
            else return prev;
          }, 0);

          return (
            <Form onSubmit={handleSubmit}>
              <DialogTitle variant="h5" sx={{paddingLeft: "0px !important", paddingTop: "30px", paddingBottom: "10px"}}>{intl.formatMessage({ id: 'AddBucket' })}</DialogTitle>
              {/* <Divider /> */}

              <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                <DialogContent className='bucket-table-parent'>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} md={3}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="customer_Mobile">{intl.formatMessage({ id: 'CustomerMobileNoLabel' })}</InputLabel>
                        <TextField
                          name={`customer_Mobile`}
                          onChange={(e) => {
                            const mobileNumber = e.target.value;
                            setFieldValue('customer_Mobile', mobileNumber);
                            if (mobileNumber.length === 10) {
                              setCustomerMobile(mobileNumber);
                            } else if (mobileNumber.length > 10) {
                              // Reset error
                              setIsCustomerInvalidError(true);
                            } else if (mobileNumber.length < 10) {
                              setCustomerMobile(mobileNumber);
                              // Reset error
                              setIsCustomerInvalidError(false);

                              setBucketData((preValue) => { return { ...preValue, customer_Mobile: mobileNumber, detailsDtos: [] } })
                            }
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
                            {/* Please enter valid Mobile Number. */}
                            Customer number not exists.
                          </Typography>}
                        {(values.customer_Mobile?.length > 10 && isCustomerInvalidError) &&
                          <Typography color="error" mb={1} mt={1} fontSize={12}>
                            {/* Please enter valid Mobile Number. */}
                            Please enter valid customer number.
                          </Typography>}

                      </Stack>
                    </Grid>
                    {/* <Grid item xs={12} sm={6} md={3} alignSelf="flex-end">
                      <Grid item xs={12} md={8}>
                        <Box>
                          <Button
                            color="primary"
                            startIcon={<PlusOutlined />}
                            onClick={() => {
                              setCustomerMobile(values.customer_Mobile);
                              setFieldValue('customer_Mobile', values.customer_Mobile);
                            }}
                            variant="dashed"
                            sx={{ bgcolor: 'transparent !important' }}
                          >
                            {intl.formatMessage({ id: 'GetBucket' })}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid> */}
                    <Grid item xs={12} sm={3} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>{intl.formatMessage({ id: 'Date' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              disabled
                              inputFormat="dd/MM/yyyy"
                              value={values.date}
                              onChange={(newValue) => setFieldValue('date', newValue)}
                              renderInput={(params) => <TextField {...params} />}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Stack>
                      {touched.date && errors.date && <FormHelperText error={true}>{errors.date}</FormHelperText>}
                    </Grid>

                    <Grid item xs={12} sm={5} md={5} sx={{ marginTop: "0px" }}>
                      <Stack spacing={1}>
                        <InputLabel>{intl.formatMessage({ id: 'Product' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Select
                            value={selectedProduct || ''}
                            displayEmpty
                            name="Purchase_detail"
                            renderValue={() => {
                              if (!selectedProduct) {
                                return <Box sx={{ color: 'secondary.400' }}>{intl.formatMessage({ id: 'select' })}  {intl.formatMessage({ id: 'product' })}</Box>;
                              }
                              return selectedProduct.name;
                            }}
                            onChange={(event) => {
                              const selectedProductId = event.target.value;
                              const selectedProduct = productMetaData.find((item) => item.id === selectedProductId);
                              setSelectedProduct(selectedProduct);
                            }}
                            // error={Boolean(errors.Purchase_detail && touched.Purchase_detail)}
                            MenuProps={MenuProps}
                          >
                            <MenuItem disabled value="">
                              {intl.formatMessage({ id: 'select' })}  {intl.formatMessage({ id: 'product' })}
                            </MenuItem>
                            {productMetaData?.map((item, index) => (
                              <MenuItem key={index} value={item.id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                      {touched.vendor && errors.vendor && <FormHelperText error={true}>{errors.vendor}</FormHelperText>}
                    </Grid>
                    <Grid item xs={12} sm={1} md={1} sx={{ marginTop: "28px" }}>
                      <Grid container>
                        <Grid item xs={12} md={12}>
                          <Box>
                            <Button
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
                                  }
                                  setSelectedProduct('')
                                }
                              }}
                              sx={{ bgcolor: 'transparent !important', py: "6px !important" }}
                              size='large'

                              // disabled={!!(errors && errors.customer_Mobile && errors.customer_Mobile.length) || isCustomerNotFoundError}
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

                    {touched.Purchase_detail && errors.Purchase_detail && (
                        <FormHelperText error={true} sx={{marginLeft:"24px !important", marginBottom:"-10px !important"}}>{errors.Purchase_detail}</FormHelperText>
                      )}
                    <Grid item xs={12}>
                      <TableContainer className='ottr-table bucket-new-table' sx={{ marginTop: "-15px !important" }}>
                        <Table>
                          <TableHead sx={{ border: '0', paddingTop: "8px !important" }}>
                            <TableRow sx={{ background: '#fafafb', paddingTop: "8px !important" }} className='bucket-table-header'>
                              <TableCell align="left" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'SR.NO.' })}</TableCell>
                              <TableCell sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Discription' })}</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Quantity' })}</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'UNITPRICE' })} (₹)</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'action' })}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>

                            {values.Purchase_detail.length ? values.Purchase_detail?.map((item, index) => (
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
                            )) : <TableRow>
                              <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={5}>
                                {intl.formatMessage({ id: 'NoRecord' })}
                              </TableCell>
                            </TableRow>}
                          </TableBody>
                        </Table>
                        <Grid item
                          container
                          direction="row"
                          py={2}
                          pr={2}
                          sx={{ background: '#fafafb' }}
                          mt={1}
                          justifyContent="flex-end"
                          alignItems="flex-start"
                          className='model-footer'
                        >
                          <Typography fontWeight={500} fontSize={"14px"} color={'#262626'}>{intl.formatMessage({ id: 'TotalPrice' })} (₹) :</Typography>
                          <Typography variant="h5" color={'#2B3467'}>{(values.Ammount = subtotal.toFixed(2))}</Typography>
                        </Grid>

                        <DialogActions className='model-footer' sx={{marginTop: "-18px !important"}}>
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
                              <Button color="primary" variant="contained" type="submit" sx={{marginLeft: "15px !important"}}>
                                {intl.formatMessage({ id: 'save' })}
                              </Button>
                            </Stack>
                          </Grid>
                        </DialogActions>


                      </TableContainer>
                    </Grid>
                  </Grid>
                </DialogContent>
              </ScrollX>
              {/* <DialogActions className='model-footer'>
                <Grid pl={5} container direction="row" justifyContent="end" alignItems="flex-start" xs={12} sm={6} my={1} mr={1}>
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
              </DialogActions> */}
            </Form>
          );
        }}
      </Formik>
    </MainCard>
  );
};

export default AddBucket;