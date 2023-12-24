import { useState } from 'react';

// material-ui
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// project import
import MainCard from 'components/MainCard';

// ==============================|| DATE PICKER - HELPER TEXT ||============================== //

export default function HelperText() {
  const [value, setValue] = useState(null);

  const helperDatepickerCodeString = `<LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="Helper Text"
    value={value}
    onChange={(newValue) => {
      setValue(newValue);
    }}
    renderInput={(params) => <TextField {...params} placeholder="Helper Text" helperText={params?.inputProps?.placeholder} />}
  />
</LocalizationProvider>`;

  return (
    <MainCard title="Helper Text" codeString={helperDatepickerCodeString}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Helper Text"
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField {...params} placeholder="Helper Text" helperText={params?.inputProps?.placeholder} />}
        />
      </LocalizationProvider>
    </MainCard>
  );
}
