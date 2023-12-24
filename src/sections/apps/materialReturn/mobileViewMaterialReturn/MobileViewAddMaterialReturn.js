// React apis
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import "style.css";

// material-ui
import { Button, FormControl, Autocomplete, Typography, FormHelperText, Grid, InputLabel, Stack, TextField, IconButton, DialogContent, Dialog } from '@mui/material';
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
import ScrollX from 'components/ScrollX';
import Loader from 'components/Loader';
import ScannerLoader from '../../newbucket/ScannerLoader';
// import Avatar from 'components/@extended/Avatar';

import { useDispatch, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// Services
import { addMaterialReturn } from '_api/transactions/material_Return';
import { getQRCodeStatus } from '_api/transactions/material_Inward';
import { getProduct } from '_api/master_Product';
import { getReturnReason } from '_api/master_ReturnReason';

// Assets
import scannerImage from 'assets/images/scanner.png';
// import { CheckCircleFilled } from '@ant-design/icons';
import SuccessLogo from 'assets/images/success.gif';

// Components
import MobileCardComponent from '../../../../components/comman/MobileCard';
import { PopupTransition } from 'components/@extended/Transitions';

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
const getInitialValues = () => {
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

// ==============================|| Material Return ADD ||============================== //

const MobileViewAddMaterialReturn = () => {

    const dispatch = useDispatch();

    const navigate = useNavigate();

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

  // Set open material return success prompt state
  const [openMaterialReturnSuccess, setOpenMaterialReturnSuccess] = useState(false);

  useEffect(() => {
    // Get return reason list api call
    dispatch(getReturnReason())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        }
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'MasterReturnReasonListErrorMsg' })}`,
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

    // Redirect to home
    const handleRedirectHome = () => {
        // Close popup
        setOpenMaterialReturnSuccess(false);
        handleCancel();
    }

    // Start again
    const handleStartAgain = () => {
        // Close popup
        setOpenMaterialReturnSuccess(false);
        // Reset form
        formik.resetForm();
    }

  // Initialize Formik outside of the useEffect
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      try {
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
              } else {
                // Open popup
                setOpenMaterialReturnSuccess(true);
                // // Toaster for success
                // dispatch(
                //   openSnackbar({
                //     open: true,
                //     message: `${intl.formatMessage({ id: 'MaterialReturnTostAdd' })}`,
                //     variant: 'alert',
                //     alert: {
                //       color: 'success'
                //     },
                //     close: true
                //   })
                // );
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
        // Reset submitting flag
        setSubmitting(true);
        // Reset material return form
        resetForm();
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
    // Check if the Enter key is pressed to detect the end of a scan
    if (event.key === 'Enter') {
      // Prevent the default Enter key behavior (e.g., form submission)
      event.preventDefault();

      // Extract the scanned data from the buffer
      const scannedData = scannerInputBuffer.join('');

      // Process the scanned data as needed
      const parsedData = parseScannedData(scannedData);
      if (parsedData !== null) {
        handleScan(parsedData,'GunScan')
      }
      // Clear the buffer for the next scan
      scannerInputBuffer.length = 0;
    } else {
      // Append the key to the buffer
      scannerInputBuffer.push(event.key);
    }
  };

  const handleCancel = () => {
    // Reset form
    formik.resetForm();
    // Cancel method
    navigate(`/newdashboard`, {});
  };

  const handleError = (error) => {
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
        <>
        <Grid container sx={{ p: 2 }}>
        <Grid item xs={12} sm={12} md={12}>
        <FormikProvider value={formik}>
              {!loadingScan && <Loader /> && <ScannerLoader />}
            <Form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={12} mb={0}>
                    <Typography variant="h2" sx={{fontSize: '18px', fontWeight: 600}}>{intl.formatMessage({ id: 'Material-return' })}</Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
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
            </Grid>
              <ScrollX>
              {/* <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}> */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={5} sm={5} md={4}>
                      <Stack spacing={0.5}>
                        <InputLabel sx={{fontWeight: 'bold'}}>{intl.formatMessage({ id: 'date' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <StyledDatePicker
                              inputFormat="dd/MM/yyyy"
                              value={values.date}
                              maxDate={new Date()}
                              disabled={true}
                              className={'disabled-input'}
                              sx={{backgroundColor: '#f0f0f0'}}
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
                    <Grid item xs={7} sm={7} md={4}>
                      <Stack spacing={0.5}>
                        <InputLabel sx={{fontWeight: 'bold'}}>{intl.formatMessage({ id: 'store' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Autocomplete
                            disablePortal
                            id="store"
                            noOptionsText={noOptionsText}
                            value={values.store || null}
                            className='disabled-input'
                            disabled={true}
                            sx={{ '& div button': { visibility: 'hidden' }, backgroundColor: '#f0f0f0' }}
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
                    <Grid item xs={12} sm={12} md={4}>
                      <Stack spacing={0.5}>
                        <InputLabel sx={{fontWeight: 'bold'}}>{intl.formatMessage({ id: 'Reason' })}</InputLabel>
                        <FormControl sx={{ width: '100%' }}>
                          <Autocomplete
                            // disablePortal
                            id="store"
                            noOptionsText={noOptionsText}
                            // value={values.returnReason || null}
                            value={values.returnReason}
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
                    <Grid item xs={12}>
                      <FieldArray
                        name="materialReturnNoteDetails"
                        render={() => {
                          return (
                            <>
                              <Grid container spacing={3} sx={{ mb: 8 }}>
                                <Grid item xs={12} sm={6} md={8}>
                                  {touched.materialReturnNoteDetails && errors.materialReturnNoteDetails ? (
                                    <FormHelperText error={true}>{errors.materialReturnNoteDetails}</FormHelperText>
                                  ) : null}
                                  <MobileCardComponent list={materialReturnNoteDetailsProductIdAndVendorIdWise} setFieldValue={setFieldValue} fieldName='materialReturnNoteDetails' />
                                </Grid>
                              </Grid>
                            </>
                          );
                        }}
                      />
                    </Grid>
                  </Grid>
              </ScrollX>
              {/* <Divider /> */}
            </Form>
          </FormikProvider>
          </Grid>
        </Grid>
        {openMaterialReturnSuccess && 
          <Dialog
            open={openMaterialReturnSuccess}
            // onClose={() => handleClose(false)}
            keepMounted
            TransitionComponent={PopupTransition}
            maxWidth="xs"
            aria-labelledby="column-success-title"
            aria-describedby="column-success-description"
            // sx={{ 
            //     '& .MuiDialog-container': {
            //         width: '100%',
            //     }
            // }}
            >
          <DialogContent sx={{ mt: 2, my: 1 }}>
            <Stack alignItems="center">
                <Stack mb={1}>
                    <Typography variant="h2" sx={{fontSize: '16px', fontWeight: 600}} align="center">
                        {intl.formatMessage({ id: 'Material-return' })}
                    </Typography>
              </Stack>
              <img src={SuccessLogo} alt="" style={{ width: 72, height: 72, fontSize: '1.75rem'  }} />
              {/* <Avatar color="success" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
                <CheckCircleFilled />
              </Avatar> */}
              <Stack mt={1} mb={2}>
                <Typography align="center">
                    {intl.formatMessage({ id: 'MaterialReturnAlert' })}
                </Typography>
              </Stack>
    
              <Stack direction="column" spacing={1.5} sx={{ width: 1 }}>
                <Button fullWidth variant="contained" onClick={() => handleStartAgain()} autoFocus>
                    {intl.formatMessage({ id: 'StartAgain' })}
                </Button>
                <Button className="gray-outline-btn" fullWidth onClick={() => handleRedirectHome()} variant="text">
                    {intl.formatMessage({ id: 'BackToHome' })}
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>}
        <Grid display={"flex"} className='bucket-sticky-button' sx={{position:'fixed', bottom:'0'}}>
            <Stack sx={{justifyContent:'space-between', alignItems:'center'}}>
                <Button className="gray-outline-btn cta2" sx={{marginRight: '8px'}} variant="outlined-gray" onClick={handleCancel} fullWidth>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button
                type="submit"
                variant="contained"
                sx={{ marginLeft: '8px' }}
                className="cta2"
                disabled={materialReturnNoteDetailsProductIdAndVendorIdWise.length == 0 || isSubmitting}
                onClick={handleSubmit}
                fullWidth
                >
                    <FormattedMessage id="save" />
                </Button>

            </Stack>
        </Grid>
        </>
    );
}
  
export default MobileViewAddMaterialReturn;