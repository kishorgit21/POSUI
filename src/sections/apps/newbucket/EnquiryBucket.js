// React apis
import React, { useState, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';

// material-ui
import { Stack, Grid, Button, Typography, IconButton, useMediaQuery } from '@mui/material';

import Loader from 'components/Loader';
import ScannerLoader from './ScannerLoader';

//store
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';

// project import
import QrReader from "react-qr-reader";
import moment from 'moment';
import expImg from 'assets/images/expired.png';

// Services
import { getProduct } from '_api/master_Product';
import { getQRCodeStatus } from '_api/transactions/material_Inward';
import { setEnquiryBucketFlag } from 'store/reducers/newbucketFlagReducer';

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

const EnquiryBucket = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [scannedProductData, setScannedProductData] = useState('')
  const [loadingScan, setLoadingScan] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  //set camera device found or not flag
  const [cameraFlag, setCameraFlag] = useState(false);

  const qrReaderRef = useRef(null);
  const dispatch = useDispatch();

  // Initialize a buffer to store the scanned data
  const scannerInputBuffer = [];

  // Get product list
  const { products } = useSelector((state) => state.productSlice);

  const handleCameraSwitch = () => {
    setFacingMode((prevMode) => (prevMode === 'environment' ? 'user' : 'environment'));
  };

  const intl = useIntl();

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

  //handle USB scan handler
  useEffect(() => {
    document.addEventListener('keydown', handleScannerInput);
    return () => {
      document.removeEventListener('keydown', handleScannerInput);
    };
  }, [products]); // Include products in the dependency array

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
    setLoadingScan(false)
    // Check if the Enter key is pressed to detect the end of a scan
    if (event.key === 'Enter') {
      // Prevent the default Enter key behavior (e.g., form submission)
      event.preventDefault();

      // Extract the scanned data from the buffer
      const scannedData = scannerInputBuffer.join('');

      // Process the scanned data as needed
      const parsedData = parseScannedData(scannedData);
      if (parsedData !== null && parsedData !== '') {
        handleScan(parsedData)
      }
      // Clear the buffer for the next scan
      scannerInputBuffer.length = 0;
      setLoadingScan(false)
    } else {
      // Append the key to the buffer
      scannerInputBuffer.push(event.key);
      setLoadingScan(false)
    }
  };

  const handleScan = async (scanData) => {
      // setTimeout(() => {
      setLoadingScan(true);
      //   }, 3000)
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
    }
    else if (scanData && scanData !== "") {
      const finalScanData = JSON.parse(scanData);
      const findProductObj = products.filter((val) => val.id == finalScanData.productId);
      const productExists = products.some(product => product.id === finalScanData.productId);
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
      }
      else {
        const model = {
          qrcode: finalScanData.barcode
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
              var enquiryBucketProduct = {
                id: finalScanData.productId,
                name: findProductObj[0].name,
                vendorName: payload.data.vendorName,
                rate: findProductObj[0].cost,
                expiryDate: payload.data.expiryDate,
                days: payload.data.days,
                quantity: 1
              }
              setScannedProductData(enquiryBucketProduct)
              setLoadingScan(false)
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

  const currentDate = new Date();
  const expiryDate = new Date(scannedProductData.expiryDate);
  return (
    <Grid container className="ottr-table bucket-new-table">
      <Grid item xs={12} className="bucket-header" mx={matchDownSM ? 2 : 0} mt={matchDownSM ? 1 : 0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={matchDownSM ? 'auto' : 1}>
          <Typography variant="h5" component="div" sx={{fontSize:'18px'}} className='blue-header'>
            {intl.formatMessage({ id: "Enquiry" })}
          </Typography>
        </Stack>
      </Grid>
      <Grid container>
        <Grid item xs={12} sm={6} px={2} pt={matchDownSM?1:2} pb={matchDownSM ? 0 : 2}
         sx={{ position: 'relative' }}>
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
          {cameraFlag && (<div className="qr-overlay">
            <img src={scannerImage} alt="scanner" />
            <Typography variant="h5" sx={{ cursor: 'default', fontSize: '0.9rem' }} color={'#262626'} mt={2}>
              {intl.formatMessage({ id: "CameraDeviceNotFoundLabel" })}
            </Typography>
          </div>
          )}
        </Grid>

        {!cameraFlag && !loadingScan && <Loader /> && <ScannerLoader />}
        {scannedProductData === "" ? (
          <Grid item xs={12} sm={6} textAlign='center' sx={{ m: 'auto' }} py={3} px={matchDownSM?2:0}>
            <Typography variant="body1" sx={{ cursor: 'default' }}>
              {intl.formatMessage({ id: "EnquiryProductNoDataLabel" })}
            </Typography>
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} p={2} pt={matchDownSM && scannedProductData?.days == 0 ? '' : currentDate.setUTCHours(0, 0, 0, 0) > expiryDate.setUTCHours(0, 0, 0, 0) ? 2.8 : 2 }>
            <Grid className="bucket-card" p={2} sx={{ border: "1px solid #e6ebf1", borderRadius: '5px', position: 'relative' }}>
              {matchDownSM && scannedProductData?.days == 0 ? '' : currentDate.setUTCHours(0, 0, 0, 0) > expiryDate.setUTCHours(0, 0, 0, 0) &&
                <Button mt={4} mb={2} sx={{ bgcolor: '#FD0202', border: '1px solid #FD0202', borderRadius: '3px', color: '#fff', fontSize: '12px', fontWeight: '500', padding: '0px', position: 'absolute', top: '-11px', left: '14px' }}>
                  Expired
                </Button>
              }
              {matchDownSM ? <div className='qr-scanner-container'>
                <Typography sx={{ fontWeight: '500', color: '#2B3467',fontSize:'18px !important' }} p={0.5}>{scannedProductData?.name}</Typography>
                <Stack direction='row' justifyContent="space-between" p={0.5}>
                  <Typography sx={{fontWeight: '400'}}>
                    {intl.formatMessage({ id: "VendorName" })}
                  </Typography>
                  <Typography sx={{ fontWeight: '500', color: '#2B3467',fontSize:'13px'  }}>{scannedProductData?.vendorName}</Typography>
                </Stack>
                <Stack direction='row' justifyContent="space-between" p={0.5}>
                  <Typography sx={{fontWeight: '400'}}>
                    {intl.formatMessage({ id: "GoodQuality" })}
                  </Typography>
                  <Typography sx={{ fontWeight: '500', color: '#2B3467',fontSize:'13px'  }}>
                    {scannedProductData?.days == 0 ? '' : moment(scannedProductData?.expiryDate).format("MMM D, YYYY")}
                  </Typography>
                </Stack>
                <Stack direction='row' justifyContent="space-between" p={0.5}>
                  <Typography sx={{fontWeight: '400'}}>
                    {intl.formatMessage({ id: "Cost" })}
                  </Typography>
                  <Typography sx={{ fontWeight: '500', color: '#2B3467' }}>
                    {intl.formatMessage({ id: "Rs." })} {Number(scannedProductData?.rate)?.toFixed(2)}
                  </Typography>
                </Stack>
              </div> :
                <div className='qr-scanner-container'>
                  <Stack justifyContent="space-evenly" p={1}>
                    <Typography className="bucket-card-label">
                      {intl.formatMessage({ id: "VendorName" })}
                    </Typography>
                    <Typography sx={{ fontWeight: '500', color: '#2B3467' }}>{scannedProductData?.vendorName}</Typography>
                  </Stack>
                  <Stack justifyContent="space-evenly" p={1}>
                    <Typography className="bucket-card-label">
                      {intl.formatMessage({ id: "Name" })}
                    </Typography>
                    <Typography sx={{ fontWeight: '500', color: '#2B3467' }}>{scannedProductData?.name}</Typography>
                  </Stack>
                  <Stack justifyContent="space-evenly" p={1}>
                    <Typography className="bucket-card-label">
                      {intl.formatMessage({ id: "GoodQuality" })}
                    </Typography>
                    <Typography sx={{ fontWeight: '500', color: '#2B3467' }}>
                      {scannedProductData?.days == 0 ? '' : moment(scannedProductData?.expiryDate).format("MMM D, YYYY")}
                    </Typography>
                  </Stack>
                  <Stack justifyContent="space-evenly" p={1}>
                    <Typography className="bucket-card-label">
                      {intl.formatMessage({ id: "Cost" })}
                    </Typography>
                    <Typography sx={{ fontWeight: '500', color: '#2B3467' }}>
                      {intl.formatMessage({ id: "Rs." })} {Number(scannedProductData?.rate)?.toFixed(2)}
                    </Typography>
                  </Stack>
                  {scannedProductData?.days == 0 ? '' : currentDate.setUTCHours(0, 0, 0, 0) > expiryDate.setUTCHours(0, 0, 0, 0) && (
                    <img src={expImg} alt="Google" className='exp-img' />
                  )}
                </div>
              }
            </Grid>
          </Grid>
        )}
      </Grid>
      {!matchDownSM && (<Grid item className="model-footer" container direction="row" justifyContent="end" alignItems="flex-start" xs={12} sm={12} p={2}>
        <Stack direction="row" justifyContent="flex-end" alignItems="flex-end">
          <Button className="gray-outline-btn" variant="text" color="secondary" onClick={() => dispatch(setEnquiryBucketFlag(false))}>
            {intl.formatMessage({ id: "cancel" })}
          </Button>
        </Stack>
      </Grid>)}
    </Grid>
  );
};

export default EnquiryBucket;