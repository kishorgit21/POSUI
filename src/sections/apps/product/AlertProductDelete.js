import PropTypes from 'prop-types';

// Material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// Project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

import { FormattedMessage } from 'react-intl';

// Assets
import { DeleteFilled } from '@ant-design/icons';

// ==============================|| PRODUCT - DELETE ||============================== //

export default function AlertProductDelete({ title, open, handleClose }) {
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
            <FormattedMessage id="Delete"/>
            </Typography>
            <Typography align="center">

              <FormattedMessage id="DeleteAlert"/>
            {' '} 
              &quot;{title ? title : ''}&quot;{' '}
              <FormattedMessage id="product"/> ?

              {/* By deleting
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{title ? title : ''}&quot;{' '}
              </Typography>
              user, all task assigned to that user will also be deleted. */}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button className="gray-outline-btn" fullWidth onClick={() => handleClose(false, 'cancel')} color="secondary" variant="text">
            <FormattedMessage id="No"/>
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={() => handleClose(true, 'delete')} autoFocus>
              <FormattedMessage id="yes"/>
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertProductDelete.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func
};
