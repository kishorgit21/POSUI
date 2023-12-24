// React apis
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';

// CSS
import "style.css";

// Material-ui
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, FormControl, FormHelperText, Grid, InputLabel, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, FormControlLabel, Switch, Autocomplete, OutlinedInput, InputAdornment, Portal } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// Third-party Package Apis
import { Form, Formik, FieldArray } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import * as yup from 'yup';
import moment from 'moment';

// Project Import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';
import PurchaseOrderDetails from './PurchaseOrderDetails';
import QuantityInput from './QuantityInput'

// Services
import { addMaterialInward, updateMaterialInward } from '_api/transactions/material_Inward';
import { getFrequentlyPurchasedProducts } from '_api/transactions/purchase-order';
import { getByRole } from '_api/settings/settings';

import { useDispatch, useSelector } from 'react-redux';
import { getVendor } from '_api/master_Vendor';
import { getProduct } from '_api/master_Product';
// Reducers
import { openSnackbar } from 'store/reducers/snackbar';

//Get Future Date / Hide Past Date
// const futureDate = new Date((new Date()).valueOf() - 1000 * 60 * 60)

//Auto focus on click of the add product button
let productRef;

//Date picker on focuse outline remove and input box crop
const StyledDatePicker = styled(DatePicker)({
  '& .MuiInputBase-input': {
    padding: '10.5px 0px 10.5px 12px',
  },
  '& .MuiInputBase-root.Mui-focused': {
    boxShadow: 'none', // Remove focus outline when DatePicker is focused
  },
});

// Set Material Inward form schema
const validationSchema = yup.object({
  // date: yup.date().required(<FormattedMessage id="TransactionMaterialInwardDateRequired" />),
  date: yup.date().typeError(<FormattedMessage id="TransactionPurchaseDetailProductDeliveryInvalidDateRequired" />)
    // max(new Date(), <FormattedMessage id="TransactionPurchaseOrderFutureDateValidation" />)
    .required(<FormattedMessage id="TransactionPurchaseOrderRequired" />),
  Purchase_Order: yup.string().required(<FormattedMessage id="TransactionMaterialInwardPurchaseOrderRequired" />),
  vendor_Name: yup.string().required(<FormattedMessage id="TransactionMaterialInwardVendorNameRequired" />),
  Purchase_detail: yup
    .array()
    .required(<FormattedMessage id="InvoiceDetailsVal" />)
    .of(
      yup.object().shape({
      })
    )
    .min(1, <FormattedMessage id="MaterialInwardVal" />)
});

//Set Material Inward  purchase order validation schema
const purchaseOrderValidationSchema = yup.object({
  // materialInwardDate: yup.date().required(<FormattedMessage id="TransactionMaterialInwardDateRequired" />),
  materialInwardDate: yup.date().typeError(<FormattedMessage id="TransactionPurchaseDetailProductDeliveryInvalidDateRequired" />)
    // max(new Date(), <FormattedMessage id="TransactionPurchaseOrderFutureDateValidation" />)
    .required(<FormattedMessage id="TransactionPurchaseOrderRequired" />),
  vendor: yup.object().required(<FormattedMessage id="TransactionPurchaseOrderVendorNameRequired" />).nullable(),
  Purchase_detailList: yup
    .array()
    .required(<FormattedMessage id="InvoiceDetailsVal" />)
    .of(
      yup.object().shape({
        productName: yup.string().required(<FormattedMessage id="ProductNameRequireVal" />),

      })
    )
    .min(1, <FormattedMessage id="MaterialInwardVal" />)
});

// Validation schema for add product details form
const validationSchemaForAddProductForm = yup.object({
  productId: yup.object().required(<FormattedMessage id="TransactionPurchaseDetailProductNameRequired" />).nullable(),
  quantity: yup.number()
    .positive(<FormattedMessage id="TransactionPurchaseDetailProductQuantityPositive" />)
    .typeError(<FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />).
    test('is-decimal', <FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />, value => {
      if (value === undefined || value === null) {
        return false;
      }
      const decimalRegex = /^\d+(\.\d{1,2})?$/;
      return decimalRegex.test(value.toString());
    })
    .required(<FormattedMessage id="TransactionPurchaseDetailProductQuantityRequired" />),
  // yup.number().positive(<FormattedMessage id="TransactionPurchaseDetailProductQuantityPositive" />).
  // typeError(<FormattedMessage id="TransactionPurchaseDetailProductQuantityTypeError" />).
  // required(<FormattedMessage id="TransactionPurchaseDetailProductQuantityRequired" />),
  rate: yup.number().positive(<FormattedMessage id="TransactionPurchaseDetailProductRatePositive" />).typeError(<FormattedMessage id="TransactionPurchaseDetailProductRateValid" />).
    test('is-decimal', <FormattedMessage id="TransactionPurchaseDetailProductRateValid" />, value => {
      if (value === undefined || value === null) {
        return false;
      }
      const decimalRegex = /^\d+(\.\d{1,2})?$/;
      return decimalRegex.test(value.toString());
    }).required(<FormattedMessage id="TransactionPurchaseDetailProductRateRequired" />),
  // expiryDate: yup
  //   .date()
  //   .required(<FormattedMessage id="TransactionMaterialInwardProductExpDateRequired" />)
  //   .typeError(<FormattedMessage id="TransactionPurchaseDetailProductDeliveryInvalidDateRequired" />)
  //   .test('is-future-or-current-date', <FormattedMessage id="TransactionMaterialInwardExpFutureAndCurrentDateRequired" />, (date) => {
  //     if (!date) return true; // Allow empty date, Yup will handle the required validation
  //     const currentDate = moment().startOf('day');
  //     const selectedDate = moment(date).startOf('day');
  //     return selectedDate.isSameOrAfter(currentDate);
  //   }).test('is-valid-date', <FormattedMessage id="TransactionPurchaseDetailProductDeliveryInvalidDateRequired" />, (date) => {
  //     if (!date || !(date instanceof Date)) return true; // Allow empty date, Yup will handle the required validation
  //     return moment(date, 'DD/MM/YYYY', true).isValid();
  //   })
  //yup.date().min(new Date(), <FormattedMessage id="TransactionPurchaseDetailDeliveryDatePastDate" />).required(<FormattedMessage id="YesterDateVal" />)
});

// ==============================|| MATERIAL INWARD ADD / EDIT  ||============================== //
const purchaseOrderIinitialVal = {
  materialInwardDate: new Date(),
  vendor: '',
  Purchase_detailList: []
};

const AddMaterialInward = ({ addEditStatus, materialInward, onCancel, setUpdated }) => {
  // Get material inward form initial values
  const initialval = {
    id: materialInward?.id || '',
    date: materialInward?.date || new Date(),
    Purchase_Order: materialInward?.purchaserOrderId || '',
    Purchase_documentNumber: materialInward?.purchaseOrder?.documentNumber || '',
    vendor_Name: materialInward?.vendorName || '',
    vendor_Id: materialInward?.vendorId || '',
    Purchase_detail: materialInward?.materialInwardDetails || []
  };

  const initialProductVal = {
    productId: '',
    expiryDate: new Date(),
    quantity: '', rate: ''
  }

  const dispatch = useDispatch();
  const intl = useIntl();
  const portalRef = useRef(null);
  const formikRef = useRef();

  const [add, setAdd] = useState(false);

  //Set initial value
  const [value, setValue] = useState(initialval);
  const [newPOList, setNewPOList] = useState([]);

  // Set material Inward action state
  const [materialInwardAction, setMaterialInwardAction] = useState('');

  // Get vendor list 
  const { vendors } = useSelector((state) => state.vendorSlice);
  const [autoCompleteVendorsOpen, setAutoCompleteVendorsOpen] = useState(false);

  // Get product list
  const { products } = useSelector((state) => state.productSlice);
  const [autoCompleteProductOpen, setAutoCompleteProductOpen] = useState(false);

  //set products list 
  const [productList, setProductList] = useState([])

  //Product form validation for vendor selection it will be visible
  const [purchaseDetailsFlag, setPurchaseDetailsFlag] = useState(false);

  //With PO and Withou PO Toggle state
  const [purchaseOrderFlag, setPurchaseOrderFlag] = useState(false);

  //Validation Date state
  const [purchaseOrderDateVal, setPurchaseOrderDateVal] = useState(materialInward?.date)
  const noOptionsText = intl.formatMessage({ id: 'Norecords' });

  // set one of product atlist one quantity error msg  
  const [filteredPurchase_detailErrMsg, setFilteredPurchase_detailErrMsg] = useState('')

  const [materialInwardDate, setMaterialInwardDate] = useState(new Date());

  //Set role state
  const [role, setRole] = useState(false);

  useEffect(() => {
    // if (addEditStatus === 'edit') {
    // Get role data api call
    dispatch(getByRole())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          // console.log('role', payload.data)
          const getEditSetting = payload.data.filter((val) => val.featureName == 'EditMaterialInward')
          const getEditSettingPermission = getEditSetting.filter((val) => val.hasPermission == true)
          const hasPermission = getEditSettingPermission.length == 0 ? false : getEditSettingPermission[0].hasPermission;
          setRole(hasPermission)
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
      })
    // }
  }, [role]);

  // Cancel the add/ edit material inward operation
  const handleCancel = (resetForm) => {
    setValue({
      id: '',
      date: new Date(),
      Purchase_Order: '',
      Purchase_documentNumber: '',
      vendor_Name: '',
      vendor_Id: '',
      Purchase_detail: []
    })
    setPurchaseDetailsFlag(false)
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    // MI Date reset
    setPurchaseOrderDateVal('')
    setFilteredPurchase_detailErrMsg('')
    // Reset form
    resetForm();
    // Cancel method
    onCancel('cancel');
  };

  //purchase order validation set
  useEffect(() => {
    if (materialInward?.vendorId) {
      setPurchaseDetailsFlag(true)
    }
  }, [])

  useEffect(() => {
    // Get vendor list api call
    dispatch(getVendor())
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
              message: `${intl.formatMessage({ id: 'MasterVendorListErrorMsg' })}`,
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

  // Constructor
  useEffect(() => {
    // Reset status value
    if (addEditStatus === 'add') {
      setMaterialInwardAction(<FormattedMessage id="AddMasterMaterialInward" />);
      setMaterialInwardDate(new Date());
    } else if (addEditStatus === 'edit') {
      setMaterialInwardAction(<FormattedMessage id="EditMasterMaterialInward" />);
      setMaterialInwardDate(materialInward?.date)
    } else if (addEditStatus === 'view') {
      setMaterialInwardAction(<FormattedMessage id="ViewMasterMaterialInward" />);
      setMaterialInwardDate(materialInward?.date)
    }
  }, [addEditStatus]);


  const [isShowHideMainForm, setIsShowHideMainForm] = useState(false);

  /**
  * Handle Add purchase order details 
  * @param {*} materialInward 
  */
  const handleAdd = (materialInward, status) => {

    setRole(true)
    if (materialInward) {

      //Deafult expiry date set to the today date
      const updatedList = materialInward?.purchaseOrder?.purchaseOrderDetails.map((val) => {
        // const material_Inward_Exp_Date = materialInward.purchaseOrder?.date || new Date();
        const material_Inward_Exp_Date = new Date();
        const newExpDate = new Date(material_Inward_Exp_Date);
        newExpDate.setDate(newExpDate.getDate() + val.days - 1);
        val.expiryDate = val.days === 0 ? new Date() : newExpDate;
        val.poQuantity = val.quantity;
        val.mindate = val.days === 0 ? new Date() : val.expiryDate;
        return val;
      })

      setPurchaseOrderDateVal(materialInward.purchaseOrder?.date || new Date())
      //set initial val
      setValue({
        // date: materialInward.purchaseOrder?.date || new Date(),
        date: new Date(),
        Purchase_Order: materialInward.purchaseOrder?.id,
        Purchase_documentNumber: materialInward.purchaseOrder?.documentNumber,
        vendor_Name: materialInward.purchaseOrder?.vendorName,
        vendor_Id: materialInward.vendor?.id,
        Purchase_detail: updatedList
      })
      setPurchaseOrderFlag(true)
    }
    if (status === 'add-start') {
      setIsShowHideMainForm(true);
    } else if (status === 'add' || status === 'cancel') {

      setIsShowHideMainForm(false);
    }
    setAdd(!add);
  };

  /**
  * Handle Submit add/edit material inward form 
  * @param {*} values 
  */
  const handlerCreate = (values, resetForm) => {
    try {

      if (addEditStatus === 'edit') {

        // edit materialInward model
        // const data = removeKeysFromArray(values.Purchase_detail, ['productName', 'rate']);

        // Filter out items with quantity equal to 0
        const filteredPurchase_detail = values.Purchase_detail.filter(item => item.quantity !== 0);
        if (filteredPurchase_detail.length === 0) {
          const noOptionsText = intl.formatMessage({ id: 'hasProductWithQuantityOne' });
          setFilteredPurchase_detailErrMsg(noOptionsText)
        }
        else {
          setFilteredPurchase_detailErrMsg('')
          // Edit materialInward model
          const model = {
            id: values?.id,
            date: values.date,
            materialInwardDetails: filteredPurchase_detail
          }

          // Edit Material Inward API Call
          dispatch(updateMaterialInward({ model }))
            .unwrap()
            .then((payload) => {

              // Check for error & success
              if (payload && payload.isError && payload.errorCode === "E_DEPEDENCY_EXISTS") {
                // Handle error
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'MaterialInwardEditBalanceError' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              } else if (payload.errorCode === 'E_PERMISSIONDEINED') {
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
              } else {
                // Toaster for success
                dispatch(
                  openSnackbar({
                    open: true,
                    message: `${intl.formatMessage({ id: 'TransactionMaterialInwardTostEdit' })}`,
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
                    message: `${intl.formatMessage({ id: 'MaterialInwardEditErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
            });
          // Reset updated flag
          setUpdated(true);
          
          // Cancel method
          onCancel('cancel');
          resetForm()
        }
      }
      else {
        // Filter out items with quantity equal to 0 with PO
        const filteredWithPurchase_detail = values.Purchase_detail?.filter(item => item.quantity !== 0);

        // Filter out items with quantity equal to 0 with out PO
        const filteredWithOutPurchase_detail = values.Purchase_detailList?.filter(item => item.quantity !== 0);

        // Add materialInward model
        const modelWithPO = {
          purchaseOrderId: values.Purchase_Order,
          isPoAvailable: purchaseOrderFlag,
          vendorId: values?.vendor_Id,
          date: values.date,
          materialInwardDetail: filteredWithPurchase_detail
        }
        const modelWithOutPO = {
          isPoAvailable: purchaseOrderFlag,
          vendorId: values.vendor?.id,
          date: values.materialInwardDate,
          materialInwardDetail: filteredWithOutPurchase_detail
        }

        const model = purchaseOrderFlag ? modelWithPO : modelWithOutPO;

        const filteredFlag = purchaseOrderFlag ? (filteredWithPurchase_detail || []).length === 0 : (filteredWithOutPurchase_detail || []).length === 0;
        if (filteredFlag) {
          const noOptionsText = intl.formatMessage({ id: 'hasProductWithQuantityOne' });
          setFilteredPurchase_detailErrMsg(noOptionsText)
        }
        else {
          setFilteredPurchase_detailErrMsg('')
          // Add Material Inward API Call
          dispatch(addMaterialInward({ model }))
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
                    message: `${intl.formatMessage({ id: 'TransactionMaterialInwardTostAdd' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'success'
                    },
                    close: true
                  })
                );

                // Min Date reset
                setPurchaseOrderDateVal('');

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
                    message: `${intl.formatMessage({ id: 'MaterialInwardAddErrorMsg' })}`,
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );

              }
            });
          // Reset updated flag
          setUpdated(true);

          // Cancel method
          onCancel('cancel');
          resetForm()
        }
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (addEditStatus === 'add') {
      setValue({
        id: '',
        date: new Date(),
        Purchase_Order: '',
        Purchase_documentNumber: '',
        vendor_Name: '',
        vendor_Id: '',
        Purchase_detail: []
      })
      setPurchaseOrderFlag(false)
    }
    if (addEditStatus === 'edit' || addEditStatus == 'view') {
      //Deafult mindate date set to the today date
      const updatedList = materialInward?.materialInwardDetails.map((val) => {

        // Create a Date object for the current date and time
        const currentDate = new Date();
        const expiryDate = new Date(val.expiryDate);

        // Remove the time portion to compare only the dates
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const expDay = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());

        // Compare the expiry date with the currentDate
        if (expDay > currentDay) {
          // The expiry date is in the future.
          val.mindate = new Date();
        } else if (expDay < currentDay) {
          // The expiry date is in the past.
          val.mindate = val.expiryDate;
        } else {
          // The expiry date is the same as the current date.
          val.mindate = new Date();
        }

        val.poQuantity = val.quantity
        return val;
      })
      setValue({
        id: materialInward?.id,
        date: materialInward?.date,
        Purchase_Order: materialInward?.purchaserOrderId,
        Purchase_documentNumber: materialInward?.documentNumber,
        vendor_Name: materialInward?.vendorName,
        vendor_Id: materialInward?.vendorId,
        Purchase_detail: updatedList
      })
      setPurchaseOrderDateVal(materialInward?.date)
      setPurchaseOrderFlag(true)
    }
  }, [addEditStatus])

  const onChangeVendorHandle = (values, newValue, setFieldValue) => {
    setFieldValue('vendor', newValue);
    !newValue ? setPurchaseDetailsFlag(false) : setPurchaseDetailsFlag(true)

    // Set frequently purchased products by vendor id model
    const model = {
      id: newValue?.id
    };
    if (newValue) {
      // Get by vendor id frequently purchased products api call
      dispatch(getFrequentlyPurchasedProducts({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError) {
            // Handle error

          } else {
            // Set frequently purchased products
            const frequentlyProduct = payload.data.map((val) => {
              return {
                id: val.productId,
                name: val.productName,
                cost: val.cost,
                days: val.days,
                isExpDate: val.isExpDate
              }
            })
            const filteredProductItems = products?.filter((val) => val.recordStatus === 0).filter(
              (item) => !frequentlyProduct.some((frequentlyAddedItem) => frequentlyAddedItem.id === item.id)
            );

            const groupedOptions = [
              ...frequentlyProduct.map((product) => ({
                ...product,
                groupName: "Frequently Added Products"
              })),
              ...filteredProductItems.map((product) => ({
                ...product,
                groupName: "Other Products"
              }))
            ];

            setProductList(groupedOptions)
            if (formikRef.current) {
              formikRef.current.resetForm();
            }
          }
        })
        .catch((error) => {
          if (error && error.code === "ERR_BAD_REQUEST") {
            dispatch(
              openSnackbar({
                open: true,
                message: 'Purchase order Get by Id: Validation Error.\nInvalid/ empty purchase order id.',
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
      setFieldValue('Purchase_detailList', []);
    }
  }

  // handle calendar date change
  const handleDateChange = (newValue, index, setFieldValue) => {
    setFieldValue(`Purchase_detail.${index}.expiryDate`, newValue);
  };

  // handle calendar opened
  const handleCalendarOpen = (index, setFieldValue) => {
    // Set mindate to current date when calendar is opened to allow only future dates
    setFieldValue(`Purchase_detail.${index}.mindate`, new Date());
  };

  // handle calendar closed
  const handleCalendarClose = (index, setFieldValue, expiryDate) => {

    // Create a Date object for the current date and time
    const currentDate = new Date();
    const expDate = new Date(expiryDate);

    // Remove the time portion to compare only the dates
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const expDay = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());

    // Compare the expiry Date with the currentDate
    if (expDay < currentDay) {
      // The expiry date is in the past.
      // Set minDate to current date when calendar is closed to allow only future dates
      setFieldValue(`Purchase_detail.${index}.mindate`, expiryDate);
    }
  };

  return (
    <MainCard className="edit-purchase-order">
      {!isShowHideMainForm ? <Formik
        enableReinitialize={true}
        initialValues={purchaseOrderFlag ? value : purchaseOrderIinitialVal}
        validationSchema={purchaseOrderFlag ? validationSchema : purchaseOrderValidationSchema}
        onSubmit={(values, { resetForm }) => handlerCreate(values, resetForm)}>

        {({ errors, handleSubmit, values, setFieldValue, touched, resetForm }) => {

          // Set material inward PO list  by giving only added item
          const setMaterialInwardPOList = (item) => {
            // Find the index of the existing product in the Purchase_detailList
            const existingProductIndex = values.Purchase_detailList.findIndex(
              (existingItem) => existingItem.productId === item.productId
            );

            if (existingProductIndex !== -1) {
              // If the product already exists, show an error message
              dispatch(
                openSnackbar({
                  open: true,
                  message: `${intl.formatMessage({ id: 'ProductExitsInMILabel' })}`,
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            } else {
              // If the product doesn't exist, add it to the Purchase_detailList
              const updatedPurchaseDetail = [...values.Purchase_detailList, item];
              setFieldValue('Purchase_detailList', updatedPurchaseDetail);
            }
          };

          return (
            <>
              <Form onSubmit={handleSubmit}>
                <DialogTitle className='model-header'>{materialInwardAction}</DialogTitle>
                <Divider />
                <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <DialogContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4} md={2.5}>
                        <Stack spacing={1}>
                          <InputLabel>{intl.formatMessage({ id: 'Date' })}</InputLabel>
                          <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <StyledDatePicker
                                minDate={purchaseOrderDateVal}
                                maxDate={new Date()}
                                inputFormat="dd/MM/yyyy"
                                value={!purchaseOrderFlag ? values.materialInwardDate : values.date}
                                disabled={addEditStatus === 'view' ? true : false}
                                className={addEditStatus === 'view' ? "disabled-input" : ""}
                                onChange={(newValue) => {
                                  // Ensure newValue is a Date object before setting it
                                  const selectedDate = newValue instanceof Date ? newValue : new Date(newValue);
                                  !purchaseOrderFlag
                                    ? setFieldValue('materialInwardDate', selectedDate)
                                    : setFieldValue('date', selectedDate);
                                  setMaterialInwardDate(selectedDate)

                                  if (!purchaseOrderFlag) {
                                    //Deafult expiry date set to the today date
                                    const updatedWithOutPOList = values?.Purchase_detailList.map((val) => {
                                      // const material_Inward_Exp_Date = materialInward.purchaseOrder?.date || new Date();
                                      const material_Inward_Exp_Date = selectedDate;
                                      const newExpDate = new Date(material_Inward_Exp_Date);
                                      newExpDate.setDate(newExpDate.getDate() + val.days - 1);
                                      val.expiryDate = val.days === 0 ? new Date() : newExpDate;
                                      val.poQuantity = val.quantity;
                                      val.mindate = val.days === 0 ? new Date() : val.expiryDate;
                                      return val;
                                    })
                                    setFieldValue('Purchase_detailList', updatedWithOutPOList)
                                  }
                                  else {
                                    //Deafult expiry date set to the today date
                                    const updatedWithPOList = values?.Purchase_detail.map((val) => {
                                      // const material_Inward_Exp_Date = materialInward.purchaseOrder?.date || new Date();
                                      const material_Inward_Exp_Date = selectedDate;
                                      const newExpDate = new Date(material_Inward_Exp_Date);
                                      newExpDate.setDate(newExpDate.getDate() + val.days - 1);
                                      val.expiryDate = val.days === 0 ? new Date() : newExpDate;
                                      val.poQuantity = val.quantity;
                                      val.mindate = val.days === 0 ? new Date() : val.expiryDate;
                                      return val;
                                    })
                                    setFieldValue('Purchase_detail', updatedWithPOList)
                                  }


                                  if (formikRef.current) {
                                    formikRef.current.resetForm();
                                  }
                                }}
                                renderInput={(params) =>
                                  <TextField
                                    {...params}
                                    value={!purchaseOrderFlag ?
                                      (values.materialInwardDate ? moment(values.materialInwardDate).format('DD/MM/YYYY') : '') :
                                      (values.date ? moment(values.date).format('DD/MM/YYYY') : '')}
                                    inputProps={{
                                      readOnly: true,
                                      onClick: () => params.inputProps.onClick && params.inputProps.onClick()
                                    }}
                                    error={!purchaseOrderFlag ? Boolean(touched.materialInwardDate && errors.materialInwardDate) : Boolean(touched.date && errors.date)}
                                    helperText={!purchaseOrderFlag ? (touched.materialInwardDate && errors.materialInwardDate) : (touched.date && errors.date ? errors.date : '')}
                                  />}
                              />
                            </LocalizationProvider>
                          </FormControl>

                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4} md={3.5}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="Purchase_documentNumber">{intl.formatMessage({ id: 'purchaseOrder' })}</InputLabel>
                          <TextField fullWidth value={values.Purchase_documentNumber || ''}
                            placeholder={intl.formatMessage({ id: 'purchaseorder' })}
                            // disabled={true}
                            className={(touched.Purchase_Order && errors.Purchase_Order) ? 'error-input' : 'disabled-input'}
                            error={Boolean(touched.Purchase_Order && errors.Purchase_Order)}
                            helperText={touched.Purchase_Order && errors.Purchase_Order}
                            InputProps={{
                              classes: {
                                root: (touched.Purchase_Order && errors.Purchase_Order) ? 'error-input' : 'disabled-input',
                                notchedOutline: (touched.Purchase_Order && errors.Purchase_Order) ? 'error-outline' : 'notched-outline',
                              },
                              readOnly: true,
                            }}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4} md={1.6} sx={{ marginTop: '27px' }}>
                        <Button
                          className={addEditStatus === 'edit' || !purchaseOrderFlag || addEditStatus == 'view' ? "disabled-btn" : "btn-outlined-primary add-product"}
                          disabled={!purchaseOrderFlag ? true : false}
                          color="primary"
                          endIcon={<i className='icon-plus ottr-icon icon-size'></i>}
                          variant="outlined"
                          size='large'
                          sx={{ bgcolor: 'transparent !important' }}
                          onClick={() => handleAdd(null, 'add-start')}
                        >
                          {intl.formatMessage({ id: 'Show' })}
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4.4} sx={{ marginTop: '10px' }}>
                        <FormControlLabel
                          // className='show-toggle'
                          value={purchaseOrderFlag}
                          disabled={addEditStatus === 'edit' || addEditStatus == 'view' ? true : false}
                          onChange={(event) => {
                            setPurchaseOrderFlag(event.target.checked);
                            if (!event.target.checked) {
                              // Min date reset 
                              setPurchaseOrderDateVal('');
                              // Reset date
                              setMaterialInwardDate(new Date());
                            }
                            setValue({
                              id: '',
                              date: new Date(),
                              Purchase_Order: '',
                              Purchase_documentNumber: '',
                              vendor_Name: '',
                              vendor_Id: '',
                              Purchase_detail: []
                            })

                          }}
                          style={{ pointerEvents: "none", marginLeft: 0 }}
                          control={<Switch checked={purchaseOrderFlag} color="primary" style={{ pointerEvents: "auto" }} />}
                          label={intl.formatMessage({ id: 'withPurchaseOrder' })}
                          labelPlacement="start"
                          sx={{ mr: 1, mt: 2.5 }}
                        />
                      </Grid>

                    </Grid>
                    <Grid container>
                      <Grid item xs={12} sm={7} md={6} mt={2}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="Vendor-name">{intl.formatMessage({ id: 'Vendor' })}</InputLabel>
                          {purchaseOrderFlag || addEditStatus === 'edit' || addEditStatus == 'view' ?
                            <TextField
                              fullWidth
                              value={values.vendor_Name || ''}
                              id="Vendor-name"
                              placeholder={intl.formatMessage({ id: 'Vendorname' })}
                              className={(touched.Purchase_Order && errors.Purchase_Order) ? 'error-input' : 'disabled-input'}
                              error={Boolean(touched.vendor_Name && errors.vendor_Name)}
                              helperText={touched.vendor_Name && errors.vendor_Name}
                              InputProps={{
                                classes: {
                                  root: touched.vendor_Name && errors.vendor_Name ? 'error-input' : 'disabled-input',
                                  notchedOutline: touched.vendor_Name && errors.vendor_Name ? 'error-outline' : 'notched-outline',
                                },
                                readOnly: true,
                              }}
                            />
                            :
                            <>
                              <Autocomplete
                                disablePortal
                                id="vendor"
                                noOptionsText={noOptionsText}
                                value={values.vendor || null}
                                options={vendors?.filter((val) => val.recordStatus === 0) || []}
                                getOptionLabel={(option) => option ? option.name : ''}
                                onChange={(event, newValue) => onChangeVendorHandle(values, newValue, setFieldValue)}
                                isOptionEqualToValue={(option, value) => {
                                  if (value === '') {
                                    // Handle the case when the value is an empty string
                                    return option === null || option === '';
                                  }
                                  return option && value && option.id === value.id;
                                }}
                                open={autoCompleteVendorsOpen}
                                onInputChange={(event, value, reason) => {
                                  switch (reason) {
                                    case "input":
                                      setAutoCompleteVendorsOpen(!!value);
                                      break;
                                    case "reset":
                                    case "clear":
                                      // Reset Material Inward Details
                                      if (formikRef.current) {
                                        formikRef.current.resetForm();
                                      }
                                      setAutoCompleteVendorsOpen(false);
                                      break;
                                    default:
                                      console.log(reason);
                                  }
                                }}
                                // sx={{ width: 300 }}
                                placeholder={intl.formatMessage({ id: 'SelectVendor' })}
                                renderInput={(params) =>
                                  <TextField {...params}
                                    autoFocus  // Add this attribute to set initial focus on the input field
                                    aria-label={intl.formatMessage({ id: 'SelectVendor' })}
                                    placeholder={intl.formatMessage({ id: 'Search&SelectVendor' })}
                                    size='large'
                                    error={Boolean(touched.vendor && errors.vendor)}
                                    helperText={touched.vendor && errors.vendor ? errors.vendor : ''}
                                  />
                                } />
                            </>
                          }
                        </Stack>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} mb={2} mt={2}>
                      <Typography variant="h5">{intl.formatMessage({ id: 'MaterialInwardDetails' })}</Typography>
                    </Grid>
                    <Grid item xs={12} md={12} mb={1}>
                      <div ref={portalRef} />
                    </Grid>
                    <Grid item xs={12} md={12} sx={{ paddingTop: "5px !important" }}>
                      {touched && touched?.Purchase_detail && errors &&
                        errors?.Purchase_detail && (
                          <FormHelperText error={true}>{errors?.Purchase_detail}</FormHelperText>
                        )}
                      {touched && touched.Purchase_detailList && errors && errors.Purchase_detailList && (

                        <FormHelperText error={true}>{errors?.Purchase_detailList}</FormHelperText>)}
                      {filteredPurchase_detailErrMsg && (
                        <FormHelperText error={true}>{filteredPurchase_detailErrMsg}</FormHelperText>
                      )}
                      <TableContainer className='ottr-table bucket-new-table' sx={{ marginTop: "0px !important" }}>
                        <Table>
                          <TableHead sx={{ border: '0', width: '100%' }}>
                            <TableRow
                              // sx={{ background: '#fafafb', paddingTop: "8px !important" }} 
                              // className='bucket-table-header'
                              sx={{
                                '& > th:first-of-type': { width: '50px' },
                                '& > th:last-of-type': { width: '50px' },
                                '& > th:nth-of-type(2)': { width: '200px' },
                                '& > th:nth-of-type(3)': { width: '150px' },
                                '& > th:nth-of-type(4)': { width: '100px' },
                                '& > th:nth-of-type(5)': { width: '160px' },
                              }}
                            >
                              <TableCell align="left" sx={{ textTransform: 'none' }} >
                                {intl.formatMessage({ id: 'SR.NO.' })}
                              </TableCell>
                              <TableCell sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'ProductName' })}</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Quantity' })}</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'UNITPRICE' })} (₹)</TableCell>
                              <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'ExpiryDate' })}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(!purchaseOrderFlag ?
                              <FieldArray
                                name="Purchase_detailList"
                                render={() => {
                                  const finalPurchaseOrderList = values.Purchase_detailList;
                                  const hasProductWithQuantityGreaterThan1 = values.Purchase_detailList?.some(product => product.quantity > 1);
                                  return (
                                    <>
                                      {finalPurchaseOrderList && finalPurchaseOrderList?.length > 0
                                        ? finalPurchaseOrderList.map((purchaseOrderData, index) => (
                                          <TableRow key={index} sx={{ height: "43px !important" }}>
                                            <TableCell align="left">{index + 1}</TableCell>
                                            <TableCell align="left">
                                              {!purchaseOrderData.productName
                                                ? productList.find((product) => product.id === purchaseOrderData.productId.id)?.name
                                                : purchaseOrderData.productName}
                                            </TableCell>
                                            <TableCell align="right">
                                              <FormControl>
                                                <QuantityInput
                                                  // className={addEditStatus === 'edit' ? "disabled-input" : " "}
                                                  value={Number(purchaseOrderData.quantity)}
                                                  hasProductWithQuantityOne={hasProductWithQuantityGreaterThan1}
                                                  setFilteredPurchase_detailErrMsg={setFilteredPurchase_detailErrMsg}
                                                  id="Purchase_Order"
                                                  onValueChange={(e) => {
                                                    setFieldValue(
                                                      `Purchase_detailList.${index}.quantity`,
                                                      e
                                                    );
                                                  }}
                                                />
                                              </FormControl>
                                              <FormHelperText error={true}>
                                                {errors.Purchase_detailList?.[index]?.quantity}
                                              </FormHelperText>
                                            </TableCell>
                                            <TableCell align="right">{Number(purchaseOrderData.rate)?.toFixed(2)}</TableCell>
                                            <TableCell align="right">
                                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <StyledDatePicker
                                                  inputFormat="dd/MM/yyyy"
                                                  // minDate={new Date()}
                                                  minDate={materialInwardDate}
                                                  name={`Purchase_detailList.${index}.expiryDate`} // Update the name prop dynamically
                                                  onChange={(newValue) => {
                                                    setFieldValue(`Purchase_detailList.${index}.expiryDate`, newValue); // Update the expiryDate for the specific purchaseOrderData
                                                  }}
                                                  value={purchaseOrderData.expiryDate}
                                                  renderInput={(params) => <TextField
                                                    {...params}
                                                    value={purchaseOrderData.expiryDate ? moment(purchaseOrderData.expiryDate).format('DD/MM/YYYY') : ''}
                                                    inputProps={{
                                                      readOnly: true, // Disable direct input
                                                      onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                                                    }}
                                                  />}
                                                />

                                              </LocalizationProvider>
                                              {/* <FormHelperText error={true}>
                                                {errors.Purchase_detailList?.[index]?.expiryDate}
                                              </FormHelperText> */}
                                            </TableCell>
                                          </TableRow>
                                        ))
                                        : <TableRow>
                                          <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                                            {intl.formatMessage({ id: 'NoRecord' })}
                                          </TableCell>
                                        </TableRow>}
                                    </>
                                  );
                                }}
                              /> :
                              <FieldArray
                                name="Purchase_detail"
                                render={() => {
                                  const finalPurchaseOrderList = values.Purchase_detail;
                                  const hasProductWithQuantityGreaterThan1 = values.Purchase_detail?.some(product => product.quantity > 1);
                                  return (
                                    <>
                                      {finalPurchaseOrderList && finalPurchaseOrderList?.length > 0
                                        ? finalPurchaseOrderList.map((purchaseOrderData, index) => (
                                          <TableRow key={index} sx={{ height: "43px !important" }}>
                                            <TableCell align="left">{index + 1}</TableCell>
                                            <TableCell align="left">
                                              {!purchaseOrderData?.productName
                                                ? productList.find((product) => product.id === purchaseOrderData.productId.id)?.name
                                                : purchaseOrderData?.productName}
                                            </TableCell>
                                            <TableCell align="right">
                                              <FormControl>
                                                <QuantityInput
                                                  disabled={addEditStatus === 'view' ? true : false}
                                                  className={addEditStatus === 'view' ? "disabled-input" : ""}
                                                  incrementDisableFlag={purchaseOrderFlag}
                                                  isPoAvailable={addEditStatus === 'add' ? true : materialInward.isPoAvailable}
                                                  value={Number(purchaseOrderData.quantity)}
                                                  poQuantity={Number(purchaseOrderData.poQuantity)}
                                                  setFilteredPurchase_detailErrMsg={setFilteredPurchase_detailErrMsg}
                                                  hasProductWithQuantityOne={hasProductWithQuantityGreaterThan1}
                                                  id="Purchase_Order"
                                                  onValueChange={(e) => {
                                                    setFieldValue(
                                                      `Purchase_detail.${index}.quantity`,
                                                      e
                                                    )
                                                  }}
                                                />
                                              </FormControl>
                                              <FormHelperText error={true}>
                                                {errors.Purchase_detail?.[index]?.quantity}
                                              </FormHelperText>
                                            </TableCell>
                                            <TableCell align="right">{Number(purchaseOrderData.rate)?.toFixed(2)}</TableCell>
                                            <TableCell align="right">
                                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <StyledDatePicker
                                                  inputFormat="dd/MM/yyyy"
                                                  disabled={addEditStatus === 'view' ? true : false}
                                                  className={addEditStatus === 'view' ? "disabled-input" : " "}
                                                  // minDate={purchaseOrderData.mindate}
                                                  minDate={materialInwardDate}
                                                  name={`Purchase_detail.${index}.expiryDate`}
                                                  onChange={(newValue) => handleDateChange(newValue, index, setFieldValue)}
                                                  onOpen={() => handleCalendarOpen(index, setFieldValue)} // Use onOpen event
                                                  onClose={() => handleCalendarClose(index, setFieldValue, purchaseOrderData.expiryDate)} // Use onClose event
                                                  value={purchaseOrderData.expiryDate}
                                                  renderInput={(params) => (
                                                    <TextField
                                                      {...params}
                                                      value={purchaseOrderData.expiryDate ? moment(purchaseOrderData.expiryDate).format('DD/MM/YYYY') : ''}
                                                      inputProps={{
                                                        readOnly: true,

                                                      }}
                                                    />
                                                  )}
                                                />
                                              </LocalizationProvider>
                                              {/* <FormHelperText error={true}>
                                                {errors.Purchase_detail?.[index]?.expiryDate}
                                              </FormHelperText> */}
                                            </TableCell>
                                          </TableRow>
                                        ))
                                        : <TableRow>
                                          <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                                            {intl.formatMessage({ id: 'NoRecord' })}
                                          </TableCell>
                                        </TableRow>}
                                    </>
                                  );
                                }}
                              />
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </DialogContent>
                </ScrollX>

                <Divider />
                <DialogActions sx={{ p: 2.5 }} className='model-footer'>
                  <Grid container justifyContent="end" alignItems="center">
                    <Grid item>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                          className="gray-outline-btn"
                          variant="text"
                          color="secondary"
                          onClick={() => handleCancel(resetForm)}
                          sx={{ color: 'secondary.dark' }}
                        >
                          {intl.formatMessage({ id: 'cancel' })}
                        </Button>
                        {addEditStatus == 'view' ? '' :
                          <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                          >
                            {addEditStatus === 'edit' ? <FormattedMessage id="save" /> : <FormattedMessage id="create" />}
                          </Button>}
                      </Stack>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Form>
              {purchaseOrderFlag || addEditStatus !== 'edit' && (<Portal container={portalRef.current}>
                <Formik
                  innerRef={formikRef}
                  initialValues={initialProductVal}
                  validationSchema={validationSchemaForAddProductForm}
                  onSubmit={(values, { setSubmitting, resetForm }) => {
                    // new purchase detail list
                    const newPOObjUpdated = {
                      productId: values.productId.id,
                      days: values.productId.days,
                      productName: values.productId.name,
                      quantity: Number(values.quantity),
                      rate: Number(values.rate),
                      expiryDate: values.expiryDate,
                    }

                    const newPOListUpdated = [...newPOList, newPOObjUpdated];
                    setNewPOList(newPOListUpdated);

                    // Reset purchase detail list
                    setMaterialInwardPOList(newPOObjUpdated);

                    // Reset submitting flag
                    setSubmitting(true);

                    // Reset form
                    resetForm();

                    //Focus set to product autocomplete input
                    productRef.focus();
                  }}
                >
                  {({ errors, handleSubmit, values, setFieldValue, touched }) => {
                    return (
                      <Form onSubmit={handleSubmit}>
                        <Grid container spacing={1} sx={{ marginTop: "-10px !important" }}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Stack spacing={1}>
                              <InputLabel>{intl.formatMessage({ id: 'Product Name' })}</InputLabel>
                              <FormControl sx={{ width: '100%' }}>

                                <Autocomplete
                                  disablePortal
                                  id="productId"
                                  noOptionsText={noOptionsText}
                                  value={values.productId || null}
                                  disabled={!purchaseDetailsFlag ? true : false}
                                  className={!purchaseDetailsFlag ? 'disabled-input' : ''}
                                  groupBy={(option) => option.groupName} // Group options based on groupName property
                                  options={productList}
                                  getOptionLabel={(option) => option ? option.name : ''}
                                  onChange={(event, newValue) => {
                                    setFieldValue('productId', newValue);
                                    if (newValue) {
                                      const priceOfProduct = productList.filter((val) => val?.id === newValue?.id)
                                      setFieldValue('rate', priceOfProduct[0]?.cost);
                                      if (priceOfProduct[0].days === 0) {
                                        setFieldValue('expiryDate', new Date());
                                      }
                                      else {
                                        const newExpDate = new Date(materialInwardDate);
                                        newExpDate.setDate(newExpDate.getDate() + priceOfProduct[0].days - 1);
                                        setFieldValue('expiryDate', newExpDate);
                                      }
                                    }
                                    else {
                                      setFieldValue('rate', '');
                                      setFieldValue('expiryDate', new Date());
                                    }
                                    setPurchaseDetailsFlag(true)
                                  }}
                                  open={autoCompleteProductOpen}
                                  onInputChange={(event, value, reason) => {
                                    switch (reason) {
                                      case "input":
                                        setAutoCompleteProductOpen(!!value);
                                        break;
                                      case "reset":
                                      case "clear":
                                        setAutoCompleteProductOpen(false);
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
                                  placeholder={intl.formatMessage({ id: 'Select Product' })}
                                  renderInput={(params) => <TextField {...params}
                                    inputRef={input => {
                                      productRef = input;
                                    }}
                                    aria-label={intl.formatMessage({ id: 'Select Product' })}
                                    placeholder={intl.formatMessage({ id: 'Search&SelectProduct' })}
                                    size='large'
                                    error={values.productId ? false : (Boolean(touched.productId && errors.productId))}
                                    helperText={values.productId ? '' : (touched.productId && errors.productId ? errors.productId : '')}
                                  />}
                                />
                              </FormControl>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6} md={2}>
                            <Stack spacing={1}>
                              <InputLabel>{intl.formatMessage({ id: 'Quantity' })}</InputLabel>
                              <FormControl sx={{ width: '100%' }}>
                                <TextField
                                  name="quantity"
                                  id="filled-number"
                                  disabled={!purchaseDetailsFlag ? true : false}
                                  className={!purchaseDetailsFlag ? 'disabled-input' : ''}
                                  placeholder={intl.formatMessage({ id: 'Quantity' })}
                                  onChange={($event) => {
                                    const value = $event.target.value;
                                    // const sanitizedValue = value.replace(/^0+/, ''); // 
                                    // Removes leading '0's and Remove decimal points from the input
                                    const sanitizedValue = value.replace(/^0+|[^0-9]/g, '');
                                    setFieldValue('quantity', sanitizedValue);
                                  }}
                                  value={values.quantity || ''}
                                  error={Boolean(errors.quantity && touched.quantity)}
                                  helperText={touched.quantity && errors.quantity ? errors.quantity : ''}
                                  inputProps={{
                                    className: 'align-right', // Add the custom class for aligning the text to the right
                                    style: { textAlign: 'right' } // Add inline style for text alignment
                                  }}
                                />
                              </FormControl>
                            </Stack>
                            {/* {touched.quantity && errors?.quantity && <FormHelperText error={true}>{errors?.quantity}</FormHelperText>} */}
                          </Grid>
                          <Grid item xs={12} sm={6} md={2}>
                            <Stack spacing={1}>
                              <InputLabel>{intl.formatMessage({ id: 'UNITPRICE' })}</InputLabel>
                              {/* <FormControl sx={{ width: '100%' }}> */}
                              <FormControl variant="outlined">
                                <OutlinedInput
                                  name="rate"
                                  id="outlined-start-adornment"
                                  placeholder='0.0'
                                  // disabled={!purchaseDetailsFlag ? true : false}
                                  // className={!purchaseDetailsFlag ? 'disabled-input' : ''}
                                  sx={{
                                    pointerEvents: 'none',
                                    borderColor: '#ccc'
                                  }}
                                  readOnly={true}
                                  startAdornment={<InputAdornment position="start">₹</InputAdornment>}
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
                                    setFieldValue('rate', sanitizedValue);
                                  }}
                                  value={values.rate || ''}
                                  error={Boolean(errors.rate && touched.rate)}
                                  inputProps={{
                                    pattern: '^\\S*$',
                                    className: 'align-right', // Add the custom class for aligning the text to the right
                                    style: { textAlign: 'right' } // Add inline style for text alignment
                                  }}
                                />
                              </FormControl>
                              {/* </FormControl> */}
                              {touched.rate && errors?.rate && <FormHelperText error={true} sx={{ marginTop: '3px !important' }}>{errors?.rate}</FormHelperText>}
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6} md={2.1}>
                            <Stack spacing={1}>
                              <InputLabel>{intl.formatMessage({ id: 'ExpiryDate' })}</InputLabel>
                              <Stack spacing={1}>
                                <FormControl sx={{ width: '100%' }}
                                // error={Boolean(touched.expiryDate && errors.expiryDate)}
                                >
                                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <StyledDatePicker
                                      // minDate={futureDate}
                                      minDate={materialInwardDate}
                                      disabled={!purchaseDetailsFlag ? true : false}
                                      className={!purchaseDetailsFlag ? 'disabled-input' : ''}
                                      inputFormat="dd/MM/yyyy"
                                      name="expiryDate"
                                      renderInput={(params) => <TextField {...params}
                                        value={values.expiryDate ? moment(values.expiryDate).format('DD/MM/YYYY') : ''} // Display the selected date value
                                        inputProps={{
                                          readOnly: true, // Disable direct input
                                          onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                                        }}
                                      // error={Boolean(touched.expiryDate && errors.expiryDate)}
                                      // helperText={touched.expiryDate && errors.expiryDate ? errors.expiryDate : ''}
                                      />}
                                      onChange={(newValue) => {
                                        setFieldValue('expiryDate', newValue);
                                      }}
                                      value={values.expiryDate}
                                    />
                                  </LocalizationProvider>
                                </FormControl>
                              </Stack>
                            </Stack>
                            {/* {touched.expiryDate && errors.expiryDate && (
                              <FormHelperText error={true}>{errors.expiryDate}</FormHelperText>
                            )} */}
                          </Grid>
                          <Grid item xs={12} md={1} sx={{ marginTop: '28px' }}>
                            <Box>
                              <Button
                                type="submit"
                                color="primary"
                                variant="outlined"
                                endIcon={<i className='icon-plus ottr-icon icon-size'></i>}
                                disabled={!purchaseDetailsFlag ? true : false}
                                className={!purchaseDetailsFlag ? 'disabled-input' : "btn-outlined-primary add-product"}
                                sx={{ bgcolor: 'transparent !important', py: "6px !important" }}
                                size='large'
                              >
                                {intl.formatMessage({ id: 'Add' })}
                              </Button>
                            </Box>
                          </Grid>
                          {/* <Grid item xs={12} sm={6} md={1}>
                            {touched.Purchase_detail && errors.Purchase_detail && (
                              <FormHelperText error={true}>{errors.Purchase_detail}</FormHelperText>
                            )}
                          </Grid> */}
                        </Grid>
                      </Form>
                    );
                  }}
                </Formik>
              </Portal>)}
            </>
          );
        }}
      </Formik> : ''}

      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        // onClose={handleAdd}
        onClose={() => setAdd(true)}
        open={add}
        BackdropProps={{ open: true }}
        sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <PurchaseOrderDetails value={value} onCancel={handleAdd} />
      </Dialog>
    </MainCard>
  );
};

AddMaterialInward.propTypes = {
  materialInward: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddMaterialInward;