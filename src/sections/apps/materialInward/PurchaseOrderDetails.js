// React apis
import * as React from 'react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// Material-ui
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Autocomplete,
  Grid,
  TableHead,
  TableRow,
  Link,
  Stack,
  Button,
  Typography,
  DialogTitle,
  Divider,
  DialogContent,
  DialogActions,

} from '@mui/material';

// Third-party Package Apis
import { useFormik } from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import { FormattedMessage, useIntl } from 'react-intl';

// Services
import { getVendorIdByPurchaseOrder, getByIdPurchaseOrder } from '_api/transactions/material_Inward'
import { useDispatch, useSelector } from 'react-redux';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import ScrollX from 'components/ScrollX';

// validation schema
const validationSchema = yup.object({
  vendor: yup.object().required(<FormattedMessage id="TransactionPurchaseOrderVendorNameRequired" />).nullable()
});

// ==============================|| PURCHASE ORDER DETAILS  ||============================== //

const PurchaseOrderDetails = ({ value, onCancel }) => {

  // Set Purchase Order Details List
  const [purchaseOrderDetailsList, setPurchaseOrderDetailsList] = useState([]);

  // Clear Purchase Order Data flag
  const [purchaseOrderDataCleanFlag, setPurchaseOrderDataCleanFlag] = useState(false);

  // Get vendor list, loading flag & another parameters
  const { vendors } = useSelector((state) => state.vendorSlice);
  const [autoCompleteVendorsOpen, setAutoCompleteVendorsOpen] = useState(false);

  // Submit Purchase Order Details Form
  const formik = useFormik({
    initialValues: {
      vendor: '',
    },
    validationSchema,
    onSubmit: async (values) => {

      // Set get vendor by id model
      const model = {
        id: values.vendor.id
      };

      vendorIdByPurchaseOrder(model)
    }
  });

  const dispatch = useDispatch();
  const intl = useIntl();
  const noOptionsText = intl.formatMessage({ id: 'Norecords' });

  useEffect(() => {
    if (!value.vendor_Id) {
      formik.resetForm();
      setPurchaseOrderDetailsList([])
    }
  }, [value])

  const handleCancel = () => {
    if (!purchaseOrderDataCleanFlag) {
      // Reset form
      formik.resetForm();
      setPurchaseOrderDetailsList([])
    }
    // Cancel method call
    onCancel(null, "cancel");
  };

  //Get Purchase Order Details API Call
  const vendorIdByPurchaseOrder = (model) => {

    // Get by id vendor api call
    dispatch(getVendorIdByPurchaseOrder({ model })).then((response) => {

      // Process get by id api response
      if ((response.payload && response.payload.isError) || !!response.error) {

        if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'MasterVendorGetByIdErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      }
      else {
        //Set Puchase Order Details List
        setPurchaseOrderDetailsList(response.payload.data);
      }
    });
  }

  /**
   * Get Purchase Order Id by id
   * @param {*} product
   */
  const handlePurchaseOrderIDClick = (product) => {
    const model = {
      id: product.purchaserOrderId,
    };

    setPurchaseOrderDataCleanFlag(true)
    // Get by id Purchase Order api call
    dispatch(getByIdPurchaseOrder({ model })).then((response) => {
      // Process get by id api response
      if ((response.payload && response.payload.isError) || !!response.error) {
        if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: 'Purchase Order Get by Id: Validation Error.\nInvalid/ empty purchase order id.',
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      }
      else {
        const selectedpurchaseOrderDetailsList = purchaseOrderDetailsList.filter((val)=> val.purchaserOrderId ==product.purchaserOrderId)

        const POAndMIDependenceList = selectedpurchaseOrderDetailsList.map((item1) => {
          const item2 = response.payload.data.purchaseOrderDetails.find((item2) => item2.productName === item1.productName);
          if (item2) {
            return {
              ...item2,
              quantity: item1.quantity
            };
          }
          return item1;
        });

        var obj = {
          vendor: formik.values.vendor,
          purchaseOrder: {
            ...response.payload.data,
            purchaseOrderDetails: POAndMIDependenceList
          }
        }
        onCancel(obj, "add");
      }
    });
  }

  const renderedRows = [];

  purchaseOrderDetailsList.forEach((product, index) => {
    const isFirstProductForOrderAndVendor =
      index === 0 ||
      purchaseOrderDetailsList[index - 1].purchaserOrderId !== product.purchaserOrderId

    const row = (
      <TableRow key={index} mx={1} mt={1} sx={{ height: "42px !important" }}>
        {isFirstProductForOrderAndVendor ? (
          <TableCell>
            <Link
              component="button"
              variant="body2"
              onClick={() => handlePurchaseOrderIDClick(product)}
            >
              {product.documentNumber}
            </Link>
          </TableCell>
        ) : (
          <TableCell>
          </TableCell>
        )}
        <TableCell>{moment(product.date).format('DD/MM/YYYY')}</TableCell>
        <TableCell>{product?.productName}</TableCell>
        <TableCell align="right">{product?.quantity}</TableCell>
        <TableCell align='right'>{moment(product.deliveryDate).format('DD/MM/YYYY')}</TableCell>
      </TableRow>
    );

    renderedRows.push(row);
  });

  return (
    <Grid container>
      <Grid item xs={12} pb={2}>
        <Stack>
          <form onSubmit={formik.handleSubmit} id="material-inward-vendor-forms">
            <DialogTitle className='model-header'>{intl.formatMessage({ id: 'purchaseOrder' })}</DialogTitle>
            <Divider />
            <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}>
              <DialogContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{ width: '100%' }}>
                  <Grid item xs={12} sm={5}>
                    <Typography variant="subtitle1" mb={1}>{intl.formatMessage({ id: 'Vendor' })}</Typography>
                    <Autocomplete
                      disablePortal
                      id="vendor"
                      noOptionsText={noOptionsText}
                      value={formik.values.vendor || null}
                      options={vendors || []}
                      getOptionLabel={(option) => option ? option.name : ''}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('vendor', newValue);
                        if (newValue) {
                          // Set get vendor by id model
                          const model = {
                            id: newValue.id
                          };

                          vendorIdByPurchaseOrder(model)
                        }
                        else {
                          setPurchaseOrderDetailsList([]);
                        }
                      }}
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
                            setAutoCompleteVendorsOpen(false);
                            break;
                          default:
                            console.log(reason);
                        }
                      }}
                      // sx={{ width: 350 }}
                      renderInput={(params) => <TextField {...params}
                       aria-label={intl.formatMessage({ id: 'SelectVendor' })} 
                       placeholder={intl.formatMessage({ id: 'Search&SelectVendor' })} size='large'
                       error={Boolean(formik.touched?.vendor && formik?.errors.vendor)}
                       helperText={formik?.touched.vendor && formik?.errors.vendor ? formik?.errors.vendor : ''}
                        />}
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={7} mt={4} ml={3}>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="btn-outlined-primary add-product"
                      sx={{ bgcolor: 'transparent !important', py: "6px !important" }}
                      size='large'
                      type="submit"
                    >
                      {intl.formatMessage({ id: 'Show' })}
                    </Button>
                  </Grid> */}
                </Stack>
                <Grid item xs={12} mb={0} sx={{ marginTop: '20px', marginBottom: '20px' }}>
                  <Typography variant="h5">{intl.formatMessage({ id: 'PurchaseOrderDetails' })}</Typography>
                </Grid>

                <TableContainer className='ottr-table bucket-new-table' sx={{ marginTop: "-15px !important" }}>
                  <Table>
                    <TableHead sx={{ border: '0', paddingTop: "8px !important" }}>
                      <TableRow sx={{ background: '#fafafb', paddingTop: "8px !important" }} className='bucket-table-header'>
                        <TableCell align="left" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'PO.NO.' })}</TableCell>
                        <TableCell align="left" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Date' })}</TableCell>
                        <TableCell sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'ProductName' })}</TableCell>
                        <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'Quantity' })}</TableCell>
                        <TableCell align="right" sx={{ textTransform: 'none' }}>{intl.formatMessage({ id: 'DeliveryDate' })}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{renderedRows.length > 0 ? renderedRows :
                      <TableRow>
                        <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                          {intl.formatMessage({ id: 'NoRecord' })}
                        </TableCell>
                      </TableRow>
                    }</TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
            </ScrollX>

            <Divider />
            <DialogActions sx={{ p: 2.5, marginBottom: "-15px" }} className='model-footer'>
              <Grid container justifyContent="end" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      className="gray-outline-btn"
                      variant="text"
                      color="secondary"
                      onClick={handleCancel}
                      sx={{ color: 'secondary.dark' }}>
                      {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </form>
        </Stack>
      </Grid>
    </Grid>
  );
};

PurchaseOrderDetails.propTypes = {
  onCancel: PropTypes.func
};

export default PurchaseOrderDetails;