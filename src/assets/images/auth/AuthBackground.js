// material-ui
//import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import packageJson from '../../../../package.json';
import Logo from 'assets/images/ottr-logo-bg.png';
// ==============================|| AUTH BLUR BACK SVG ||============================== //

const AuthBackground = () => {
  const projectVersion = packageJson.version;

  //const theme = useTheme();
  return (
    <Box  >
     <img hidden src={Logo} alt="logo" height="550px" />
     <Typography className='version'>Version : {projectVersion}</Typography>
    </Box>
    
  );
};

export default AuthBackground;
