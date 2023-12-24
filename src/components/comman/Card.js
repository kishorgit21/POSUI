// React apis
import React from 'react';

// material-ui
import { Stack, Grid, Button, Typography, useMediaQuery } from '@mui/material';

// third party
import moment from 'moment';
import { useIntl } from 'react-intl';
import ScrollX from 'components/ScrollX';

// Assets
import UPIImage from 'assets/images/UPI.png';

const CardComponent = ({ list, title, iconEnd, noRecordLabel, handleDetails, selectedTab }) => {
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const intl = useIntl();

    return (
        <Grid container className='bucket-new-table' mt={matchDownSM ? 0 : 3} sx={{ border: '1px solid var(--ligt_gray_1)', borderRadius: '5px', marginBottom: matchDownSM && selectedTab && selectedTab == 'Buckets' ? '75px' : '0' }}>
            {title && (<Grid item xs={12} className='bucket-header'>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant={'h5'}
                        sx={{ fontSize: matchDownSM ? '15px' : 'auto', fontWeight: matchDownSM ? '600' : 'auto' }} component="div" >
                        {title}
                    </Typography>
                    {iconEnd}
                </Stack>
            </Grid>
            )}
            <ScrollX sx={{ minHeight: matchDownSM ? 'auto' : 'calc(100vh - 340px)', maxHeight: matchDownSM ? 'auto' : 'calc(100vh - 340px)' }}>
                <Grid item xs={12}>
                    {list.length ? (list?.map((val, index) => (
                        <Stack m={2} p={2} key={index} direction={matchDownSM ? 'column' : 'row'} className='bucket-card' onClick={() => handleDetails(val)}>
                            <Grid item xs={4} sm={4}>
                                <Typography className='bucket-fs13' sx={{ fontWeight: '500', color: matchDownSM ? '' : '#2B3467' }}>
                                    #{val.bucketNumber} {val.documentNumber}
                                </Typography>
                                {val.modeOfPayment !== undefined && (
                                    <Button size="small" className='payment-btn' sx={{borderColor:val.modeOfPayment != 0 ?'#2B3467 !important':'#FF3A59 !important'}}>
                                        {val.modeOfPayment === 0 ? 'Cash' :
                                            <img src={UPIImage} alt="" style={{ width: '26px',height:'7px' }} />
                                        }
                                    </Button>
                                )}
                            </Grid>
                            <Grid item xs={3} sm={4}>
                                <Stack direction={'column'} justifyContent="space-between">
                                    <Typography className='bucket-fs13' sx={{ fontWeight: '500', color: matchDownSM ? '' : '#2B3467' }}>
                                        {val.totalItems ? val.totalItems : val.itemsCount}
                                        {val.totalItems === 1 || val.itemsCount == 1 ? ` ${intl.formatMessage({ id: 'Item' })}` : ` ${intl.formatMessage({ id: 'Items' })}`}
                                    </Typography>
                                    <Stack direction={'row'} alignItems={'center'}>
                                        {val.mobileNumber ? <i className='icon-smartphone mobile-card-icon' style={{height: '20px'}} /> : ''}
                                        <Typography ml={0.2} className='bucket-card-label'>
                                            {val.mobileNumber ? val.mobileNumber : ''}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Grid>
                            <Grid item xs={5} sm={4}>
                                <Stack direction="column" justifyContent="space-between">
                                    <Typography className='bucket-fs13' sx={{ fontWeight: '500', color: '#2B3467', textAlign: matchDownSM ? 'right' : 'left' }}>
                                        {intl.formatMessage({ id: 'Rs.' })} {val.amount ? Number(val.amount)?.toFixed(2) : Number(val.totalAmount)?.toFixed(2)}
                                    </Typography>
                                    <Stack direction={'row'} justifyContent={matchDownSM ? 'end' : 'start'} alignItems={'center'}>
                                        <Typography sx={{ fontWeight: '500', fontSize: '12px', color: '#939599'}}>
                                            <i className='icon-calendar mobile-card-icon' />
                                        </Typography>
                                        <Typography ml={0.3} sx={{ fontWeight: '500', fontSize: '12px', color: '#939599'}}>
                                            {moment(val.date).format('DD MMM YY')}
                                            {/* {moment(val.date).format('DD MMM YY h:mm a')} */}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </Stack>
                    ))) :
                        <Grid p={4} textAlign='center'>
                            <Typography variant="body1" sx={{ cursor: 'default' }}>{noRecordLabel}</Typography>
                        </Grid>
                    }
                </Grid>
            </ScrollX>
        </Grid>
    );
};

export default CardComponent;