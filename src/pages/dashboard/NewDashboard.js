import React, { useState, useEffect } from 'react';
import "../../style.css";

// MUI components
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

// RRD
import { Link } from 'react-router-dom';

// API
import { getDashboardCount } from '_api/settings/settings';

//store
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';

//Multi
import { useIntl } from 'react-intl';

export default function NewDashboard() {

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  const dispatch = useDispatch();

  const intl = useIntl();

  // Get dashboard count data, loading flag & another parameters
  const { dashboardCount } = useSelector((state) => state.settingsSlice);

  useEffect(() => {
    // Get settings list api call
    dispatch(getDashboardCount())
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

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ maxWidth: 250 }}>
          <CardContent>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: 'default' }}>
              <Typography variant="h5" component="div">
                {intl.formatMessage({ id: 'invoice' })}
              </Typography>
              <span className='header-badge'>{dashboardCount?.todaysInvoiceCount}</span>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              className="btn-outline"
              sx={{
                marginLeft: '13px',
                marginBottom: '13px'
              }}
              variant="outlined" component={Link} to={'../apps/Transactions/ottrinvoice'} size="small">
              {intl.formatMessage({ id: 'GoToMenu' })}
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ maxWidth: 250 }}>
          <CardContent>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: 'default' }}>
              <Typography variant="h5" component="div">
                {intl.formatMessage({ id: 'products' })}
              </Typography>
              <span className='header-badge'>{dashboardCount?.productsCount}</span>
            </Grid>
          </CardContent>
          <CardActions>
            <Button className="btn-outline" sx={{ marginLeft: '13px', marginBottom: '13px' }} variant="outlined" size="small" component={Link} to={'../apps/Master/Product'}>
              {intl.formatMessage({ id: 'GoToMenu' })}
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ maxWidth: 250 }}>
          <CardContent>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: 'default' }}>

              <Typography variant="h5" component="div">
                {intl.formatMessage({ id: 'purchaseOrder' })}
              </Typography>
              <span className='header-badge'>{dashboardCount?.todaysPurchaseorderCount}</span>

            </Grid>
          </CardContent>
          <CardActions>
            <Button className="btn-outline" sx={{ marginLeft: '13px', marginBottom: '13px' }} variant="outlined" size="small" component={Link} to={'../apps/Transactions/purchase-order'}>
              {intl.formatMessage({ id: 'GoToMenu' })}
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ maxWidth: 250 }}>
          <CardContent>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: 'default' }}>
              <Typography variant="h5" component="div">
                {intl.formatMessage({ id: 'Vendors' })}
              </Typography>
              <span className='header-badge'>{dashboardCount?.vendorCount}</span>
            </Grid>
          </CardContent>
          <CardActions>
            <Button className="btn-outline" sx={{ marginLeft: '13px', marginBottom: '13px' }} variant="outlined" size="small" component={Link} to={'../apps/Master/Vendors'}>
              {intl.formatMessage({ id: 'GoToMenu' })}
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ maxWidth: 250 }}>
          <CardContent>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: 'default' }}>
              <Typography variant="h5" component="div">
                {intl.formatMessage({ id: 'Material-return' })}
              </Typography>
              <span className='header-badge'>{dashboardCount?.todaysMaterialReturnCount}</span>
            </Grid>
          </CardContent>
          <CardActions>
            <Button className="btn-outline" sx={{ marginLeft: '13px', marginBottom: '13px' }} variant="outlined" size="small" component={Link} to={'../apps/Transactions/Material-return'}>
              {intl.formatMessage({ id: 'GoToMenu' })}
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ maxWidth: 250 }}>
          <CardContent>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" sx={{ cursor: 'default' }}>
              <Typography variant="h5" component="div">
                {intl.formatMessage({ id: 'Customer' })}
              </Typography>
              <span className='header-badge'>{dashboardCount?.customerCount}</span>
            </Grid>
          </CardContent>
          <CardActions>
            <Button className="btn-outline" sx={{ marginLeft: '13px', marginBottom: '13px' }} variant="outlined" size="small" component={Link} to={'../apps/Master/Customer'}>
              {intl.formatMessage({ id: 'GoToMenu' })}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
}