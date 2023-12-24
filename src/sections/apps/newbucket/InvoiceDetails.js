// React apis
import PropTypes from 'prop-types';
import { useState } from 'react';

// Material-ui
import { DialogContent, DialogTitle, Typography, Button, Grid, Stack, DialogActions, useMediaQuery, Box, TextField, IconButton, Tooltip, Dialog } from '@mui/material';

// Project Import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import PrintInvoice from 'sections/apps/ottrInvoice/PrintInvoice';
import { PopupTransition } from 'components/@extended/Transitions';

// Assets
import { useIntl } from 'react-intl';
import moment from 'moment';

// ==============================|| UPI PAYMENT ALERT ||============================== //

export default function InvoiceDetails({ invoice, onCancel }) {

    // Localizations - multilingual
    const intl = useIntl();

    // const dispatch = useDispatch();
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    //mobile number state
    const [mobileNumber, setMobileNumber] = useState(invoice?.mobileNumber || '');
    const [mobileNumberVal, setMobileNumberVal] = useState(false);

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


    return (
        <MainCard className="edit-purchase-order">
            <DialogTitle className='model-header'>
                <Stack direction="row" justifyContent="space-between" alignItems="center" p={0} m={0}>
                    <Typography variant="h5" component="div" >
                        {intl.formatMessage({ id: 'invoice' })} - #{invoice?.documentNumber}
                    </Typography>
                    <Tooltip title={intl.formatMessage({ id: 'View' })}>
                        <IconButton
                            color="primary"
                            sx={{
                                height: '30px',
                                width: '30px',
                                border: '1px solid #404876 !important'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPrintInvoice(true)
                            }}
                        >
                            <i className="icon-download ottr-icon"></i>
                        </IconButton>
                    </Tooltip>
                </Stack>
            </DialogTitle>
            {invoice?.customerName && (
                <Grid container sx={{ backgroundColor: '#fafafb' }} py={2} px={3}>
                    <Grid item xs={12} sm={6}>
                        <Stack direction={'column'} justifyContent="space-between">
                            <Typography sx={{fontWeight:'500',color:'#2B3467', fontSize: '16px' }}>
                                {invoice?.customerName}
                            </Typography>
                            <Typography sx={{ fontWeight: '400', fontSize: '14px' }}>
                                {invoice?.mobileNumber ? invoice.mobileNumber : '-'}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} textAlign={matchDownSM ? 'start' : 'end'}>
                        <Stack direction={'column'} justifyContent="space-between">
                            <Typography sx={{ fontWeight: '400', fontSize: '14px' }} mt={3}>
                                {intl.formatMessage({ id: 'ReceiptSentviaSMS' })}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>)}
            <DialogContent>
                <Grid container pt={invoice?.customerName ? 0 : 2}>
                    <ScrollX sx={{ maxHeight: 'calc(100vh - 386px)', border: '1px solid #e6ebf1', borderRadius: '5px' }}>
                        {invoice?.details.length ? (invoice?.details?.map((val, index) => (
                            <Box sx={{ borderBottom: '1px solid #e6ebf1' }} key={index}>
                                <Stack direction="row" justifyContent="space-between" mb={1} pl={2} pr={2} pt={1}>
                                    <Grid item xs={8} sm={8}>
                                        <Typography sx={{fontWeight:'500',color:'#2B3467'}}>
                                            {val?.productName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4} sm={4}>
                                        <Typography sx={{ fontWeight: '500', fontSize: '12px', color: '#939599', textAlign: 'right' }}>
                                            {val?.days == 0 ? `${intl.formatMessage({ id: 'NoExpiryDate' })}` : `${intl.formatMessage({ id: 'Expireson' })} ${moment(val?.expiryDate).format('MMM D, YY')}`}
                                            {/* {intl.formatMessage({ id: 'Expireson' })} {moment(val?.expiryDate).format('MMM D, YY')} */}
                                        </Typography>
                                    </Grid>
                                </Stack>
                                <Grid container mb={1} pl={2} pr={2}>
                                    <Grid item xs={8} sm={7} container alignItems="center" justifyContent="space-between">
                                        <Typography>
                                            {intl.formatMessage({ id: 'Rs.' })} {Number(val?.rate)?.toFixed(2)}
                                        </Typography>
                                        <Typography>
                                            X
                                        </Typography>
                                        <Typography>
                                            {intl.formatMessage({ id: 'Quantity' })} {Number(val?.quantity)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4} sm={5}>
                                        <Typography sx={{ fontWeight: '500' }} textAlign='end'>
                                            {intl.formatMessage({ id: 'Rs.' })} {(Number(val?.rate) * Number(val?.quantity)).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                        ))) :
                            <Grid p={4} textAlign='center'>
                                <Typography variant="body1" sx={{ cursor: 'default' }}>{intl.formatMessage({ id: 'InvoiceNoRecordLabel' })}</Typography>
                            </Grid>
                        }
                    </ScrollX>
                </Grid>
            </DialogContent>
            <Grid container justifyContent='center' alignItems='center' p={2} pl={3} pr={3} sx={{ background: '#fafafb' }}>
                <Grid item xs={12} sm={6}>
                    <Typography sx={{fontWeight:'500',color:'#2B3467'}}>
                        {invoice?.modeOfPayment == 0 ? intl.formatMessage({ id: 'InvoiceAmountCashLabel' }) :
                            intl.formatMessage({ id: 'InvoiceAmountUPILabel' })}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={3}
                    textAlign={matchDownSM ? 'start' : 'center'}
                    pt={matchDownSM ? 2 : 0}>
                    <Button color="primary" variant="contained" type="submit" sx={{ cursor: 'auto', padding: '2px  10px', minWidth: 'auto' }}>
                        {totalQuantity}
                    </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Typography textAlign={matchDownSM ? 'start' : 'end'} pt={matchDownSM ? 2 : 0} sx={{ fontSize: '16px', fontWeight: 500, color: '#EB455F' }}>
                        {intl.formatMessage({ id: 'Rs.' })} {Number(totalValue)?.toFixed(2)}
                    </Typography>
                </Grid>
            </Grid>
            <DialogActions className='model-footer' sx={{ p: 2.5 }}>
                <Grid item xs={12} justifyContent='space-between' sx={{ width: '100%' }}>
                    <Button className="gray-outline-btn" variant="outlined-gray" sx={{ width: matchDownSM ? '100%' : 'auto', marginBottom: matchDownSM ? "15px" : "0px",}} onClick={() => onCancel()}>
                        {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                    <TextField
                        id="customer-mobile-no"
                        fullWidth={matchDownSM ? true : false}
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
                            setMobileNumber(truncatedMobileNumber)
                            if (truncatedMobileNumber.length == 10) {
                                setMobileNumberVal(false)
                            }
                        }}
                        value={mobileNumber || ''}
                        error={mobileNumberVal ? true : false}
                        pt={mobileNumberVal ? 2 : 0}
                        helperText={mobileNumberVal ? intl.formatMessage({ id: 'MasterVendorMobileCharLimit' }) : null}
                        sx={{
                            '& .MuiOutlinedInput-input': { py: 1.2, backgroundColor: 'white' },
                            margin: matchDownSM?'0':'0 10px'// Add margin here (adjust the value as needed)
                        }}
                    />
                    <Button
                        className={(mobileNumber.length < 10) ? "disabled-btn" : ""}
                        disabled={(mobileNumber.length < 10) ? true : false}
                        sx={{ width: matchDownSM ? '100%' : 'auto', py: 0.9, fontWeight: '400' ,marginTop: matchDownSM ? "15px" : "0px" }}
                        color="primary" variant="contained"
                        onClick={() => (mobileNumber.length < 10 && mobileNumber) ? setMobileNumberVal(true) : (setMobileNumberVal(false))}>
                        {intl.formatMessage({ id: 'SendReceiptviaSMS' })}
                    </Button>
                </Grid>
            </DialogActions>
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
        </MainCard>
    );
}

InvoiceDetails.propTypes = {
    onCancel: PropTypes.func
};