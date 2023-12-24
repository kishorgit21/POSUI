// React apis
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, Fragment, useRef } from 'react';
import '../../../style.css';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from 'react-intl';

// Material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Button,
  Dialog,
  Stack,
  Table,
  TableBody,InputLabel,
  FormControlLabel, FormControl,
  Switch,
  TableCell,
  TableHead,
  TableRow,
  Tooltip, Autocomplete, TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Third-party package apis
import NumberFormat from 'react-number-format';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// Services
import { deleteProduct, getByIdProduct, getProduct, getProductsForCSV, revokeDeletedProduct } from '../../../_api/master_Product';
import { getProductCategory } from '_api/master/product_Category';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { CSVExport, HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';

// Propmt components
import AddProduct from 'sections/apps/product/AddProduct';
import AlertProductDelete from 'sections/apps/product/AlertProductDelete';

// Assets
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';
// import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';

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

function ReactTable({ columns, data, getHeaderProps, handleAdd, setShowDelete, showDelete, deletelable, AddPRoduct, productCategoryData, productCategory, setProductCategory }) {
  const intl = useIntl();

  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const filterTypes = useMemo(() => renderFilterTypes, []);

  const [autoCompleteProductCategoryOpen, setAutoCompleteProductCategoryOpen] = useState(false);

  const noOptionsText = intl.formatMessage({ id: 'Norecords' });

  // Sorting product list parameters
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
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['id', 'recordStatus', 'days', 'isExpDate', 'ingredients', 'notes'], sortBy: sortBy }
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
      setHiddenColumns(['id', 'recordStatus', 'days', 'isExpDate', 'ingredients', 'notes']);
    } else {
      setHiddenColumns(['id', 'recordStatus', 'days', 'isExpDate', 'ingredients', 'notes']);
    }
    // eslint-disable-next-line

    return () => {
      setShowDelete(false);
    }
  }, [matchDownSM]);

  // handle show delete records toggle
  const handleShowDelete = (event) => {
    setShowDelete(event.target.checked);
  };

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

  // Set csv export data
  const [csvExportData, SetCSVExportData] = useState([]);

  // Ref for csv link
  const excelRef = useRef();

  // Get data for csv download
  const getData = () => {
    // Get by id products csv api call
    dispatch(getProductsForCSV())
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
              message: `${intl.formatMessage({ id: 'MasterProductGetForCSVErrorMsg' })}`,
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

  const onChangeProductCategoryHandle = (newValue) => {
    console.log('newValue', newValue)
    setProductCategory(newValue)
    setAutoCompleteProductCategoryOpen(false)
  }
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
          <Stack spacing={0} direction={'row'}>
            <Stack>
              <FormControl sx={{ width:'300px',height: '50px',marginTop:'16px',marginRight:'10px' }}>
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  size="small"
                  className='table-search'
                  searchId="product-search"
                />
              </FormControl>
            </Stack>
            <Stack>
              <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'productCategory' })}</InputLabel>
              <FormControl sx={{ width: '180px', height: '50px' }}>
                <Autocomplete
                  // disablePortal
                  id="product_category"
                  noOptionsText={noOptionsText}
                  value={productCategory || null}
                  options={productCategoryData || []}
                  getOptionLabel={(option) => option.name ?? option}
                  onChange={(event, newValue) => onChangeProductCategoryHandle(newValue)}
                  open={autoCompleteProductCategoryOpen}
                  onInputChange={(event, value, reason) => {
                    switch (reason) {
                      case "input":
                        setAutoCompleteProductCategoryOpen(!!value);
                        break;
                      case "reset":
                      case "clear":
                        setAutoCompleteProductCategoryOpen(false);
                        break;
                      default:
                        console.log(reason);
                    }
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (value === '') {
                      // Handle the case when the value is an empty string
                      return option === null || option === '';
                    }
                    return option && value && option.id === value.id;
                  }}
                  placeholder={intl.formatMessage({ id: 'SelectProductCategory' })}
                  renderInput={(params) => <TextField {...params}
                    aria-label={intl.formatMessage({ id: 'SelectProductCategory' })}
                    placeholder={intl.formatMessage({ id: 'Search&SelectProductCategory' })}
                    size='large'
                  />}
                />
              </FormControl>
            </Stack>
          </Stack>
          <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
            <FormControlLabel
              className='show-toggle'
              value={showDelete}
              onChange={handleShowDelete}
              style={{ pointerEvents: "none" }}
              control={<Switch id="product-deleted-switch" color="primary" style={{ pointerEvents: "auto" }} />}
              label={deletelable}
              labelPlacement="start"
              sx={{ mr: 1 }}
            />
            <Button id="add-product-btn" className="btn-outlined-primary add-product" variant="outlined" endIcon={<i className='icon-plus  ottr-icon'></i>} onClick={() => handleAdd('add')} size="large">
              {AddPRoduct}
            </Button>
            <CSVExport
              headers={filteredCsvHeaders}
              data={csvExportData}
              filename={`${intl.formatMessage({ id: 'product' })}-${intl.formatMessage({ id: 'list' })}.csv`}
              getData={getData}
              excelRef={excelRef}
              isApiCallRequired={true}
              idCSVExport="product-export-btn"
              isDisabled={data.length ? false : true}
            />
          </Stack>
        </Stack>
        <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className='ottr-table'>
          <TableWrapper id='products-table'>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow
                    key={i}
                    {...headerGroup.getHeaderGroupProps()}
                    sx={{ '& > th:first-of-type': { width: '50px' }, '& > th:last-of-type': { width: '150px' }, '& > th:nth-of-type(2)': { width: '500px' }, '& > th:nth-of-type(3)': { width: '200px' } }}
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

// ==============================|| PRODUCT - LIST ||============================== //

// Selection Cell and Header
const SelectionCell = ({ row }) => {
  // Set selected flag for each record action
  row.isSelected = row.values.recordStatus === 1 ? false : row.isSelected;

  return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} disabled={row.values.recordStatus === 1} />;
};
const SelectionHeader = ({ getToggleAllPageRowsSelectedProps, page }) => (
  <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} disabled={page.every((item) => item.original.recordStatus === 1)} />
);

const CustomCell = ({ row, value }) => {
  const { values } = row;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {value === 'name' ?
        <Tooltip title={values[value]} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 450 }}>
          <Stack spacing={0} >
            <Typography variant="subtitle1">{values[value]}</Typography>
          </Stack>
        </Tooltip>
        :
        <Stack spacing={0}>
          <Typography variant="subtitle1">{value === 'cost' ? values[value]?.toFixed(2) : values[value]}</Typography>
        </Stack>
      }
    </Stack>
  );
};

const NumberFormatCell = ({ value }) => <NumberFormat displayType="text" format="########" defaultValue={value} />;

/**
 * Get product by id
 * @param {*} selectedProduct
 * @param {*} setProduct
 */
const getProductById = (selectedProduct, setProduct, handleAdd, status) => {
  // Set get product by id model
  const model = {
    id: selectedProduct.id
  };

  // Get by id product api call
  dispatch(getByIdProduct({ model }))
    .unwrap()
    .then((payload) => {
      // Check for error & success
      if (payload && payload.isError) {
        // Handle error
      } else {
        // Set product
        setProduct(payload.data);

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
            message: `${intl.formatMessage({ id: 'MasterProductGetByIdErrorMsg' })}`,
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

const ActionCell = (row, setProduct, setProductDeleteId, handleClose, handleAdd, revokeDeletedItem) => {
  const intl = useIntl();
  // console.log("🚀 ~ file: product.js:217 ~ ActionCell ~ row:", row)
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
              getProductById(row.values, setProduct, handleAdd, 'view');
              // setProduct(row.values);
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
            id="edit-product-icon"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              getProductById(row.values, setProduct, handleAdd, 'edit');
              // handleAdd('edit');
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
            id="delete-product-icon"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setProductDeleteId(row.values);
              handleClose();
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
        /*  // <Tooltip title={intl.formatMessage({ id: 'Revoke' })} placement="bottom" followCursor={true} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 450 }}>
           <FormControlLabel
             className='show-toggle'
             value={false}
             onChange={() => revokeDeletedItem(row.values, products)}
             style={{ pointerEvents: "none" }}
             control={<Switch color="secondary" style={{ pointerEvents: "auto" }} />}
             // label={intl.formatMessage({ id: 'Deleted' })}
             labelPlacement="start"
             sx={{ mr: 1 }}
           /> */

        <Button id="product-restore-btn" className="btn-outlined-primary add-product" sx={{ marginRight: "-5px !important", padding: "0 5px !important" }} variant="outlined" onClick={() => revokeDeletedItem(row.values)} size="small">
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
 * Product list page
 * @returns
 */
const Product = () => {
  const theme = useTheme();


  // Set add product state
  const [add, setAdd] = useState(false);

  // Set add/edit product status state
  const [addEditStatus, setAddEditStatus] = useState('');

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected product state
  const [product, setProduct] = useState();

  // Set product delete id state
  const [productDeleteId, setProductDeleteId] = useState();

  /**
   * Handle add product
   * @param {*} status
   */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
    } else if (status === 'add') {
      setProduct({});
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
  const handleClose = (isOpen, status) => {
    if (status === 'delete') {
      // Set delete model
      const model = {
        id: productDeleteId.id
      };

      // Delete product api call
      dispatch(deleteProduct({ model }))
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
                message: `${intl.formatMessage({ id: 'MasterProductTostDelete' })}`,
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
                message: `${intl.formatMessage({ id: 'MasterProductDeleteErrorMsg' })}`,
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
    dispatch(revokeDeletedProduct({ model }))
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
              message: `${intl.formatMessage({ id: 'MasterProductTostRevoke' })}`,
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
              message: `${intl.formatMessage({ id: 'MasterProductRevokeErrorMsg' })}`,
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
        displayType: 'none',
        disableGlobalFilter: false,
      },
      {
        Header: `${intl.formatMessage({ id: 'ProductName' })}`,
        accessor: 'name',
        Cell: ({ row }) => <CustomCell row={row} value='name' />,
        sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'UNITPRICE' })} (₹)`,
        accessor: 'cost',
        Cell: ({ row }) => <CustomCell row={row} value='cost' />,
        displayType: 'none',
        disableGlobalFilter: false,
      },
      {
        Header: `${intl.formatMessage({ id: 'Ingredients' })}`,
        accessor: 'ingredients',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Note' })}`,
        accessor: 'notes',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'ExpiresIn' })}`,
        accessor: 'isExpDate',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'Days' })}`,
        accessor: 'days',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'productCategory' })}`,
        accessor: 'categoryName',
        Cell: ({ row }) => <CustomCell row={row} value='categoryName' />,
        displayType: 'none'
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
        displayType: 'none',
        disableGlobalFilter: true,
      },
      {
        Header: `${intl.formatMessage({ id: 'action' })}`,
        className: 'cell-center',
        disableSortBy: true,
        Cell: ({ row }) => ActionCell(row, setProduct, setProductDeleteId, handleClose, handleAdd, revokeDeletedItem, theme),
        disableGlobalFilter: true,
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  const [productCategory, setProductCategory] = useState({ id: 'all', name: "All", recordStatus: 0 });

  // Get product list, loading flag & another parameters
  const { isLoading, products } = useSelector((state) => state.productSlice);
  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);
  const [filteredData, setFilteredData] = useState([]);
  const { search } = useSelector((state) => state.searchStateSlice);

  // Product category meta data
  const [productCategoryData, setproductCategoryMetaData] = useState([]);

  useEffect(() => {
    const data = isDeleted ? products : products.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemName = item.name.toLowerCase(); // Convert item name to lowercase
      const itemCost = item.cost.toString();
      const searchTerm = search.toLowerCase(); // Convert search term to lowercase
      return itemName.includes(searchTerm) || itemCost.includes(searchTerm);
    });
    if(productCategory?.id==='all'){
      setFilteredData(filteredItems);
    }
    else{
      const searchbyProductCategory=filteredItems.filter((item) => item.productCategory === productCategory?.id);
      setFilteredData(searchbyProductCategory);
    }
  }, [isDeleted, products, search,productCategory]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Get product list api call
    dispatch(getProduct())
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
              message: `${intl.formatMessage({ id: 'MasterProductListErrorMsg' })}`,
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

  // API for product category meta data
  useEffect(() => {
    dispatch(getProductCategory()).then((res) => {
      const list = res.payload.data.filter((val) => val.recordStatus === 0);
      const param = {
        id: 'all',
        name: 'All'
      }
      list.unshift(param)
      setproductCategoryMetaData(list);
    });
  }, []);

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
            productCategoryData={productCategoryData}
            productCategory={productCategory}
            setProductCategory={setProductCategory}
            handleAdd={handleAdd}
            getHeaderProps={(column) => column.getSortByToggleProps()}
            setShowDelete={setShowDelete}
            showDelete={isDeleted}
            deletelable={intl.formatMessage({ id: 'ShowDeletelabel' })}
            AddPRoduct={intl.formatMessage({ id: 'AddProductlabel' })}
          />
        </ScrollX>
        {open && <AlertProductDelete title={productDeleteId.name} open={open} handleClose={handleClose} />}
        {/* add user dialog */}
        {add && (
          <Dialog
            className="ottr-model"
            maxWidth="sm"
            TransitionComponent={PopupTransition}
            keepMounted
            fullWidth
            onClose={() => setAdd(true)}
            open={add}
            sx={{ '& .MuiDialog-paper': { p: 0, overflowY: 'hidden' }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <AddProduct addEditStatus={addEditStatus} product={product} onCancel={handleAdd} setUpdated={setUpdated} />
          </Dialog>
        )}
      </MainCard>
    </>
  );
};

export default Product;
