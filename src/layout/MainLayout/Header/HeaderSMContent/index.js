// material-ui
import { Box, IconButton } from '@mui/material';
import logo from 'assets/images/ottr-logo.png';

import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router';

// project import
import MobileProfile from './MobileProfile';

//store
import { useDispatch, useSelector } from 'react-redux';
import { setNewBucketFlag, setEnquiryBucketFlag } from 'store/reducers/newbucketFlagReducer';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderSMContent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const dispatch = useDispatch();

    //new bucket Flag state and enquiry bucket flag by using reducer
    const { newbucketFlag, enquirybucketFlag } = useSelector((state) => state.newbucketFlagSlice);

    let currentPath = location.pathname;

    const handleBackArrow = () => {
        if (currentPath.includes('/apps/Transactions/bucket')) {
            if(currentPath.includes('/apps/Transactions/bucket/payment')){
                const localStore = localStorage.getItem('bucket')
                var parsedData;
                if (localStore) {
                    try {
                        parsedData = JSON.parse(localStore); // Parse the JSON string to a JavaScript object  
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                    }
                } 
                // console.log('parsedData',JSON.parse(localStore))
                navigate(`/apps/Transactions/bucket`, {
                    state: {
                        bucket: parsedData
                    }
                })            
            }
            else if (newbucketFlag === true) {
                dispatch(setNewBucketFlag(!newbucketFlag))
            }
            else if (enquirybucketFlag === true) {
                dispatch(setEnquiryBucketFlag(!enquirybucketFlag))
            }
            else {
                navigate('/newdashboard')
            }
        }
        else {
            if (currentPath.includes('/apps/Transactions/invoice-details')) {
                navigate(`/apps/Transactions/bucket`, {
                    state: {
                        invoice: 'invoice'
                    }
                })
            }
            else {
                navigate(-1); // This will go back one step in the history.
            }
        }
    }
    return (
        <>
            {currentPath.includes('/newdashboard') ?
                <img src={logo} alt="" width="80" /> :
                <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleBackArrow}
                    edge="end"
                    color="secondary"
                    sx={{ width: 0 }}
                >
                    <i className='icon-arrow-left ottr-icon' style={{ fontSize: '20px', color: '#2B3467' }} />
                </IconButton>
            }
            <Box sx={{ width: '100%', ml: 1 }} />
            <MobileProfile />
        </>
    );
};

export default HeaderSMContent;