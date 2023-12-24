import React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect, Fragment, useMemo, useRef } from 'react';

// Material-ui
import { useTheme, styled } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Stack,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  useMediaQuery,
  Box,
  Autocomplete,
  InputLabel
} from '@mui/material';

// Services
import { getVendor } from '_api/master_Vendor';
import { getPaymentDetailsReport } from '_api/reports/report';
import { getProductCategory } from '_api/master/product_Category';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Loader from 'components/Loader';
import { HeaderSort, TablePagination, CSVExport } from 'components/third-party/ReactTable';

// Reducers
import { openSnackbar } from 'store/reducers/snackbar';

// Date adapters and support
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { useTable, useSortBy, usePagination } from 'react-table';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import moment from 'moment';

// Function to check if a date is valid
const isValidDate = (dateObject) => {
  return dateObject instanceof Date && !isNaN(dateObject);
};

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

//Date picker on focuse outline remove
const StyledDatePicker = styled(DatePicker)({
  '& .MuiInputBase-input': {
    padding: '10.5px 0px 10.5px 12px',
  },
  "& .MuiInputBase-root.Mui-focused": {
    boxShadow: "none", // Remove focus outline when DatePicker is focused
  },
});

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, getHeaderProps, vendors, vendor, setVendor, productCategoryMetaData, category, setCategory, date, setDate, setUpdated }) {
  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const intl = useIntl();

  const sortBy = [{ id: 'name', desc: false }];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,

    rows,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10, sortBy: sortBy }
    },
    useSortBy,
    usePagination
  );

  // Handle from date change
  const handleFromDateChange = (selectedDate) => {
    setDate((prevDate) => ({
      ...prevDate,
      fromDate: selectedDate,
    }));
    setUpdated(true);
  };

  // Handle to date change
  const handleToDateChange = (selectedDate) => {
    setDate((prevDate) => ({
      ...prevDate,
      toDate: selectedDate,
    }));
    setUpdated(true);
  };

  // Set to maintain Error msg in list
  const listError = intl.formatMessage({ id: 'NoRecord' });

  // Csv header list
  const csvHeaders = columns.map((column) => {
    const label = column.Header;
    const key = column.accessor;
    return { label, key };
  });

  // Set csv export data
  const [csvExportData, SetCSVExportData] = useState([]);

  // Ref for csv link
  const excelRef = useRef();

  const noOptionsText = intl.formatMessage({ id: 'Norecords' });

  const [autoCompleteVendorsOpen, setAutoCompleteVendorsOpen] = useState(false);

  const [autoCompleteCategoryOpen, setAutoCompleteCategoryOpen] = useState(false);

  // Set the maximum date to today to disable future dates
  const maxDate = new Date();

  useEffect(() => {
    if (data.length) {
      excelRef.current?.link.click();
    }
  }, [csvExportData, SetCSVExportData]);

  // Get data for csv download
  const getData = () => {
    if (data.length) {
      SetCSVExportData(data);
      // SetCSVExportData(data.sort((rowA, rowB) => rowA.productName.localeCompare(rowB.productName, undefined, { numeric: true, sensitivity: 'base' })));
    }
  }

  // Form date validation variables
  const isFromDateEmpty = date.fromDate === null;
  const isFromDateInvalid = !isValidDate(date.fromDate);
  const isFromDateEmptyOrInvalid = isFromDateEmpty || isFromDateInvalid;

  // To date validation variables
  const isToDateEmpty = date.toDate === null;
  const isToDateInvalid = !isValidDate(date.toDate);
  const greaterDateVal = date.toDate.setUTCHours(0, 0, 0, 0) >= date.fromDate.setUTCHours(0, 0, 0, 0);
  const isToDateEmptyOrInvalid = isToDateEmpty || isToDateInvalid || !greaterDateVal;

  // Handle vendor change
  const handleVendorChange = (selectedVendor) => {
    setVendor(selectedVendor);
    setUpdated(true);
  };

  // Handle category change
  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    setUpdated(true);
  };

  return (
    <>
    <Stack spacing={3} className='table-filter'>
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            spacing={1}
            justifyContent="space-between"
            // alignItems="center"
            sx={{ p: 3, pb: 0 }}
          >
            <Stack
            direction={matchDownSM ? 'column' : 'row'}
            alignItems="center"
            spacing={1}>
              <Stack spacing={0.5}>
              <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'VendorName' })}</InputLabel>
              <FormControl sx={{ width: '220px' }}>
                  <Autocomplete
                    // disablePortal
                    id="vendor"
                    noOptionsText={noOptionsText}
                    value={vendor && vendor.name ? vendor.name : null}
                    options={vendors}
                    getOptionLabel={(option) => option.name ?? option}
                    onChange={(event, newValue) => handleVendorChange(newValue)}
                    open={autoCompleteVendorsOpen}
                    onInputChange={(event, value, reason) => {
                      switch (reason) {
                        case "input":
                          setAutoCompleteVendorsOpen(!!value);
                          break;
                        case "reset":
                        case "clear":
                          // Reset category list
                          setCategory({});
                          setAutoCompleteVendorsOpen(false);
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
                      return option && value && option.name === value;
                    }}
                    placeholder={intl.formatMessage({ id: 'SelectVendor' })}
                    renderInput={(params) => <TextField {...params}
                      aria-label={intl.formatMessage({ id: 'SelectVendor' })}
                      placeholder={intl.formatMessage({ id: 'Search&SelectVendor' })} size='large'
                    />}
                  />
                </FormControl>
                </Stack>
                <Stack spacing={0.5}>
              <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'productCategory' })}</InputLabel>
              <FormControl sx={{ width: matchDownSM ? '220px' : '290px' }}>
                  <Autocomplete
                    // disablePortal
                    id="category"
                    noOptionsText={noOptionsText}
                    disabled={vendor && vendor.name ? false : true}
                    className={vendor && vendor.name ? '' : 'disabled-input'}
                    value={category && category.name ? category.name : null}
                    options={productCategoryMetaData?.filter((val) => val.recordStatus === 0) || []}
                    getOptionLabel={(option) => option.name ?? option}
                    onChange={(event, newValue) => handleCategoryChange(newValue)}
                    open={autoCompleteCategoryOpen}
                    onInputChange={(event, value, reason) => {
                      switch (reason) {
                        case "input":
                          setAutoCompleteCategoryOpen(!!value);
                          break;
                        case "reset":
                        case "clear":
                          setAutoCompleteCategoryOpen(false);
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
                      return option && value && option.name === value;
                    }}
                    placeholder={intl.formatMessage({ id: 'SelectProductCategory' })}
                    renderInput={(params) => <TextField {...params}
                      aria-label={intl.formatMessage({ id: 'SelectProductCategory' })}
                      placeholder={intl.formatMessage({ id: 'Search&SelectProductCategory' })} size='large'
                    />}
                  />
                </FormControl>
                </Stack>
            </Stack>
            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
            <Stack spacing={0.5}>
              <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'StartDate' })}</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>

                <StyledDatePicker
                  name="fromDate"
                  inputFormat="dd/MM/yyyy"
                  value={date.fromDate}
                  maxDate={date.toDate}
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
                  maxDate={maxDate}
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
              <Stack spacing={0.5} sx={{ pt: "17px" }}>
                <CSVExport
                  headers={csvHeaders}
                  data={csvExportData}
                  filename={`${intl.formatMessage({ id: 'VendorPaymentDetails' })} from ${moment(date.fromDate).local().format("DD-MM-YYYY")} to ${moment(date.toDate).local().format("DD-MM-YYYY")}.csv`}
                  getData={getData}
                  excelRef={excelRef}
                  isApiCallRequired={true}
                  idCSVExport="payment-details-export-btn"
                  isDisabled={data.length ? false : true}
                />
              </Stack>
            </Stack>
          </Stack>
          <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className='ottr-table'>
          <TableWrapper id='payment-details-table'>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow
                    key={i}
                    {...headerGroup.getHeaderGroupProps()}
                    sx={{ 
                      '& > th:first-of-type': { width: '280px' }, 
                      '& > th:nth-of-type(2) div': { justifyContent: 'end' }, 
                      '& > th:nth-of-type(3) div': { justifyContent: 'end' }, 
                      '& > th:nth-of-type(4) div': { justifyContent: 'end' }, 
                      '& > th:nth-of-type(5) div': { justifyContent: 'end' }, 
                      '& > th:nth-of-type(6) div': { justifyContent: 'end' },
                      '& > th:nth-of-type(7) div': { justifyContent: 'end' },
                      '& > th:nth-of-type(8) div': { justifyContent: 'end' },
                      '& > th:nth-of-type(9) div': { justifyContent: 'end' },
                      '& > th:nth-of-type(10) div': { justifyContent: 'end' }
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
                          }}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: 'inherit',
                            '& > td:nth-of-type(2) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(3) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(4) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(5) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(6) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(7) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(8) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(9) div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(10) div': { justifyContent: 'end', paddingRight: '8px' }
                          }}
                        >
                          {row.cells.map((cell, index) => (
                            <TableCell
                              sx={{ color: 'inherit' }}
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
                    <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={10}>
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
  getHeaderProps: PropTypes.func
};

// ==============================|| PAYMENT DETAILS - REPORT LIST ||============================== //

const CustomCell = ({ row, value }) => {
  const { values } = row;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
        <Stack spacing={0} >
        <Typography variant="subtitle1" pl={values[value] == 0 || values[value] == null ? 6 : 0}>{values[value] == null ? 0 : value === 'paymentAmt' || value === 'saleAmt' || value === 'serviceAmt' || value === 'cost' ? values[value]?.toFixed(2) : values[value]}</Typography>
        </Stack>
    </Stack>
  );
};

/**
 * Payment details report list page
 * @returns
 */
const PaymentDetails = () => {
  const theme = useTheme();

  // Set selected vendor state
  const [vendor, setVendor] = useState({});

  // Product category meta data
  const [productCategoryMetaData, setProductCategoryMetaData] = useState();

  // Selected product category
  const [category, setCategory] = useState({});
  
  // Get vendor list, loading flag & another parameters
  const { isLoading, vendors } = useSelector((state) => state.vendorSlice);

  // Get report list, loading flag & another parameters
  const { isReportLoading, paymentDetailsReports } = useSelector((state) => state.reportSlice);
  
  // Set updated flag
  const [updated, setUpdated] = useState(false);
  
  // Set date state
  const [date, setDate] = useState({ fromDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), toDate: new Date() });

  // Filtered report list
  const [filteredReportData, setFilteredReportData] = useState([]);

  const intl = useIntl();

  const dispatch = useDispatch();

  // Filtered vendor list
  const [filteredVendorData, setFilteredVendorData] = useState([]);

  useEffect(() => {
    const data = vendors.filter((item) => item.recordStatus === 0);
    setFilteredVendorData(data);
  }, [vendors]);

  useEffect(() => {
    setFilteredReportData(paymentDetailsReports);
  }, [paymentDetailsReports]);

  useEffect(() => {
    // Get vendor list api call
    dispatch(getVendor())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
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
  }, []);

  // API for product category meta data
  useEffect(() => {
    dispatch(getProductCategory()).then((res) => {
      const list=res.payload.data.filter((val) => val.recordStatus === 0);
      setProductCategoryMetaData(list);
    });
  }, []);

  useEffect(() => {
    const fromDay = new Date(date.fromDate.getFullYear(), date.fromDate.getMonth(), date.fromDate.getDate());
    const toDay = new Date(date.toDate.getFullYear(), date.toDate.getMonth(), date.toDate.getDate());
    if (fromDay > toDay) {
      // Reset updated flag
      setUpdated(false);
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
    else if (vendor && vendor.id && category && category.id && isValidDate(date.fromDate) && isValidDate(date.toDate)) {
      // // Set the time to "00:00:00"
      // date.setUTCHours(0, 0, 0, 0);
      // Set model to get payment details report list
      const model = {
        vendorId: vendor.id,
        categoryId: category.id,
        fromDate: encodeURIComponent(date.fromDate.toISOString()),
        toDate: encodeURIComponent(date.toDate.toISOString())
      };

      // Get payment details list api call
      dispatch(getPaymentDetailsReport({ model }))
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
        // Reset updated flag
        setUpdated(false);
        if (error && error.code === 'ERR_BAD_REQUEST') {
          dispatch(
            openSnackbar({
              open: true,
              message: `${intl.formatMessage({ id: 'ReportListErrorMsg' })}`,
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: true
            })
          );
        }
      });
    } else {
      setFilteredReportData([]);
      // Reset updated flag
      setUpdated(false);
    }
  }, [updated]);

  // Sorting function
  // function compareNumericString(rowA, rowB, id) {
  //   const valueA = rowA.values[id].toLowerCase();
  //   const valueB = rowB.values[id].toLowerCase();
  //   const statusA = rowA.values.recordStatus === 0 ? 0 : 1;
  //   const statusB = rowB.values.recordStatus === 0 ? 0 : 1;

  //   if (statusA < statusB) {
  //     return -1;
  //   }
  //   if (statusA > statusB) {
  //     return 1;
  //   }
  //   if (valueA < valueB) {
  //     return -1;
  //   }
  //   if (valueA > valueB) {
  //     return 1;
  //   }
  //   return 0;

  // }

  // Set column list
  const columns = useMemo(
    () => [
      {
        Header: `${intl.formatMessage({ id: 'ProductName' })}`,
        accessor: 'productName',
        Cell: ({ row }) => <CustomCell row={row} value='productName' />,
        // sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'OpeningQty' })}`,
        accessor: 'openingQty',
        Cell: ({ row }) => <CustomCell row={row} value='openingQty' />
      },
      {
        Header: `${intl.formatMessage({ id: 'PurchaseQty' })}`,
        accessor: 'purchaseQty',
        Cell: ({ row }) => <CustomCell row={row} value='purchaseQty' />
      },
      {
        Header: `${intl.formatMessage({ id: 'ReturnQty' })}`,
        accessor: 'returnQty',
        Cell: ({ row }) => <CustomCell row={row} value='returnQty' />
      },
      {
        Header: `${intl.formatMessage({ id: 'SaleQty' })}`,
        accessor: 'saleQty',
        Cell: ({ row }) => <CustomCell row={row} value='saleQty' />
      },
      {
        Header: `${intl.formatMessage({ id: 'RemainingQty' })}`,
        accessor: 'remainingQty',
        Cell: ({ row }) => <CustomCell row={row} value='remainingQty' />
      },
      {
        Header: `${intl.formatMessage({ id: 'UNITPRICE' })}`,
        accessor: 'cost',
        Cell: ({ row }) => <CustomCell row={row} value='cost' />
      },
      {
        Header: `${intl.formatMessage({ id: 'SaleAmt' })}`,
        accessor: 'saleAmt',
        Cell: ({ row }) => <CustomCell row={row} value='saleAmt' />
      },
      {
        Header: `${intl.formatMessage({ id: 'ServiceAmt' })}`,
        accessor: 'serviceAmt',
        Cell: ({ row }) => <CustomCell row={row} value='serviceAmt' />
      },
      {
        Header: `${intl.formatMessage({ id: 'PaymentAmt' })}`,
        accessor: 'paymentAmt',
        Cell: ({ row }) => <CustomCell row={row} value='paymentAmt' />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <>
      {(isLoading || isReportLoading) && <Loader />}
      <MainCard content={false} className="ottr-table-section">
        <ScrollX>
          <ReactTable
            vendors={filteredVendorData}
            vendor={vendor}
            setVendor={setVendor}
            productCategoryMetaData={productCategoryMetaData}
            category={category}
            setCategory={setCategory}
            date={date}
            setDate={setDate}
            columns={columns}
            data={filteredReportData}
            setUpdated={setUpdated}
            getHeaderProps={(column) => column.getSortByToggleProps()}
          />
        </ScrollX>
      </MainCard>
    </>
  );
};

export default PaymentDetails;
