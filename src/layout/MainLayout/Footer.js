import { Link as RouterLink } from 'react-router-dom';

// Material-ui
import { Link, Stack, Typography } from '@mui/material';

// Multilingual message
import { FormattedMessage } from 'react-intl';

const Footer = () => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: '24px 0 0 0', mt: 'auto' }} className='ottr-page-footer'>
    <Typography variant="caption">&copy; <FormattedMessage id="AllRightsReserved" /></Typography>
    <Stack spacing={1.5} direction="row" justifyContent="space-between" alignItems="center">
      <Link component={RouterLink} to="#" target="_blank" variant="caption" color="textPrimary" onClick={(e) => e.preventDefault()} style={{textDecoration:'none',cursor:'none'}}>
        <FormattedMessage id="AboutUs" />
      </Link>
      <Link component={RouterLink} to="#" target="_blank" variant="caption" color="textPrimary" onClick={(e) => e.preventDefault()} style={{textDecoration:'none',cursor:'none'}}>
      <FormattedMessage id="Privacy" />
      </Link>
      <Link component={RouterLink} to="#" target="_blank" variant="caption" color="textPrimary" onClick={(e) => e.preventDefault()} style={{textDecoration:'none',cursor:'none'}}>
      <FormattedMessage id="Terms" />
      </Link>
    </Stack>
  </Stack>
);

export default Footer;
