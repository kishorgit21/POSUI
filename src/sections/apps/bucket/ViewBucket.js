// import { useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
// import { useTheme } from '@mui/material/styles';

import {
  Button,
  Divider,
  DialogContent,
  DialogActions,
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
  Typography,
  DialogTitle,
  Tooltip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as yup from 'yup';
// import { format } from 'date-fns';
import { Form, Formik } from 'formik';

// project import

import MainCard from 'components/MainCard';
// import PurchaseOrderItem from 'sections/apps/PurchaseOrder/PurchaseOrderItem';

// import incrementer from 'utils/incrementer';
// import { useDispatch } from 'store';
// import { openSnackbar } from 'store/reducers/snackbar';
// import { getInvoiceList } from 'store/reducers/invoice';

// assets
import { DeleteOutlined } from '@ant-design/icons';
import ScrollX from 'components/ScrollX';

const validationSchema = yup.object({
  date: yup.date().required('date is required'),
  customer_Mobile: yup.string().min(10).max(10).required('Mobile number is required'),
  Product_ID: yup.string().required('Product ID  is required'),
  Purchase_detail: yup
    .array()
    .required('Invoice details is required')
    .of(
      yup.object().shape({
        Description: yup.string().required('Discription is required'),
        qty: yup.string().required('quantity is required'),
        rate: yup.string().required('rate is required')
      })
    )
    .min(1, 'Bucket must have at least 1 items'),
  Ammount: yup.string()
});

// ==============================|| INVOICE - AddBucket ||============================== //

const AddBucket = ({ customer, onCancel }) => {
  //   const dispatch = useDispatch();

  //   const [data, setData] = useState({
  //     Description: '',
  //     qty: '',
  //     price: ''
  //   });

  const theme = useTheme();
  const handleCancel = () => {
    onCancel();
  };

  //   const handlerCreate = (values) => {
  //     const NewList = {
  //       date: format(values.date, 'MM/dd/yyyy'),
  //       store: values.store,
  //       vendor: values.vendor,
  //       Purchase_detail: values.Purchase_detail
  //     };
  //     console.log('newlist', NewList);
  //     dispatch(getInvoiceList()).then(() => {
  //       dispatch(getInvoiceInsert(NewList)).then(() => {
  //         dispatch(
  //           openSnackbar({
  //             open: true,
  //             message: 'Purchase order added Added successfully',
  //             anchorOrigin: { vertical: 'top', horizontal: 'right' },
  //             variant: 'alert',
  //             alert: {
  //               color: 'success'
  //             },
  //             close: false
  //           })
  //         );
  //       });
  //     });
  //   };

  const initialval = {
    date: new Date(),
    customer_Mobile: '',
    Product_ID: '',
    Purchase_detail: [
      {
        Description: 'spe',
        qty: '2',
        rate: '10'
      },
      {
        Description: 'spe',
        qty: '3',
        rate: '10'
      },
      {
        Description: 'spe',
        qty: '4',
        rate: '20'
      }
    ],
    Ammount: ''
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
          }}
        >
          {({ errors, handleSubmit, values, getFieldProps, setFieldValue, touched, resetForm }) => {
            const subtotal = values?.Purchase_detail.reduce((prev, curr) => {
              if (curr.Description.trim().length > 0) return prev + Number(curr.rate * Math.floor(curr.qty));
              else return prev;
            }, 0);
            return (
              <Form onSubmit={handleSubmit}>
                <DialogTitle>{customer ? 'Add Bucket' : 'Edit Bucket'}</DialogTitle>
                <Divider />

                <DialogContent>
                <ScrollX sx={{ maxHeight: 'calc(100vh - 200px)' }}> 
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="customer_Mobile">Customer Mobile No. :</InputLabel>
                      <TextField
                        name={`customer_Mobile`}
                        onChange={(e) => setFieldValue(`customer_Mobile`, e.target.value)}
                        fullWidth
                        id="customer_Mobile"
                        placeholder="customer Mobile"
                        value={values.customer_Mobile}
                        {...getFieldProps('customer_Mobile')}
                        error={Boolean(touched.customer_Mobile && errors.customer_Mobile)}
                        helperText={touched.customer_Mobile && errors.customer_Mobile}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Date</InputLabel>
                      <FormControl sx={{ width: '100%' }} error={Boolean(touched.date && errors.date)}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            disabled
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

                  <Grid item xs={12} sm={6} md={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="Product_ID">Product ID :</InputLabel>
                      <TextField
                        name={`Product_ID`}
                        onChange={(e) => setFieldValue(`Product_ID`, e.target.value)}
                        fullWidth
                        id="Product_ID"
                        value={values.Product_ID}
                        placeholder="Product_ID"
                        {...getFieldProps('Product_ID')}
                        error={Boolean(touched.Product_ID && errors.Product_ID)}
                        helperText={touched.Product_ID && errors.Product_ID}
                      />
                    </Stack>
                  </Grid>

                  <Divider />

                  <Grid item xs={12}>
                    <Typography variant="h5">Purchase Detail</Typography>
                  </Grid>

                  <Grid item xs={12}>

                  <TableContainer >
                    <Table >
                      <TableHead sx={{border:'0' }}>
                        <TableRow sx={{background:'#fafafb'}}>
                          <TableCell align="left">Sr.no.</TableCell>
                          <TableCell>Discription</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {values.Purchase_detail?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell align="left">{index + 1}</TableCell>
                            <TableCell>{item.Description}</TableCell>
                            <TableCell align="right">{item.qty}</TableCell>
                            <TableCell align="right">{item.rate}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Remove Item">
                                <Button
                                  color="error"
                                  onClick={() => {
                                    console.log('in', index);
                                    values.Purchase_detail.splice(index, 1);
                                    setFieldValue('Purchase_detail', values.Purchase_detail);
                                    console.log('plain values : ', values);
                                  }}
                                >
                                  <DeleteOutlined />
                                </Button>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Grid container direction="row" py={2} pr={2} sx={{background:'#fafafb'}}  mt={1} justifyContent="flex-end" alignItems="flex-start">
                      <Typography color={theme.palette.grey[500]}>Amount :</Typography>
                      {/* {values.Ammount=subtotal.toFixed(2)} */}
                      <Typography variant="h5">{(values.Ammount = subtotal.toFixed(2))}</Typography>
                    </Grid>
                  </TableContainer>
                  </Grid>
                  </Grid>
                  </ScrollX> 
                  </DialogContent>
                  
                  <Divider />
                  <DialogActions>
                 
                  <Grid pl={5} container direction="row" justifyContent="end" alignItems="flex-start" xs={12} sm={6} my={1} mr={1}>
                    <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={4} sx={{ height: '100%' }}>
                      <Button
                      className='gray-outline-btn'
                        variant="text"
                        color="secondary"
                        onClick={() => {
                          resetForm();
                          handleCancel();
                        }}
                        sx={{ color: 'secondary.dark' }}
                      >
                        Cancel
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

AddBucket.propTypes = {
  customer: PropTypes.any,
  onCancel: PropTypes.func
};

export default AddBucket;
