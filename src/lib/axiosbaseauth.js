// Axios
import axios from "axios";

// Create axios instance
const instance = axios.create({
    // baseURL: process.env.REACT_APP_API_AUTH_URL,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {

       // Reset authorization token
       config.headers.Authorization = `Bearer ${localStorage.getItem('authToken')}`;
        
       const fixedUrlPart = process.env.REACT_APP_AUTH_FIXED_URL; // Replace with your fixed URL part
       config.url = `${fixedUrlPart}${config.url}`;
       
       return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(response => {
    return response;
}, error => {
    if ((error && error.response && error.response.status && error.response.status === 401) || (error && error.code === 'ERR_NETWORK')) { // error.code === 'ERR_NETWORK'
        
        // // Show toaster for session timeout
        // dispatch(
        //     openSnackbar({
        //         open: true,
        //         message: <FormattedMessage id="sessionTimeOutError" />,
        //         variant: 'alert',
        //         alert: {
        //             color: 'error'
        //         },
        //         close: true
        //     })
        // )

        // // Navigate to login page
        // setTimeout(() => {
        //     localStorage.clear();
        //     window.location.href = '/';
        // }, 1000)

    }
    return Promise.reject(error);
});

export default instance;
