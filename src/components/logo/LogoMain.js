//import PropTypes from 'prop-types';

// material-ui
//import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
//  */
// import logoDark from 'assets/images/logo.png';
import logo from 'assets/images/ottr-logo.png';
 /*
 */

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({width}) => {
  //const theme = useTheme();
  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     */
    <img src={logo} alt="" width={width ? width : "120"} />
    //{theme.palette.mode === 'dark' ? reverse ? logoDark : logo : theme.palette.common.black}
     /*
     */
   /* <>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1230 223.5" width="250" height="50">
        <circle className="st0" cx="106.9" cy="112" r="103.9" />
        <g>
          <path
            className="st1"
            d="M110.7,3.3C50.8,3.3,2,52.1,2,112s48.8,108.7,108.7,108.7S219.4,171.9,219.4,112S170.7,3.3,110.7,3.3z
          M110.7,211.1c-54.6,0-99.1-44.5-99.1-99.1s44.5-99.1,99.1-99.1s99.1,44.5,99.1,99.1S165.4,211.1,110.7,211.1z"
            fill={theme.palette.primary.white}
          />
          <path
            className="st1"
            d="M192.6,85.8c-3.3-4.7-7.6-6.6-12.7-5.9c-1.5,0.2-2.3-0.3-3.2-1.9c-2.9-5-5.7-10.2-9.3-14.5
          c-15.7-19-34.9-28.2-56.9-29.1c-17.1-0.7-33.1,4.2-47.7,15.1c-9.5,7.1-17.5,16-23.3,27.6c-1.2,2.4-2.3,3-4.5,2.8
          c-6.8-0.7-12.9,4.7-14.7,12.8c-1.7,7.5,1.6,15.3,8.1,19.2c1.2,0.7,1.6,1.5,1.6,3.1c-0.1,3.3,0,6.7,0,10.5c1.2-0.7,1.9-1.1,2.6-1.7
          c7.3-5.8,15.2-10.4,23.4-13.8c9.3-3.9,18.8-6.7,28.5-8.5c1.1-0.2,2.6-0.8,3.2-1.8c1.6-2.9,3.7-5,6.3-6.4c7.5-4.3,15.3-4.8,23.3-2.1
          c4.1,1.4,7.8,3.5,10.4,7.8c1,1.7,2.1,2.3,3.6,2.6c3.1,0.6,6.3,1.3,9.4,2.1c15.6,3.7,30.3,10.4,43.7,20.9c0.3,0.2,0.7,0.3,1.6,0.8
          c0-2.7,0.2-5.1,0-7.5c-0.4-3.5,0.2-6.1,3.3-7.2c0.5-0.2,0.9-0.7,1.3-1C196.8,103.8,197.8,93.2,192.6,85.8z M77.2,98.5
          c-3.3,3.8-9.9,3.9-13.2,0.1c-2.1-2.4-2.9-5.3-2.2-8.6c0.8-3.6,3-5.6,5.8-6.6c0.9-0.3,1.9-0.4,2.5-0.5c3.5,0.2,6.2,1.4,8,4.7
          C80.1,91.3,79.8,95.5,77.2,98.5z M153.9,94.1c-0.6,3.5-2.6,5.6-5.3,6.6c-1.2,0.4-2.4,0.5-4,0.8c-1.2-0.4-2.8-0.6-4.2-1.4
          c-5.1-3-5.7-10.5-1.2-14.7c3.2-3,8-3.2,11.3-0.5C153.4,87.1,154.5,90.2,153.9,94.1z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st1"
            d="M71.6,88.7c-1.8-0.1-3.5,1.7-3.6,3.6c-0.1,2.3,1.4,3.9,3.6,4c1.9,0,3.6-1.6,3.6-3.5
          C75.3,90.5,73.7,88.7,71.6,88.7z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st1"
            d="M146,88.7c-2,0-3.6,1.7-3.5,3.9c0,1.9,1.6,3.6,3.4,3.6c2.2,0,3.8-1.6,3.8-3.9C149.6,90.5,147.9,88.7,146,88.7z
          "
            fill={theme.palette.primary.dark}
          />
          <path
            className="st1"
            d="M166.8,161.2c-5.5,3.9-12.2,6.3-19.5,6.3c-15.4,0-28.3-10.3-31.7-24.2c-0.4-1.6,0.5-3.3,2-3.8
          c9-2.6,15.3-8.8,15.3-15.9c0-9.6-11.2-17.3-25-17.3s-25,7.8-25,17.3c0,7.2,6.3,13.3,15.3,15.9c1.6,0.5,2.4,2.2,2,3.8
          c-3.5,13.9-16.4,24.2-31.7,24.2c-7.3,0-14.1-2.3-19.5-6.3c-0.9-0.7-2.2,0.3-1.6,1.3c5.5,10,16.3,16.8,28.8,16.8
          c15.4,0,28.2-10.3,31.7-24.1c3.5,13.8,16.4,24.1,31.7,24.1c12.5,0,23.3-6.8,28.8-16.8C169,161.5,167.8,160.5,166.8,161.2z"
            fill={theme.palette.primary.dark}
          />
        </g>
        <g>
          <path
            className="st2"
            d="M346.4,137.9l10.4,10.8l-14.1,12.6l-11-11.4c-7.5,4.2-16.2,6.5-25.4,6.5c-29,0-52.4-23.1-52.4-52.6
        c0-29.6,23.4-52.6,52.4-52.6c29,0,52.6,23,52.6,52.6C358.8,117,354.2,128.8,346.4,137.9z M317.5,135l-16.6-17.3l14.1-12.6
        l17.8,18.5c3.8-5.3,6.1-12.1,6.1-19.8c0-19.5-14.4-33.2-32.6-33.2c-18.2,0-32.6,13.7-32.6,33.2c0,19.3,14.4,33.1,32.6,33.1
        C310.2,136.9,314.1,136.2,317.5,135z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M439.7,82.2v72.2h-18.6v-8.1c-4.3,6.5-11.8,10.1-21.5,10.1c-15.3,0-27.3-10.7-27.3-29.9V82.2h18.6v42
        c0,9.8,5.9,14.9,14.3,14.9c9.1,0,15.9-5.3,15.9-17.9v-39H439.7z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M454.6,62.1c0-6.2,5.2-11.6,11.4-11.6c6.4,0,11.6,5.3,11.6,11.6s-5.2,11.4-11.6,11.4
        C459.8,73.5,454.6,68.3,454.6,62.1z M456.7,82.2h18.6v72.2h-18.6V82.2z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M488.6,118.3c0-21.5,16.2-38.1,38.1-38.1c14.1,0,26.4,7.5,32.3,18.6l-16,9.4c-2.9-5.9-9.1-9.7-16.5-9.7
        c-11.1,0-19.3,8.2-19.3,19.8c0,11.4,8.2,19.6,19.3,19.6c7.5,0,13.7-3.6,16.6-9.5l16.2,9.2c-6.2,11.3-18.5,18.8-32.6,18.8
        C504.8,156.4,488.6,139.8,488.6,118.3z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M614.1,154.4l-26.3-32.8v32.8h-18.6V53.3h18.6v60.6l24.8-31.8h22.2l-29,35.7l29.9,36.5H614.1z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M754.2,87.2c0,18.9-15,33.9-34.5,33.9h-17.8v33.2H682V53.3h37.7C739.1,53.3,754.2,68.3,754.2,87.2z
        M734.4,87.2c0-8.8-6.2-15.3-14.7-15.3h-17.8v30.6h17.8C728.2,102.5,734.4,95.9,734.4,87.2z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M835,82.2v72.2h-18.6v-8.5c-5.2,6.5-13,10.5-23.5,10.5c-19.2,0-35.1-16.6-35.1-38.1s15.9-38.1,35.1-38.1
        c10.5,0,18.3,4,23.5,10.5v-8.5H835z M816.4,118.3c0-12.1-8.5-20.4-20.1-20.4c-11.4,0-19.9,8.2-19.9,20.4c0,12.1,8.5,20.4,19.9,20.4
        C807.9,138.6,816.4,130.4,816.4,118.3z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M918.9,82.2l-26.3,72.2c-7.5,20.8-19.8,29.9-38.1,28.9v-17.3c10.3,0.1,15.5-4.2,18.9-13.9l-29.6-69.9h20.4
        l18.8,48.5l16-48.5H918.9z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M960,103.8c0-29.6,23.2-52.6,52.4-52.6c29.2,0,52.6,23,52.6,52.6c0,29.5-23.4,52.6-52.6,52.6
        C983.3,156.4,960,133.3,960,103.8z M1045.1,103.8c0-19.5-14.3-33.2-32.6-33.2c-18.3,0-32.6,13.7-32.6,33.2
        c0,19.3,14.3,33.1,32.6,33.1C1030.8,136.9,1045.1,123.2,1045.1,103.8z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M1103.1,100.1v30c0,7.8,5.6,7.9,16.3,7.4v16.9c-26.1,2.9-34.9-4.8-34.9-24.3v-30h-12.6V82.2h12.6V67.6
        l18.6-5.6v20.2h16.3v17.9H1103.1z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M1154.8,100.1v30c0,7.8,5.6,7.9,16.3,7.4v16.9c-26.1,2.9-34.9-4.8-34.9-24.3v-30h-12.6V82.2h12.6V67.6
        l18.6-5.6v20.2h16.3v17.9H1154.8z"
            fill={theme.palette.primary.dark}
          />
          <path
            className="st2"
            d="M1226,80.7v20.8c-9.7-1.2-21.9,3.2-21.9,18.3v34.5h-18.6V82.2h18.6v12.4C1207.8,84.8,1216.9,80.7,1226,80.7z"
            fill={theme.palette.mode === 'dark' || reverse ? theme.palette.common.white : theme.palette.common.black}
          />
        </g>
      </svg>
    </>*/
  );
};

// LogoMain.propTypes = {
//   reverse: PropTypes.bool
// };

export default LogoMain;