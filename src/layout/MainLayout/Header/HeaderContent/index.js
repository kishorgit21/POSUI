// import { useMemo } from 'react';

// material-ui
import { Box, useMediaQuery } from '@mui/material';

// project import
// import Search from './Search';
// import Message from './Message';
// import Profile from './Profile';
import Localization from './Localization';
import Settings from './Settings';
// import Notification from './Notification';
// import Customization from './Customization';
// import MobileSection from './MobileSection';
// import MegaMenuSection from './MegaMenuSection';

import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/MainLayout/Drawer/DrawerHeader';
import { LAYOUT_CONST } from 'config';
import Profile from './Profile';
import StoreSection from './StoreSection'

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const localization = useMemo(() => <Localization />, [i18n]);

  // const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <>
      {menuOrientation === LAYOUT_CONST.HORIZONTAL_LAYOUT && !downLG && <DrawerHeader open={true} />}
      {/* {!downLG && <Search />} */}
      {/* {!downLG && megaMenu} */}
      <StoreSection/>
      <Box sx={{ width: '100%', ml: 1 }} />
      {/* {downLG && <Box sx={{ width: '100%', ml: 1 }} />} */}
      {/* {!downLG && <Box sx={{width: '100%', ml: 1}} />} */}

      {/* <Notification /> */}
      {/* <Message /> */}
      {/* <Customization /> */}
     
      <Localization/>
      <Settings/>
      <Profile />
      {/* {!downLG && <Profile />} */}
      {/* {downLG && <MobileSection />} */}
    </>
  );
};

export default HeaderContent;
