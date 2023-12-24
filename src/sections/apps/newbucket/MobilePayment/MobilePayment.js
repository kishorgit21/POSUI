// React apis
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// Material-ui
import { FormControl, FormControlLabel, Dialog, Switch, Button, Typography, Popper, Paper, Grid, Stack, Autocomplete, TextField } from '@mui/material';

import * as Yup from 'yup';
import { FormikProvider, Form, useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

// Project Import
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';
import UPIPayment from '../UPIPayment';

// Propmt components
import AddNewCustomer from 'sections/apps/newCustomer/AddnewCustomer';

// Hooks
import useNumberInputList from 'hooks/useOnlyNumberAndList';
import { useNavigate } from 'react-router';

// Services
import { getStore } from '_api/master_Store';
import { getCustomer } from '_api/master_Customer';
import { addBucketInvoice, generatePaymentQRCode } from '_api/transactions/new_Bucket';
import { openSnackbar } from 'store/reducers/snackbar';
import { getSettings } from '_api/settings/settings';

import { useLocation } from 'react-router';
import { setNewBucketFlag } from 'store/reducers/newbucketFlagReducer';


// ==============================|| PAYMENT METHOD||============================== //

const MobilePayment = () => {
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

    const location = useLocation();

    // Initial form values
    const initialValues = {
        mobileNumber: location.state?.customerMobileNo || '',
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
    const navigate = useNavigate();
    let currentPath = location.pathname;

    //Get amount to return to pay state
    const [amount, setAmount] = useState('')

    //Get return to pay state
    const [returnToPay, setReturnToPay] = useState(0);

    const totalValue = location.state?.totalValue;
    const bucketId = location.state?.bucketId
    const totalQuantity = location.state?.totalQuantity;
    // const invoiceGenerated = location.state?.invoiceGenerated;


    // Submit add/ edit customer form
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: !UPIPayIntegration ? validationForUPISaveSchema : validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            try {
                if (amount >= totalValue || values.paymentMethod === 'UPI') {
                    const scannedProductList = location.state.scannedProductData?.map((val) => {
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

                                        navigate(`/apps/Transactions/bucket`, {
                                            state: {
                                                invoice: 'invoice'
                                            }
                                        })
                                        dispatch(setNewBucketFlag(false))
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
                                    navigate(`/apps/Transactions/bucket`, {
                                        state: {
                                            invoice: 'invoice'
                                        }
                                    })
                                    dispatch(setNewBucketFlag(false))
                                    resetForm()
                                    setSubmitting(true);
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
    const { errors, touched, setFieldValue, values, resetForm } = formik;

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
        navigate(`/apps/Transactions/bucket`, {
            state: {
                bucketId: bucketId
            }
        })

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

    useEffect(() => {
        const handleBackButton = () => {
            if (currentPath.includes('/apps/Transactions/bucket/payment')) {
                const localStore = localStorage.getItem('bucket')
                var parsedData;
                if (localStore) {
                    try {
                        parsedData = JSON.parse(localStore); // Parse the JSON string to a JavaScript object  
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                    }
                }
                navigate(`/apps/Transactions/bucket`, {
                    state: {
                        bucket: parsedData
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
            <FormikProvider value={formik}>
                <Form>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={2} pt={2} m={0}>
                        <Typography sx={{ fontWeight: '600', fontSize: '18px', color: '#353B44' }}>
                            {intl.formatMessage({ id: 'Payment' })}
                        </Typography>
                        <Stack direction="row">
                            <Typography sx={{ fontWeight: '600', fontSize: '14px', color: '#353B44' }}> Bucket - </Typography>
                            <Typography sx={{ fontWeight: '400', fontSize: '14px', color: '#353B44' }}>#{location?.state?.bucketNoName}</Typography>
                        </Stack>
                    </Stack>
                    <Grid mx={2} p={2} mb={1.5} sx={{ background: '#EB455F', borderRadius: '5px' }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                {intl.formatMessage({ id: 'TotalItems' })}
                            </Typography>
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                {totalQuantity}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                {intl.formatMessage({ id: 'TotalAmount' })}
                            </Typography>
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                                {intl.formatMessage({ id: 'Rs.' })} {Number(totalValue)?.toFixed(2)}
                            </Typography>
                        </Stack>
                    </Grid>
                    <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <Grid container spacing={1.5} px={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack spacing={0.5}>
                                    <Typography sx={{ color: '#111828', fontSize: '14px', fontWeight: '500' }}>{intl.formatMessage({ id: 'store' })}</Typography>
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
                                            placeholder={intl.formatMessage({ id: 'Select Store' })}
                                            renderInput={(params) => <TextField {...params}
                                                aria-label={intl.formatMessage({ id: 'Select Store' })}
                                                placeholder={intl.formatMessage({ id: 'Search&SelectStore' })}
                                                size='small'
                                                error={Boolean(touched.store && errors.store)}
                                                helperText={touched.store && errors.store ? errors.store : ''}
                                            />}
                                        />
                                    </FormControl>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack spacing={0.5}>
                                    <Typography sx={{ color: '#111828', fontSize: '14px', fontWeight: '500' }}>{intl.formatMessage({ id: 'MobileNumber' })}</Typography>
                                    <TextField
                                        id="customer-mobile-no"
                                        placeholder={intl.formatMessage({ id: 'MobilePlaceholder' })}
                                        value={values.mobileNumber || ''}
                                        size='small'
                                        onChange={($event) => handleNumberChange($event)}
                                        error={Boolean(touched.mobileNumber && errors.mobileNumber)}
                                        helperText={touched.mobileNumber && errors.mobileNumber ? errors.mobileNumber : ''}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={8}>
                                <Stack spacing={0.5}>
                                    <Typography sx={{ color: '#111828', fontSize: '14px', fontWeight: '500' }}>{intl.formatMessage({ id: 'customer' })}</Typography>
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
                                            placeholder={intl.formatMessage({ id: 'SelectCustomer' })}
                                            renderInput={(params) => <TextField {...params}
                                                aria-label={intl.formatMessage({ id: 'SelectCustomer' })}
                                                placeholder={intl.formatMessage({ id: 'Search&SelectCustomer' })}
                                                size='small'
                                                error={Boolean(touched.customer && errors.customer)}
                                                helperText={touched.customer && errors.customer ? errors.customer : ''}

                                            />}
                                        />
                                    </FormControl>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack direction={'row'} justifyContent='space-between'>
                                    <FormControlLabel
                                        disabled={!values.mobileNumber || values.mobileNumber.toString()?.length != 10 ? true : false}
                                        onChange={(event) => setReceiptSMSFlag(event.target.checked)}
                                        style={{ pointerEvents: "none" }}
                                        control={<Switch checked={receiptSMSFlag} color="primary" style={{ pointerEvents: "auto" }} size='small' />}
                                        label={<Typography sx={{ fontSize: '12px', fontWeight: '400', color: '#000' }}>{intl.formatMessage({ id: 'SendReceiptLabel' })}</Typography>}
                                        labelPlacement="end"
                                    />

                                    <FormControlLabel
                                        onChange={() => {
                                            setFieldValue('paymentMethod', values.paymentMethod === 'UPI' ? 'cash' : 'UPI')
                                            if (values.paymentMethod === 'cash') {
                                                if (!UPIPayIntegration) {
                                                    //UPI Save thrrow Google pay
                                                }
                                                else {
                                                    handleUPIPaymentMethod()
                                                }
                                            }
                                        }
                                        }
                                        style={{ pointerEvents: "none" }}
                                        control={<Switch checked={values.paymentMethod === 'UPI'} color="primary" style={{ pointerEvents: "auto" }} size='small' />}
                                        label={<Typography sx={{ fontSize: '12px', fontWeight: '400', color: '#000' }}>{intl.formatMessage({ id: 'UPIPaymentLabel' })}</Typography>}
                                        labelPlacement="end"
                                    />
                                </Stack>
                            </Grid>

                            {values.paymentMethod === 'cash' && (
                                <>
                                    <Grid item xs={6} sm={6} md={4}>
                                        <Typography sx={{ fontWeight: '500', fontSize: '14px', color: '#353B44' }}>{intl.formatMessage({ id: 'GotAmount' })}</Typography>
                                        <TextField
                                            id="return-to-pay"
                                            sx={{ width: '150px', marginTop: '2px', fontWeight: '400', fontSize: '14px', color: '#2B3467', textAlign: 'right' }}
                                            value={amount}
                                            placeholder='₹ 0.00'
                                            size='small'
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
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={4}>
                                        <Typography sx={{ fontWeight: '500', fontSize: '14px', color: '#353B44', textAlign: 'right', }}>{intl.formatMessage({ id: 'ReturnToPay' })}</Typography>
                                        <Typography mt={0.5} sx={{ fontWeight: '400', fontSize: '14px', color: '#2B3467', textAlign: 'right', }}>{'₹ ' + returnToPay.toFixed(2)}</Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </ScrollX>
                    <Grid display='flex' className='bucket-sticky-button' sx={{ position: 'fixed', bottom: '0' }}>
                        <Stack sx={{ justifyContent: 'space-between' }}>
                            <Button
                                fullWidth className="gray-outline-btn"
                                variant="outlined-gray"
                                onClick={() => handleCancel()}
                                sx={{ width: '48%' }}
                            >
                                {intl.formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                                type="submit" variant="contained"
                                sx={{ width: '48%' }}
                            >
                                {values.paymentMethod === 'UPI' && UPIPayIntegration ? <FormattedMessage id="GenerateQRcode" /> : <FormattedMessage id="save" />}
                            </Button>
                        </Stack>
                    </Grid>
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
                handleClose={() => setOpenUPI(false)} />
            }
        </>
    );
};

export default MobilePayment;