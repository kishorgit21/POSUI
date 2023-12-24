// React apis
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, Fragment } from 'react';
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
import { deleteStore, getStore, revokeDeletedStore } from '_api/master_Store';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { CSVExport, HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';
// import Loader from 'components/Loader';

// Propmt components
import AddStore from 'sections/apps/store/AddStore';
import AlertStoreDelete from 'sections/apps/store/AlertStoreDelete';

// Assets
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';
import { useDispatch, useSelector } from 'react-redux';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';
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

function ReactTable({ columns, data, getHeaderProps, handleAdd, setShowDelete, showDelete, deletelable, AddStore }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);


  // Sorting store list parameters
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
      initialState: { pageIndex: 0, pageSize: 10,
         hiddenColumns: ['avatar', 'email', 'recordStatus', 'id', 'foodLicenseNumber', 'phoneNumber', 'longName'], 
         sortBy: sortBy }
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
      setHiddenColumns(['age', 'contact', 'visits', 'email', 'status', 'avatar', 'recordStatus', 'id', 'foodLicenseNumber', 'phoneNumber', 'longName']);
    } else {
      setHiddenColumns(['avatar', 'email', 'recordStatus', 'id', 'foodLicenseNumber', 'phoneNumber', 'longName']);
    }
    // eslint-disable-next-line

    return () => {
      setShowDelete(false);
    }
  }, [matchDownSM]);

  // State to maintain Error msg in list
  const [listError, setListError] = useState();

  const intl = useIntl()
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
            searchId="store-search"
          />
          <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
            <FormControlLabel
              className='show-toggle'
              value={showDelete}
              onChange={handleShowDelete}
              style={{ pointerEvents: "none" }}
              control={<Switch id="store-deleted-switch" color="primary" style={{ pointerEvents: "auto" }} />}
              label={deletelable}
              labelPlacement="start"
              sx={{ mr: 1 }}
            />
            <Button id="add-store-btn" className="btn-outlined-primary add-product" variant="outlined" endIcon={<i className='icon-plus  ottr-icon'></i>} onClick={() => handleAdd('add')} size="large">
              {AddStore}
            </Button>
            <CSVExport
              headers={filteredCsvHeaders}
              data={
                selectedFlatRows.length > 0
                  ? selectedFlatRows.filter((item) => item.original.recordStatus === 0).map((d) => { const { id, ...rest } = d.original; return { id, ...rest } })
                  : (showDelete ? rows.map((data) => { const { id, ...rest } = data.original; return { id, ...rest } }) : rows.filter((item) => item.original.recordStatus === 0).map((data) => { const { id, ...rest } = data.original; return { id, ...rest } }))
              }
              filename={`${intl.formatMessage({ id: 'store' })}-${intl.formatMessage({ id: 'list' })}.csv`}
              isApiCallRequired={false}
              idCSVExport="store-export-btn"
              isDisabled={data.length ? false : true}
            />
          </Stack>
        </Stack>
        <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className='ottr-table'>
          <TableWrapper id='stores-table'>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow
                    key={i}
                    {...headerGroup.getHeaderGroupProps()}
                    sx={{ '& > th:first-of-type': { width: '50px', maxWidth: '50px' }, '& > th:last-of-type': { width: '100px', maxWidth: '100px' }, '& > th:nth-of-type(2)': { width: '200px', maxWidth: '200px' }, '& > th:nth-of-type(3)': { width: '150px', maxWidth: '150px' }, '& > th:nth-of-type(4)': { width: '300px', maxWidth: '300px' } }}
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
                            '& > td:first-of-type': { width: '50px', maxWidth: '50px' }, '& > td:last-of-type': { width: '100px', maxWidth: '100px' }, '& > td:nth-of-type(2)': { width: '200px', maxWidth: '200px' }, '& > td:nth-of-type(3)': { width: '150px', maxWidth: '150px' }, '& > td:nth-of-type(4)': { width: '300px', maxWidth: '300px' }
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

const ActionCell = (row, setStore, setStoreDeleteId, HandleClose, handleAdd, revokeDeletedItem) => {
  const intl = useIntl()
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
              // row.toggleRowExpanded();
              setStore(row.values);
              handleAdd('view');
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
            id="edit-store-icon"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setStore(row.values);
              handleAdd('edit');
            }}
          >
            {/* <EditTwoTone twoToneColor={theme.palette.primary.main} /> */}
            <i className='icon-edit ottr-icon'></i>
          </IconButton>
        </Tooltip>
      ) : (
        ''
      )}
      {row.values && row.values.recordStatus === 0 ? (
        <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
          <IconButton
            id="delete-store-icon"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setStoreDeleteId(row.values);
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
        <Button id="store-restore-btn" className="btn-outlined-primary add-product" sx={{ marginRight: "-5px !important" , padding:"0 5px !important" }} variant="outlined" onClick={() => revokeDeletedItem(row.values)} size="small">
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
 * Store list page
 * @returns
 */
const Store = () => {
  const theme = useTheme();

  // Set add store state
  const [add, setAdd] = useState(false);

  // Set add/edit store status state
  const [addEditStatus, setAddEditStatus] = useState('');

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected store state
  const [store, setStore] = useState();

  // Set store delete id state
  const [storeDeleteId, setStoreDeleteId] = useState();

  /**
   * Handle add store
   * @param {*} status
   */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
    } else if (status === 'add') {
      setStore({});
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
        id: storeDeleteId.id
      };

      // Delete store api call
      dispatch(deleteStore({ model }))
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
                message: `${intl.formatMessage({ id: 'MasterStoreTostDelete' })}`,
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
                message: `${intl.formatMessage({ id: 'MasterStoreDeleteErrorMsg' })}`,
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
    dispatch(revokeDeletedStore({ model }))
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
              message: `${intl.formatMessage({ id: 'MasterStoreTostRevoke' })}`,
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
              message: `${intl.formatMessage({ id: 'MasterStoreRevokeErrorMsg' })}`,
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
        Header: `${intl.formatMessage({ id: 'StoreNameLable' })}`,
        accessor: 'name',
        Cell: ({ row }) => <CustomCell row={row} value='name' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'MobileNumber' })}`,
        accessor: 'mobileNumber',
        // Cell: ({ value }) => <NumberFormatCell value={`${value}`} />,
        Cell: ({ row }) => <CustomCell row={row} value='mobileNumber' />,
      },
      {
        Header: `${intl.formatMessage({ id: 'Address' })}`,
        accessor: 'address',
        Cell: ({ row }) => <CustomCell row={row} value='address' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Email' })}`,
        accessor: 'email',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'PhoneNumber' })}`,
        accessor: 'phoneNumber',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'FoodLicenseNumber' })}`,
        accessor: 'foodLicenseNumber',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'LongName' })}`,
        accessor: 'longName',
        Cell: CustomCell,
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'action' })}`,
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setStore, setStoreDeleteId, HandleClose, handleAdd, revokeDeletedItem, theme),
        disableGlobalFilter: true,
      },
     
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  // Get store list, loading flag & another parameters
  const { isLoading, stores } = useSelector((state) => state.storeSlice);

  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);
  const [filteredData, setFilteredData] = useState([]);
  const { search } = useSelector((state) => state.searchStateSlice);


  useEffect(() => {
    const data = isDeleted ? stores : stores.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemName = item.name.toLowerCase(); // Convert item name to lowercase
      const itemNumber = item.mobileNumber.toString();
      const itemAddress = item.address.toLowerCase();
      const searchTerm = search.toLowerCase(); // Convert search term to lowercase
      return itemName.includes(searchTerm) || itemNumber.includes(searchTerm) || itemAddress.includes(searchTerm);
    });
    setFilteredData(filteredItems);
  }, [isDeleted, stores, search]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Get store list api call
    dispatch(getStore())
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
              message: `${intl.formatMessage({ id: 'MasterStoreListErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
        setUpdated(false);
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
            AddStore={intl.formatMessage({ id: 'AddStore' })}
          />
        </ScrollX>
        {open && <AlertStoreDelete title={storeDeleteId.name} open={open} handleClose={HandleClose} />}
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
            <AddStore addEditStatus={addEditStatus} store={store} onCancel={handleAdd} setUpdated={setUpdated} />
          </Dialog>
        )}
      </MainCard>
    </>
  );
};

export default Store;
