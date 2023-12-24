// React apis
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ScrollX from 'components/ScrollX';

// Material-ui
import { Dialog, DialogContent, Stack, DialogTitle, Typography, Button, Grid, DialogActions, useMediaQuery } from '@mui/material';
import Image from 'mui-image'

// Project Import
import { PopupTransition } from 'components/@extended/Transitions';
import ExpirationTimer from './ExpirationTimer'

// Assets
import { useIntl } from 'react-intl';

//store
import { checkPaymentStatus, addBucketInvoice, generatePaymentQRCode } from '_api/transactions/new_Bucket'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { setNewBucketFlag } from 'store/reducers/newbucketFlagReducer';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { openSnackbar } from 'store/reducers/snackbar';

// ==============================|| UPI PAYMENT ALERT ||============================== //

export default function UPIPayment({ totalValue, bucketId, invoiceGenerated, qrCodeImgPay, qrCodeIdPay, qrValidTimePay, open, handleClose, modelUPIData }) {

    // Localizations - multilingual
    const intl = useIntl();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [zoomLevel, setZoomLevel] = useState(1);

    //set QR code image state
    const [qrCodeImg, setQRCodeImg] = useState('')

    //set QR code id state
    const [qrCodeId, setQRCodeId] = useState('')

    //set QR code timmer state
    const [qrValidTime, setQRValidTime] = useState('')

    //set QR code regenerate loader flag
    const [QRcodeImgLoaded, setQRcodeImgLoaded] = useState(false);

    const [QRCodeExpFlag, setQRCodeExpFlag] = useState(false);

    const handleWheelZoom = (event) => {
        const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
        setZoomLevel((prevZoom) => Math.min(Math.max(prevZoom * scaleFactor, 0.5), 3));
    };

    const handleImageClick = () => {
        setZoomLevel((prevZoom) => Math.min(prevZoom * 1.1, 3));
    };


    useEffect(() => {
        setQRCodeImg(qrCodeImgPay)
        setQRValidTime(qrValidTimePay)
        setQRCodeId(qrCodeIdPay)
        // setQRcodeImgLoaded(false)
    }, [])

    useEffect(() => {
        const currentTime = new Date().getTime();
        const qrExpTime = new Date(qrValidTime).getTime()
        if (currentTime > qrExpTime) {
            setQRCodeExpFlag(true)
        }
        else {
            setQRCodeExpFlag(false)
        }
    }, [qrCodeId, qrValidTime, QRCodeExpFlag])

    useEffect(() => {
        // Check payment status
        const checkPayment = setInterval(() => {
            const currentTime = new Date().getTime();
            const qrExpTime = new Date(qrValidTime).getTime()
            if (currentTime > qrExpTime) {
                // QR code has expired, handle the expiration logic here
                // For example, update the payment status or show an error message
                // setPaymentStatus('Expired');
                clearInterval(checkPayment); // Stop further checks
                dispatch(
                    openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'QRCodeExpLabel' })}`,
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            } else {
                if (qrCodeId) {
                    const model = {
                        id: qrCodeId
                    }
                    //check paymeent status API call
                    dispatch(checkPaymentStatus({ model })).then((response) => {
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
                            // Set payment status
                            if (response && response.payload && response.payload.data) {
                                if (response.payload.data.paymentStatusValue === 'COMPLETED') {
                                    // const { modelUPIData, ...rest } = jsonData;
                                    const modifiedJsonData = { model: modelUPIData };
                                    const model = modifiedJsonData.model

                                    // Add bucket invoice api call
                                    dispatch(addBucketInvoice({ model }))
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
                                                        message: `${intl.formatMessage({ id: 'InvoiceTostAdd' })}`,
                                                        variant: 'alert',
                                                        alert: {
                                                            color: 'success'
                                                        },
                                                        close: true
                                                    })
                                                );

                                                // Reset updated flag
                                                dispatch(setNewBucketFlag(false))
                                                handleClose()
                                                if (matchDownSM) {
                                                    navigate(`/apps/Transactions/bucket`, {
                                                        state: {
                                                            invoice: 'invoice'
                                                        }
                                                    })
                                                }
                                                else{
                                                    invoiceGenerated()
                                                }
                                            }
                                        })
                                        .catch((error) => {
                                            // Caught error
                                            if (error && error.code === 'ERR_BAD_REQUEST') {
                                                dispatch(
                                                    openSnackbar({
                                                        open: true,
                                                        message: `${intl.formatMessage({ id: 'InvoiceAddErrorMsg' })}`,
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
                        }
                    });
                }
            }
        }, 5000);

        return () => {
            clearInterval(checkPayment);
        };

    }, [qrCodeId, qrValidTime])


    const handleZoomIn = (zoomIn) => {
        zoomIn();
    };

    const handleZoomOut = (zoomOut) => {
        zoomOut();
    };

    const handleResetTransform = (resetTransform) => {
        resetTransform();
    };

    const handleUPIPaymentMethod = () => {
        setQRcodeImgLoaded(true)
        const model = {
            bucketId: bucketId,
            amount: totalValue
        }
        // Generate payment QR code api call
        dispatch(generatePaymentQRCode({ model }))
            .unwrap()
            .then((payload) => {
                // Check for error & success
                if (payload && payload.isError) {
                    // Handle error
                } else {
                    // Handle success
                    setQRCodeImg(payload.data?.imageUrl)
                    setQRValidTime(payload.data?.validTill)
                    setQRCodeId(payload.data?.id)
                    setQRcodeImgLoaded(false)
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: `${intl.formatMessage({ id: 'QRCodeRegeneratedLabel' })}`,
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
                // Caught error
                if (error && error.code === 'ERR_BAD_REQUEST') {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: `${intl.formatMessage({ id: 'InvoiceAddErrorMsg' })}`,
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
    return (
        <Dialog
            open={open}
            keepMounted
            TransitionComponent={PopupTransition}
            maxWidth="xs"
        >
            <DialogTitle className='model-header'>
                <Typography variant="h5" component="div" >
                    {intl.formatMessage({ id: 'ScanToPay' })}
                </Typography>
            </DialogTitle>
            <ScrollX sx={{ maxHeight: 'calc(100vh - 300px)', width: matchDownSM ? 'auto' : '425px' }} >
                <DialogContent>
                    {QRcodeImgLoaded && (
                        <div className='qr-generating'>
                            {intl.formatMessage({ id: 'QRCodeGeneratingLabel' })}
                        </div>
                    )}
                    {!QRcodeImgLoaded && (
                        <Stack alignItems="center">
                            <TransformWrapper
                                defaultScale={zoomLevel}
                                wheel={{ step: 50 }}
                                onWheel={handleWheelZoom}
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <>
                                        <TransformComponent>
                                            <div
                                                role="button"
                                                tabIndex="0"
                                                onClick={handleImageClick}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        handleImageClick();
                                                    }
                                                }}
                                                style={{width:'35%',margin:'auto'}}
                                            >
                                                <Image
                                                    src={qrCodeImg}
                                                    alt="QR Code"
                                                    className='qrCodeImg'
                                                    showLoading={
                                                        <div className='qr-loading'>
                                                            {intl.formatMessage({ id: 'QRCodeGeneratingLabel' })}
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </TransformComponent>
                                        <Stack spacing={1.5} direction='row' alignItems="center" mt={2} className='qrzoom-button'>
                                            <Button sx={{ minWidth: '30px', height: '30px', padding: '0' }} size="small" variant="outlined" color="primary" onClick={() => handleZoomIn(zoomIn)}>
                                                <i className='icon-zoom-in ottr-icon' />
                                            </Button>
                                            <Button sx={{ minWidth: '30px', height: '30px', padding: '0' }} size="small" variant="outlined" color="primary" onClick={() => handleZoomOut(zoomOut)}>
                                                <i className='icon-zoom-out ottr-icon' />
                                            </Button>
                                            <Button sx={{ minWidth: '30px', height: '30px', padding: '0' }} size="small" variant="outlined" color="primary" onClick={() => handleResetTransform(resetTransform)}>
                                                <i className='icon-zoom-close ottr-icon' />
                                            </Button>
                                        </Stack>
                                    </>
                                )}
                            </TransformWrapper>
                        </Stack>)}
                </DialogContent>
            </ScrollX>
            <DialogActions sx={{ p: 2.5 }} className='model-footer'>
                <Grid container justifyContent='space-between' alignItems="center">
                    <Stack spacing={0.4} direction='row' alignItems="center">
                        {qrCodeImg && (<ExpirationTimer expiryTimestamp={qrValidTime} handleUPIPaymentMethod={()=>handleUPIPaymentMethod()}/>)}
                        {/* {QRCodeExpFlag && (
                            <Button size="small" variant="contained" color="primary" onClick={() => handleUPIPaymentMethod()}>
                                {intl.formatMessage({ id: 'Regenerate' })}
                            </Button>
                        )} */}
                    </Stack>
                    <Button className="gray-outline-btn" variant="outlined-gray" onClick={() => handleClose()}>
                        {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}

UPIPayment.propTypes = {
    qrCodeIdPay: PropTypes.string,
    qrCodeImgPay: PropTypes.string,
    open: PropTypes.bool,
    handleClose: PropTypes.func
};