// React apis
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import "style.css";

// material-ui
import { Button, Divider, DialogContent, DialogActions, FormControl, Autocomplete, Typography, FormHelperText, Grid, InputLabel, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, DialogTitle, Tooltip, IconButton } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// third party
import * as yup from 'yup';
import { FormattedMessage, useIntl } from 'react-intl';
import { FieldArray, Form, FormikProvider, useFormik } from 'formik';
import moment from 'moment';
import QrReader from "react-qr-reader";

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Loader from 'components/Loader';
import ScannerLoader from '../newbucket/ScannerLoader';

import { useDispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// Services
import { addMaterialReturn, updateMaterialReturn } from '_api/transactions/material_Return';
import { getQRCodeStatus } from '_api/transactions/material_Inward';
import { getProduct } from '_api/master_Product';
//assets
import scannerImage from 'assets/images/scanner.png';

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

//Date picker on focuse outline remove and input box crop
const StyledDatePicker = styled(DatePicker)({
  '& .MuiInputBase-input': {
    padding: '10.5px 0px 10.5px 12px',
  },
  '& .MuiInputBase-root.Mui-focused': {
    boxShadow: 'none', // Remove focus outline when DatePicker is focused
  },
});

// Get material return form initial values
const getInitialValues = (materialReturn) => {
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

  const newMaterialReturn = {
    date: new Date(),
    store: parsedData || '',
    returnReason: '',
    vendor: '',
    materialReturnNoteDetails: [],
    barcodeDetails: []
  };

  if (materialReturn) {
    newMaterialReturn.date = materialReturn.date || new Date();
    newMaterialReturn.store = {
      id: materialReturn.storeId || parsedData.id,
      name: materialReturn.storeName || parsedData.name
    }
    // newMaterialReturn.returnReason = {
    //   id: materialReturn.returnReasonId,
    //   name: materialReturn.returnReasonName
    // }
    // newMaterialReturn.store = materialReturn.storeName,
    newMaterialReturn.returnReason = materialReturn.returnReasonName,
      newMaterialReturn.vendor = {
        id: materialReturn.vendorId,
        name: materialReturn.vendorName,
      }
    newMaterialReturn.materialReturnNoteDetails = materialReturn.materialReturnNoteDetails || [];

    return _.merge({}, newMaterialReturn, materialReturn);
  }

  return newMaterialReturn;
};

// Validation schema for add/ edit purchase order form
const validationSchema = yup.object({
  date: yup.date().required(<FormattedMessage id="MaterialReturnDateVal" />),
  store: yup.object().required(<FormattedMessage id="StoreSelectionVal" />).nullable(),
  returnReason: yup.object().required(<FormattedMessage id="ReturnReasonVal" />).nullable(),
  materialReturnNoteDetails: yup
    .array()
    .required(<FormattedMessage id="InvoiceDetailsVal" />)
    .of(
      yup.object().shape({
        vendorId: yup.string().required(<FormattedMessage id="ProductNameVal" />),
        productId: yup.string().required(<FormattedMessage id="ProductNameVal" />),
        quantity: yup.string().required(<FormattedMessage id="ProductNameVal" />)
      })
    )
    .min(1, <FormattedMessage id="OneItemVal" />)
});

// ==============================|| Material Return  ADD / EDIT ||============================== //

const AddMaterialReturn = ({ materialReturn, addEditStatus, onCancel, setUpdated }) => {
  const dispatch = useDispatch();

  // Set material return action state
  const [materialReturnAction, setMaterialReturnAction] = useState('');

  // Localizations - multilingual
  const intl = useIntl();

  // Get store list, loading flag & another parameters
  const { stores } = useSelector((state) => state.storeSlice);
  const [autoCompleteStoresOpen, setAutoCompleteStoresOpen] = useState(false);
  const [autoCompleteReturnReasonOpen, setAutoCompleteReturnReasonOpen] = useState(false);

  // Initialize a buffer to store the scanned data
  const scannerInputBuffer = [];

  const noOptionsText = intl.formatMessage({ id: 'Norecords' });

  // Get return reason list, loading flag & another parameters
  const { returnReasons } = useSelector((state) => state.returnReasonSlice);

  // Get product list
  const { products } = useSelector((state) => state.productSlice);
  const [facingMode, setFacingMode] = useState('environment');
  const qrReaderRef = useRef(null);

  //set camera device found or not flag
  const [cameraFlag, setCameraFlag] = useState(false);

  const handleCameraSwitch = () => {
    setFacingMode((prevMode) => (prevMode === 'environment' ? 'user' : 'environment'));
  };

  const [loadingScan, setLoadingScan] = useState(false);

  // Initialize Formik outside of the useEffect
  const formik = useFormik({
    initialValues: getInitialValues(materialReturn),
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      try {
        if (addEditStatus === 'edit') {
          // Edit material return model
          const model = {
            id: materialReturn?.id || '',
            vendorId: values?.vendor.id || '',
            date: values.date || '',
            storeId: values.store.id || '',
            returnReasonId: values.returnReason.id || '',
            materialReturnNoteDetails: values.materialReturnNoteDetails || '',
            barcodeDetails: values.barcodeDetails || ''
          };
          // Edit material return api call
          dispatch(updateMaterialReturn({ model }))
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
                    message: `${intl.formatMessage({ id: 'MaterialReturnTostEdit' })}`,
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
                    message: `${intl.formatMessage({ id: 'MaterialReturnEditErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
            });
        } else {
          // Add material return model
          const model = {
            // vendorId: values?.vendor.id || '',
            date: values.date || '',
            storeId: values.store.id || '',
            returnReasonId: values.returnReason.id || '',
            materialReturnNoteDetails: values.materialReturnNoteDetails || '',
            barcodeDetails: values.barcodeDetails || ''
          };
          // Add material return api call
          dispatch(addMaterialReturn({ model }))
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
                    message: `${intl.formatMessage({ id: 'MaterialReturnTostAdd' })}`,
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
                    message: `${intl.formatMessage({ id: 'MaterialReturnAddErrorMsg' })}`,
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
        // Reset material return form
        resetForm();
        // Cancel method
        onCancel('cancel');

      } catch (error) {
        console.error(error);
      }
    }
  });

  // Formik form flags, states, events
  const { errors, touched, handleSubmit, isSubmitting, setFieldValue, values } = formik;

  //handle USB scan handler
  useEffect(() => {
    document.addEventListener('keydown', handleScannerInput);
    return () => {
      document.removeEventListener('keydown', handleScannerInput);
    };
  }, [products, values]); // Include products and formik values in the dependency array

  // Function to parse and clean up the scanned data
  const parseScannedData = (rawData) => {
    const cleanedData = rawData.replace(/Shift/g, ""); // Remove "Shift" word
    try {
      return cleanedData; // Parse the cleaned data as JSON
    } catch (error) {
      console.error("Error parsing scanned data:", error);
      return null; // Handle parsing errors gracefully
    }
  };

  //Get the scanned data fron USB
  const handleScannerInput = (event) => {
    setLoadingScan(true)
    // Check if the Enter key is pressed to detect the end of a scan
    if (event.key === 'Enter') {
      // Prevent the default Enter key behavior (e.g., form submission)
      event.preventDefault();

      // Extract the scanned data from the buffer
      const scannedData = scannerInputBuffer.join('');

      // Process the scanned data as needed
      const parsedData = parseScannedData(scannedData);
      if (parsedData !== null && parsedData !== '') {
        handleScan(parsedData,'GunScan')
      }
      // Clear the buffer for the next scan
      scannerInputBuffer.length = 0;
      setLoadingScan(true)
    } else {
      // Append the key to the buffer
      scannerInputBuffer.push(event.key);
      setLoadingScan(true)
    }
  };
  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setMaterialReturnAction(<FormattedMessage id="AddMaterialReturn" />);
    } else if (addEditStatus === 'edit') {
      setMaterialReturnAction(<FormattedMessage id="EditMaterialReturn" />);
    } else {
      setLoadingScan(true);
      setMaterialReturnAction(<FormattedMessage id="ViewMaterialReturn" />);
    }
  }, []);

  const handleCancel = () => {
    // Reset form
    formik.resetForm();
    // Cancel method call
    onCancel('cancel');
  };

  const handleError = (error) => {
    if (addEditStatus === 'add') {
      if (error instanceof DOMException && error.message.includes("Requested device not found")) {
        // Camera device not found
        console.log('Requested camera device not found');
        setLoadingScan(true)
        setCameraFlag(true)
      } else if (error instanceof DOMException && error.message.includes("Permission denied")) {
        // Permission denied by the user
        // console.log('Camera permission denied by the user')
        setCameraFlag(false)
        dispatch(
          openSnackbar({
            open: true,
            message: `${intl.formatMessage({ id: 'CameraPermissionErrorMessage' })}`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
      else if (error instanceof DOMException && error.message.includes("Permission dismissed")) {
        // Permission denied by the user
        // console.log('Camera permission denied by the user')
        setCameraFlag(false)
        dispatch(
          openSnackbar({
            open: true,
            message: `${intl.formatMessage({ id: 'CameraPermissionErrorMessage' })}`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
      else {
        setLoadingScan(true)
        setCameraFlag(true)
        // Other types of errors
        console.log('QR code scanning error:', error);
        // this.setState({ errorMessage: 'Error scanning QR code' });
      }
    }
  };

  const handleScan = async (scanData,status) => {
    if (status != 'GunScan') {
      // setTimeout(() => {
      setLoadingScan(true);
      //   }, 3000)
    }

    if (!isValidJSON(scanData)) {
      dispatch(
        openSnackbar({
          open: true,
          message: `${intl.formatMessage({ id: 'BucketInvalidQRErrorMsg' })}`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
      setLoadingScan(false);
    }
    else if (scanData && scanData !== "") {
      const finalScanData = JSON.parse(scanData);
      var newProduct1 = {
        barcodeNumber: finalScanData.barcode,
        productId: finalScanData.productId
      }
      const productExists = products.some(product => product.id === newProduct1?.productId);
      const findProductObj = products.filter((val) => val.id == newProduct1?.productId)
      if (productExists == false) {
        dispatch(
          openSnackbar({
            open: true,
            message: `${intl.formatMessage({ id: 'ProductNotExistMsg' })}`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
        setLoadingScan(false);
      }
      else {
        const model = {
          qrcode: newProduct1.barcodeNumber
        }
        dispatch(getQRCodeStatus({ model }))
          .unwrap()
          .then((payload) => {
            if (payload && payload.isError) {
              // Handle error
              if (payload.errorCode === 'E_INVALID_QR_CODE') {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'BucketInvalidQRErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
            } else {
              //console.log('finalScanData',finalScanData)
              var newProduct = {
                productId: finalScanData.productId,
                barcodeNumber: finalScanData.barcode,
                productName: findProductObj[0].name,
                vendorName: payload.data.vendorName,
                vendorId: payload.data.vendorId,
                rate: findProductObj[0].cost,
                expiryDate: payload.data.expiryDate,
                quantity: 1
              }
              if (payload.data.remainingQty < 1) {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'BucketOutOfStockErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
              else {
                // Find the index of the existing product in the materialReturnNoteDetails
                const existingProductIndex = values.materialReturnNoteDetails.findIndex(
                  (existingItem) =>
                    existingItem.barcodeNumber == newProduct?.barcodeNumber
                  //existingItem.productId === newProduct.productId && existingItem.vendorId == newProduct.vendorId
                );

                const productMatch = values?.materialReturnNoteDetails.find(product =>
                  // product?.productId === newProduct?.productId && product?.vendorId === newProduct?.vendorId
                  product?.barcodeNumber == newProduct?.barcodeNumber
                );
                const qtyMatch = payload.data.remainingQty === (productMatch?.quantity ?? 0);
                if (productMatch && qtyMatch) {
                  dispatch(
                    openSnackbar({
                      open: true,
                      message: `${intl.formatMessage({ id: 'BucketOutOfStockErrorMsg' })}`,
                      variant: 'alert',
                      alert: {
                        color: 'error'
                      },
                      close: true
                    })
                  );
                }
                else {
                  const barcodeDetails = {
                    quantity: newProduct.quantity,
                    productId: newProduct.productId,
                    vendorId: newProduct.vendorId,
                    barcodeNumber: newProduct.barcodeNumber
                  }

                  // Find the index of the existing product in the barcodeDetails
                  const existingBarcodeProductIndex = values.barcodeDetails.findIndex(
                    (existingItem) =>
                      existingItem?.barcodeNumber == newProduct?.barcodeNumber
                    //existingItem.productId === newProduct.productId && existingItem.vendorId == newProduct.vendorId
                  );
                  if (existingProductIndex !== -1) {
                    const updatedBucketDetail = [...values.materialReturnNoteDetails];
                    updatedBucketDetail[existingProductIndex].quantity += Number(newProduct.quantity);
                    setFieldValue('materialReturnNoteDetails', updatedBucketDetail);// Set material return with updated 

                    const updateBarcodeDeatils = [...values.barcodeDetails];
                    updateBarcodeDeatils[existingBarcodeProductIndex].quantity += Number(barcodeDetails.quantity)
                    setFieldValue('barcodeDetails', updateBarcodeDeatils)
                  }
                  else {
                    // If the product doesn't exist, add it to the materialReturnNoteDetails
                    const updatedPurchaseDetail = [...values.materialReturnNoteDetails, newProduct];
                    setFieldValue('materialReturnNoteDetails', updatedPurchaseDetail);

                    // If the product doesn't exist, add it to the barcodeDetails
                    const updatedbarcodePurchaseDetail = [...values.materialReturnNoteDetails, barcodeDetails];
                    setFieldValue('barcodeDetails', updatedbarcodePurchaseDetail);
                  }
                }
                setLoadingScan(false);
              }
              setLoadingScan(false);
            }
          })
          .catch((error) => {
            if (error && error.code === "ERR_BAD_REQUEST") {
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
          })
      }
    }
  }
  useEffect(() => {
    // Get product list api call
    dispatch(getProduct())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          // Reset updated flag
        }
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'MasterProductListErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      });
  }, []);


  const quantityMap = values?.materialReturnNoteDetails?.reduce((acc, item) => {
    const key = `${item.productId}-${item.vendorId}`;
    if (!acc[key]) {
      acc[key] = {
        ...item,
        productId: item.productId,
        vendorId: item.vendorId,
        quantity: 0
      };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {});

  const materialReturnNoteDetailsProductIdAndVendorIdWise = Object.values(quantityMap);


  return (
    <MainCard className="edit-purchase-order">
      {!cameraFlag && !loadingScan && <Loader /> && <ScannerLoader />}
      <FormikProvider value={formik}>
        <Form onSubmit={handleSubmit}>
          <DialogTitle className='model-header' >{materialReturnAction}</DialogTitle>
          <Divider />
          <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} md={4}>
                  <Stack spacing={1}>
                    <InputLabel>{intl.formatMessage({ id: 'date' })}</InputLabel>
                    <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StyledDatePicker
                          inputFormat="dd/MM/yyyy"
                          value={values.date}
                          maxDate={new Date()}
                          // disabled={addEditStatus === 'view' ? true : false}
                          // className={addEditStatus === 'view' ? 'disabled-input' : ''}
                          disabled={true}
                          className={'disabled-input'}
                          onChange={(newValue) => setFieldValue('date', newValue)}
                          renderInput={(params) => <TextField
                            {...params}
                            value={moment(values.date).format('DD/MM/YYYY')}
                            //value={values.date instanceof Date ? values.date.toLocaleDateString() : ''}
                            inputProps={{
                              readOnly: true, // Disable direct input
                              onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                            }}
                          />}
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Stack>
                  {touched.date && errors.date && <FormHelperText error={true}>{errors.date}</FormHelperText>}
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                  <Stack spacing={1}>
                    <InputLabel>{intl.formatMessage({ id: 'store' })}</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Autocomplete
                        disablePortal
                        id="store"
                        noOptionsText={noOptionsText}
                        value={values.store || null}
                        // disabled={addEditStatus === 'view' ? true : false}
                        //className={addEditStatus === 'view' ? 'disabled-input' : ''}
                        // disabled={true}
                        className='disabled-input'
                        sx={{ '& div button': { visibility: 'hidden' } }}
                        options={stores?.filter((val) => val.recordStatus === 0) || []}
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
                <Grid item xs={12} sm={4} md={4}>
                  <Stack spacing={1}>
                    <InputLabel>{intl.formatMessage({ id: 'Reason' })}</InputLabel>
                    <FormControl sx={{ width: '100%' }}>
                      <Autocomplete
                        disablePortal
                        id="store"
                        disabled={addEditStatus === 'view' ? true : false}
                        className={addEditStatus === 'view' ? 'disabled-input' : ''}
                        noOptionsText={noOptionsText}
                        // value={values.returnReason || null}
                        value={addEditStatus === 'view' ? materialReturn.returnReasonName : values.returnReason}
                        options={returnReasons?.filter((val) => val.recordStatus === 0) || []}
                        getOptionLabel={(option) => option.name ?? option}
                        onChange={(event, newValue) => {
                          setFieldValue('returnReason', newValue);
                        }}
                        open={autoCompleteReturnReasonOpen}
                        onInputChange={(event, value, reason) => {
                          switch (reason) {
                            case "input":
                              setAutoCompleteReturnReasonOpen(!!value);
                              break;
                            case "reset":
                            case "clear":
                              setAutoCompleteReturnReasonOpen(false);
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
                        placeholder={intl.formatMessage({ id: 'SelectReturnReason' })}
                        renderInput={(params) => <TextField {...params}
                          aria-label={intl.formatMessage({ id: 'SelectReturnReason' })}
                          placeholder={intl.formatMessage({ id: 'Search&SelectReturnReason' })} size='large'
                          error={Boolean(touched.returnReason && errors.returnReason)}
                          helperText={touched.returnReason && errors.returnReason ? errors.returnReason : ''}
                        />}
                      />

                    </FormControl>
                  </Stack>
                </Grid>
                <Grid item xs={12} mb={0}>
                  <Typography variant="h5">{intl.formatMessage({ id: 'MaterialReturnDetails' })}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <FieldArray
                    name="materialReturnNoteDetails"
                    render={() => {
                      return (
                        <>
                          <Grid container spacing={3} sx={{ mb: 2 }}>
                            <Grid item xs={addEditStatus === 'view' ? 0 : 12} sm={addEditStatus === 'view' ? 0 : 6} md={addEditStatus === 'view' ? 0 : 4} sx={{position:'relative'}}>
                                <div className="qr-scanner-container">
                                  <QrReader
                                    ref={qrReaderRef}
                                    facingMode={facingMode}
                                    onError={handleError}
                                    onScan={handleScan}
                                    className="qr-image-wrapper"
                                  />
                                  <IconButton className="camera-switch-button" onClick={handleCameraSwitch}>
                                    <i className='icon-camera ottr-icon' />
                                  </IconButton>
                                </div>
                              {cameraFlag && (<div className="qr-overlay" style={{width:'100%',height:'100%'}}>
                                <img src={scannerImage} alt="scanner" style={{width:'60%'}}/>
                                <Typography variant="h5" sx={{ cursor: 'default', fontSize: '0.9rem' }} color={'#262626'} mt={2}>
                                  {intl.formatMessage({ id: "CameraDeviceNotFoundLabel" })}
                                </Typography>
                              </div>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={addEditStatus === 'view' ? 12 : 6} md={addEditStatus === 'view' ? 12 : 8}>
                              {touched.materialReturnNoteDetails && errors.materialReturnNoteDetails ? (
                                <FormHelperText error={true}>{errors.materialReturnNoteDetails}</FormHelperText>
                              ) : null}
                              <TableContainer className='ottr-table bucket-new-table' sx={{ marginTop: "0px !important" }}>
                                <Table>
                                  <TableHead sx={{ border: '0' }}>
                                    <TableRow sx={{ background: '#fafafb' }} className='bucket-table-header'>
                                      <TableCell align="left" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'SR.NO.' })}</TableCell>
                                      <TableCell sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'ProductName' })}</TableCell>
                                      <TableCell sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'VendorName' })}</TableCell>
                                      <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Quantity' })}</TableCell>
                                      {addEditStatus != 'view' && (
                                        <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'action' })}</TableCell>
                                      )}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {materialReturnNoteDetailsProductIdAndVendorIdWise?.length ? materialReturnNoteDetailsProductIdAndVendorIdWise?.map((item, index) =>
                                      <TableRow key={index} sx={{ height: "45px !important" }}
                                      >
                                        <TableCell align="left">{index + 1}</TableCell>
                                        <TableCell>
                                          <Tooltip title={item.productName} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                                            <Stack spacing={0} >
                                              <Typography variant="subtitle1">{item.productName}</Typography>
                                            </Stack>
                                          </Tooltip></TableCell>
                                        <TableCell>
                                          <Tooltip title={item.vendorName} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                                            <Stack spacing={0} >
                                              <Typography variant="subtitle1">{addEditStatus === 'view' ? materialReturn?.vendorName : item.vendorName}</Typography>
                                            </Stack>
                                          </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
                                        {addEditStatus != 'view' && (
                                          <TableCell align="right" className='action-icons'>
                                            <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
                                              <IconButton
                                                color="error"
                                                disabled={addEditStatus === 'view' ? true : false}
                                                className={addEditStatus === 'view' ? 'disabled-input' : ''}
                                                onClick={() => {
                                                  materialReturnNoteDetailsProductIdAndVendorIdWise.splice(index, 1);
                                                  setFieldValue('materialReturnNoteDetails', materialReturnNoteDetailsProductIdAndVendorIdWise);
                                                }}
                                              >
                                                <i className='icon-trash ottr-icon' style={{ fontSize: "22px" }}></i>
                                              </IconButton>
                                            </Tooltip>
                                          </TableCell>
                                        )}
                                      </TableRow>
                                    ) :
                                      <TableRow>
                                        <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                                          {intl.formatMessage({ id: 'NoRecord' })}
                                        </TableCell>
                                      </TableRow>}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </Grid>
                        </>
                      );
                    }}
                  />
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
                      {addEditStatus === 'edit' ? <FormattedMessage id="save" /> : <FormattedMessage id="create" />}
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </FormikProvider>
    </MainCard>
  );
};

AddMaterialReturn.propTypes = {
  materialReturn: PropTypes.any,
  addEditStatus: PropTypes.string,
  onCancel: PropTypes.func
};

export default AddMaterialReturn;