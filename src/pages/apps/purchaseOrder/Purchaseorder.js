// React apis
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dispatch } from 'store';
import { useIntl } from 'react-intl';

// Material-ui
import { alpha, useTheme } from '@mui/material/styles';
import { Button, Dialog, Stack, TextField, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, useMediaQuery, FormControlLabel, Switch, InputLabel } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { styled } from '@mui/material/styles';

// Third-party package apis
import NumberFormat from 'react-number-format';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// Services
import { getStore } from '_api/master_Store';
import { getVendor } from '_api/master_Vendor';
import { getProduct } from '_api/master_Product';
import { getByRole } from '_api/settings/settings';
import { deletePurchaseOrder, getPurchaseOrder, getPurchaseOrderbyID } from '_api/transactions/purchase-order';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';

// Propmt components
import DeleteAlert from 'components/comman/DeleteAlert';
import AddPurchaseOrder from 'sections/apps/PurchaseOrder/AddPurchaseOrder';
import Loader from 'components/Loader';

// Assets
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';

// Date adapters and support
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { Box } from '@mui/material';
import { setDeletedFlag } from 'store/reducers/deleteStateReducer';
import { setPurchaseOrderData } from 'store/reducers/transactions/purchase-order';
import moment from 'moment';

// Table style
const TableWrapper = styled('div')(() => ({
  '.header': {
    position: 'sticky',
    zIndex: 1,
    width: 'fit-content'
  },
  '& th[data-sticky-td]': {
    position: 'sticky',
    zIndex: '5 !important'
  }
}));

// Function to check if a date is valid
const isValidDate = (dateObject) => {
  return dateObject instanceof Date && !isNaN(dateObject);
};

//Date picker on focuse outline remove and input box crop
const StyledDatePicker = styled(DatePicker)({
  '& .MuiInputBase-input': {
    padding: '10.5px 0px 10.5px 12px',
  },
  '& .MuiInputBase-root.Mui-focused': {
    boxShadow: 'none', // Remove focus outline when DatePicker is focused
  },
});

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, getHeaderProps, handleAdd, setShowDelete, showDelete, setPurchaseOrderMetadata, setIsLoadingStart, date, setDate, setUpdated, deletelable, AddPurchaseOrder }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);

  // Sorting purchase order list parameters
  const sortBy = !showDelete ? [{ id: 'vendorName', desc: false }] : [{ id: 'recordStatus', desc: false }, { id: 'vendorName', desc: false }];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setHiddenColumns,

    rows,
    page,
    gotoPage,
    setPageSize,
    state: { globalFilter, pageIndex, pageSize },
    preGlobalFilteredRows,
    setGlobalFilter,

  } = useTable(
    {
      columns,
      data,
      // @ts-ignore
      filterTypes,
      // @ts-ignore
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['id', 'recordStatus', 'role'], sortBy: sortBy }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  // Reset hidden column list
  useEffect(() => {
    if (matchDownSM) {
      setHiddenColumns(['id', 'recordStatus', 'role','editRole']);
    } else {
      setHiddenColumns(['id', 'recordStatus', 'role','editRole']);
    }
    // eslint-disable-next-line

    return () => {
      setShowDelete(false);
    }
  }, [matchDownSM]);

  // Handle from date change
  const handleFromDateChange = (selectedDate) => {
    setDate((prevDate) => ({
      ...prevDate,
      fromDate: selectedDate,
    }));
    setUpdated(true)
  };

  // Handle to date change
  const handleToDateChange = (selectedDate) => {
    setDate((prevDate) => ({
      ...prevDate,
      toDate: selectedDate,
    }));
    setUpdated(true)
  };

  useEffect(() => {
    if (date.fromDate > date.toDate) {
      // if (moment(date.toDate).local().format("DD/MM/YYYY") >= moment(date.fromDate).local().format("DD/MM/YYYY")) {
      setUpdated(true)
    }
  }, [setDate, date])

  // /**
  //  * Handle new from & to date changes
  //  * @param {*} newDates 
  //  */
  // const handleFromToDateChange = (newDates) => {
  //   setDate(() => ({
  //     fromDate: newDates[0],
  //     toDate: newDates[1],
  //   }));
  // }

  // // Function to filter and get specific columns
  // function getColumns(data, columns) {
  //   return data.map(obj =>
  //     columns.reduce((acc, column) => {
  //       if (column in obj) {
  //         acc[column] = obj[column];
  //       }
  //       return acc;
  //     }, {})
  //   );
  // }

  // State to maintain Error msg in list
  const [listError, setListError] = useState();

  const intl = useIntl();

  // handle Error msg in list
  useEffect(() => {
    if (typeof globalFilter === 'undefined') {
      setListError(`${intl.formatMessage({ id: 'NoRecord' })}`);
    } else {
      setListError(`${intl.formatMessage({ id: 'searchResultNotFound' })}`);
    }
  }, [globalFilter]);

  // handle show delete records toggle
  const handleShowDelete = (event) => {
    setShowDelete(event.target.checked);
  };

  //form date validation variables
  const isFromDateEmpty = date.fromDate === null;
  const isFromDateInvalid = !isValidDate(date.fromDate);
  const isFromDateEmptyOrInvalid = isFromDateEmpty || isFromDateInvalid;

  //To date validation variables
  const isToDateEmpty = date.toDate === null;
  const isToDateInvalid = !isValidDate(date.toDate);
  const greaterDateVal = date.toDate >= date.fromDate;
  const isToDateEmptyOrInvalid = isToDateEmpty || isToDateInvalid || !greaterDateVal;

  return (
    <>
      {/* <TableRowSelection selected={selectedFlatRows.filter((item) => item.original.recordStatus === 0).length} /> */}
      <Stack spacing={3} className='table-filter'>
        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 1, pb: 0 }}
        >
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            size="large"
            className='transaction-search'
          />
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            spacing={1}
          >
            <Stack spacing={0.5}>
              <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'StartDate' })}</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>

                <StyledDatePicker
                  name="fromDate"
                  inputFormat="dd/MM/yyyy"
                  value={date.fromDate}
                  onChange={handleFromDateChange}
                  renderInput={(params) => (
                    <TextField
                      size='large' {...params}
                      error={isFromDateEmptyOrInvalid} // Add error prop to highlight the DatePicker when date is empty or invalid
                      sx={{ width: matchDownSM ? 'auto' : '150px' }}
                      value={date.fromDate ? date.fromDate.toLocaleDateString() : ''} // Display the selected date value
                      inputProps={{
                        readOnly: true, // Disable direct input
                        onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
            <Stack spacing={1}>
              <Box sx={{ mx: "5px" }} className='to-label'>{intl.formatMessage({ id: 'To' })}</Box>
            </Stack>

            <Stack spacing={0.5}>
              <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'EndDate' })}</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StyledDatePicker
                  inputFormat="dd/MM/yyyy"
                  name="toDate"
                  value={date.toDate}
                  minDate={date.fromDate}
                  onChange={handleToDateChange}
                  renderInput={(params) =>
                    <TextField
                      size='large' {...params}
                      error={isToDateEmptyOrInvalid} // Add error prop to highlight the DatePicker when date is empty or invalid
                      sx={{ width: matchDownSM ? 'auto' : '150px' }}
                      value={date.toDate ? date.toDate.toLocaleDateString() : ''} // Display the selected date value
                      inputProps={{
                        readOnly: true, // Disable direct input
                        onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                      }}
                    />
                  }
                />
              </LocalizationProvider>
            </Stack>

            <Stack spacing={0} sx={{ width: "190px" }}>
              <FormControlLabel
                className='show-toggle'
                value={showDelete}
                onChange={handleShowDelete}
                style={{ pointerEvents: "none", marginLeft: 0 }}
                control={<Switch color="primary" style={{ pointerEvents: "auto" }} />}
                label={deletelable}
                labelPlacement="start"
                sx={{ mr: 1, mt: 2.5 }}
              />
            </Stack>

            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
              <Tooltip title={AddPurchaseOrder}>
                <Button sx={{ mt: 2 }} className="btn-outlined-primary add-product" variant="outlined" endIcon={<i className='icon-plus ottr-icon'></i>} onClick={() => getPurchaseOrderMetadata({}, setPurchaseOrderMetadata, handleAdd, 'add', setIsLoadingStart)} size="large">
                  {intl.formatMessage({ id: 'Add' })}
                </Button>
              </Tooltip>
              {/* <CSVExport data={
              selectedFlatRows.length > 0
                ? getColumns(selectedFlatRows.filter((item) => item.original.recordStatus === 0).map((d) => d.original), ['date', 'storeName', 'vendorName'])
                : getColumns(data.filter((item) => item.recordStatus === 0), ['date', 'storeName', 'vendorName'])
            }
              filename={`${intl.formatMessage({ id: 'purchaseOrder' })}-${intl.formatMessage({ id: 'list' })}.csv`}
              isApiCallRequired={false}
            /> */}
            </Stack>
          </Stack>

        </Stack>
        <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className='ottr-table'>
          <TableWrapper>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow
                    key={i}
                    {...headerGroup.getHeaderGroupProps()}
                    sx={{
                      '& > th:first-of-type': { width: '150px' },
                      '& > th:last-of-type': { width: '150px' },
                      '& > th:nth-of-type(2)': { width: '150px' },
                      // '& > th:nth-of-type(3)': { width: '150px' }, 
                      '& > th:nth-of-type(3)': { width: '200px' }
                    }}
                  >
                    {headerGroup.headers.map((column, index) => (
                      <TableCell
                        sx={{ position: 'sticky !important' }}
                        key={index}
                        {...column.getHeaderProps([{ className: column.className }, getHeaderProps(column)])}
                      >
                        <HeaderSort column={column} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              <TableBody {...getTableBodyProps()}>
                {page.length ? (
                  page.map((row, i) => {
                    prepareRow(row);

                    return (
                      <Fragment key={i}>
                        <TableRow
                          {...row.getRowProps()}
                          onClick={() => {
                            if (page[i].values.recordStatus == 0) {
                              row.toggleRowSelected();
                            }
                          }}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: page[i].values.recordStatus == 1 ? alpha(theme.palette.secondary[100], 0.35) : 'inherit'
                          }}
                          className={page[i].values.recordStatus == 1 ? 'deleted-record' : ''}
                        >
                          {row.cells.map((cell, index) => (
                            <TableCell
                              sx={{ color: page[i].values.recordStatus == 1 ? '#7e7e7e' : 'inherit' }}
                              key={index}
                              {...cell.getCellProps([{ className: cell.column.className }])}
                            >
                              {cell.render('Cell')}
                            </TableCell>
                          ))}
                        </TableRow>
                      </Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={5}>
                      {listError}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableWrapper>
        </ScrollX>
        <Table className='bottom-pagination'>
          <TableBody>
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 2 }} colSpan={9} className='pagination-parent'>
                <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} isDisabled={page.length ? false : true} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  setPurchaseOrderMetadata: PropTypes.func,
  setIsLoadingStart: PropTypes.func,
  // date: PropTypes.instanceOf(Date).isRequired,
  setDate: PropTypes.func,
  setUpdated: PropTypes.func
};

// ==============================|| PURCHASE ORDER - LIST ||============================== //

// // Selection Cell and Header
// const SelectionCell = ({ row }) => {
//   // Set selected flag for each record action
//   row.isSelected = row.values.recordStatus === 1 ? false : row.isSelected;

//   return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} disabled={row.values.recordStatus === 1} />;
// };
const SelectionHeader = ({ getToggleAllPageRowsSelectedProps }) => (
  <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />
);

const CustomCell = ({ row, value }) => {
  const { values } = row;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {value === 'vendorName' ?
        <Tooltip title={values[value]} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 450 }}>
          <Stack spacing={0} >
            <Typography variant="subtitle1">{values[value]}</Typography>
          </Stack>
        </Tooltip>
        :
        <Stack spacing={0} >
          <Typography variant="subtitle1">{values[value]}</Typography>
        </Stack>
      }
    </Stack>
  );
};

const NumberFormatCell = ({ value }) => <NumberFormat displayType="text" format="##########" mask="_" defaultValue={value} />;

/**
 * Get purchase order metadata
 * @param {*} selectedPurchaseOrder 
 * @param {*} setPurchaseOrderMetadata 
 * @param {*} handleAdd 
 * @param {*} status 
 * @param {*} setIsLoadingStart 
 * @param {*} setPurchaseOrder 
 */
const getPurchaseOrderMetadata = (selectedPurchaseOrder, setPurchaseOrderMetadata, handleAdd, status, setIsLoadingStart, setPurchaseOrder) => {

  // Reset loading flag
  setIsLoadingStart(true);

  // Set get purchase order by id model
  const model = {
    id: selectedPurchaseOrder.id
  };

  // Set purchase order metadata object
  var purchaseOrderMetadata = {
    storeList: [],
    vendorList: [],
    productList: []
  }

  // Get by id store api call
  dispatch(getStore({ model }))
    .unwrap()
    .then((payload) => {
      // Check for error & success
      if (payload && payload.isError) {
        // Handle error

      } else {
        // Set store list
        purchaseOrderMetadata.storeList = payload.data;
      }
    })
    .catch((error) => {
      if (error && error.code === "ERR_BAD_REQUEST") {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Store Get by Id: Validation Error.\nInvalid/ empty store id.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    })
    .then(() => {
      // Get by id vendor api call
      dispatch(getVendor({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError) {
            // Handle error

          } else {
            // Set vendor list
            purchaseOrderMetadata.vendorList = payload.data;
          }
        })
        .catch((error) => {
          if (error && error.code === "ERR_BAD_REQUEST") {
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'MasterVendorGetByIdErrorMsg' })}`,
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          }
        })
        .then(() => {
          // Get by id product api call
          dispatch(getProduct({ model }))
            .unwrap()
            .then((payload) => {
              // Check for error & success
              if (payload && payload.isError) {
                // Handle error

              } else {
                // Set product list
                purchaseOrderMetadata.productList = payload.data;

                // Set purchase order metadata
                setPurchaseOrderMetadata(purchaseOrderMetadata);

                // Handle add of specific task
                if (status === 'add') {
                  handleAdd('add');
                } else if (status === 'edit') {
                  // Get purchase order data by id
                  getPurchaseOrderById(selectedPurchaseOrder, setPurchaseOrder, handleAdd, 'edit');
                } else if (status === 'view') {
                  // Get purchase order data by id
                  getPurchaseOrderById(selectedPurchaseOrder, setPurchaseOrder, handleAdd, 'view');
                }
              }
            })
            .catch((error) => {
              if (error && error.code === "ERR_BAD_REQUEST") {
                dispatch(
                  openSnackbar({
                    open: true,
                    message: 'Product Get by Id: Validation Error.\nInvalid/ empty product id.',
                    variant: 'alert',
                    alert: {
                      color: 'error'
                    },
                    close: true
                  })
                );
              }
            })
        })
    })

}


/**
 * Get purchase order by id
 * @param {*} selectedPurchaseOrder 
 * @param {*} setPurchaseOrder 
 * @param {*} handleAdd 
 * @param {*} status 
 */
const getPurchaseOrderById = (selectedPurchaseOrder, setPurchaseOrder, handleAdd, status) => {
  // Set get purchase order by id model
  const model = {
    id: selectedPurchaseOrder.id
  };

  // Get by id purchase order api call
  dispatch(getPurchaseOrderbyID({ model }))
    .unwrap()
    .then((payload) => {
      // Check for error & success
      if (payload && payload.isError) {
        // Handle error

      } else {
        const purchaseOrderDetailsArray = payload.data.purchaseOrderDetails.map(item => ({
          ...item,
          minDate: new Date().toISOString() // Add the current date as an ISO string
        }));
        const updatedData = {
          ...payload.data,
          purchaseOrderDetails: purchaseOrderDetailsArray
        };

        // console.log(updatedData);

        // Set purchase order
        setPurchaseOrder(updatedData);

        // Handle add of specific task
        if (status === 'edit') {
          handleAdd('edit');
        } else if (status === 'view') {
          handleAdd('view');
        }
      }
    })
    .catch((error) => {
      if (error && error.code === "ERR_BAD_REQUEST") {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Purchase order Get by Id: Validation Error.\nInvalid/ empty purchase order id.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    });
}

/**
 * Action cell
 * @param {*} row 
 * @param {*} setPurchaseOrder 
 * @param {*} setPurchaseOrderDeleteId 
 * @param {*} handleClose 
 * @param {*} handleAdd 
 * @param {*} handleReadonly 
 * @param {*} theme 
 * @param {*} setPurchaseOrderMetadata 
 * @param {*} setIsLoadingStart 
 * @returns 
 */
const ActionCell = (row, setPurchaseOrder, setPurchaseOrderDeleteId, handleClose, handleAdd, handleReadonly, theme, setPurchaseOrderMetadata, setIsLoadingStart) => {
  const intl = useIntl()
  // const collapseIcon = row.isExpanded ? (
  //   <CloseOutlined style={{ color: theme.palette.error.main }} />
  // ) : (
  //   <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
  // );
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0} className='action-icons'>
      {(row.values && row.values.recordStatus === 0) ?
        <>  {!row.values.editRole ? 
          <Tooltip title={intl.formatMessage({ id: 'view' })}>
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              getPurchaseOrderMetadata(row.values, setPurchaseOrderMetadata, handleAdd, 'view', setIsLoadingStart, setPurchaseOrder);
            }}
          >
            <i className='icon-eye ottr-icon' />
          </IconButton>
        </Tooltip> :
          <Tooltip title={intl.formatMessage({ id: 'edit' })}>
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                getPurchaseOrderMetadata(row.values, setPurchaseOrderMetadata, handleAdd, 'edit', setIsLoadingStart, setPurchaseOrder);
              }}
            >
              {/* <EditTwoTone twoToneColor={theme.palette.primary.main} /> */}
              <i className='icon-edit ottr-icon'></i>
            </IconButton>
          </Tooltip>}
          {row.values.role &&
            <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setPurchaseOrderDeleteId(row.values);
                  handleClose();
                }}
              >
                {/* <DeleteTwoTone twoToneColor={theme.palette.error.main} /> */}
                <i className='icon-trash ottr-icon'></i>
              </IconButton>
            </Tooltip>
          }
        </>
        :
        <span>{intl.formatMessage({ id: 'Deleted' })}</span>
      }

    </Stack>
  );
};

NumberFormatCell.propTypes = {
  value: PropTypes.string
};

CustomCell.propTypes = {
  row: PropTypes.object
};

// SelectionCell.propTypes = {
//   row: PropTypes.object
// };

SelectionHeader.propTypes = {
  getToggleAllPageRowsSelectedProps: PropTypes.func
};

/**
 * Purchase order list page
 * @returns 
 */
const PurchaseOrder = () => {
  const theme = useTheme();

  // Set add purchase order state
  const [add, setAdd] = useState(false);

  // Set readonly flag
  const [readonly, setReadOnly] = useState(false);

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected purchase order state
  const [purchaseOrder, setPurchaseOrder] = useState();

  // Set selected purchase order metadata state
  const [purchaseOrderMetadata, setPurchaseOrderMetadata] = useState();

  // Set purchase order delete id state
  const [purchaseOrderDeleteId, setPurchaseOrderDeleteId] = useState();

  // Set purchase order start flag
  const [isLoadingStart, setIsLoadingStart] = useState(false);

  // Get the current date
  const currentDate = new Date();

  // Calculate yesterday's date
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  // Set purchase order date state
  const [date, setDate] = useState({ fromDate: yesterday, toDate: new Date() });

  // Set add/edit store status state
  const [addEditStatus, setAddEditStatus] = useState('');

  /**
   * Handle add purchase order
   * @param {*} status
   */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
      setIsLoadingStart(false);
    } else if (status === 'add') {
      setPurchaseOrder(null);
      setAddEditStatus('add');
      setAdd(true);
      setIsLoadingStart(false);
    } else if (status === 'view') {
      setAddEditStatus('view');
      setAdd(true);
      setIsLoadingStart(false);
    } else {
      // Reset Date
      // setDate((prevDate) => ({
      //   ...prevDate,
      //   toDate: new Date(),
      // }));

      setAddEditStatus('');
      setAdd(false);
    }
  };

  /**
   * Handle read only function
   */
  const handleReadonly = () => {
    setReadOnly(!readonly);
  };

  /**
   * Close prompt event
   * @param {*} isOpen 
   * @param {*} status 
   */
  const handleClose = (isOpen, status) => {
    if (status === 'delete') {
      // Set delete model
      const model = {
        id: purchaseOrderDeleteId.id
      }

      // Delete purchase order api call
      dispatch(deletePurchaseOrder({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError) {
            // Handle error
            if (payload.errorCode === 'E_DEPEDENCY_EXISTS') {
              dispatch(
                openSnackbar({
                  open: true,
                  message: `${intl.formatMessage({ id: 'TransactionnPurchaseOrderMIDeleteError' })}`,
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
            else if (payload.errorCode === 'E_PERMISSIONDEINED') {
              dispatch(
                openSnackbar({
                  open: true,
                  message: `${intl.formatMessage({ id: 'SettingRoleErrorMsg' })}`,
                  variant: 'alert',
                  alert: {
                    color: 'error'
                  },
                  close: true
                })
              );
            }
          } else {
            // Toaster for success
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'TransactionPurchaseOrderToastDelete' })}`,
                variant: 'alert',
                alert: {
                  color: 'success'
                },
                close: true
              })
            );

            // Reset updated flag
            setUpdated(true);
          }
        })
        .catch((error) => {
          if (error && error.code === "ERR_BAD_REQUEST") {
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'TransactionnPurchaseOrderDeleteError' })}`,
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          }
        });

      // Reset open flag
      setOpen(false);
    } else if (status === 'cancel') {
      // Reset open flag
      setOpen(false);
    } else if (status === undefined) {
      // Reset open flag
      setOpen(true);
    }
  };

  const intl = useIntl();

  // Sorting function
  function compareNumericString(rowA, rowB, id) {
    const valueA = rowA.values[id].toLowerCase();
    const valueB = rowB.values[id].toLowerCase();
    const statusA = rowA.values.recordStatus === 0 ? 0 : 1;
    const statusB = rowB.values.recordStatus === 0 ? 0 : 1;

    if (statusA < statusB) {
      return -1;
    }
    if (statusA > statusB) {
      return 1;
    }
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;

  }

  // Set column list
  const columns = useMemo(
    () => [
      // {
      //   title: 'Row Selection',
      //   Header: SelectionHeader,
      //   accessor: 'selection',
      //   Cell: SelectionCell,
      //   disableSortBy: true,
      //   disableGlobalFilter: true,
      // },

      {
        Header: `${intl.formatMessage({ id: 'Id' })}`,
        accessor: 'id',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'PO.NO.' })}`,
        accessor: 'documentNumber',
        Cell: ({ row }) => <CustomCell row={row} value='documentNumber' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'Date' })}`,
        Cell: ({ row }) => <CustomCell row={row} value={intl.formatMessage({ id: 'Date' })} />,
        accessor: d => {
          return moment(d.date)
            .local()
            .format("DD/MM/YYYY")
        }
      },
      {
        Header: `${intl.formatMessage({ id: 'StoreName' })}`,
        accessor: 'storeName',
        Cell: ({ row }) => <CustomCell row={row} value='storeName' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'VendorName' })}`,
        accessor: 'vendorName',
        Cell: ({ row }) => <CustomCell row={row} value='vendorName' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `role`,
        accessor: 'role',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true
      },
      {
        Header: `editRole`,
        accessor: 'editRole',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true
      },
      {
        Header: `${intl.formatMessage({ id: 'action' })}`,
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setPurchaseOrder, setPurchaseOrderDeleteId, handleClose, handleAdd, handleReadonly, theme, setPurchaseOrderMetadata, setIsLoadingStart),
        disableGlobalFilter: true,
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  // Get product list, loading flag & another parameters
  const { isLoading, purchaseOrders } = useSelector((state) => state.purchaseOrderSlice);

  //Set role state
  const [role, setRole] = useState(false);
  const [editRole, setEditRole] = useState(false);

  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);
  const [filteredData, setFilteredData] = useState([]);
  const { search } = useSelector((state) => state.searchStateSlice);

  useEffect(() => {
    const data = isDeleted ? purchaseOrders : purchaseOrders.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemStoreName = item.storeName.toLowerCase();
      const itemDocumentNumber = item.documentNumber.toLowerCase();
      const itemName = item.vendorName.toLowerCase(); // Convert item name to lowercase
      const searchTerm = search.toLowerCase(); // Convert search term to lowercase
      return itemName.includes(searchTerm) || itemStoreName.includes(searchTerm) || itemDocumentNumber.includes(searchTerm);
    });
    const itemsWithRole = filteredItems.map((item) => {
      return {
        ...item, // Copy the original item properties
        editRole:editRole,
        role: role, // Add the role object as a property
      };
    });
    setFilteredData(itemsWithRole);
  }, [isDeleted, purchaseOrders, search, role]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fromDay = new Date(date.fromDate.getFullYear(), date.fromDate.getMonth(), date.fromDate.getDate());
    const toDay = new Date(date.toDate.getFullYear(), date.toDate.getMonth(), date.toDate.getDate());
    if (fromDay > toDay) {
      setPurchaseOrderData([]);
      dispatch(
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'StartAndEndDateVal' }),
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
    else if (isValidDate(date.fromDate) && isValidDate(date.toDate)) {
      // Set model to get purchase order list
      var paramObj = {
        model: {
          fromDate: encodeURIComponent(date.fromDate.toISOString()),
          toDate: encodeURIComponent(date.toDate.toISOString())
        }
      }
      // Get purchase order list api call
      dispatch(getPurchaseOrder(paramObj))
        .unwrap()
        .then((payload) => {
          if (payload && payload.isError) {
            // Handle error

          } else {
            // Reset updated flag
            setUpdated(false);
          }
        })
        .catch((error) => {
          if (error && error.code === "ERR_BAD_REQUEST") {
            dispatch(
              openSnackbar({
                open: true,
                message: 'Purchase Order List: Unknown Error.\nPurchase Order list getting rejected.',
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          }
          setUpdated(false);
        })
    }
  }, [updated, date, setDate]);

  // Reset deleted flag globally
  const setShowDelete = (value) => {
    dispatch(setDeletedFlag(value));
  }

  useEffect(() => {
    // Get role data api call
    dispatch(getByRole())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          const getDeleteSetting = payload.data.filter((val) => val.featureName == 'DeletePurchaseOrder')
          const getDeleteSettingPermission = getDeleteSetting.filter((val) => val.hasPermission == true)
          const hasPermission = getDeleteSettingPermission.length == 0 ? false : getDeleteSettingPermission[0].hasPermission;
          setRole(hasPermission)

          const getEditSetting = payload.data.filter((val) => val.featureName == 'EditPurchaseOrder')
          const getEditSettingPermission = getEditSetting.filter((val) => val.hasPermission == true)
          const hasEditPermission = getEditSettingPermission.length == 0 ? false : getEditSettingPermission[0].hasPermission;
          setEditRole(hasEditPermission)
        }
      })
      .catch((error) => {
        if (error && error.code === "ERR_BAD_REQUEST") {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'SettingErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      })

  }, []);

  return (
    <>
      {isLoading || isLoadingStart && <Loader />}
      <MainCard content={false} className="ottr-table-section" sx={{ justifyContent: "center" }}>
        <ScrollX>
          <ReactTable
            columns={columns}
            data={filteredData}
            handleAdd={handleAdd}
            getHeaderProps={(column) => column.getSortByToggleProps()}
            setShowDelete={setShowDelete}
            showDelete={isDeleted}
            setPurchaseOrderMetadata={setPurchaseOrderMetadata}
            setIsLoadingStart={setIsLoadingStart}
            date={date}
            setDate={setDate}
            setUpdated={setUpdated}
            deletelable={intl.formatMessage({ id: 'ShowDeletelabel' })}
            AddPurchaseOrder={intl.formatMessage({ id: 'AddPurchaseOrder' })} />
        </ScrollX>

        {open && <DeleteAlert title={intl.formatMessage({ id: 'purchaseOrder' })} name={purchaseOrderDeleteId?.vendorName} open={open} handleClose={handleClose} />}

        {/* add user dialog */}
        {add && <Dialog
          className='ottr-model'
          maxWidth="md"
          TransitionComponent={PopupTransition}
          keepMounted
          fullWidth
          // onClose={handleAdd}
          onClose={() => setAdd(true)}
          open={add}
          sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
          aria-describedby="alert-dialog-slide-description"
        >
          <AddPurchaseOrder addEditStatus={addEditStatus} purchaseOrder={purchaseOrder} purchaseOrderMetadata={purchaseOrderMetadata} onCancel={handleAdd} setUpdated={setUpdated} />
        </Dialog>}
      </MainCard>
    </>

  );
};

export default PurchaseOrder;