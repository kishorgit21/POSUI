// React apis
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

// Material-ui
import { Radio, FormControl, FormControlLabel, Dialog, Switch, Button, Typography, useMediaQuery, FormHelperText, DialogActions, Popper, Paper, DialogTitle, DialogContent, Divider, Grid, Stack, Autocomplete, InputLabel, TextField } from '@mui/material';

import * as Yup from 'yup';
import { FormikProvider, Form, Field, useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

// Project Import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';
import UPIPayment from './UPIPayment';

// Propmt components
import AddNewCustomer from 'sections/apps/newCustomer/AddnewCustomer';

// Hooks
import useNumberInputList from '../../../hooks/useOnlyNumberAndList';

// Services
import { getStore } from '_api/master_Store';
import { getCustomer } from '_api/master_Customer';
import { addBucketInvoice, generatePaymentQRCode } from '_api/transactions/new_Bucket';
import { openSnackbar } from 'store/reducers/snackbar';
import { setNewBucketFlag } from 'store/reducers/newbucketFlagReducer';
import { getSettings } from '_api/settings/settings';


// ==============================|| PAYMENT METHOD||============================== //

const PaymentMethod = ({ invoiceGenerated, customerMobileNo, bucketId, totalQuantity, totalValue, scannedProductData, bucketNoName, onCancel }) => {
    // Define the validation schema using Yup
    const validationForUPISaveSchema = Yup.object().shape({
        mobileNumber: Yup.string()
            .when('paymentMethod', {
                is: 'UPI', // Adjust this condition based on your payment method values
                then: Yup.string()
                    .required(<FormattedMessage id="MobileValidForPaymentMethod" />)
                    .max(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
                    .min(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
                    .matches(/^[1-9][0-9]{9}$/, { message: <FormattedMessage id="MasterVendorMobileValid" /> }),
                otherwise: Yup.string()
                    .nullable()
                    .max(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
                    .min(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
                    .matches(/^[1-9][0-9]{9}$/, { message: <FormattedMessage id="MasterVendorMobileValid" /> }),
            }),
        // customer: Yup.object().nullable(),
        customer: Yup.object().when('paymentMethod', {
            is: 'UPI', // Adjust this condition based on your payment method values
            then: Yup.object().required(<FormattedMessage id="CustomerNameForPaymentMethod" />).nullable(),
            otherwise: Yup.object().nullable(),
        }),

        store: Yup.object().required(<FormattedMessage id="TransactionPurchaseOrderStoreNameRequired" />).nullable(),
        paymentMethod: Yup.string().required('Please choose a payment method.'),
    });

    const validationSchema = Yup.object().shape({
        mobileNumber: Yup.string(<FormattedMessage id="MasterVendorMobileValid" />)
            .nullable()
            // .required(<FormattedMessage id="MasterCustomerMobileRequired" />)
            .max(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
            .min(10, <FormattedMessage id="MasterCustomerMobileCharLimit" />)
            .matches(/^[1-9][0-9]{9}$/, { message: <FormattedMessage id="MasterVendorMobileValid" /> }),
        customer: Yup.object().nullable(),
        store: Yup.object().required(<FormattedMessage id="TransactionPurchaseOrderStoreNameRequired" />).nullable(),
        paymentMethod: Yup.string().required('Please choose a payment method.'),
    });

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

    // Initial form values
    const initialValues = {
        mobileNumber: customerMobileNo || '',
        store: parsedData || '',
        customer: '',
        paymentMethod: 'cash', // Will be 'UPI' or 'cash'
    };

    // Localizations - multilingual
    const intl = useIntl();

    const noOptionsText = intl.formatMessage({ id: 'Norecords' });
    const [autoCompleteStoresOpen, setAutoCompleteStoresOpen] = useState(false);
    const [autoCompleteCustomersOpen, setAutoCompleteCustomersOpen] = useState(false);

    //set QR code image state
    const [qrCodeImg, setQRCodeImg] = useState('')

    //set QR code id state
    const [qrCodeId, setQRCodeId] = useState('')

    //set QR code timmer state
    const [qrValidTime, setQRValidTime] = useState('')

    // Set add customer state
    const [add, setAdd] = useState(false);

    // Set updated flag
    const [updated, setUpdated] = useState(false);

    //Send receipt SMS Toggle state
    const [receiptSMSFlag, setReceiptSMSFlag] = useState(false);

    // Get store list
    const { stores } = useSelector((state) => state.storeSlice);

    // Set open prompt state
    const [openUPI, setOpenUPI] = useState(false);

    //Get customer list 
    const [customerList, setCustomerList] = useState([])

    //set model UPI Values state for UPI method dialod
    const [modelUPIData, setModelUPIData] = useState('');

    // Get settings list, loading flag & another parameters
    const { settings } = useSelector((state) => state.settingsSlice);

    const [UPIPayIntegration, setUPIPayIntegration] = useState(false);

    const dispatch = useDispatch();
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));


    //Get amount to return to pay state
    const [amount, setAmount] = useState('')

    //Get return to pay state
    const [returnToPay, setReturnToPay] = useState(0)

    // Submit add/ edit customer form
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: !UPIPayIntegration ? validationForUPISaveSchema : validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            try {
                if (amount >= totalValue || values.paymentMethod === 'UPI') {
                    const scannedProductList = scannedProductData?.map((val) => {
                        var obj = {
                            productId: val.productId,
                            quantity: val.quantity,
                            rate: val.rate
                        }
                        return obj
                    })

                    const model = {
                        date: new Date(),
                        customerId: values.customer?.id,
                        storeId: values.store.id,
                        amount: totalValue,
                        bucketId: bucketId,
                        paymentMode: values.paymentMethod == 'cash' ? 0 : 1,
                        mobileNumber: values.mobileNumber == '' ? 0 : values.mobileNumber,
                        isShareReceiptThroughSms: receiptSMSFlag,
                        invoiceDetails: scannedProductList
                    }

                    if (values.paymentMethod === 'UPI') {
                        if (!UPIPayIntegration) {
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
                                        //   setUpdated(true);
                                        dispatch(setNewBucketFlag(false))
                                        invoiceGenerated()
                                        resetForm()
                                        setSubmitting(true);
                                        // Cancel method call
                                        onCancel('cancel');
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
                        else {
                            setModelUPIData(model)
                            setOpenUPI(true)
                        }
                    }
                    else {

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
                                    //   setUpdated(true);
                                    dispatch(setNewBucketFlag(false))
                                    invoiceGenerated()
                                    resetForm()
                                    setSubmitting(true);
                                    // Cancel method call
                                    onCancel('cancel');
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
                else {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: `${intl.formatMessage({ id: 'TotalamountVal' })}`,
                            variant: 'alert',
                            alert: {
                                color: 'error'
                            },
                            close: true
                        })
                    );
                }
            } catch (error) {
                console.error(error);
            }
        }
    });

    // Formik form flags, states, events
    const { errors, touched, setFieldValue, handleChange, values, resetForm } = formik;

    //Add new customer btn
    const addNewCustomer = (
        <Stack direction="row" justifyContent="space-between" alignItems="center" p={0} m={0}>
            <Typography color="error" mb={1} mt={1} fontSize={12}>
                {intl.formatMessage({ id: 'BucketCustomerVal' })}
            </Typography>
            <Button size="small" id="add-customer-btn" className="btn-outlined-primary add-product"
                onClick={() => setAdd(true)}
                variant="outlined" endIcon={<i className='icon-plus  ottr-icon'></i>}>
                {intl.formatMessage({ id: 'AddCustomer' })}</Button>
        </Stack>
    )

    useEffect(() => {
        // Get store list api call
        dispatch(getStore())
            .unwrap()
            .then((payload) => {
                if (payload && payload.isError) {
                    // Handle error
                } else {
                    //Handle response
                }
            })
            .catch((error) => {
                if (error && error.code === 'ERR_BAD_REQUEST') {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: `${intl.formatMessage({ id: 'MasterStoreListErrorMsg' })}`,
                            variant: 'alert',
                            alert: {
                                color: 'error'
                            },
                            close: true
                        })
                    );
                }
            });
        //Get customer lis api call
        dispatch(getCustomer()).then((response) => {
            if (response.payload && response.payload.isError) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: `${intl.formatMessage({ id: 'MasterCustomerListErrorMsg' })}`,
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            } else {
                // Set customer list
                if (response && response.payload && response.payload.data) {
                    setCustomerList(response.payload.data);
                    let foundCustomer = response.payload.data.find(customer => customer.mobileNumber == values.mobileNumber);
                    if (foundCustomer === undefined) {
                        foundCustomer = ''; // Set it to an empty string
                    }
                    setFieldValue('customer', foundCustomer);
                    setFieldValue('mobileNumber', values?.mobileNumber)
                }
                // Reset updated flag
                setUpdated(false);
            }
        });
    }, [updated]);

    // Cancel the payment method operation
    const handleCancel = () => {
        // Reset form
        resetForm();
        // Cancel method call
        onCancel('cancel');
    };

    const handleAddCustomerCancel = (status, mobileNumber) => {
        setUpdated(true);
        setAdd(false)
        setFieldValue('mobileNumber', mobileNumber)
    }
    const handleUPIPaymentMethod = () => {
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

    // Set field value for mobile number field
    const onSetField = (fieldName, inputValue) => {
        if (inputValue.length <= 10) {
            setFieldValue(fieldName, inputValue);
        }
    };

    // Set field value for mobile number field
    const onCustomerChange = (inputValue) => {
        let foundCustomer = customerList.find(customer => customer.mobileNumber == inputValue);
        if (foundCustomer === undefined) {
            foundCustomer = ''; // Set it to an empty string
        }
        setFieldValue('customer', foundCustomer);
    };

    // Number only hook for mobile number
    const [handleNumberChange] = useNumberInputList(onSetField, onCustomerChange, 'mobileNumber');
    const customer = {
        id: '',
        name: '',
        mobileNumber: '',
    }


    useEffect(() => {
        // Get settings list api call
        dispatch(getSettings())
            .unwrap()
            .then((payload) => {
                if (payload && payload.isError) {
                    // Handle error

                } else {
                    // Reset updated flag
                    setUpdated(false);
                }
            })
            .catch((error) => {
                if (error && error.code === "ERR_BAD_REQUEST") {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: `${intl.formatMessage({ id: 'SettingErrorMsg' })}`,
                            variant: 'alert',
                            alert: {
                                color: 'error'
                            },
                            close: true
                        })
                    );
                }
                setUpdated(false);
            })
    }, [updated]);

    useEffect(() => {
        const UPIPayIntegrationObj = settings.find(
            (setting) => setting.settingType === 'UPI_Pay_Integration'
        );
        const UPIValue = UPIPayIntegrationObj?.settingValue
        setUPIPayIntegration(UPIValue === 'true' ? true : false)
    }, [settings])

    return (
        <MainCard className="edit-purchase-order">
            <FormikProvider value={formik}>
                <Form>
                    <DialogTitle className='model-header'>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" p={0} m={0}>
                            <Typography variant="h5" component="div" >
                                {bucketNoName}
                            </Typography>
                            {/* <Button color="error" variant="contained" onClick={() => handleDeleteBucket()} autoFocus>
                                {intl.formatMessage({ id: 'Delete' })} {intl.formatMessage({ id: 'bucket' })}
                            </Button> */}
                        </Stack>
                    </DialogTitle>
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
                                                className='disabled-input'
                                                sx={{ '& div button': { visibility: 'hidden' } }}
                                                noOptionsText={noOptionsText}
                                                value={values.store || null}
                                                options={stores?.filter((val) => val.recordStatus === 0) || []}
                                                getOptionLabel={(option) => option.name ?? option}
                                                onChange={(event, newValue) => {
                                                    setFieldValue('store', newValue);
                                                }}
                                                open={autoCompleteStoresOpen}
                                                PopperComponent={(props) => (
                                                    <Popper {...props}>
                                                        <Paper
                                                            style={{
                                                                maxHeight: 200,
                                                                // overflowY: 'auto',/
                                                            }}
                                                        >
                                                            {props.children}
                                                        </Paper>
                                                    </Popper>
                                                )}
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
                                <Grid item xs={12} sm={6} md={4}>
                                    <Stack spacing={1}>
                                        <InputLabel>{intl.formatMessage({ id: 'MobileNumber' })}</InputLabel>
                                        <TextField
                                            // disabled={scannedProductData.length>0 ? false : true}
                                            // className={scannedProductData.length>0 ? '' : 'disabled-input'}
                                            id="customer-mobile-no"
                                            placeholder={intl.formatMessage({ id: 'MobilePlaceholder' })}
                                            value={values.mobileNumber || ''}
                                            // onChange={($event) => {
                                            //     const newMobileNumber = $event.target.value;
                                            //     // Remove any non-digit characters (e.g., spaces, hyphens, etc.)
                                            //     const cleanedMobileNumber = newMobileNumber.replace(/\D/g, '');

                                            //     // Truncate to 10 digits if the input exceeds 10 characters
                                            //     const truncatedMobileNumber = cleanedMobileNumber.slice(0, 10);
                                            //     setFieldValue('mobileNumber', truncatedMobileNumber)
                                            //     const foundCustomer = customerList.find(customer => customer.mobileNumber == truncatedMobileNumber);
                                            //     setFieldValue('customer', foundCustomer);
                                            // }}
                                            onChange={($event) => handleNumberChange($event)}
                                            error={Boolean(touched.mobileNumber && errors.mobileNumber)}
                                            helperText={touched.mobileNumber && errors.mobileNumber ? errors.mobileNumber : ''}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} sx={{ mt: matchDownSM ? 1 : 0 }}>
                                    <Stack direction="row" justifyContent={matchDownSM ? "space-between" : "space-around"}>
                                        <Stack spacing={1}>
                                            <InputLabel sx={{ textAlign: 'right' }}>{intl.formatMessage({ id: 'Quantity' })}</InputLabel>
                                            <Typography sx={{fontWeight:'500',color:'#2B3467',textAlign: 'right' }}>
                                                {totalQuantity}
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={1}>
                                            <InputLabel sx={{ textAlign: 'right' }}>{intl.formatMessage({ id: 'Amount' })}</InputLabel>
                                            <Typography sx={{ textAlign: 'right', fontSize: '16px', fontWeight: 500, color: '#EB455F' }}>
                                                {intl.formatMessage({ id: 'Rs.' }) + " " + Number(totalValue)?.toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6} md={8}>
                                    <Stack spacing={1}>
                                        <InputLabel>{intl.formatMessage({ id: 'customer' })}</InputLabel>
                                        <FormControl sx={{ width: '100%' }}>
                                            <Autocomplete
                                                disablePortal
                                                id="customer"
                                                noOptionsText={addNewCustomer}
                                                value={values.customer || null}
                                                options={customerList?.filter((val) => val.recordStatus === 0) || []}
                                                getOptionLabel={(option) => option.name ?? option}
                                                onChange={(event, newValue) => {
                                                    if (newValue) {
                                                        setFieldValue('customer', newValue);
                                                        setFieldValue('mobileNumber', newValue.mobileNumber)
                                                    }
                                                    else {
                                                        setFieldValue('customer', '');
                                                        setFieldValue('mobileNumber', '')
                                                    }
                                                }}
                                                open={autoCompleteCustomersOpen}
                                                PopperComponent={(props) => (
                                                    <Popper {...props}>
                                                        <Paper
                                                            style={{
                                                                maxHeight: 100,
                                                                // overflowY: 'auto',
                                                            }}
                                                        >
                                                            {props.children}
                                                        </Paper>
                                                    </Popper>
                                                )}
                                                onInputChange={(event, value, reason) => {
                                                    switch (reason) {
                                                        case "input":
                                                            setAutoCompleteCustomersOpen(!!value);
                                                            break;
                                                        case "reset":
                                                        case "clear":
                                                            setAutoCompleteCustomersOpen(false);
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
                                                placeholder={intl.formatMessage({ id: 'SelectCustomer' })}
                                                renderInput={(params) => <TextField {...params}
                                                    aria-label={intl.formatMessage({ id: 'SelectCustomer' })}
                                                    placeholder={intl.formatMessage({ id: 'Search&SelectCustomer' })} size='large'
                                                    error={Boolean(!values.customer && touched.customer && errors.customer)}
                                                    helperText={!values.customer && touched.customer && errors.customer ? errors.customer : ''}
                                                />}
                                            />
                                        </FormControl>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} sx={{ marginLeft: matchDownSM ? '-20px' : 'auto' }}>
                                    <FormControlLabel
                                        disabled={!values.mobileNumber || values.mobileNumber.toString()?.length != 10 ? true : false}
                                        onChange={(event) => setReceiptSMSFlag(event.target.checked)}
                                        style={{ pointerEvents: "none" }}
                                        control={<Switch checked={receiptSMSFlag} color="primary" style={{ pointerEvents: "auto" }} />}
                                        label={<InputLabel>{intl.formatMessage({ id: 'SendReceiptLabel' })}</InputLabel>}
                                        labelPlacement="start"
                                        sx={{ mt: matchDownSM ? 0 : 3.5 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={8}>
                                    {/* <Stack spacing={1}> */}
                                    <InputLabel>{intl.formatMessage({ id: 'PaymentMethod' })}</InputLabel>
                                    <FormControl component="fieldset">
                                        <FormControlLabel
                                            style={{ pointerEvents: "none" }}
                                            control={<Field style={{ pointerEvents: "auto" }} type="radio" name="paymentMethod" value="cash" as={Radio} />}
                                            label={intl.formatMessage({ id: 'Cash' })}
                                        />
                                        <FormControlLabel
                                            style={{ pointerEvents: "none" }}
                                            control={<Field style={{ pointerEvents: "auto" }} type="radio" name="paymentMethod" value="UPI" as={Radio} onChange={(e) => {
                                                handleChange(e);
                                                if (e.target.value === 'UPI') {
                                                    if (!UPIPayIntegration) {
                                                        //UPI Save thrrow Google pay
                                                    }
                                                    else{
                                                        handleUPIPaymentMethod()
                                                    }
                                                }
                                            }} />}
                                            label={intl.formatMessage({ id: 'UPI' })}
                                        />
                                    </FormControl>
                                    {touched.paymentMethod && errors?.paymentMethod && <FormHelperText error={true}>{errors?.paymentMethod}</FormHelperText>}
                                    {/* </Stack> */}
                                </Grid>
                                {values.paymentMethod === 'cash' && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Stack spacing={1} justifyContent='flex-end' alignItems={matchDownSM ? 'flex-start' : 'flex-end'}>
                                            <TextField
                                                id="return-to-pay"
                                                sx={{ width: '85px', marginTop: '10px' }}
                                                value={amount}
                                                // placeholder={intl.formatMessage({ id: 'Amount' })}
                                                placeholder='0.00'
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
                                                    setAmount(sanitizedValue)
                                                    if (sanitizedValue > totalValue) {
                                                        const returnToPayAmount = sanitizedValue - totalValue;
                                                        !sanitizedValue ? setReturnToPay(0) : setReturnToPay(returnToPayAmount)
                                                    }
                                                    else {
                                                        setReturnToPay(0)
                                                    }
                                                }}
                                                inputProps={{
                                                    style: { textAlign: 'right' },
                                                }}
                                            />
                                            <InputLabel sx={{ textAlign: 'right' }}>{intl.formatMessage({ id: 'ReturnToPay' })} : {returnToPay.toFixed(2)}</InputLabel>

                                        </Stack>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                    </ScrollX>
                    <Divider />
                    <DialogActions sx={{ p: 2.5 }} className='model-footer'>
                        <Grid container justifyContent="end" alignItems="center">
                            <Grid item>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button className="gray-outline-btn" variant="outlined-gray" onClick={() => handleCancel()}>
                                        <FormattedMessage id="cancel" />
                                    </Button>
                                    <Button type="submit" variant="contained">
                                        {values.paymentMethod === 'UPI' && UPIPayIntegration ? <FormattedMessage id="GenerateQRcode" /> : <FormattedMessage id="save" />}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Form>
                {/* add user dialog */}
                {add && (
                    <Dialog
                        className='ottr-model'
                        maxWidth="sm"
                        TransitionComponent={PopupTransition}
                        keepMounted
                        fullWidth
                        onClose={() => setAdd(true)}
                        open={add}
                        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <AddNewCustomer addEditStatus='add' customer={customer} onCancel={handleAddCustomerCancel} setUpdated={setUpdated} />
                    </Dialog>
                )}
            </FormikProvider>
            {openUPI && <UPIPayment
                open={openUPI}
                qrCodeImgPay={qrCodeImg}
                qrCodeIdPay={qrCodeId}
                qrValidTimePay={qrValidTime}
                modelUPIData={modelUPIData}
                totalValue={totalValue}
                bucketId={bucketId}
                invoiceGenerated={invoiceGenerated}
                handleClose={() => setOpenUPI(false)} />
            }

        </MainCard>
    );
};

PaymentMethod.propTypes = {
    onCancel: PropTypes.func,
    handleDeleteBucket: PropTypes.func
};

export default PaymentMethod;