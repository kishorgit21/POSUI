import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, ButtonBase, ClickAwayListener, Paper, Popper, Stack, Typography } from '@mui/material';

// project import
import ProfileTab from './ProfileTab';
// import SettingTab from './SettingTab';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
// import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';

// assets
import avatar1 from 'assets/images/users/avatar-1.png';

// Services
import { getUser } from '_api/auth/auth';

// Store
import { dispatch } from 'store';
// import { openSnackbar } from 'store/reducers/snackbar';

// Reducer
import { useSelector } from 'react-redux';

// Loader
import Loader from 'components/Loader';
// import { LogoutOutlined } from '@ant-design/icons';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

// function a11yProps(index) {
//   return {
//     id: `profile-tab-${index}`,
//     'aria-controls': `profile-tabpanel-${index}`
//   };
// }

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get logged in, loading flag & another parameters
  const { isLoading, user } = useSelector((state) => state.authReducer);
  const { onChangeLocalization } = useConfig();
  
  // User name
  var userName = '';

  // Set user name
  if(user && user.data && (user.data.firstName && user.data.lastName)) {
    userName = user.data.firstName + ' ' + user.data.lastName;
  }

  useEffect(()=> {
    // Get user api call
    dispatch(getUser())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } 
        
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          // dispatch(
          //   openSnackbar({
          //     open: true,
          //     message: 'Logged In User: Unknown Error.\nLogged In User getting rejected.',
          //     variant: 'alert',
          //     alert: {
          //       color: 'error'
          //     },
          //     close: true
          //   })
          // );
        }
      });
  },[])
  

  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/`, {
        state: {
          from: ''
        }
      });
      localStorage.removeItem('store');
      onChangeLocalization('en')
    } catch (err) {
      console.error(err);
    }
  };

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // const [value, setValue] = useState(0);

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';

  // Set loader
  if(isLoading) {
    return <Loader />;
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }} className='profile-btn'>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 0.5 }}>
          <Avatar alt="profile user" src={avatar1} size="xs" />
          <Typography variant="subtitle1">{userName}</Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
        className='profile-section'
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 150,
                maxWidth: 150,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 250
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  {/* <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar alt="profile user" src={avatar1} sx={{ width: 32, height: 32 }} />
                          <Stack>
                            <Typography variant="h6">{user?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              UI/UX Designer
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Logout">
                          <IconButton size="large" sx={{ color: 'text.primary' }} onClick={handleLogout}>
                            <LogoutOutlined />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent> */}

                  {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="profile tabs"> */}
                      {/* <Tab
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textTransform: 'capitalize'
                        }}
                        icon={<UserOutlined style={{ marginBottom: 0, marginRight: '10px' }} />}
                        label="Profile"
                        {...a11yProps(0)}
                      /> */}
                      {/* <Tab
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textTransform: 'capitalize'
                        }}
                        icon={<SettingOutlined style={{ marginBottom: 0, marginRight: '10px' }} />}
                        label="Setting"
                        {...a11yProps(1)}
                      /> */}
                    {/* </Tabs>
                  </Box> */}
                  <TabPanel value={0} index={0} dir={theme.direction}>
                    <ProfileTab handleLogout={handleLogout} handleDropdownToggle={handleToggle} handleClose={handleClose}/>
                  </TabPanel>
                  {/* <Tab
                  Panel value={value} index={1} dir={theme.direction}>
                    <SettingTab />
                  </TabPanel> */}
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;
