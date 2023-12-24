// Material-ui
import { Button, Dialog, DialogContent, Box, Typography, useMediaQuery } from '@mui/material';

// Assets
import { useIntl } from 'react-intl';
import SessionTimeOutImg from 'assets/images/ottr-logo-bg.png';

import { dispatch } from 'store';
import { closeDialog } from 'store/reducers/sessionTimout/dialogReducer';
import { useSelector } from 'react-redux';

// ==============================|| SESSION TIME OUT ALERT ||============================== //

export default function SessionDialog() {
    // Localizations - multilingual
    const intl = useIntl();
    const isDialogOpen = useSelector(state => state.dialogSlice.isOpen);

    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const handleClose = () => {
        dispatch(closeDialog());
        // Navigate to login page
          localStorage.clear();
          window.location.href = '/';
      };
    return (
        <Dialog
            open={isDialogOpen}
            // onClose={handleClose}
            aria-labelledby="sessionTimeOut-dialog-title" >
            <DialogContent>
                <Box sx={{ width: { xs: 250, sm: 150 }, margin: '10px auto' }} textAlign={'center'}>
                    <img src={SessionTimeOutImg} alt="SessionTimeOut" style={{ width: matchDownSM ? '25%' : '100%', height: 'auto' }} />
                </Box>
                <Typography variant="h5" align="center" sx={{fontSize: matchDownSM ? '14px' : '1rem', fontWeight: matchDownSM ? 400 : 600 }}>
                    {intl.formatMessage({ id: 'sessionTimeOutError' })}
                </Typography>
                <Button
                    sx={{ margin: '15px auto', display: 'flex', cursor: 'pointer' }}
                    color="primary"
                    variant="contained"
                    onClick={() => handleClose()}>
                    {intl.formatMessage({ id: 'Logout' })}
                </Button>
            </DialogContent>
        </Dialog>
    );
}