import { useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
// import { useTheme } from '@mui/material/styles';

import {
  Box,
  Button,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  DialogTitle,
  OutlinedInput,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as yup from 'yup';
import { format } from 'date-fns';
import { FieldArray, Form, Formik } from 'formik';

// project import

import MainCard from 'components/MainCard';
// import PurchaseOrderItem from 'sections/apps/PurchaseOrder/PurchaseOrderItem';

// import incrementer from 'utils/incrementer';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { getInvoiceList } from 'store/reducers/invoice';

// assets
// import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import ScrollX from 'components/ScrollX';

const validationSchema = yup.object({
  date: yup.date().required('order date is required'),
  store: yup.string().required('Store selection is required'),
  vendor: yup.string().required('Vendor selection is required'),
  Purchase_detail: yup
    .array()
    .required('Invoice details is required')
    .of(
      yup.object().shape({
        Material_name: yup.string().required('Product name is required'),
        qty: yup.string().required('Product name is required'),
        price: yup.string().required('Product name is required')
      })
    )
    .min(1, 'Invoice must have at least 1 items')
});

// ==============================|| INVOICE - ViewPurchaseOrder ||============================== //

const ViewPurchaseOrder = ({ customer, onCancel }) => {
  const dispatch = useDispatch();

  const [data, setData] = useState({
    Material_name: '',
    qty: '',
    price: ''
  });

  const handleCancel = () => {
    onCancel();
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
    store: '',
    vendor: '',
    Purchase_detail: []
  };

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

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
          {({ errors, handleChange, handleSubmit, values, setFieldValue, getFieldProps, touched, resetForm }) => {
            return (
              <Form onSubmit={handleSubmit}>
                <DialogTitle>{customer ? 'view Purchase Order' : 'view no purchase Order'}</DialogTitle>
                <Divider />
                <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}> 
                <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1}>
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
                    {touched.date && errors.date && <FormHelperText error={true}>{errors.date}</FormHelperText>}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Stack spacing={1}>
                      <InputLabel>Store</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={values.store}
                          displayEmpty
                          name="store"
                          {...getFieldProps('store')}
                          renderValue={(selected) => {
                            if (selected.length === 0) {
                              return <Box sx={{ color: 'secondary.400' }}>Select store</Box>;
                            }
                            return selected;
                            // return selected.join(', ');
                          }}
                          onChange={handleChange}
                        >
                          <MenuItem disabled value="">
                            Select store
                          </MenuItem>
                          <MenuItem value="Paid">Paid</MenuItem>
                          <MenuItem value="Unpaid">Unpaid</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    {touched.store && errors.store && <FormHelperText error={true}>{errors.store}</FormHelperText>}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Stack spacing={1}>
                      <InputLabel>Vendor</InputLabel>
                      <FormControl sx={{ width: '100%' }}>
                        <Select
                          value={values.vendor}
                          displayEmpty
                          name="vendor"
                          renderValue={(selected) => {
                            if (selected.length === 0) {
                              return <Box sx={{ color: 'secondary.400' }}>Select vendor</Box>;
                            }
                            return selected;
                            // return selected.join(', ');
                          }}
                          onChange={handleChange}
                        >
                          <MenuItem disabled value="">
                            Select vendor
                          </MenuItem>
                          <MenuItem value="Paid">Paid</MenuItem>
                          <MenuItem value="Unpaid">Unpaid</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                    {touched.vendor && errors.vendor && <FormHelperText error={true}>{errors.vendor}</FormHelperText>}
                  </Grid>

                  <Divider />

                  <Grid item xs={12} mb={-2}>
                    <Typography variant="h5">Purchase Detail</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FieldArray
                      name="Purchase_detail"
                      render={() => {
                        return (
                          <>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                              <Grid item xs={12} sm={6} md={3}>
                                <FormControl sx={{ width: '100%' }}>
                                  <Select
                                    value={data.Material_name}
                                    displayEmpty
                                    name="Material_name"
                                    renderValue={(selected) => {
                                      if (selected.length === 0) {
                                        return <Box sx={{ color: 'secondary.400' }}>Select Material</Box>;
                                      }
                                      return selected;
                                      // return selected.join(', ');
                                    }}
                                    onChange={onChange}
                                    error={Boolean(errors.Purchase_detail && touched.Purchase_detail)}
                                  >
                                    <MenuItem disabled value="">
                                      Select material
                                    </MenuItem>
                                    <MenuItem value="Paid">Paid</MenuItem>
                                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <FormControl sx={{ width: '100%' }}>
                                  <TextField
                                    value={data.qty}
                                    name="qty"
                                    id="filled-number"
                                    placeholder="Quantity"
                                    onChange={onChange}
                                    error={Boolean(errors.Purchase_detail && touched.Purchase_detail)}
                                  />
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <FormControl sx={{ width: '100%' }}>
                                  <FormControl variant="outlined">
                                    <OutlinedInput
                                      value={data.price}
                                      name="price"
                                      onChange={onChange}
                                      id="outlined-adornment-weight"
                                      endAdornment={<InputAdornment position="end">Rs.</InputAdornment>}
                                      error={Boolean(errors.Purchase_detail && touched.Purchase_detail)}
                                    />
                                  </FormControl>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <Grid container>
                                  <Grid item xs={12} md={8}>
                                    <Box></Box>
                                  </Grid>
                                </Grid>
                                {touched.Purchase_detail && errors.Purchase_detail && (
                                  <FormHelperText error={true}>{errors.Purchase_detail}</FormHelperText>
                                )}
                              </Grid>
                            </Grid>

                            <TableContainer>
                              <Table>
                              <TableHead sx={{border:'0' }}>
                                <TableRow sx={{background:'#fafafb'}}>
                                    <TableCell align="left">Sr.no.</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    {/* <TableCell align="right">Action</TableCell> */}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {values.Purchase_detail?.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell align="left">{index + 1}</TableCell>
                                      <TableCell>{item.Material_name}</TableCell>
                                      <TableCell align="right">{item.qty}</TableCell>
                                      <TableCell align="right">{item.price}</TableCell>
                                      <TableCell align="right">
                                        <Tooltip title="Remove Item"></Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </>
                        );
                      }}
                    />
                    </Grid>
                  </Grid>
                  </DialogContent>
                  </ScrollX>
                  <Divider />
                  <DialogActions sx={{ p: 2.5 }}>
                  <Grid item xs={12} sm={12}>
                    <Stack  justifyContent="end" alignItems="flex-start" spacing={2} >
                      <Button
                      className="gray-outline-btn"
                        variant="text"
                        color="secondary"
                        onClick={() => {
                          resetForm();
                          handleCancel();
                        }}
                        sx={{ color: 'secondary.dark' }}
                      >
                        Close
                      </Button>
                    </Stack>
                  </Grid>
                  </DialogActions>
                
              </Form>
            );
          }}
        </Formik>
    </MainCard>
  );
};

ViewPurchaseOrder.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default ViewPurchaseOrder;
