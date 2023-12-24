// React apis
import PropTypes from 'prop-types';

// Material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// Project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// Assets
import { DeleteFilled } from '@ant-design/icons';
import { useIntl } from 'react-intl';

// ==============================|| PRODUCT CATEGORY - DELETE ||============================== //

export default function AlertProductCategoryDelete({ title, open, handleClose }) {
  // Localizations - multilingual
  const intl = useIntl();

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              {intl.formatMessage({ id: 'Delete' })}
            </Typography>
            {title ?
            <Typography align="center">
                {intl.formatMessage({ id: 'DeleteAlert' })} {' '} &quot;{intl.formatMessage({ id: 'invoice' })}
                - #{title ? title : ''}&quot;{' '} ?
            </Typography>:
                <Typography align="center">
                {intl.formatMessage({ id: 'DeleteAlert' })} {' '}{intl.formatMessage({ id: 'invoice' })} ?
            </Typography>}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button className="gray-outline-btn" fullWidth onClick={() => handleClose(false, 'cancel')} color="secondary" variant="text">
                {intl.formatMessage({ id: 'No' })}
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={() => handleClose(true, 'delete')} autoFocus>
                {intl.formatMessage({ id: 'yes' })}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertProductCategoryDelete.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
