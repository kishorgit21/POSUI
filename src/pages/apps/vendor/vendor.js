// React apis
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, Fragment, useRef } from 'react';
import '../../../style.css';

import { useIntl } from 'react-intl';


// Material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Button,
  Dialog,
  Stack,
  Table,
  TableBody,
  TableCell,
  FormControlLabel,
  Switch,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Third-party package apis
import NumberFormat from 'react-number-format';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// Services
import { deleteVendor, getByIdVendor, getVendor, getVendorsForCSV, revokeDeletedVendor } from '_api/master_Vendor';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { CSVExport, HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';

// Propmt components
import AddVendor from 'sections/apps/vendor/AddVendor';
import AlertVendorDelete from 'sections/apps/vendor/AlertVendorDelete';

// Assets
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';
// import { PlusOutlined, EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import Loader from 'components/Loader';
import { setDeletedFlag } from '../../../store/reducers/deleteStateReducer';

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

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, getHeaderProps, handleAdd, setShowDelete, showDelete, deletelable, AddVendor }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);

  // Sorting vendor list parameters
  const sortBy = !showDelete ? [{ id: 'name', desc: false }] : [{ id: 'name', desc: false }];

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

    selectedFlatRows
  } = useTable(
    {
      columns,
      data,
      // @ts-ignore
      filterTypes,
      // @ts-ignore
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['id', 'recordStatus', 'contact', 'city', 'email', 'note', 'pin'], sortBy: sortBy }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  const intl = useIntl()


  // Reset hidden column list
  useEffect(() => {
    if (matchDownSM) {
      setHiddenColumns(['id', 'recordStatus', 'contact', 'city', 'email', 'note', 'pin']);
    } else {
      setHiddenColumns(['id', 'recordStatus', 'contact', 'city', 'email', 'note', 'pin']);
    }
    // eslint-disable-next-line

    return () => {
      setShowDelete(false);
    }
  }, [matchDownSM]);

  // State to maintain Error msg in list
  const [listError, setListError] = useState();

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

  // Set csv export data
  const [csvExportData, SetCSVExportData] = useState([]);

  // Ref for csv link
  const excelRef = useRef();

  // Get data for csv download
  const getData = () => {
    // Get by id vendors csv api call
    dispatch(getVendorsForCSV())
      .unwrap()
      .then((payload) => {
        // Check for error & success
        if (payload && payload.isError) {
          // Handle error
        } else {
          // Then call this functionality
          if ((selectedFlatRows && selectedFlatRows.length)) {
            SetCSVExportData(payload.data.filter(obj1 =>
              selectedFlatRows.some(obj2 => obj1.id === obj2.original.id)))
          } else {
            SetCSVExportData(payload.data.filter(obj1 => data.some(obj2 => obj1.id === obj2.id)).sort((rowA, rowB) => rowA.recordStatus - rowB.recordStatus || rowA.name.localeCompare(rowB.name, undefined, { numeric: true, sensitivity: 'base' })));
          }
        }
      })
      .catch((error) => {
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'MasterVendorGetForCSVErrorMsg' })}`,
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

  useEffect(() => {
    if (data.length) {
      excelRef.current?.link.click();
    }
  }, [csvExportData, SetCSVExportData]);

  // Csv header list
  const csvHeaders = columns.map((column) => column.Header).slice(1, -1).map((label, index) => {
    const key = columns[index + 1].accessor;
    return { label, key };
  });

  // Define an array of keys for the columns you want to exclude
  const columnsKeysToRemove = ['id', 'recordStatus'];

  // Filter the csvHeaders list to exclude the specified columns and their headers
  const filteredCsvHeaders = csvHeaders.length > 0 ? csvHeaders.filter((header) => !columnsKeysToRemove.includes(header.key)) : [];

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
            size="small"
            className='table-search'
            searchId="vendor-search"
          />
          <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
            <FormControlLabel
              className='show-toggle'
              value={showDelete}
              onChange={handleShowDelete}
              style={{ pointerEvents: "none" }}
              control={<Switch id="vendor-deleted-switch" color="primary" style={{ pointerEvents: "auto" }} />}
              label={deletelable}
              labelPlacement="start"
              sx={{ mr: 1 }}
            />
            <Button id="add-vendor-btn" className="btn-outlined-primary add-product" variant="outlined" endIcon={<i className='icon-plus  ottr-icon'></i>} onClick={() => handleAdd('add')} size="large">
              {AddVendor}
            </Button>
            <CSVExport
              headers={filteredCsvHeaders}
              data={csvExportData}
              filename={`${intl.formatMessage({ id: 'Vendor' })}-${intl.formatMessage({ id: 'list' })}.csv`}
              getData={getData}
              excelRef={excelRef}
              isApiCallRequired={true}
              idCSVExport="vendor-export-btn"
              isDisabled={data.length ? false : true}
            />
          </Stack>
        </Stack>
        <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className='ottr-table'>
          <TableWrapper id='vendors-table'>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow
                    key={i}
                    {...headerGroup.getHeaderGroupProps()}
                    sx={{ '& > th:first-of-type': { width: '50px', maxWidth: '50px' }, 
                    '& > th:last-of-type': { width: '80px', maxWidth: '80px' }, 
                    '& > th:nth-of-type(2)': { width: '100px', maxWidth: '100px' }, 
                    '& > th:nth-of-type(3)': { width: '150px', maxWidth: '150px' },
                    '& > th:nth-of-type(4)': { width: '300px', maxWidth: '300px' },
                    '& > th:nth-of-type(5)': { width: '150px', maxWidth: '150px' } }}
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
                            bgcolor: page[i].values.recordStatus == 1 ? alpha(theme.palette.secondary[100], 0.35) : 'inherit',
                            '& > td:first-of-type': { width: '50px', maxWidth: '50px' }, 
                            '& > td:last-of-type': { width: '80px', maxWidth: '80px' }, 
                            '& > td:nth-of-type(2)': { width: '100px', maxWidth: '100px' }, 
                            '& > td:nth-of-type(3)': { width: '150px', maxWidth: '150px' },
                            '& > td:nth-of-type(4)': { width: '300px', maxWidth: '300px' },
                            '& > td:nth-of-type(5)': { width: '150px', maxWidth: '150px' }
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
        <Table className="bottom-pagination">
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

// ==============================|| VENDOR - LIST ||============================== //

// Selection Cell and Header
const SelectionCell = ({ row }) => {
  // Set selected flag for each record action
  row.isSelected = row.values.recordStatus === 1 ? false : row.isSelected;

  return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} disabled={row.values.recordStatus === 1} />
};
const SelectionHeader = ({ getToggleAllPageRowsSelectedProps, page }) => (
  <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} disabled={page.every((item) => item.original.recordStatus === 1)} />
);

const CustomCell = ({ row, value }) => {
  const { values } = row;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" marginLeft={0}>
      {value === 'address' || value === 'name' ?
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

const NumberFormatCell = ({ value }) => value === 'NA' ? 'NA' : <NumberFormat displayType="text" format="##########" mask="_" defaultValue={value} />;

/**
 * Get vendor by id
 * @param {*} selectedVendor
 * @param {*} setVendor
 */
const getVendorById = (selectedVendor, setVendor, handleAdd, status) => {
  // Set get vendor by id model
  const model = {
    id: selectedVendor.id
  };

  // Get by id vendor api call
  dispatch(getByIdVendor({ model })).then((response) => {
    // Process get by id api response
    if ((response.payload && response.payload.isError) || !!response.error) {
      if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
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
    } else {
      // Set vendor
      setVendor(response.payload.data);

      // Handle add of specific task
      if (status === 'edit') {
        handleAdd('edit');
      } else if (status === 'view') {
        handleAdd('view');
      }
    }
  });
};

const ActionCell = (row, setVendor, setVendorDeleteId, HandleClose, handleAdd, revokeDeletedItem) => {
  const intl = useIntl();
  // const collapseIcon = row.isExpanded ? (
  //   <CloseOutlined style={{ color: theme.palette.error.main }} />
  // ) : (
  //   <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
  // );
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0} className='action-icons'>
      {/* {row.values && row.values.recordStatus === 0 ? (
        <Tooltip title="View">
          <IconButton
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              getVendorById(row.values, setVendor, handleAdd, 'view');
              // setVendor(row.values);
              // handleAdd('view');
            }}
          >
            {collapseIcon}
          </IconButton>
        </Tooltip>
      ) : (
        ''
      )} */}
      {row.values && row.values.recordStatus === 0 ? (
        <Tooltip title={intl.formatMessage({ id: 'edit' })}>
          <IconButton
            id="edit-vendor-icon"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              getVendorById(row.values, setVendor, handleAdd, 'edit');
              // handleAdd('edit');
            }}
          >
            <i className='icon-edit ottr-icon'></i>
          </IconButton>
        </Tooltip>
      ) : (
        ''
      )}
      {row.values && row.values.recordStatus === 0 ? (
        <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
          <IconButton
            id="delete-vendor-icon"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setVendorDeleteId(row.values);
              HandleClose();
            }}
          >
            {/* <DeleteTwoTone twoToneColor={theme.palette.error.main} /> */}
            <i className='icon-trash ottr-icon'></i>
          </IconButton>
        </Tooltip>
      ) : (
        ''
      )}

      {row.values && row.values.recordStatus === 1 && (
        <Button id="vendor-restore-btn" className="btn-outlined-primary add-product" sx={{ marginRight: "-5px !important" , padding:"0 5px !important" }} variant="outlined" onClick={() => revokeDeletedItem(row.values)} size="small">
          {intl.formatMessage({ id: 'Restore' })}
        </Button>
      )}
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
 * Vendor list page
 * @returns
 */
const Vendor = () => {
  const theme = useTheme();

  // Set add vendor state
  const [add, setAdd] = useState(false);

  // Set add/edit vendor status state
  const [addEditStatus, setAddEditStatus] = useState('');

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected vendor state
  const [vendor, setVendor] = useState();

  // Set vendor delete id state
  const [vendorDeleteId, setVendorDeleteId] = useState();

  const intl = useIntl();

  /**
   * Handle add vendor
   * @param {*} status
   */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
    } else if (status === 'add') {
      setVendor({});
      setAddEditStatus('add');
      setAdd(true);
    } else if (status === 'view') {
      setAddEditStatus('view');
      setAdd(true);
    } else {
      setAddEditStatus('');
      setAdd(false);
    }
  };

  /**
   * Close prompt event
   * @param {*} isOpen
   * @param {*} status
   */
  const HandleClose = (isOpen, status) => {
    if (status === 'delete') {
      // Set delete model
      const model = {
        id: vendorDeleteId.id
      };

      // Delete vendor api call
      dispatch(deleteVendor({ model }))
        .unwrap()
        .then((payload) => {
          // Check for error & success
          if (payload && payload.isError) {
            // Handle error
          } else {
            // Toaster for success
            dispatch(
              openSnackbar({
                open: true,
                message: `${intl.formatMessage({ id: 'MasterVendorTostDelete' })}`,
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
                message: `${intl.formatMessage({ id: 'MasterVendorDeleteErrorMsg' })}`,
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

  /**
   * Revoke the deleted item
   * @param {*} deletedItem 
   */
  const revokeDeletedItem = (deletedItem) => {
    // Set delete model
    const model = {
      id: deletedItem.id
    };

    // Delete product api call
    dispatch(revokeDeletedVendor({ model }))
      .unwrap()
      .then((payload) => {
        // Check for error & success
        if (payload && payload.isError) {
          // Handle error
        } else {
          // Toaster for success
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'MasterVendorTostRevoke' })}`,
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
              message: `${intl.formatMessage({ id: 'MasterVendorRevokeErrorMsg' })}`,
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

  // Set column list
  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: SelectionHeader,
        accessor: 'selection',
        Cell: SelectionCell,
        disableSortBy: true,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Id' })}`,
        accessor: 'id',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'vendorCode' })}`,
        accessor: 'vendorCode',
        Cell: ({ row }) => <CustomCell row={row} value='vendorCode' />,
      },
      {
        Header: `${intl.formatMessage({ id: 'VendorName' })}`,
        accessor: 'name',
        Cell: ({ row }) => <CustomCell row={row} value='name' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'Address' })}`,
        accessor: 'address',
        Cell: ({ row }) => <CustomCell row={row} value='address' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'MobileNumber' })}`,
        accessor: 'mobileNumber',
        // Cell: ({ value }) => <NumberFormatCell value={`${value ? value : 'NA'}`} />,
        Cell: ({ row }) => <CustomCell row={row} value='mobileNumber' />,
      },
      {
        Header: `${intl.formatMessage({ id: 'City' })}`,
        accessor: 'city',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Pin' })}`,
        accessor: 'pin',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Email' })}`,
        accessor: 'email',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Note' })}`,
        accessor: 'note',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'action' })}`,
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setVendor, setVendorDeleteId, HandleClose, handleAdd, revokeDeletedItem, theme),
        disableGlobalFilter: true,
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  // Get vendor list, loading flag & another parameters
  const { isLoading, vendors } = useSelector((state) => state.vendorSlice);

  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);
  const [filteredData, setFilteredData] = useState([]);

  const { search } = useSelector((state) => state.searchStateSlice);

  useEffect(() => {
    const data = isDeleted ? vendors : vendors.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemName = item.name.toLowerCase(); // Convert item name to lowercase
      // const itemNumber = item.mobileNumber.toString();
      const itemDocumentNumber = (item?.vendorCode?.toString() || '') // Handle null or undefined
      const itemAddress = item.address.toLowerCase();
      const searchTerm = search.toLowerCase(); // Convert search term to lowercase
      return itemName.includes(searchTerm) || itemDocumentNumber.includes(searchTerm) || itemAddress.includes(searchTerm);
    });
    setFilteredData(filteredItems);
  }, [isDeleted, vendors, search]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Get vendor list api call
    dispatch(getVendor())
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
              message: `${intl.formatMessage({ id: 'MasterVendorListErrorMsg' })}`,
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

  // Reset deleted flag globally
  const setShowDelete = (value) => {
    dispatch(setDeletedFlag(value));
  }

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
            deletelable={intl.formatMessage({ id: 'ShowDeletelabel' })}
            AddVendor={intl.formatMessage({ id: 'AddVendorlabel' })}
          />
        </ScrollX>
        {open && <AlertVendorDelete title={vendorDeleteId.name} open={open} handleClose={HandleClose} />}
        {/* add user dialog */}
        {add && (
          <Dialog
            className='ottr-model'
            maxWidth="sm"
            TransitionComponent={PopupTransition}
            keepMounted
            fullWidth
            onClose={()=> setAdd(true)}
            open={add}
            sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <AddVendor addEditStatus={addEditStatus} vendor={vendor} onCancel={handleAdd} setUpdated={setUpdated} />
          </Dialog>
        )}
      </MainCard>
    </>

  );
};

export default Vendor;
