// React apis
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';

// material-ui
import { Stack, Grid, Button, Typography, IconButton, Tooltip, Dialog, TextField, useMediaQuery } from '@mui/material';

// Components
import Loader from 'components/Loader';
import PaymentMethod from './PaymentMethod';
import ScannerLoader from './ScannerLoader';
import { PopupTransition } from 'components/@extended/Transitions';
import DeleteAlert from 'components/comman/DeleteAlert';
import ScrollX from 'components/ScrollX';

// API
import { addActiveBuckets, deleteBucket, deleteItemBucket, getByIdBucket, updateMobileNumber } from '_api/transactions/new_Bucket';
import { getQRCodeStatus } from '_api/transactions/material_Inward';
import { getProduct } from '_api/master_Product';

// project import
import QrReader from "react-qr-reader";
import moment from 'moment';

//store
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import { setNewBucketFlag } from 'store/reducers/newbucketFlagReducer';

//assets
import scannerImage from 'assets/images/scanner.png';
import { useNavigate, useLocation } from 'react-router';

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

const AddNewBucket = ({ bucketData, title, noRecordLabel, setUpdated }) => {

    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const matchDownMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

    //product list data state
    const [scannedProductData, setScannedProductData] = useState([]);

    //mobile number state
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobileNumberVal, setMobileNumberVal] = useState(false);

    // Set payment method state
    const [paymentMethod, setPaymentMethod] = useState(false);

    const [loadingScan, setLoadingScan] = useState(false);

    const intl = useIntl();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    //bucket id and number state
    const [bucketId, setBucketID] = useState('')
    const [bucketNo, setBucketNo] = useState('')
    const [getByIdBucketFlag, setGetByIdBucketFlag] = useState(false);

    // Get product list
    const { products } = useSelector((state) => state.productSlice);

    const bucketNoName = intl.formatMessage({ id: 'bucket' }) + ' - #' + bucketNo;

    const [facingMode, setFacingMode] = useState('environment');
    const qrReaderRef = useRef(null);

    //set camera device found or not flag
    const [cameraFlag, setCameraFlag] = useState(false);

    // Set open bucket delete prompt state
    const [openBucketDelete, setOpenBucketDelete] = useState(false);

    // Initialize a buffer to store the scanned data
    const scannerInputBuffer = [];

    // Set open bucket item delete prompt state
    const [openBucketItemDelete, setOpenBucketItemDelete] = useState(false);
    const [bucketItem, setBucketItem] = useState('')

    const handleCameraSwitch = () => {
        setFacingMode((prevMode) => (prevMode === 'environment' ? 'user' : 'environment'));
    };

    //handle USB scan handler
    useEffect(() => {
        document.addEventListener('keydown', handleScannerInput);
        return () => {
            document.removeEventListener('keydown', handleScannerInput);
        };
    }, [products, bucketId, scannedProductData, getByIdBucketFlag]); // Include products in the dependency array

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
            if (parsedData !== null && parsedData !== '') {
                handleScan(parsedData)
            }
            // Clear the buffer for the next scan
            scannerInputBuffer.length = 0;
        } else {
            // Append the key to the buffer
            scannerInputBuffer.push(event.key);
        }
    };

    useEffect(() => {
        if (location.state?.bucketId) {
            setGetByIdBucketFlag(true)
        }
    }, [])

    useEffect(() => {
        if (getByIdBucketFlag) {
            const model = {
                id: bucketId || location.state?.bucketId
            };

            // Get by id product api call
            dispatch(getByIdBucket({ model }))
                .unwrap()
                .then((payload) => {
                    // Check for error & success
                    if (payload && payload.isError) {
                        // Handle error
                    } else {
                        // Set bucket data
                        setScannedProductData(payload.data.detailsDtos)
                        setGetByIdBucketFlag(false)
                    }
                })
                .catch((error) => {
                    if (error && error.code === 'ERR_BAD_REQUEST') {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: `${intl.formatMessage({ id: 'BucketGetByIdErrorMsg' })}`,
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
    }, [bucketId, scannedProductData, getByIdBucketFlag])

    useEffect(() => {
        if (bucketData) {
            setScannedProductData(bucketData?.detailsDtos)
            updateBucketId(bucketData?.id)
            setBucketNo(bucketData?.bucketNumber)
            setMobileNumber(bucketData?.mobileNumber)
        }
    }, [bucketData])

    // Define a memoized function to update bucketId
    const updateBucketId = useCallback((newBucketId) => {
        setBucketID(newBucketId);
    }, [bucketData]);

    const handleScan = async (scanData) => {
        // setTimeout(() => {
        setLoadingScan(true);
        //    }, 5000)

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
            const updateSetting = JSON.parse(scanData);

            const findProductObj = products.filter((val) => val.id == updateSetting.productId)

            var newProduct = {
                productId: updateSetting.productId,
                barCode: updateSetting.barcode,
                productName: findProductObj[0]?.name,
                // vendorName: updateSetting.vendorName,
                rate: findProductObj[0]?.cost,
                // expiryDate: updateSetting.expiryDate,
                quantity: 1
            }


            const model = {
                qrcode: newProduct.barCode
            }
            const productExists = products.some(product => product.id === newProduct.productId);

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
                                newProduct.days = payload.data.days

                                if (payload.data.days === 0) {

                                    // Add/ edit active bucket model
                                    const model = {
                                        bucketDetail: {
                                            productId: newProduct?.productId,
                                            quantity: 1,
                                            rate: newProduct?.rate,
                                            expiryDate: payload.data?.expiryDate
                                        },
                                        barcodesPost: {
                                            quantity: 1,
                                            barcodeNumber: newProduct?.barCode
                                        }
                                    }

                                    // Conditionally set bucketId in the model if it's available
                                    if (bucketId) {
                                        model.id = bucketId;
                                    }
                                    // Add/Update active bucket api call
                                    dispatch(addActiveBuckets({ model }))
                                        .unwrap()
                                        .then((payload) => {
                                            setGetByIdBucketFlag(true)

                                            if (payload && payload.isError) {
                                                // Handle error

                                            } else {
                                                //set Bucket id state 
                                                updateBucketId(payload.data.id)
                                                if (matchDownSM) {
                                                    // setUpdated(true)
                                                    window.localStorage.setItem('isBucketCreated', true);
                                                }
                                                //set Bucket number state
                                                setBucketNo(payload.data.bucketNumber)
                                                setLoadingScan(false);
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
                                            //   setUpdated(false);
                                        })
                                }
                                else {
                                    const currentDate = new Date();
                                    const expiryDate = new Date(payload.data.expiryDate);
                                    // Remove the time portion to compare only the dates
                                    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                                    const expDay = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());

                                    if (expDay < currentDay) {
                                        // Toaster for expiry product
                                        dispatch(
                                            openSnackbar({
                                                open: true,
                                                message: `${intl.formatMessage({ id: 'ExpProductLebal' })}`,
                                                variant: 'alert',
                                                alert: {
                                                    color: 'error'
                                                },
                                                close: true
                                            }))

                                    }
                                    else {
                                        // Add/ edit active bucket model
                                        const model = {
                                            bucketDetail: {
                                                productId: newProduct?.productId,
                                                quantity: 1,
                                                rate: newProduct?.rate,
                                                expiryDate: payload?.data?.expiryDate
                                            },
                                            barcodesPost: {
                                                quantity: 1,
                                                barcodeNumber: newProduct?.barCode
                                            }
                                        }

                                        // Conditionally set bucketId in the model if it's available
                                        if (bucketId) {
                                            model.id = bucketId;
                                        }
                                        // Add/Update active bucket api call
                                        dispatch(addActiveBuckets({ model }))
                                            .unwrap()
                                            .then((payload) => {
                                                setGetByIdBucketFlag(true)

                                                if (payload && payload.isError) {
                                                    // Handle error

                                                } else {
                                                    //set Bucket id state 
                                                    updateBucketId(payload.data.id)
                                                    if (matchDownSM) {
                                                        // setUpdated(true)
                                                        window.localStorage.setItem('isBucketCreated', true);
                                                    }
                                                    //set Bucket number state
                                                    setBucketNo(payload.data.bucketNumber)
                                                    setLoadingScan(false);
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
                                                //   setUpdated(false);
                                            })
                                    }
                                }
                            }

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

    const handleError = (error) => {
        console.log(error instanceof DOMException)
        console.log('message', error?.message)
        console.log('code', error?.code)
        console.log('name', error?.name)
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

    // Delete Bucket
    const handleDeleteBucket = (status) => {
        if (status == false) {
            setOpenBucketDelete(false)
        }
        else {
            // Set delete model
            const model = {
                id: bucketId
            };

            // Delete product api call
            dispatch(deleteBucket({ model }))
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
                                message: `${intl.formatMessage({ id: 'BucketTostDelete' })}`,
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );

                        // Reset updated flag
                        setUpdated(true);
                        dispatch(setNewBucketFlag(false))
                        setOpenBucketDelete(false)
                    }
                })
                .catch((error) => {
                    if (error && error.code === 'ERR_BAD_REQUEST') {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: `${intl.formatMessage({ id: 'BucketDeleteErrorMsg' })}`,
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

    }

    //Delete Bucket Item/Product
    const handleDeleteBucketItem = (status) => {
        if (status == false) {
            setOpenBucketItemDelete(false)
        }
        else {
            // Set delete model
            const model = {
                id: bucketItem.val.id,
                barcodeNumbers: bucketItem.val.barcodeNumbers
            };

            // Delete product api call
            dispatch(deleteItemBucket({ model }))
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
                                message: `${intl.formatMessage({ id: 'BucketItemTostDelete' })}`,
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );

                        const updatedList = [...scannedProductData];
                        updatedList.splice(bucketItem.ind, 1);
                        setScannedProductData(updatedList)
                        setOpenBucketItemDelete(false)
                    }
                })
                .catch((error) => {
                    if (error && error.code === 'ERR_BAD_REQUEST') {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: `${intl.formatMessage({ id: 'BucketDeleteErrorMsg' })}`,
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

    }

    // Calculate the total rate using reduce
    const totalValue = scannedProductData.reduce((accumulator, currentItem) => {
        return accumulator + (currentItem.rate * currentItem.quantity);
    }, 0);

    // Calculate the total rate using reduce
    const totalQuantity = scannedProductData.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.quantity
    }, 0);

    const handleMobileOnChange = (mobileNumber) => {
        if (mobileNumber.length == 10) {
            const model = {
                id: bucketId,
                mobileNumber: mobileNumber
            }
            //check paymeent status API call
            dispatch(updateMobileNumber({ model })).then((response) => {
                if (response.payload && response.payload.isError) {
                    // dispatch(
                    //     openSnackbar({
                    //         open: true,
                    //         message: `${intl.formatMessage({ id: 'MasterCustomerListErrorMsg' })}`,
                    //         variant: 'alert',
                    //         alert: {
                    //             color: 'error'
                    //         },
                    //         close: true
                    //     })
                    // );
                } else {
                    //sucess
                    setMobileNumberVal(false)
                }
            });
        }
    }
    const handleTextAndBtn = (<>
        <TextField
            id="customer-mobile-no"
            fullWidth={matchDownSM ? true : false}
            className={scannedProductData.length == 0 ? "disabled-btn" : ""}
            disabled={scannedProductData.length == 0 ? true : false}
            placeholder={intl.formatMessage({ id: 'MobilePlaceholder' })}
            onChange={($event) => {
                if ($event.target.value == '') {
                    setMobileNumberVal(false)
                }
                const newMobileNumber = $event.target.value;
                // Remove any non-digit characters (e.g., spaces, hyphens, etc.)
                const cleanedMobileNumber = newMobileNumber.replace(/\D/g, '');

                // Truncate to 10 digits if the input exceeds 10 characters
                const truncatedMobileNumber = cleanedMobileNumber.slice(0, 10);
                setMobileNumber(truncatedMobileNumber);
                handleMobileOnChange(truncatedMobileNumber)
            }}
            value={mobileNumber || ''}
            error={mobileNumberVal ? true : false}
            pt={mobileNumberVal ? 2 : 0}
            helperText={mobileNumberVal ? intl.formatMessage({ id: 'MasterVendorMobileCharLimit' }) : null}
            sx={{ '& .MuiOutlinedInput-input': { py: 1.1, backgroundColor: 'white' } }}
        />
        {!matchDownSM && <Button color="primary" variant="contained" type="submit" sx={{ cursor: 'auto' }}>
            {totalQuantity}
        </Button>}
    </>)

    return (
        <>
            <Grid container className='ottr-table mobile-bucket' px={matchDownSM ? 2 : 0} sx={{ height: matchDownSM ? 'calc(100vh - 70px)' : 'auto', display: matchDownSM ? 'block' : 'flex', overflow: 'auto' }}>
                <Grid item xs={12} className='bucket-header'>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={1}>
                        {bucketNo ? <Stack direction="row" alignItems="center" py={1} pr={1}>
                            <Typography variant="h2" component="div" sx={{ fontSize: '18px', fontWeight: 600 }}>
                                {intl.formatMessage({ id: 'bucket' })} -
                            </Typography>
                            <Typography variant="h2" component="div" ml={0.5} sx={{ fontSize: '18px', fontWeight: 400 }}>
                                #{bucketNo}
                            </Typography>
                        </Stack> 
                        : <Typography variant="h5" component="div" className='blue-header'>
                            {title}
                        </Typography>}
                        {bucketData && (
                            <Stack direction="row" justifyContent='flex-end' alignItems="center" onClick={() => setOpenBucketDelete(true)} sx={{ cursor: 'pointer' }}>
                                <i className='icon-trash bucket-icon'></i>
                                <Typography sx={{ fontSize: '14px', fontWeight: '400', paddingLeft: '5px' }}>
                                    {`${intl.formatMessage({ id: 'bucket' })} ${intl.formatMessage({ id: 'Delete' })}`}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Grid>
                <Grid item xs={12} sm={5} p={matchDownSM ? 0 : 2} sx={{ position: 'relative' }}>
                    <div className="qr-scanner-container">
                        <QrReader
                            ref={qrReaderRef}
                            facingMode={facingMode}
                            onError={handleError}
                            onScan={handleScan}
                            delay={800}
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
                <Grid item xs={12} sm={7} p={matchDownSM ? 0 : 2} mt={matchDownSM ? 1.5 : 0}>
                    <ScrollX sx={{ maxHeight: matchDownSM ? 'auto' : 'calc(100vh - 386px)' }} mb={matchDownSM ? '100px' : '0'}>
                        <div className='bucket-item-view-parent'>
                            {!cameraFlag && !loadingScan && <Loader /> && <ScannerLoader />}
                            {scannedProductData.length ? (scannedProductData?.map((val, index) => (
                                <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" className='bucket-card new-bucket-item-view' p={2} mb={2}>
                                    <Grid item xs={7} sm={8}>
                                        <Stack direction={matchDownMD ? 'column' : 'row'} justifyContent="space-between">
                                            <Tooltip title={val?.productName} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>
                                                <Typography className='bucket-card-title bucket-fs13'>{val?.productName}</Typography>
                                            </Tooltip>
                                            <Stack direction={'row'} alignItems={'center'}>
                                                <Typography className='bucket-card-label'>
                                                    <i className='icon-calendar mobile-card-icon' />
                                                </Typography>
                                                <Typography className='bucket-card-label'>
                                                    {val.days == 0 ? `${intl.formatMessage({ id: 'NoExpiryDate' })}` : `${intl.formatMessage({ id: 'Expireson' })} ${moment(val?.expiryDate).format('MMM D, YY')}`}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={1} sm={1.5}>
                                        <Stack direction="column" alignItems='flex-end'>
                                            <Button className='bucket-qty-btn'>
                                                {val.quantity}
                                            </Button>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={4} sm={2.5}>
                                        <Stack direction="row" justifyContent='end' alignItems='flex-end'>
                                            <Typography className='bucket-card-title bucket-fs13' textAlign={'end'}>
                                                {intl.formatMessage({ id: 'Rs.' })} {Number(val?.rate)?.toFixed(2)}
                                            </Typography>
                                            <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
                                                <IconButton
                                                    color="error"
                                                    className='bucket-item-delete'
                                                    onClick={() => {
                                                        if (scannedProductData.length == 1) {
                                                            dispatch(
                                                                openSnackbar({
                                                                    open: true,
                                                                    message: `${intl.formatMessage({ id: 'BucketProductListRequired' })}`,
                                                                    variant: 'alert',
                                                                    alert: {
                                                                        color: 'error'
                                                                    },
                                                                    close: true
                                                                })
                                                            );
                                                        }
                                                        else {
                                                            setOpenBucketItemDelete(true)
                                                            const obj = {
                                                                val: val,
                                                                ind: index
                                                            }
                                                            setBucketItem(obj)
                                                        }
                                                    }
                                                    }
                                                >
                                                    <i className='icon-trash bucket-trash-icon' />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                </Stack>

                            ))) :
                                <Grid p={4} textAlign='center' px={matchDownSM ? 2 : 0}>
                                    <Typography variant="body1" sx={{ cursor: 'default' }}>{noRecordLabel}</Typography>
                                </Grid>
                            }
                        </div>
                        {matchDownMD && <Stack pt={1}>{handleTextAndBtn}</Stack>}
                    </ScrollX>
                </Grid>
                {matchDownSM ?
                    null :
                    <Grid display={matchDownSM ? "none" : "block"} item xs={12} sm={12} className='model-footer' container direction="row" justifyContent="end" alignItems="flex-start" p={2} sx={{ width: matchDownSM ? '100%' : 'auto' }}>
                        <Stack direction={matchDownSM ? "column" : "row"} justifyContent="flex-end" alignItems="flex-start" spacing={1.5} sx={{ height: '100%', width: matchDownSM ? '100%' : 'auto' }}>
                            <Button
                                className="gray-outline-btn"
                                variant="text"
                                color="secondary"
                                onClick={() => {
                                    // Reset updated flag
                                    setUpdated(true);
                                    dispatch(setNewBucketFlag(false))
                                }}
                                sx={{ padding: '5px 16px !important', color: 'secondary.dark', width: matchDownSM ? '100%' : 'auto', order: matchDownSM ? 3 : 0, marginTop: matchDownSM ? "15px" : "0px" }}
                            >
                                {intl.formatMessage({ id: 'close' })}
                            </Button>
                            <Stack direction='row' justifyContent='space-between' spacing={1.5} sx={{ height: '100%', width: matchDownSM ? '100%' : 'auto' }}>
                                {handleTextAndBtn}
                            </Stack>
                            <Button
                                className={scannedProductData.length == 0 ? "disabled-btn" : ""}
                                disabled={scannedProductData.length == 0 ? true : false}
                                sx={{ width: matchDownSM ? '100%' : 'auto', py: 0.9 }}
                                color="primary" variant="contained"
                                onClick={() => (mobileNumber.length < 10 && mobileNumber) ? setMobileNumberVal(true) : (setPaymentMethod(true), setMobileNumberVal(false))}
                            >
                                {intl.formatMessage({ id: 'Pay Rs.' })} {Number(totalValue)?.toFixed(2)}
                            </Button>
                        </Stack>
                    </Grid>}

                {paymentMethod && (
                    <Dialog
                        className='ottr-model'
                        maxWidth="sm"
                        TransitionComponent={PopupTransition}
                        keepMounted
                        fullWidth
                        onClose={() => setPaymentMethod(true)}
                        open={paymentMethod}
                        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <PaymentMethod
                            onCancel={() => setPaymentMethod(false)}
                            handleDeleteBucket={() => handleDeleteBucket()}
                            bucketId={bucketId}
                            bucketNoName={bucketNoName}
                            totalQuantity={totalQuantity}
                            scannedProductData={scannedProductData}
                            totalValue={totalValue}
                            customerMobileNo={mobileNumber}
                            invoiceGenerated={() => {
                                setUpdated(true);
                                setPaymentMethod(false);
                            }}
                        />
                    </Dialog>
                )}
                {openBucketDelete && <DeleteAlert
                    name={bucketNoName}
                    open={openBucketDelete}
                    handleClose={handleDeleteBucket} />}

                {openBucketItemDelete && <DeleteAlert
                    name={bucketItem?.val?.productName}
                    open={openBucketItemDelete}
                    handleClose={handleDeleteBucketItem}
                />}

            </Grid>
            {matchDownSM &&
            <Grid className='bucket-sticky-button' sx={{ position: 'fixed', bottom: '0' }}>
                <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Total {totalQuantity} Items</span>
                    <Button color="primary" variant="contained"
                        className={scannedProductData.length == 0 ? "disabled-btn" : ""}
                        disabled={scannedProductData.length == 0 ? true : false}
                        sx={{ width: '175px', borderRadius: '5px' }}
                        onClick={() => (mobileNumber.length < 10 && mobileNumber) ? setMobileNumberVal(true) : (
                            // setPaymentMethod(true), 
                            setMobileNumberVal(false),
                            // Redirect to mobile view invoice details page
                            navigate(`/apps/Transactions/bucket/payment`, {
                                state: {
                                    bucketId: bucketId,
                                    bucketNoName: bucketNo,
                                    totalQuantity: totalQuantity,
                                    scannedProductData: scannedProductData,
                                    totalValue: totalValue || '',
                                    customerMobileNo: mobileNumber || '',
                                }
                            })
                        )}
                    >
                        {intl.formatMessage({ id: 'Pay Rs.' })} {Number(totalValue)?.toFixed(2)}
                    </Button>
                </Stack>
            </Grid>
            }
        </>
    );
};

export default AddNewBucket;