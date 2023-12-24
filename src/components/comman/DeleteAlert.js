// React apis
import PropTypes from 'prop-types';

// Material-ui
import { Button, Dialog, DialogContent, Stack, Typography, useMediaQuery, IconButton } from '@mui/material';

// Project Import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// Assets
import { DeleteFilled } from '@ant-design/icons';
import { useIntl } from 'react-intl';

// ==============================|| DELETE ALERT ||============================== //

export default function DeleteAlert({ name, title, open, handleClose }) {
  // Localizations - multilingual
  const intl = useIntl();
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      // onClose={() => handleClose(false)}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: matchDownSM ? 0 : 2, my: matchDownSM ? 0 : 1 }}>
        {matchDownSM && <Stack direction="row" sx={{ width: 1 }} justifyContent='space-between'>
          <Typography sx={{ color: '#2B3467', fontSize: '16px', fontWeight: '600' }} align="center">
            {intl.formatMessage({ id: 'Delete' })}
          </Typography>
          <IconButton
            aria-label="close bucket"
            onClick={() => handleClose(false, 'cancel')}
            edge="end"
            sx={{ height: 'auto !important', padding: 'unset' }}
            align="center"
          >
            <i className='icon-close' style={{ fontSize: '18px', color: '#6A6C72', fontStyle: 'normal' }} />
          </IconButton>
        </Stack>
        }
        <Stack alignItems="center" spacing={!matchDownSM ? 3.5 : 1}>
          {!matchDownSM ?
            <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <DeleteFilled />
            </Avatar> :
            <i className='icon-trash' style={{ fontSize: '3rem', color: '#DA0B0B', fontStyle: 'normal' }} />
          }
          <Stack spacing={2} sx={{marginTop: 0}}>
            {!matchDownSM && <Typography variant="h4" align="center">
              {intl.formatMessage({ id: 'Delete' })}
            </Typography>}
            <Typography align="center">
              {intl.formatMessage({ id: 'DeleteAlert' })} {' '}&quot;{name ? name : ''}&quot;{' '}
              {title ? title : ''}{' '}?
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }} pt={matchDownSM ? 1 : 0}>
            <Button className="gray-outline-btn" fullWidth onClick={() => handleClose(false, 'cancel')} color="secondary" variant="text">
              {intl.formatMessage({ id: 'No' })}
            </Button>
            {matchDownSM ? <Button fullWidth sx={{ bgcolor: '#DA0B0B' }} variant="contained" onClick={() => handleClose(true, 'delete')} autoFocus>
              {intl.formatMessage({ id: 'yes' })}
            </Button> :
              <Button fullWidth color="error" variant="contained" onClick={() => handleClose(true, 'delete')} autoFocus>
                {intl.formatMessage({ id: 'yes' })}
              </Button>
            }
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

DeleteAlert.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};