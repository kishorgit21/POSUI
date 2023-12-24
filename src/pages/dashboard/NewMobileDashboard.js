import React from 'react';
import "../../style.css";

// MUI components
import Button from '@mui/material/Button';
import { Grid, InputLabel } from '@mui/material';

// RRD
import { Link } from 'react-router-dom';
import StoreSection from 'layout/MainLayout/Header/HeaderContent/StoreSection';

//Multi
import { useIntl } from 'react-intl';

export default function NewMobileDashboard() {

    const intl = useIntl();
    const MobileDashboardList = [
        {
            id: 'bucket-mobile',
            name: intl.formatMessage({ id: 'bucket' }),
            icon: 'icon-shopping-cart mobile-ottr-icon',
            toLink: '../apps/Transactions/bucket'
        },
        {
            id: 'material-return-mobile',
            name: intl.formatMessage({ id: 'Material-return' }),
            icon: 'icon-arrow-up-circle mobile-ottr-icon',
            toLink: '../apps/Transactions/add-material-return'
        },

    ]
    return (
        <Grid container rowSpacing={2} p={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'Store' })}</InputLabel>
                <StoreSection />
            </Grid>
            {MobileDashboardList?.map((val, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Button
                        fullWidth
                        variant="contained"
                        component={Link} 
                        to={val.toLink} 
                        sx={{ justifyContent: 'space-between', height: '60px', fontSize: '18px', fontWeight: '500' }}
                        endIcon={<i className={val.icon}></i>}>
                        {val.name}
                    </Button>
                </Grid>
            ))}
        </Grid>
    );
}