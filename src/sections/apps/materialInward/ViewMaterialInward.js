import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
// import { useTheme } from '@mui/material/styles';

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import * as yup from 'yup';

// project import

import MainCard from 'components/MainCard';

import { PopupTransition } from 'components/@extended/Transitions';
import PurchaseOrderDetails from './PurchaseOrderDetails';
// import PurchaseOrderItem from 'sections/apps/PurchaseOrder/PurchaseOrderItem';

// import incrementer from 'utils/incrementer';
import { useDispatch } from 'store';
import { getInvoiceList } from 'store/reducers/invoice';
import { openSnackbar } from 'store/reducers/snackbar';

// assets
import { PlusOutlined } from '@ant-design/icons';
import ScrollX from 'components/ScrollX';

const validationSchema = yup.object({
  date: yup.date().required('date is required'),
  Purchase_Order: yup.string().required('Purchase_Order selection is required'),
  vendor_Name: yup.string().required('vendor_Name is required'),
  Purchase_detail: yup
    .array()
    .required('Invoice details is required')
    .of(
      yup.object().shape({
        name: yup.string().required('Product name is required'),
        rate: yup.string().required('rate is required'),
        qty: yup.string().required('required'),
        expiry: yup.date().min(new Date(), 'Selected date must be after today').required('required')
      })
    )
    .min(1, 'Invoice must have at least 1 items')
});

// ==============================|| INVOICE - AddMaterialInward ||============================== //

const AddMaterialInward = ({ customer, onCancel }) => {
  const dispatch = useDispatch();

  const handleCancel = () => {
    onCancel();
  };
  const [add, setAdd] = useState(false);
  const handleAdd = () => {
    setAdd(!add);
  };
  const handlerCreate = (values) => {
    const NewList = {
      date: format(values.date, 'MM/dd/yyyy'),
      store: values.store,
      vendor: values.vendor,
      Purchase_detail: values.Purchase_detail
    };
    console.log('newlist', NewList);
    dispatch(getInvoiceList()).then(() => {
      dispatch(getInvoiceInsert(NewList)).then(() => {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Purchase order added Added successfully',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
      });
    });
  };
 
  const initialval = {
    date: new Date(),
    Purchase_Order: '12123',
    vendor_Name: 'Nisarg Keluskar',
    Purchase_detail: [
      { name: 'Item 1', rate: 10, qty: '3', expiry: new Date() },
      { name: 'Item 2', rate: 20, qty: '4', expiry: new Date() }
    ]
  };

  //   const onChange = (e) => {
  //     setData({ ...data, [e.target.name]: e.target.value });
  //   };

  return (
    <MainCard className="edit-purchase-order">
        <Formik
          initialValues={initialval}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log('subitted', values);
            console.log('err : ', errors);
            handlerCreate(values);
          }}
        >
          {({ errors, handleSubmit, values, setFieldValue, touched, resetForm }) => {
            return (
              <Form onSubmit={handleSubmit}>
                <DialogTitle>{customer ? 'Add Material Inward' : 'Edit Material Inward'}</DialogTitle>
                <Divider />
                <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}> 
                <DialogContent>
                <Grid container spacing={3}>
                  <Grid sx={{ }} item xs={12} sm={5} md={5}>
                    <Stack item xs={3} spacing={1}>
                      <InputLabel>Date</InputLabel>
                      <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            inputFormat="dd/MM/yyyy"
                            value={values.date}
                            onChange={(newValue) => setFieldValue('date', newValue)}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        </LocalizationProvider>
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid  item xs={12} sm={7} md={7} className='purchase-order-field'>
                    <Stack spacing={1} width="100%" mr={2}>
                      <InputLabel htmlFor="Purchase_Order">Purchase Order</InputLabel>
                      <TextField fullWidth value={values.Purchase_Order} placeholder="Purchase Order" />
                    </Stack>
                    {touched.Purchase_Order && errors.Purchase_Order && (
                      <FormHelperText error={true}>{errors.Purchase_Order}</FormHelperText>
                    )}
                    <Box>
                      <Button
                        // type="submit"
                        color="primary"
                        startIcon={<PlusOutlined />}
                        variant="dashed"
                        sx={{ bgcolor: 'transparent !important' }}
                        onClick={handleAdd}
                      >
                        Show
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6} md={4} mt={1}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="Vendor-name">Vendor Name</InputLabel>
                    <TextField fullWidth value={values.vendor_Name} id="Vendor-name" placeholder="Enter Product Name" />
                  </Stack>
                  {touched.vendor_Name && errors.vendor_Name && <FormHelperText error={true}>{errors.vendor_Name}</FormHelperText>}
                </Grid>

                <Divider />

                <Grid item xs={12} mt={2} mb={2}>
                  <Typography variant="h5" sx={{fontSize:'16px'}}>Purchase Order Details</Typography>
                </Grid>

                <Grid item xs={12}>
                  <TableContainer>
                    <Table>
                    <TableHead sx={{border:'0' }}>
                        <TableRow sx={{background:'#fafafb'}}>
                          <TableCell sx={{ width: '50px' }} align="left">
                            Sr.no.
                          </TableCell>
                          <TableCell sx={{ width: '310px' }}>Name</TableCell>
                          <TableCell align="right">Rate</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Exp. Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {values.Purchase_detail?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell align="left">{index + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.rate}</TableCell>
                            <TableCell align="right">
                              <FormControl>
                                <TextField
                                  sx={{ width: '60px' }}
                                  name={`Purchase_detail[${index}].qty`}
                                  value={item.qty}
                                  // onChange={(e) => setFieldValue(`Purchase_detail[${index}].qty`, e.target.value)}
                                  fullWidth
                                  id="Purchase_Order"
                                  placeholder="Quantity"
                                />
                                {touched.Purchase_detail &&
                                  touched.Purchase_detail[index] &&
                                  errors.Purchase_detail &&
                                  errors.Purchase_detail[index] && (
                                    <FormHelperText error={true}>{errors.Purchase_detail[index].qty}</FormHelperText>
                                  )}
                              </FormControl>
                            </TableCell>
                            <TableCell align="right">
                              <FormControl>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                  <DesktopDatePicker
                                    sx={{ width: '250px' }}
                                    name={`Purchase_detail[${index}].expiry`}
                                    inputFormat="dd/MM/yyyy"
                                    value={item.expiry}
                                    // onChange={(e) => setFieldValue(`Purchase_detail[${index}].expiry`, e)}
                                    renderInput={(params) => <TextField {...params} />}
                                  />
                                </LocalizationProvider>
                              </FormControl>
                              {touched.Purchase_detail &&
                                touched.Purchase_detail[index] &&
                                errors.Purchase_detail &&
                                errors.Purchase_detail[index] && (
                                  <FormHelperText error={true}>{errors.Purchase_detail[index].expiry}</FormHelperText>
                                )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                </DialogContent>
                </ScrollX>
                <Divider />
                <DialogActions>
                <Grid item xs={12} sm={6} mt={1} mr={2} pb={1}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={2} sx={{ height: '100%' }}>
                    <Button
                    className='gray-outline-btn'
                      variant="text"
                      color="secondary"
                      onClick={() => {
                        setFieldValue(values.Purchase_detail, null);
                        resetForm();
                        handleCancel();
                      }}
                      sx={{ color: 'secondary.dark' }}
                    >
                      Cancel
                    </Button>
                    {/* <Button
                      color="primary"
                      variant="contained"
                      type="submit"
                      onClick={() => {
                        console.log('errors : ', errors);
                      }}
                    >
                      Create & Send
                    </Button> */}
                  </Stack>
                </Grid>
                </DialogActions>
              </Form>
            );
          }}
        </Formik>

      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        {/* <PurchaseOrderDetails customer={customer} onCancel={handleAdd} /> */}
        <PurchaseOrderDetails onCancel={handleAdd} />
      </Dialog>
    </MainCard>
  );
};

AddMaterialInward.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddMaterialInward;
