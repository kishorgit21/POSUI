// React apis
import React from 'react';

// material-ui
import { Typography, Grid, IconButton, Stack } from '@mui/material';

// third party
import { useIntl } from 'react-intl';

const MobileCardComponent = ({ list, setFieldValue, fieldName }) => {

    const intl = useIntl();

    return (
        <>
        <div className={list?.length ? 'bucket-item-view-parent': ''} >
        {list?.length ? list?.map((item, index) =>
         <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" className='bucket-card new-bucket-item-view mobile-return' p={2} mb={2}>
         <Grid item xs={11} sm={11}>
             <Stack direction={'column'} justifyContent="space-between">
                 <Typography className='bucket-card-label'>{intl.formatMessage({ id: 'VendorName' })}</Typography>
                     <Typography variant="h2" sx={{ mb: 0.5, fontSize: '14px', fontWeight: 500 }}>{item.vendorName}</Typography>
                 <Typography className='bucket-card-label'>{intl.formatMessage({ id: 'ProductName' })}</Typography>
                     <Typography variant="h2" sx={{ mb: 0.5, fontSize: '14px', fontWeight: 500 }}>{item.productName}</Typography>
                     {item.quantity > 1 ?
                           <Typography variant="h6" sx={{fontWeight: 500}}>{item.quantity} {intl.formatMessage({ id: 'Items' })}</Typography>
                           :
                           <Typography variant="h6" sx={{fontWeight: 500}}>{item.quantity} {intl.formatMessage({ id: 'Item' })}</Typography>
                     }
             </Stack>
         </Grid>
         <Grid item xs={1} sm={1} md={1} >
                       <Stack direction="row" justifyContent='center'>
                             <IconButton
                               color="error"
                               sx={{paddingTop: '0px', paddingRight: '0px'}}
                            //    className='bucket-item-delete'
                               onClick={() => {
                                 list.splice(index, 1);
                                 setFieldValue(fieldName, list);
                               }}
                             >
                               <i className='icon-trash bucket-trash-icon'></i>
                             </IconButton>
                             </Stack>
                       </Grid>
         </Stack>
              ) : 
                  <Grid container sx={{marginTop: '6px'}}>
                      <Grid item xs={12} sm={12} md={12} sx={{textAlign: 'center'}}>
                          <Typography variant="h2" sx={{ mb: 1, fontSize: '16px', fontWeight: 500 }}>{intl.formatMessage({ id: 'ScanToAddProduct' })}</Typography>
                          <Typography variant="h6">{intl.formatMessage({ id: 'UseThisScannerToScanProductQRCode' })}</Typography>
                      </Grid>
                  </Grid>
            }
            </div>
        </>
    );
};

export default MobileCardComponent;