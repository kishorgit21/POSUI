import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText, Dialog, useMediaQuery } from '@mui/material';

// Components
import { PopupTransition } from 'components/@extended/Transitions';

// Propmt components
import ChangePassword from '../ChangePassword';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout, handleDropdownToggle }) => {
  const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSelectedItem, setSelectedItem] = useState(false);
  const handleListItemClick = (event, index, status) => {
    setSelectedIndex(index);
    if(status=='changePassword'){
      setSelectedItem(!isSelectedItem);
    }
  };


  return (
    <>
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: matchDownSM ? 25 : 32 } }}>
      <ListItemButton sx={{paddingLeft: matchDownSM ? '8px' : '16px', paddingRight: matchDownSM ? '8px' : '16px'}} onClick={(event) => handleListItemClick(event, 0, 'changePassword')}>
        <ListItemIcon>
          <i className='icon-edit ottr-icon'></i>
        </ListItemIcon>
        <ListItemText primary="Change Password" />
      </ListItemButton>
       {/* <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 3} onClick={(event) => handleListItemClick(event, 3)}>
        <ListItemIcon>
          <ProfileOutlined />
        </ListItemIcon>
        <ListItemText primary="Social Profile" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 4} onClick={(event) => handleListItemClick(event, 4)}>
        <ListItemIcon>
          <WalletOutlined />
        </ListItemIcon>
        <ListItemText primary="Billing" />
      </ListItemButton> */}
      <ListItemButton sx={{paddingLeft: matchDownSM ? '8px' : '16px', paddingRight: matchDownSM ? '8px' : '16px'}} selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
        <i className='icon-logout ottr-icon'></i>
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
    {isSelectedItem && (
      <Dialog
        className="ottr-model"
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={()=> setSelectedItem(true)}
        open={isSelectedItem}
        sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <ChangePassword setClosePopup={setSelectedItem} handleLogout={handleLogout} handleDropdownToggle={handleDropdownToggle}/>
      </Dialog>
    )}
    </>
  );
};

ProfileTab.propTypes = {
  handleLogout: PropTypes.func,
  handleDropdownToggle: PropTypes.any
};

export default ProfileTab;
