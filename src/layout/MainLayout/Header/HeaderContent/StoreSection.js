import { useState, useEffect } from 'react';

// material-ui
import { Box, FormControl, Select, MenuItem, useMediaQuery } from '@mui/material';

// store
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

//service
import { getStore } from '_api/master_Store';

// third party
import { useIntl } from 'react-intl';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200
    }
  }
};

// ==============================|| HEADER CONTENT - STORE SECTION ||============================== //

const StoreSection = () => {
  // Get store list, loading flag & another parameters
  const [stores, setStores] = useState([])
  const [storeValue, setStoreValue] = useState('');
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // Localizations - multilingual
  const intl = useIntl();

  useEffect(() => {
    // Get store list api call
    dispatch(getStore())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          // Reset updated flag
          const stores = payload.data;
          const filterStore = (stores?.filter((val) => val.recordStatus === 0) || [])
          filterStore.sort((a, b) => {
            const nameA = a.name.toUpperCase(); // Ignore case for sorting
            const nameB = b.name.toUpperCase();

            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
          setStores(filterStore)
          const localStore = localStorage.getItem('store')
          if (localStore) {
            const parsedData = JSON.parse(localStore); // Parse the JSON string to a JavaScript object
            const storeName = parsedData.id; // Access the "name" property
            setStoreValue(storeName);
          } else {
            setStoreValue(filterStore[0]?.id)
            localStorage.setItem('store', JSON.stringify(filterStore[0]))
          }

        }
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'MasterStoreListErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      });
  }, []);

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 } }}>
      <FormControl sx={{ width: { xs: '100%', md: 224 }, marginLeft: downSM ? '0px' : '5px' }}>
        <Select
          displayEmpty
          name="vendorId"
          id="product-category"
          onChange={($event) => {
            const value = $event.target.value;
            const storeObj = (stores?.filter((val) => val.recordStatus === 0) || []).find((val) => val.id === value);
            localStorage.setItem('store', JSON.stringify(storeObj))
            setStoreValue(value)
          }}
          value={storeValue || ''}
          size={downSM?'medium':'small'}
          className='pointer-event-none'
          MenuProps={MenuProps}
          sx={{'& .MuiSelect-select':{ paddingTop: downSM ? '15px' : '10.5px', paddingBottom: downSM ? '15px' : '10.5px' }}}
        >
          <MenuItem disabled value="">
            {intl.formatMessage({ id: 'Select Store' })}
          </MenuItem>
          {(stores?.filter((val) => val.recordStatus === 0) || [])?.map(({ id, name }) => (
            <MenuItem key={id} value={id} sx={{ whiteSpace: 'normal' }}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default StoreSection;