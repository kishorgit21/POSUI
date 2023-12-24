import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Loader from './Loader'; // Import the loader component

// third-party
import { IntlProvider } from 'react-intl';

// project import
import useConfig from 'hooks/useConfig';

// load locales files
const loadLocaleData = (locale, setLoading) => {
  switch (locale) {
    case 'mr':
      return import('utils/locales/mr.json').then((d) => {
        setLoading(true);
        return d;
      });
    case 'en':
    default:
      return import('utils/locales/en.json').then((d) => {
        setLoading(true);
        return d;
      });
  }
};

// ==============================|| LOCALIZATION ||============================== //

const Locales = ({ children }) => {
  const { i18n } = useConfig();

  const [messages, setMessages] = useState();
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    setLoading(true);
    loadLocaleData(i18n, setLoading).then((d) => {
      setMessages(d.default);
      setLoading(false);
    })
    // .finally(() => {
    //   setLoading(false);
    // })
  }, [i18n]);

  return (
    <>


      {loading ? (
        <Loader />
      ) : (
        messages && (
          <IntlProvider locale={i18n} defaultLocale="en" messages={messages}>
            {children}
          </IntlProvider>
        )
      )}

    </>
  );
};

Locales.propTypes = {
  children: PropTypes.node
};

export default Locales;
