import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import useAuth from 'hooks/useAuth';

import { useContext } from 'react';

// auth provider
import AuthContext from 'contexts/ottrAuthContext';
// import AuthContext from '../../contexts/ottrAuthContext';

// project import
// import useAuth from 'hooks/useAuth';

// ==============================|| AUTH GUARD ||============================== //

const OttrAuthGuard = ({ children }) => {
  // const { isLoggedIn } = useAuth();
  const { isLoggedIn } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();
  // const nextStep = localStorage.getItem('nextStepOTP');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', {
        state: {
          from: location.pathname
        },
        replace: true
      });
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
};

OttrAuthGuard.propTypes = {
  children: PropTypes.node
};

export default OttrAuthGuard;
