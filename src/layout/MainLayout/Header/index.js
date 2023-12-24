import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, useMediaQuery } from '@mui/material';

// project import
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';
import HeaderSMContent from './HeaderSMContent'
import useConfig from 'hooks/useConfig';
import IconButton from 'components/@extended/IconButton';
import { LAYOUT_CONST } from 'config';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

const Header = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === LAYOUT_CONST.HORIZONTAL_LAYOUT && !downLG;

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);
  const headerSMContent = useMemo(() => <HeaderSMContent />, []);

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  // common header
  const mainHeader = (
    <Toolbar className='ottr-header'>
      {!isHorizontal ? (
        <IconButton
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          color="secondary"
          variant="light"
          sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor, ml: { xs: 0, lg: -2 } }}
          className="sidebar-toggle"
        >
          {!open ? <i className='icon-drawer-unfold ottr-icon'></i> : <i className='icon-drawer ottr-icon'></i>}
        </IconButton>
      ) : null}
      {headerContent}
    </Toolbar>
  );

  // common SM header
  const mainSMHeader = (
    <Toolbar>
      {headerSMContent}
    </Toolbar>
  );

  // app-bar params
  const appBar = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      zIndex: 1200,
      width: isHorizontal ? '100%' : open ? 'calc(100% - 260px)' : { xs: '100%', lg: 'calc(100% - 60px)' }
      // boxShadow: theme.customShadows.z1
    }
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={open} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : downSM ? <AppBar {...appBar}>{mainSMHeader}</AppBar> :
        (
          <AppBar {...appBar}>{mainHeader}</AppBar>
        )}
    </>
  );
};

Header.propTypes = {
  open: PropTypes.bool,
  handleDrawerToggle: PropTypes.func
};

export default Header;
