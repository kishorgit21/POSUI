// React apis
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

// material-ui
import { Button, Stack, Grid, useMediaQuery, Dialog, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import Card from 'components/comman/Card';
import AddNewBucket from './AddNewBucket';
import EnquiryBucket from './EnquiryBucket';
import { PopupTransition } from 'components/@extended/Transitions';
import InvoiceDetails from './InvoiceDetails'

//store
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import { setNewBucketFlag, setEnquiryBucketFlag } from 'store/reducers/newbucketFlagReducer';
import Loader from 'components/Loader';

// API
import { getActiveBuckets, getByIdBucket, getLatestInvoices } from '_api/transactions/new_Bucket';
import { getByIdInvoice } from '_api/ottrInvoice';

// ==============================|| BUCKET ||============================== //

const NewBucket = () => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  //set mobile view tab selection
  const [mobileViewTab, setMobileViewTab] = useState('Buckets');

  //set Bucket Data state
  const [bucketData, setBucketData] = useState('');

  //new bucket Flag state and enquiry bucket flag by using reducer
  const { newbucketFlag, enquirybucketFlag } = useSelector((state) => state.newbucketFlagSlice);

  const intl = useIntl();
  const dispatch = useDispatch();
  const location = useLocation();

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  // Get active bucket list, loading flag & another parameters
  const { activeBuckets } = useSelector((state) => state.activeBucketsSlice);

  // Get latest invoice list, loading flag & another parameters
  const { isLoading, latestInvoice } = useSelector((state) => state.activeBucketsSlice);

  // Set invoice details flag state
  const [invoiceDetailsFlag, setInvoiceDetailsFlag] = useState(false);

  // Set selected invoice state
  const [invoice, setInvoice] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    // Check mobile view and bucket is created or not
    if (matchDownSM && window.localStorage.getItem('isBucketCreated')) {
      // Get updated list
      setUpdated(true);
      // Remove key from local storage
      window.localStorage.removeItem('isBucketCreated')
    }
  }, [newbucketFlag]);

  useEffect(() => {
    // Get active buckets list api call
    dispatch(getActiveBuckets())
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
              message: `${intl.formatMessage({ id: 'BucketListErrorMsg' })}`,
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
    const handleBackButton = () => {

      if (!enquirybucketFlag && !newbucketFlag) {
        // Both flags are false, navigate to the dashboard
        navigate('/newdashboard');
      } else {
        // At least one flag is true, make it false on the bucket page
        if (enquirybucketFlag) {
          dispatch(setEnquiryBucketFlag(false));
        }
        if (newbucketFlag) {
          dispatch(setNewBucketFlag(false));
        }
        // Optionally, you can prevent going back to the bucket page
        navigate('/apps/Transactions/bucket');
      }

      // Clean up the event listener when the component unmounts
      window.removeEventListener('popstate', handleBackButton);
    };

    // Listen for the 'popstate' event (back/forward button press)
    window.addEventListener('popstate', handleBackButton);

  }, [dispatch, navigate, enquirybucketFlag, newbucketFlag]);


  useEffect(() => {
    // Get latest invoice list api call
    dispatch(getLatestInvoices())
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
              message: `${intl.formatMessage({ id: 'InvoiceListErrorMsg' })}`,
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

  const handleNewBucket = () => {
    dispatch(setNewBucketFlag(true))
    setBucketData('')
  }

  useEffect(() => {
    if (location.state?.bucket) {
      handlePerticularBucketDetails(location.state?.bucket)
    }
    if (location.state?.invoice == 'invoice') {
      setMobileViewTab('Invoices')
      navigate(`/apps/Transactions/bucket`, {})
    }
  }, [location])

  const handlePerticularBucketDetails = (val) => {
    // Check mobile view and selected tab
    dispatch(setNewBucketFlag(true))    // Set get bucket by id model
    const model = {
      id: val.id
    };
    const jsonObj = JSON.stringify(val);
    localStorage.setItem('bucket', jsonObj);
    // Get by id product api call
    dispatch(getByIdBucket({ model }))
      .unwrap()
      .then((payload) => {
        // Check for error & success
        if (payload && payload.isError) {
          // Handle error
        } else {
          // Set bucket data
          setBucketData(payload.data);
        }
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'BucketGetByIdErrorMsg' })}`,
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

  const handlePerticularInvoicetDetails = (val) => {
    // Check mobile view and selected tab
    if (!matchDownSM) {
      setInvoiceDetailsFlag(true)
      // Set get invoice by id model
      const model = {
        id: val.id
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

            // Handle add of specific task
            if (status === 'edit') {
              handleAdd('edit');
            } else if (status === 'view') {
              handleAdd('view');
            }
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
    } else {
      // Redirect to mobile view invoice details page
      navigate(`/apps/Transactions/invoice-details`, {
        state: {
          invoiceId: val.id
        }
      });
    }
  }

  // Sort the data array by bucketNumber in descending order
  const sortedBucketData = [...activeBuckets].sort((a, b) => b.bucketNumber.localeCompare(a.bucketNumber));

  return (
    <>
      {isLoading && <Loader />}
      <MainCard className="ottr-table-section bucket-table mobile-bucket">
        <Grid container spacing={matchDownSM ? 0 : 2} className='bucket-invoice-table mobile-bucket' py={matchDownSM ? 2 : 0}>
          {matchDownSM && <>
            {!newbucketFlag && !enquirybucketFlag &&
              <>
                <Grid item pt={4} xs={12} px={matchDownSM ? 2 : 0}>
                  <Typography sx={{ fontSize: '18px', fontWeight: '600', color: '#2B3467' }}>
                    {mobileViewTab == 'Buckets' ? intl.formatMessage({ id: 'Buckets' }) : intl.formatMessage({ id: 'invoices' })}
                  </Typography>
                </Grid>
                <Grid item my={1} xs={12} px={matchDownSM ? 2 : 0}>
                  <Stack direction='row' spacing={0} sx={{ height: '100%' }}>
                    <Button
                      variant={mobileViewTab == 'Buckets' ? "contained" : "outlined"}
                      className="add-product cta2"
                      sx={{ width: matchDownSM ? '100%' : 'auto', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, fontWeight: '500', fontSize: '13px' }}
                      onClick={() => { setMobileViewTab('Buckets') }}
                    >
                      {intl.formatMessage({ id: 'Buckets' })}
                    </Button>
                    <Button
                      onClick={() => setMobileViewTab('Invoices')}
                      className="add-product cta2"
                      variant={mobileViewTab == 'Invoices' ? "contained" : "outlined"}
                      sx={{ width: matchDownSM ? '100%' : 'auto', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 5, borderBottomRightRadius: 5, fontWeight: '500', fontSize: '13px' }}
                    >
                      {intl.formatMessage({ id: 'invoices' })}
                    </Button>
                  </Stack>
                </Grid>
              </>
            }
          </>}
          {!newbucketFlag && !enquirybucketFlag ?
            <>
              {matchDownSM &&
                <>
                  <Grid item xs={12} sm={12} pt={1} px={matchDownSM ? 2 : 0}>
                    <Card
                      list={mobileViewTab == 'Buckets' ? sortedBucketData : latestInvoice}
                      handleDetails={mobileViewTab == 'Buckets' ? handlePerticularBucketDetails : handlePerticularInvoicetDetails}
                      noRecordLabel={intl.formatMessage({ id: 'BucketNoRecordLabel' })}
                      iconEnd={<i className='icon-bucket bucket-icon'></i>}
                      selectedTab={mobileViewTab}
                    />
                  </Grid>
                </>
              }
              {!matchDownSM && <>
                <Grid item xs={12} sm={6} px={matchDownSM ? 2 : 0}>
                  <Card
                    list={sortedBucketData}
                    handleDetails={handlePerticularBucketDetails}
                    noRecordLabel={intl.formatMessage({ id: 'BucketNoRecordLabel' })}
                    title={intl.formatMessage({ id: 'Buckets' })}
                    iconEnd={<i className='icon-bucket bucket-icon'></i>}
                  />
                </Grid>
                <Grid item xs={12} sm={6} px={matchDownSM ? 2 : 0}>
                  <Card
                    title={intl.formatMessage({ id: 'invoices' })}
                    iconEnd={<i className='icon-invoice bucket-icon'></i>}
                    list={latestInvoice}
                    noRecordLabel={intl.formatMessage({ id: 'InvoiceNoRecordLabel' })}
                    handleDetails={handlePerticularInvoicetDetails}
                  />
                </Grid>
                <Grid item pt={2} justifyContent="end" alignItems="flex-start" my={1} xs={12} px={matchDownSM ? 0 : 0}>
                  <Stack direction={'row'} justifyContent="flex-end" alignItems="flex-end" spacing={matchDownSM ? 2 : 4} sx={{ height: '100%' }}>
                    <Button
                      endIcon={<i className='icon-qrcode2 ottr-icon' />}
                      variant="outlined"
                      className="btn-outlined-primary add-product"
                      // sx={{ width: matchDownSM ? '100%' : 'auto', order: matchDownSM ? 2 : 1 }}
                      sx={{ width: matchDownSM ? '100%' : 'auto' }}
                      onClick={() => { setBucketData(''), dispatch(setEnquiryBucketFlag(true)) }}>
                      {intl.formatMessage({ id: 'Enquiry' })}
                    </Button>
                    <Button
                      endIcon={<i className='icon-qrcode2 ottr-icon' />}
                      onClick={() => handleNewBucket()}
                      className="btn-outlined-primary add-product" variant="contained"
                      sx={{ width: matchDownSM ? '100%' : 'auto' }}
                    // sx={{ marginLeft: "15px !important", width: matchDownSM ? '100%' : 'auto', order: matchDownSM ? 1 : 2, marginBottom: matchDownSM ? "15px" : "0px" }}
                    >
                      {intl.formatMessage({ id: 'NewBucket' })}
                    </Button>
                  </Stack>
                </Grid>
              </>}
            </> :
            <Grid item xs={12} sm={12}>
              {newbucketFlag ?
                <AddNewBucket
                  title={intl.formatMessage({ id: 'NewBucket' })}
                  bucketData={bucketData}
                  noRecordLabel={intl.formatMessage({ id: 'BucketNoRecordLabel' })}
                  setUpdated={setUpdated}
                /> :
                <EnquiryBucket />}
            </Grid>
          }
        </Grid>
        {invoiceDetailsFlag && (
          <Dialog
            className='ottr-model'
            maxWidth="md"
            TransitionComponent={PopupTransition}
            keepMounted
            onClose={() => setInvoiceDetailsFlag(true)}
            open={invoiceDetailsFlag}
            sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <InvoiceDetails invoice={invoice} onCancel={() => setInvoiceDetailsFlag(false)} />
          </Dialog>
        )}
      </MainCard>
      {!newbucketFlag && !enquirybucketFlag && matchDownSM && mobileViewTab == 'Buckets' && <Grid display={matchDownSM ? "flex" : "none"} className='bucket-sticky-button' sx={{ position: 'fixed', bottom: '0' }}>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            className="btn-outlined-primary add-product cta2"
            sx={{ width: matchDownSM ? '48%' : 'auto' }}
            onClick={() => { setBucketData(''), dispatch(setEnquiryBucketFlag(true)) }}>
            {intl.formatMessage({ id: 'Enquiry' })}
          </Button>
          <Button
            onClick={() => handleNewBucket()}
            className="btn-outlined-primary add-product cta2" variant="contained"
            sx={{ width: matchDownSM ? '48%' : 'auto' }}
          >
            {intl.formatMessage({ id: 'NewBucket' })}
          </Button>
        </Stack>
      </Grid>}
    </>
  );
};

export default NewBucket;