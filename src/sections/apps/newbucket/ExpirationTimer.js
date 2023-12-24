import React, { useState, useEffect } from 'react';
import { Typography, Stack,Button } from '@mui/material';

// Assets
import { useIntl } from 'react-intl';

const ExpirationTimer = ({ expiryTimestamp, handleUPIPaymentMethod }) => {

  // Localizations - multilingual
  const intl = useIntl();

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = Math.max(new Date(expiryTimestamp) - new Date(), 0);

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes: minutes.toString().padStart(2, '0'), // Format minutes to always have 2 digits
      seconds: seconds.toString().padStart(2, '0'), // Format seconds to always have 2 digits
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTimestamp]);

  return (
    <>
      {timeLeft.minutes == 0 && timeLeft.minutes == 0 ?
       <> 
       <Typography sx={{ textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#EB455F' }}>{intl.formatMessage({ id: 'Expired' })}</Typography>
       <Button size="small" variant="contained" color="primary" onClick={() => handleUPIPaymentMethod()}>
                                {intl.formatMessage({ id: 'Regenerate' })}
                            </Button>
       </>
        :
        <Stack direction='row' spacing={0.5}>
          <Typography sx={{ textAlign: 'right', fontSize: '14px', fontWeight: 400 }}>{intl.formatMessage({ id: 'Expiresin' })} </Typography>
          <Typography sx={{ textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#EB455F' }}>
            {timeLeft.minutes} : {timeLeft.seconds}
          </Typography>
        </Stack>
      }
    </>
  );
};

export default ExpirationTimer;