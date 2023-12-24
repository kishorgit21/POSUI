import { useEffect, useState } from 'react';

// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';

import Loader from 'components/Loader';
import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

import { dispatch } from 'store';
import { fetchDashboard } from 'store/reducers/menu';

// auth provider
import { AuthProvider as OttrAuthProvider } from 'contexts/ottrAuthContext';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

import SessionDialog from 'components/comman/SessionDialog'

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboard()).then(() => {
      setLoading(true);
    });
  }, []);

  if (!loading) return <Loader />;
  return (
    <ThemeCustomization>
      <RTLLayout>
        <Locales>
          <ScrollTop>
            <OttrAuthProvider>
              <>
                <Notistack>
                  <Routes />
                  <Snackbar />
                </Notistack>
              </>
            </OttrAuthProvider>
          </ScrollTop>
          <SessionDialog/>
        </Locales>
      </RTLLayout>
    </ThemeCustomization>
  );
};

export default App;
