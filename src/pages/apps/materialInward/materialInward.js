// React apis
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, Fragment } from 'react';

// Material-ui
import { alpha, useTheme } from '@mui/material/styles';
import { Button, Box, TextField, Dialog, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, useMediaQuery, FormControlLabel, Switch, InputLabel } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

// Date adapters and support
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Third-party Package Apis
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { styled } from '@mui/material/styles';

// Project Import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';
import Loader from 'components/Loader';
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';

// Propmt components
import AddMaterialInward from 'sections/apps/materialInward/AddMaterialInward';
import DeleteAlert from 'components/comman/DeleteAlert';
import PrintProductBarcodeList from 'sections/apps/materialInward/PrintProductBarcodeList';

// Services
import { getMaterialInward, deleteMaterialInward, getByIdMaterialInward, getQRCodeDetails } from '_api/transactions/material_Inward';
import { getByRole } from '_api/settings/settings';

// Reducers
import { useDispatch, useSelector } from 'react-redux';

//Store
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { setDeletedFlag } from 'store/reducers/deleteStateReducer';
import { setMaterialInwardData } from 'store/reducers/transactions/material_Inwards';

// Table Style
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

function ReactTable({ columns, data, date, setDate, setUpdated, getHeaderProps, handleAdd, setShowDelete, showDelete, deletelable, addMaterialInward }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const filterTypes = useMemo(() => renderFilterTypes, []);
  // State to maintain error msg in list
  const [listError, setListError] = useState();

  // Sorting material inward list parameters
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
    setGlobalFilter
  } = useTable(
    {
      columns,
      data,
      // @ts-ignore
      filterTypes,
      // @ts-ignore
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['id', 'recordStatus','role'], sortBy: sortBy }
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
      setHiddenColumns(['id', 'date', 'recordStatus','role','editRole']);
    } else {
      setHiddenColumns(['id', 'date', 'recordStatus','role','editRole']);
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
      //if (moment(date.toDate).local().format("DD/MM/YYYY") >= moment(date.fromDate).local().format("DD/MM/YYYY")) {
      setUpdated(true)
    }
  }, [setDate, date])

  // handle Error msg in list
  useEffect(() => {
    if (typeof globalFilter === 'undefined') {
      setListError(`${intl.formatMessage({ id: 'NoRecord' })}`);
    } else {
      setListError(`${intl.formatMessage({ id: 'searchResultNotFound' })}`);
    }
  }, [globalFilter]);

  // Handle show delete records toggle
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
          sx={{ p: 3, pb: 0 }}
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
                  renderInput={(params) =>
                    <TextField
                      size='large' {...params}
                      error={isFromDateEmptyOrInvalid} // Add error prop to highlight the DatePicker when date is empty or invalid
                      sx={{ width: matchDownSM ? 'auto' : '150px' }}
                      value={date.fromDate ? date.fromDate.toLocaleDateString() : ''} // Display the selected date value
                      inputProps={{
                        readOnly: true, // Disable direct input
                        onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                      }}
                    // helperText={
                    //   isFromDateEmpty
                    //     ? intl.formatMessage({ id: 'TransactionStartDateRequired' })
                    //     : isFromDateInvalid
                    //     ? intl.formatMessage({ id: 'invalidDateFormat' })
                    //     : ''
                    // }
                    />}
                />
              </LocalizationProvider>
            </Stack>
            <Stack spacing={1}>
              <Box sx={{ mx: '5px' }} className='to-label'> {intl.formatMessage({ id: 'To' })} </Box>
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
                    // helperText={
                    //   isToDateEmpty
                    //     ? intl.formatMessage({ id: 'TransactionStartDateRequired' })
                    //     : isToDateInvalid
                    //       ? intl.formatMessage({ id: 'invalidDateFormat' })
                    //       : ''
                    // }
                    />}
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
              <Tooltip title={addMaterialInward}>
                <Button sx={{ mt: 2 }} className="btn-outlined-primary add-product" variant="outlined" endIcon={<i className='icon-plus ottr-icon'></i>} onClick={() => handleAdd('add')} size="large">
                  {intl.formatMessage({ id: 'Add' })}
                </Button>
              </Tooltip>
              {/* <CSVExport
                data={
                  selectedFlatRows.length > 0
                    ? selectedFlatRows.filter((item) => item.original.recordStatus === 0).map((d) => { const { id, ...rest } = d.original; return { id, ...rest } })
                    : (showDelete ? rows.map((data) => { const { id, ...rest } = data.original; return { id, ...rest } }) : rows.filter((item) => item.original.recordStatus === 0).map((data) => { const { id, ...rest } = data.original; return { id, ...rest } }))
                }
                filename={`${intl.formatMessage({ id: 'MaterialInward' })}-${intl.formatMessage({ id: 'list' })}.csv`}
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
                      '& > th:first-of-type': { width: '100px' },
                      '& > th:last-of-type': { width: '150px' },
                      // '& > th:nth-of-type(2)': { width: '50px' }, 
                      '& > th:nth-of-type(2)': { width: '500px' },
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
                    <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={4}>
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
  handleAdd: PropTypes.func
};

// Section Cell and Header
const SelectionCell = ({ row }) => {
  // Set selected flag for each record action
  row.isSelected = row.values.recordStatus === 1 ? false : row.isSelected;

  return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} disabled={row.values.recordStatus === 1} />;
};

// const SelectionHeader = ({ getToggleAllPageRowsSelectedProps }) => (
//   <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />
// );

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

/**
 * Get material inward by id
 * @param {*} selectedMaterialInward 
 * @param {*} setMaterialInward 
 * @param {*} handleAdd 
 * @param {*} status 
 */
const getMaterialInwardById = (selectedMaterialInward, setMaterialInward, handleAdd, status) => {

  // Set get material inward by id model
  const model = {
    id: selectedMaterialInward.id
  };

  // Get by id material inward api call
  dispatch(getByIdMaterialInward({ model }))
    .unwrap()
    .then((payload) => {
      // Check for error & success
      if (payload && payload.isError) {
        // Handle error
      } else {
        //updated material inward details list
        const updatedList = payload?.data?.materialInwardDetails.map((val) => {
          // const material_Inward_Exp_Date = payload?.data?.date;
          // const newExpDate = new Date(material_Inward_Exp_Date);
          // newExpDate.setDate(newExpDate.getDate() + val.days - 1);
          // val.expiryDate = newExpDate;
          val.poQuantity = val.quantity;
          val.mindate = val.expiryDate;
          return val;
        });

        const data = {
          ...payload.data,
          materialInwardDetails: updatedList
        }
        // Set material inward
        setMaterialInward(data);

        // Handle add of specific task
        if (status === 'edit') {
          handleAdd('edit');
        } else if (status === 'view') {
          handleAdd('view');
        }
      }
    })
    .catch((error) => {
      if (error && error.code === 'ERR_BAD_REQUEST') {
        dispatch(
          openSnackbar({
            open: true,
            // message: `${intl.formatMessage({ id: 'MaterialInwardGetByIdErrorMsg' })}`,
            message: 'sdsd',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    });
};

const ActionCell = (row, setMaterialInward, setMaterialInwardDelete, handleClose, handleGenerateBarcode, handleAdd) => {
  const intl = useIntl()
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0} className='action-icons'>

      {row.values && row.values.recordStatus === 1 ? (
        <span>{intl.formatMessage({ id: 'Deleted' })}</span>
      ) : (
        <>
        {!row.values.editRole ? 
             <Tooltip title={intl.formatMessage({ id: 'view' })}>
             <IconButton
               color="primary"
               onClick={(e) => {
                 e.stopPropagation();
                 getMaterialInwardById(row.values, setMaterialInward, handleAdd, 'view');
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
                getMaterialInwardById(row.values, setMaterialInward, handleAdd, 'edit');
              }}
            >
              <i className='icon-edit ottr-icon' />
            </IconButton>
          </Tooltip>}

          <Tooltip title={intl.formatMessage({ id: 'QRCode' })}>
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateBarcode(row.values);
              }}
            >
              <i className='icon-qrcode2 ottr-icon' />
            </IconButton>
          </Tooltip>
          {row.values.role &&
            <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  setMaterialInwardDelete(row.values);
                }}
              >
                <i className='icon-trash ottr-icon' />
              </IconButton>
            </Tooltip>}
        </>
      )}
    </Stack>
  );
};

CustomCell.propTypes = {
  row: PropTypes.object
};

SelectionCell.propTypes = {
  row: PropTypes.object
};

// SelectionHeader.propTypes = {
//   getToggleAllPageRowsSelectedProps: PropTypes.func
// };


// ==============================|| MATERIAL INWARD - LIST ||============================== //

const MaterialInward = () => {
  const theme = useTheme();

  // Set add material inward state
  const [add, setAdd] = useState(false);

  // Set readonly flag
  const [readonly, setReadOnly] = useState(false);

  // Set add/edit material inward status state
  const [addEditStatus, setAddEditStatus] = useState("");

  // Get the current date
  const currentDate = new Date();

  // Calculate yesterday's date
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  // Set material inward date state
  const [date, setDate] = useState({ fromDate: yesterday, toDate: new Date() });

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected material inward state
  const [materialInward, setMaterialInward] = useState();

  // Set selected QR code details for material inward product state
  const [qrCodeMIProductDetails, setQRCodeMIProductDetails] = useState();

  // Barcode generate dialog state
  const [isShowPrint, setIsShowPrint] = useState(false);

  // Set material inward delete id state
  const [materialInwardDelete, setMaterialInwardDelete] = useState();

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  // Get material inward list, loading flag & another parameters
  const { isLoading, materialinwards } = useSelector((state) => state.materialInwardsSlice);

  //set filter data of material inward
  const [filteredData, setFilteredData] = useState([]);

  const dispatch = useDispatch();

  const intl = useIntl();

  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);

  // Get search state from global store
  const { search } = useSelector((state) => state.searchStateSlice);

  //Set role state
  const [role, setRole] = useState(false);
  const [editRole, setEditRole] = useState(false);

  useEffect(() => {
    const data = isDeleted ? materialinwards : materialinwards.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemName = item.vendorName.toLowerCase(); // Convert item name to lowercase
      const searchTerm = search.toLowerCase(); // Convert search term to lowercase
      return itemName.includes(searchTerm);
    });
    const itemsWithRole = filteredItems.map((item) => {
      return {
        ...item, // Copy the original item properties
        editRole:editRole,
        role: role, // Add the role object as a property
      };
    });
    setFilteredData(itemsWithRole);
  }, [isDeleted, materialinwards, search, role]);

  /**
  * Handle add Material Inward
  * @param {*} status
  */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
      // setIsLoadingStart(false);
    } else if (status === 'add') {
      // console.log('status: ', status);
      setMaterialInward('');
      setAddEditStatus('add');
      setAdd(true);
      // setIsLoadingStart(false);
    } else if (status === 'view') {
      setAddEditStatus('view');
      setAdd(true);
      // setIsLoadingStart(false);
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
  * Handle Material Inward Delete
  * @param {*} isOpen
  * @param {*} status
  */
  const handleClose = (isOpen, status) => {
    if (status === 'delete') {
      // Set delete model
      const model = {
        id: materialInwardDelete.id
      };

      // Delete MaterialInward api call
      dispatch(deleteMaterialInward({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError && payload.errorCode === "E_DEPEDENCY_EXISTS") {
            // Handle error
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'MaterialInwardDeleteBalanceError' })}`,
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                close: true
              })
            );
          } else if (payload.errorCode === 'E_PERMISSIONDEINED') {
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
          else {
            // Toaster for success
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'TransactionMaterialInwardTostDelete' })}`,
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
          if (error && error.code === 'ERR_BAD_REQUEST') {
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'MaterialInwardDeleteErrorMsg' })}`,
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

  /**
  * Handle Generate Barcode Material Inward Products
  * @param {*} row 
  */
  const handleGenerateBarcode = (row) => {
    setIsShowPrint(true);
    // Set get QR code deatils for material inward by id model
    const model = {
      id: row.id
    };

    // Get by id material inward api call
    dispatch(getQRCodeDetails({ model }))
      .unwrap()
      .then((payload) => {
        // Check for error & success
        if (payload && payload.isError) {
          // Handle error
        } else {
          // Set QR code details for material inward product state
          setQRCodeMIProductDetails(payload.data);

          // Handle add of specific task
          if (status === 'edit') {
            handleAdd('edit');
          } else if (status === 'view') {
            handleAdd('view');
          }
        }
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              // message: `${intl.formatMessage({ id: 'MaterialInwardGetByIdErrorMsg' })}`,
              message: 'sdsd',
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
        displayType: 'none',
        disableGlobalFilter: true,
      },
      // {
      //   Header: `${intl.formatMessage({ id: 'Number' })}`,
      //   accessor: 'documentNumber',
      //   Cell: ({ row }) => <CustomCell row={row} value='documentNumber' />
      // },
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
        Header: `${intl.formatMessage({ id: 'VendorName' })}`,
        accessor: 'vendorName',
        Cell: ({ row }) => <CustomCell row={row} value='vendorName' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
        displayType: 'none',
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
        Cell: ({ row }) => ActionCell(row, setMaterialInward, setMaterialInwardDelete, handleClose, handleGenerateBarcode, handleAdd, handleReadonly),
        disableGlobalFilter: true,
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  useEffect(() => {
    if (isValidDate(date.fromDate) && isValidDate(date.toDate)) {
      // Set model to get material inward list
      var paramObj = {
        model: {
          fromDate: encodeURIComponent(date.fromDate.toISOString()),
          toDate: encodeURIComponent(date.toDate.toISOString())
        }
      }
      // Get material inward list api call
      dispatch(getMaterialInward(paramObj))
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
          if (error && error.code === 'ERR_BAD_REQUEST') {
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'MaterialInwardListErrorMsg' })}`,
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
  }, [updated]);

  useEffect(() => {
    if (date.fromDate > date.toDate) {
      //if (moment(date.toDate).local().format("DD/MM/YYYY") < moment(date.fromDate).local().format("DD/MM/YYYY")) {
      setMaterialInwardData([]);
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
  }, [date, setDate])


  // State of toggle show delete
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
          const getDeleteSetting = payload.data.filter((val) => val.featureName == 'DeleteMaterialInward')
          const getDeleteSettingPermission = getDeleteSetting.filter((val) => val.hasPermission == true)
          const hasPermission = getDeleteSettingPermission.length == 0 ? false : getDeleteSettingPermission[0].hasPermission;
          setRole(hasPermission)

          const getEditSetting = payload.data.filter((val) => val.featureName == 'EditMaterialInward')
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
      {isLoading && <Loader />}
      <MainCard content={false} className="ottr-table-section">
        <ScrollX>
          <ReactTable
            columns={columns}
            data={filteredData}
            handleAdd={handleAdd}
            getHeaderProps={(column) => column.getSortByToggleProps()}
            setShowDelete={setShowDelete}
            showDelete={isDeleted}
            date={date}
            setDate={setDate}
            setUpdated={setUpdated}
            deletelable={intl.formatMessage({ id: 'ShowDeletelabel' })}
            addMaterialInward={intl.formatMessage({ id: 'AddMasterMaterialInward' })}
          />
        </ScrollX>

        {open && <DeleteAlert title={intl.formatMessage({ id: 'Material-inward' })} name={materialInwardDelete?.vendorName} open={open} handleClose={handleClose} />}

        <Dialog
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
          <AddMaterialInward addEditStatus={addEditStatus} materialInward={materialInward} onCancel={handleAdd} setUpdated={setUpdated} />
        </Dialog>
        {isShowPrint && <Dialog
          className="ottr-model"
          maxWidth="md"
          TransitionComponent={PopupTransition}
          keepMounted
          fullWidth
          onClose={() => setIsShowPrint(true)}
          open={isShowPrint}
          sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
          aria-describedby="alert-dialog-slide-description"
        >
          <PrintProductBarcodeList productList={qrCodeMIProductDetails} onCancel={() => setIsShowPrint(false)} />
        </Dialog>}
      </MainCard>
    </>
  );
};

export default MaterialInward;