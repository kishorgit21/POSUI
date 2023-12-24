// React apis
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, Fragment } from 'react';
import '../../../style.css';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from 'react-intl';

// Material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Dialog,
  Stack,
  Table,
  TableBody,
  FormControlLabel,
  Switch,
  TableCell,
  Box,
  TableHead,
  TextField,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

// Third-party package apis
import NumberFormat from 'react-number-format';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// Services
import { deleteInvoice, getByIdInvoice, getInvoice } from '../../../_api/ottrInvoice';
import { getByRole } from '_api/settings/settings';

// Date adapters and support
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';

// Propmt components
import AddOttrInvoice from 'sections/apps/ottrInvoice/AddOttrInvoice';
import PrintInvoice from 'sections/apps/ottrInvoice/PrintInvoice';
import InvoiceDetails from 'sections/apps/newbucket/InvoiceDetails';
import AlertInvoiceDelete from 'sections/apps/ottrInvoice/AlertInvoiceDelete';

// Assets
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';
// import { PrinterFilled } from '@ant-design/icons';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import Loader from 'components/Loader';
import { dispatch } from 'store';
import { setDeletedFlag } from 'store/reducers/deleteStateReducer';
import moment from 'moment';
import { setInvoiceData } from 'store/reducers/ottrInvoices';

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

function ReactTable({ columns, data, getHeaderProps, setShowDelete, date, setDate, setUpdated, showDelete, deletelable }) {

  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);

  // Sorting invoice list parameters
  // const sortBy = { id: 'name', desc: false };
  const sortBy = !showDelete ? [{ id: 'name', desc: false }] : [{ id: 'recordStatus', desc: false }, { id: 'name', desc: false }];

  // State to maintain Error msg in list
  const [listError, setListError] = useState();

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
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['id', 'recordStatus'], sortBy: sortBy }
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
      setHiddenColumns(['id', 'recordStatus','role']);
    } else {
      setHiddenColumns(['id', 'recordStatus','role']);
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
      fromDate: selectedDate
    }));
    setUpdated(true)
  };

  // Handle to date change
  const handleToDateChange = (selectedDate) => {
    setDate((prevDate) => ({
      ...prevDate,
      toDate: selectedDate
    }));
    setUpdated(true)
  };

  // handle show delete records toggle
  const handleShowDelete = (event) => {
    setShowDelete(event.target.checked);
  };

  useEffect(() => {
    if (date.toDate > date.fromDate) {
      setUpdated(true)
    }
  }, [setDate, date])



  const intl = useIntl();
  // handle Error msg in list
  useEffect(() => {
    if (typeof globalFilter === 'undefined') {
      setListError(`${intl.formatMessage({ id: 'NoRecord' })}`);
    } else {
      setListError(`${intl.formatMessage({ id: 'searchResultNotFound' })}`);
    }
  }, [globalFilter]);

  return (
    <>
      {/* <TableRowSelection selected={selectedFlatRows.filter((item) => item.original.recordStatus === 0).length} /> */}
      <Stack spacing={3} className="table-filter">
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
            className="transaction-search"
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
                  value={date?.fromDate}
                  onChange={handleFromDateChange}
                  renderInput={(params) => <TextField size="large" {...params}
                    value={date.fromDate ? date.fromDate.toLocaleDateString() : ''} // Display the selected date value
                    inputProps={{
                      readOnly: true, // Disable direct input
                      onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                    }}
                    sx={{ width: matchDownSM ? 'auto' : '150px' }} />}
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
                  minDate={date.fromDate}
                  value={date.toDate}
                  onChange={handleToDateChange}
                  renderInput={(params) => <TextField size="large" {...params}
                    value={date.toDate ? date.toDate.toLocaleDateString() : ''} // Display the selected date value
                    inputProps={{
                      readOnly: true, // Disable direct input
                      onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                    }}
                    sx={{ width: matchDownSM ? 'auto' : '150px' }} />}
                />
              </LocalizationProvider>
            </Stack>

            {/* <Stack spacing={1}>
              <Button variant="contained" startIcon={<ArrowDownOutlined />} onClick={() => setUpdated(true)} size="large">
                {intl.formatMessage({ id: 'Fetch' })}
              </Button>
            </Stack> */}


            <Stack spacing={0} sx={{ width: "190px" }}>
              <FormControlLabel
                className="show-toggle"
                value={showDelete}
                onChange={handleShowDelete}
                style={{ pointerEvents: "none", marginLeft: 0 }}
                control={<Switch color="primary" style={{ pointerEvents: "auto" }} />}
                label={deletelable}
                labelPlacement="start"
                sx={{ mr: 1, mt: 2.5 }}
              />
            </Stack>
            {/* <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
              <Button
                sx={{ mt: 2 }}
                className="btn-outlined-primary add-invoice"
                variant="outlined"
                endIcon={<i className="icon-plus  ottr-icon"></i>}
                onClick={() => handleAdd('add')}
                size="large"
              >
                {AddInvoice}
              </Button>
            </Stack> */}
          </Stack>
        </Stack>
        <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className="ottr-table">
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
                      '& > th:nth-of-type(2)': { width: '150px' },
                      '& > th:nth-of-type(3)': { width: '300px' },
                      '& > th:nth-of-type(4)': { width: '100px' },
                      '& > th:nth-of-type(5)': { width: '100px' }

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
                    <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={6}>
                      {listError}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableWrapper>
        </ScrollX>
        <Table className="bottom-pagination">
          <TableBody>
            <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
              <TableCell sx={{ p: 2, py: 2 }} colSpan={9} className="pagination-parent">
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

// ==============================|| PRODUCT - LIST ||============================== //

// Selection Cell and Header
const SelectionCell = ({ row }) => {
  // Set selected flag for each record action
  row.isSelected = row.values.recordStatus === 1 ? false : row.isSelected;

  return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} disabled={row.values.recordStatus === 1} />;
};

const SelectionHeader = ({ getToggleAllPageRowsSelectedProps }) => (
  <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />
);

const CustomCell = ({ row, value }) => {
  const { values } = row;
  return (
    <Stack direction="row" spacing={1.5} alignItems={value === 'amount' ? "right" : "center"}>
      {value === 'vendorName' ?
        <Tooltip title={values[value]} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 450 }}>
          <Stack spacing={0} >
            <Typography variant="subtitle1">{values[value]}</Typography>
          </Stack>
        </Tooltip>
        :
        <Stack spacing={0} >
          <Typography variant="subtitle1" pl={values[value] == 0 || values[value] == null ? 6 : 0}>{values[value] == 0 || values[value] == null ? '-' : value === 'amount' ? values[value]?.toFixed(2) : values[value]}</Typography>
        </Stack>
      }
    </Stack>
  );
};

const NumberFormatCell = ({ value }) => <NumberFormat displayType="text" format="##########" mask="_" defaultValue={value} />;

/**
 * Get invoice by id
 * @param {*} selectedInvoice
 * @param {*} setInvoice
 */
const getInvoiceById = (selectedInvoice, setInvoice, handleAdd, status) => {
  // Set get invoice by id model
  const model = {
    id: selectedInvoice.id
  };

  // Get by id invoice api call
  dispatch(getByIdInvoice({ model }))
    .unwrap()
    .then((payload) => {
      // Check for error & success
      if (payload && payload.isError) {
        // Handle error
      } else {
        // Set invoice
        setInvoice(payload.data);

        // Handle add of specific task
        if (status === 'edit') {
          handleAdd('edit');
        } else if (status === 'view') {
          handleAdd('view');
        } else if (status === 'print') {
          handleAdd('print');
        }
      }
    })
    .catch((error) => {
      if (error && error.code === 'ERR_BAD_REQUEST') {
        dispatch(
          openSnackbar({
            open: true,
            message: `${intl.formatMessage({ id: 'InvoiceGetByIdErrorMsg' })}`,
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

const ActionCell = (row, setInvoice, setInvoiceDeleteId, handleClose, handleAdd) => {
  const intl = useIntl();
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0} className="action-icons">
      {row.values && row.values.recordStatus === 0 ?
        <>
          <Tooltip title={intl.formatMessage({ id: 'View' })}>
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                getInvoiceById(row.values, setInvoice, handleAdd, 'view');
              }}
              sx={{ paddingTop: '5px' }}
            >
              <i className="icon-eye ottr-icon"></i>
            </IconButton>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'View' })}>
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                getInvoiceById(row.values, setInvoice, handleAdd, 'print');
              }}
            >
              <i className="icon-download ottr-icon"></i>
              {/* <PrinterFilled /> */}
            </IconButton>
          </Tooltip>
          {row.values.role &&
            <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setInvoiceDeleteId(row.values);
                  handleClose();
                }}
              >
                <i className="icon-trash ottr-icon"></i>
              </IconButton>
            </Tooltip>
          }
        </>
        :
        <Tooltip title={intl.formatMessage({ id: 'Deleted' })}>
          <span>{intl.formatMessage({ id: 'Deleted' })}</span>
        </Tooltip>
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

SelectionCell.propTypes = {
  row: PropTypes.object
};

SelectionHeader.propTypes = {
  getToggleAllPageRowsSelectedProps: PropTypes.func
};

/**
 * Invoice list page
 * @returns
 */
const OttrInvoice = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Set add invoice state
  const [add, setAdd] = useState(false);

  // Set print invoice state
  const [printInvoice, setPrintInvoice] = useState(false);

  // Set add/edit invoice status state
  const [addEditStatus, setAddEditStatus] = useState('');

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected invoice state
  const [invoice, setInvoice] = useState();

  // Set invoice delete id state
  const [invoiceDeleteId, setInvoiceDeleteId] = useState();

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  // Get the current date
  const currentDate = new Date();

  // Calculate yesterday's date
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  // Set invoice date state
  const [date, setDate] = useState({ fromDate: yesterday, toDate: new Date() });

  // Get invoice list, loading flag & another parameters
  const { isLoading, invoices } = useSelector((state) => state.invoiceSlice);
  const [filteredData, setFilteredData] = useState([]);

  const intl = useIntl();

  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);

  // Get search state from global store
  const { search } = useSelector((state) => state.searchStateSlice);

  //Set role state
  const [role, setRole] = useState(false);

  useEffect(() => {
    const data = isDeleted ? invoices : invoices.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemDocumentNumber = (item.documentNumber || '').toLowerCase(); // Handle null or undefined
      const itemAmount = (item?.amount?.toString() || '').toLowerCase(); // Handle null or undefined
      const itemMobileNumber = (item?.mobileNumber?.toString() || '').toLowerCase(); // Handle null or undefined
      const itemName = (item?.customerName || '').toLowerCase(); // Handle null or undefined
      const searchTerm = (search || '').toLowerCase(); // Handle null or undefined
      return itemName.includes(searchTerm) || itemDocumentNumber.includes(searchTerm) || itemAmount.includes(searchTerm) || itemMobileNumber.includes(searchTerm)
    });
    const itemsWithRole = filteredItems.map((item) => {
      return {
        ...item, // Copy the original item properties
        role: role, // Add the role object as a property
      };
    });

    setFilteredData(itemsWithRole);
  }, [isDeleted, invoices, search, role]);


  /**
   * Handle add invoice
   * @param {*} status
   */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
    } else if (status === 'add') {
      setInvoice({});
      setAddEditStatus('add');
      setAdd(true);
    } else if (status === 'view') {
      setAddEditStatus('view');
      setAdd(true);
    } else if (status === 'print') {
      setAddEditStatus('print')
      setPrintInvoice(true)
    } else {
      // Reset Date
      setDate((prevDate) => ({
        ...prevDate,
        toDate: new Date()
      }));

      setAddEditStatus('');
      setAdd(false);
      setPrintInvoice(false)
    }
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
        id: invoiceDeleteId.id
      };

      // Delete invoice api call
      dispatch(deleteInvoice({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError) {
            // Handle error
            if (payload.errorCode === 'E_PERMISSIONDEINED') {
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
                message: `${intl.formatMessage({ id: 'InvoiceTostDelete' })}`,
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
                message: `${intl.formatMessage({ id: 'InvoiceDeleteErrorMsg' })}`,
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

  // Sorting function
  function compareNumericString(rowA, rowB, id) {
    // Check if rowA.values[id] is a string before calling toLowerCase()
    const valueA = typeof rowA.values[id] === 'string' ? rowA.values[id].toLowerCase() : '';
    const valueB = typeof rowB.values[id] === 'string' ? rowB.values[id].toLowerCase() : '';
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
      //   disableGlobalFilter: true
      // },
      {
        Header: `${intl.formatMessage({ id: 'Id' })}`,
        accessor: 'id',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true
      },
      {
        Header: `${intl.formatMessage({ id: 'InvoiceNo' })}`,
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
        Header: `${intl.formatMessage({ id: 'CustomerName' })}`,
        accessor: 'customerName',
        Cell: ({ row }) => <CustomCell row={row} value='customerName' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'MobileNumber' })}`,
        accessor: 'mobileNumber',
        Cell: ({ row }) => <CustomCell row={row} value='mobileNumber' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'Amount' })}`,
        accessor: 'amount',
        Cell: ({ row }) => <CustomCell row={row} value='amount' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true
      },
      {
        Header: `role`,
        accessor: 'role',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true
      },
      {
        Header: `${intl.formatMessage({ id: 'action' })}`,
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setInvoice, setInvoiceDeleteId, handleClose, handleAdd, theme),
        disableGlobalFilter: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  useEffect(() => {
    // Get role data api call
    dispatch(getByRole())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          const getDeleteSetting = payload.data.filter((val) => val.featureName == 'DeleteInvoice')
          const getDeleteSettingPermission = getDeleteSetting.filter((val) => val.hasPermission == true)
          const hasPermission = getDeleteSettingPermission.length == 0 ? false : getDeleteSettingPermission[0].hasPermission;
          setRole(hasPermission)
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

  useEffect(() => {
    // Set model to get purchase order list
    var paramObj = {
      model: {
        fromDate: encodeURIComponent(date.fromDate.toISOString()),
        toDate: encodeURIComponent(date.toDate.toISOString())
      }
    };

    // Get purchase order list api call
    dispatch(getInvoice(paramObj))
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
              message: intl.formatMessage({ id: 'InvoiceListErrorMsg' }),
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      });
  }, [updated]);

  useEffect(() => {
    if (date.fromDate > date.toDate) {
      //if (moment(date.toDate).local().format("DD/MM/YYYY") < moment(date.fromDate).local().format("DD/MM/YYYY")) {
      // setMaterialInwardData([]);
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

  // Reset deleted flag globally
  const setShowDelete = (value) => {
    dispatch(setDeletedFlag(value));
  }

  useEffect(() => {
    if (date.fromDate > date.toDate) {
      setInvoiceData([]);
      dispatch(
        openSnackbar({
          open: true,
          message: `${intl.formatMessage({ id: 'StartAndEndDateVal' })}`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  }, [date, setDate])

  return (
    <>
      {isLoading && <Loader />}
      <MainCard content={false} className="ottr-table-section" sx={{ justifyContent: "center" }}>
        <ScrollX>
          <ReactTable
            date={date}
            setDate={setDate}
            setUpdated={setUpdated}
            columns={columns}
            data={filteredData}
            handleAdd={handleAdd}
            getHeaderProps={(column) => column.getSortByToggleProps()}
            setShowDelete={setShowDelete}
            showDelete={isDeleted}
            deletelable={intl.formatMessage({ id: 'ShowDeletelabel' })}
            AddInvoice={intl.formatMessage({ id: 'AddInvoice' })}
          />
        </ScrollX>
        {open && <AlertInvoiceDelete title={invoiceDeleteId.documentNumber} open={open} handleClose={handleClose} />}
        {printInvoice &&
          <Dialog
            className="ottr-model"
            maxWidth="sm"
            TransitionComponent={PopupTransition}
            keepMounted
            fullWidth
            onClose={() => setPrintInvoice(true)}
            open={printInvoice}
            // sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
            sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <PrintInvoice invoice={invoice} onCancel={() => setPrintInvoice(false)} />
          </Dialog>
        }
        {/* add user dialog */}
        {add && (
          <Dialog
            className='ottr-model'
            maxWidth="md"
            TransitionComponent={PopupTransition}
            keepMounted
            fullWidth={addEditStatus === 'view' ? false : true}
            // onClose={handleAdd}
            open={add}
            sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            {addEditStatus === 'view' ?
              <InvoiceDetails invoice={invoice} onCancel={() => setAdd(false)} /> :
              <AddOttrInvoice addEditStatus={addEditStatus} invoice={invoice} onCancel={handleAdd} setUpdated={setUpdated} />
            }

          </Dialog>
        )}
      </MainCard>
    </>
  );
};

export default OttrInvoice;