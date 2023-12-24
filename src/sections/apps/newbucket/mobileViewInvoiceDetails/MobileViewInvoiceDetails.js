// React apis
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router';

// Material-ui
import { Typography, Grid, Stack, useMediaQuery, Box, Dialog } from '@mui/material';

// Project Import
import ScrollX from 'components/ScrollX';
import PrintInvoice from 'sections/apps/ottrInvoice/PrintInvoice';
import { PopupTransition } from 'components/@extended/Transitions';

// Assets
import { useIntl } from 'react-intl';
import moment from 'moment';

//store
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';

// API
import { getByIdInvoice } from '_api/ottrInvoice';

// ==============================|| INVOICE DETAILS ||============================== //

const MobileViewInvoiceDetails = () => {

    // Localizations - multilingual
    const intl = useIntl();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    // Set selected invoice state
    const [invoice, setInvoice] = useState();

    const location = useLocation();
    const invoiceId = location.state.invoiceId;
    let currentPath = location.pathname;

    // //mobile number state
    // const [mobileNumber, setMobileNumber] = useState(invoice?.mobileNumber || '');
    // const [mobileNumberVal, setMobileNumberVal] = useState(false);

    // Set print invoice state
    const [printInvoice, setPrintInvoice] = useState(false);

    // Calculate the total rate using reduce
    const totalValue = invoice?.details?.reduce((accumulator, currentItem) => {
        return accumulator + (currentItem.rate * currentItem.quantity);
    }, 0);

    // Calculate the total rate using reduce
    const totalQuantity = invoice?.details?.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.quantity
    }, 0);


    useEffect(() => {
        // Set get invoice by id model
        const model = {
            id: invoiceId
        };

        // Get by id invoice api call
        dispatch(getByIdInvoice({ model }))
            .unwrap()
            .then((payload) => {
                // Check for error & success
                if (payload && payload.isError) {
                    // Handle error
                } else {
                    // Set invoice
                    setInvoice(payload.data);
                    // // Set mobile number
                    // setMobileNumber(payload.data?.mobileNumber || '');
                }
            })
            .catch((error) => {
                if (error && error.code === 'ERR_BAD_REQUEST') {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: `${intl.formatMessage({ id: 'InvoiceGetByIdErrorMsg' })}`,
                            variant: 'alert',
                            alert: {
                                color: 'error'
                            },
                            close: true
                        })
                    );
                }
            });
    }, [invoiceId]);

    useEffect(() => {
        const handleBackButton = () => {
            if (currentPath.includes('/apps/Transactions/invoice-details')) {
                navigate(`/apps/Transactions/bucket`, {
                    state: {
                        invoice: 'invoice'
                    }
                })
            }
            // Clean up the event listener when the component unmounts
            window.removeEventListener('popstate', handleBackButton);
        };

        // Listen for the 'popstate' event (back/forward button press)
        window.addEventListener('popstate', handleBackButton);

    }, [dispatch, navigate]);

    return (
        <>
            <Grid container className='mobile-bucket' px={2} pb={2}>
                <Grid item xs={12} className='bucket-header'>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={1}>
                        <Stack direction="row" alignItems="center" py={1} pr={1}>
                            <Typography variant="h2" component="div" sx={{ fontSize: '18px', fontWeight: 600 }}>
                                {intl.formatMessage({ id: 'invoice' })} -
                            </Typography>
                            <Typography variant="h2" component="div" ml={0.5} sx={{ fontSize: '18px', fontWeight: 400 }}>
                                #{invoice?.documentNumber}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent='flex-end' alignItems="center" onClick={() => setPrintInvoice(true)} sx={{ cursor: 'pointer' }}>
                            <i className="icon-download ottr-icon" style={{ color: '#EB455F' }}></i>
                            <Typography sx={{ fontSize: '14px', fontWeight: '400', paddingLeft: '5px' }}>
                                {`${intl.formatMessage({ id: 'Download' })}`}
                            </Typography>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    {invoice?.customerName && (
                        <Grid container sx={{ backgroundColor: 'rgba(242, 244, 253, 0.90)', borderRadius: '5px' }} p={2} mb={2}>
                            <Grid item xs={12} sm={12}>
                                <Stack direction={'column'} justifyContent="space-between">
                                    <Typography sx={{ fontWeight: '600', color: '#2B3467', fontSize: '18px' }}>
                                        {invoice?.customerName}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={12} textAlign={matchDownSM ? 'start' : 'end'}>
                                <Stack direction={'row'} justifyContent="space-between">
                                    <Stack direction={'row'} alignItems={'center'}>
                                        <i className="icon-smartphone mobile-card-icon"></i>
                                        <Typography ml={0.1} sx={{ fontWeight: '400', fontSize: '12px', color: '#6A6C72' }}>
                                            {invoice?.mobileNumber ? invoice.mobileNumber : '-'}
                                        </Typography>
                                    </Stack>
                                    <Typography sx={{ fontWeight: '400', fontSize: '12px', color: '#6A6C72' }}>
                                        {intl.formatMessage({ id: 'ReceiptSentviaSMS' })}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>)}
                    <Grid container justifyContent='center' alignItems='center' p={2} mb={2} sx={{ background: '#EB455F', borderRadius: '5px' }}>
                        <Grid item xs={12} sm={12} mb={1}>
                            <Stack direction="row" justifyContent="space-between">
                                <Grid item xs={6} sm={6}>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                        {intl.formatMessage({ id: 'TotalItems' })}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={6} textAlign={'end'}>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                        {totalQuantity}
                                    </Typography>
                                </Grid>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Stack direction="row" justifyContent="space-between">
                                <Grid item xs={6} sm={6}>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                        {intl.formatMessage({ id: 'TotalAmount' })}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                    <Typography textAlign={'end'} sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                        {intl.formatMessage({ id: 'Rs.' })} {Number(totalValue)?.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Grid container pt={invoice?.customerName ? 0 : 2}>
                        <ScrollX sx={{ maxHeight: 'calc(100vh - 386px)', border: '1px solid #e6ebf1', borderRadius: '5px' }}>
                            {invoice?.details.length ? (invoice?.details?.map((val, index) => (
                                <Box sx={{ borderBottom: '1px solid #e6ebf1' }} key={index}>
                                    <Grid container pl={1.5} pr={1.5} pt={1}>
                                        <Typography sx={{ fontWeight: '500', color: '#2B3467' }}>
                                            {val?.productName}
                                        </Typography>
                                    </Grid>
                                    <Grid container pl={1.5} pr={1.5}>
                                        <Grid item xs={7} sm={7} container alignItems="center" justifyContent="space-between" className='item-amount-quantity'>
                                            <Typography sx={{ fontWeight: '500' }}>
                                                {intl.formatMessage({ id: 'Rs.' })} {Number(val?.rate)?.toFixed(2)}
                                            </Typography>
                                            <Typography>
                                                X
                                            </Typography>
                                            <Typography>
                                                {Number(val?.quantity)} {intl.formatMessage({ id: 'Quantity' })}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={5} sm={5}>
                                            <Typography sx={{ fontWeight: '500' }} textAlign='end'>
                                                {intl.formatMessage({ id: 'Rs.' })} {(Number(val?.rate) * Number(val?.quantity)).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid container mb={1} pl={1.5} pr={1.5}>
                                        {val?.days != 0 &&
                                            <Stack direction={'row'} alignItems={'center'}>
                                                <i className='icon-calendar mobile-card-icon'></i>
                                                <Typography ml={0.2} sx={{ fontWeight: '500', fontSize: '12px', color: '#939599', textAlign: 'right' }}>
                                                    {intl.formatMessage({ id: 'Expireson' })} {moment(val?.expiryDate).format('MMM D, YY')}
                                                    {/* {intl.formatMessage({ id: 'Expireson' })} {moment(val?.expiryDate).format('MMM D, YY')} */}
                                                </Typography>
                                            </Stack>
                                        }
                                    </Grid>
                                </Box>

                            ))) :
                                <Grid p={4} textAlign='center'>
                                    <Typography variant="body1" sx={{ cursor: 'default' }}>{intl.formatMessage({ id: 'InvoiceNoRecordLabel' })}</Typography>
                                </Grid>
                            }
                        </ScrollX>
                    </Grid>

                    {printInvoice &&
                        <Dialog
                            className="ottr-model"
                            maxWidth="sm"
                            TransitionComponent={PopupTransition}
                            keepMounted
                            fullWidth
                            onClose={() => setPrintInvoice(true)}
                            open={printInvoice}
                            // sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                            sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
                            aria-describedby="alert-dialog-slide-description"
                        >
                            <PrintInvoice invoice={invoice} onCancel={() => setPrintInvoice(false)} />
                        </Dialog>}
                </Grid>
            </Grid>
        </>
    );
}

export default MobileViewInvoiceDetails;