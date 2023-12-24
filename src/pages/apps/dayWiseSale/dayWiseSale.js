import React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect, Fragment, useMemo, useRef } from 'react';

// Material-ui
import { useTheme, styled } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  useMediaQuery,
  Box,
  InputLabel,
  Grid,
  Select, 
  MenuItem
} from '@mui/material';

// Services
import { getDayWiseSaleReport } from '_api/reports/report';

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

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, getHeaderProps, date, setDate, setUpdated, paymentMethod, paymentMethods, setPaymentMethod }) {
  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const intl = useIntl();

  const sortBy = [{ id: 'name', desc: false }];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // setHiddenColumns,

    rows,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: ['paymentMode'], sortBy: sortBy }
    },
    useSortBy,
    usePagination
  );

  // Handle date change
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
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

  // Set the maximum date to today to disable future dates
  const maxDate = new Date();

  // // Reset hidden column list
  // useEffect(() => {
  //     setHiddenColumns(['paymentMode']);
  // }, [matchDownSM]);

  useEffect(() => {
    if (data.length) {
      excelRef.current?.link.click();
    }
  }, [csvExportData, SetCSVExportData]);

  // Get data for csv download
  const getData = () => {
    if (data.length) {
      const updatedList = data.map((val) => {
        const obj = {
          ...val,
          customerName: val.customerName == "" ? '-       ' : val.customerName,
          customerMobile: val.customerMobile != 0 ? val.customerMobile : '               -     ',
          paymentMode: val.paymentMode == 0 ? 'Cash' : 'UPI'
        }
        return obj
      })
      // Combine primary data and extra data
      const combinedData = [
        ...updatedList,
        {
          "documentNumber": "",
          "customerName": "",
          "customerMobile": "",
          "amount": "",
          "serviceAmount": "",
          "dueAmount": "",
        },
        {
          "documentNumber": intl.formatMessage({ id: 'TotalAmount' }),
          "customerName": totalAmount ? totalAmount : "0.00",
          "customerMobile": "",
          "amount": "",
          "serviceAmount": "",
          "dueAmount": "",
        },
        {
          "documentNumber": intl.formatMessage({ id: 'TotalServiceAmount' }),
          "customerName": totalServiceAmount ? totalServiceAmount : "0.00",
          "customerMobile": "",
          "amount": "",
          "serviceAmount": "",
          "dueAmount": "",
        },
        {
          "documentNumber": intl.formatMessage({ id: 'TotalPaymentAmount' }),
          "customerName": totalDueAmount ? totalDueAmount : "0.00",
          "customerMobile": "",
          "amount": "",
          "serviceAmount": "",
          "dueAmount": "",
        },
      ];

      SetCSVExportData(combinedData);
      // SetCSVExportData(data.sort((rowA, rowB) => rowA.productName.localeCompare(rowB.productName, undefined, { numeric: true, sensitivity: 'base' })));
    }
  }

  function calculateAndRoundTotal(data, property) {
    const total = data.reduce((accumulator, currentItem) => accumulator + currentItem[property], 0);
    return total.toFixed(2);
  }

  // Calculate and round total amount
  const totalAmount = calculateAndRoundTotal(data, 'amount');

  // Calculate and round total service amount
  const totalServiceAmount = calculateAndRoundTotal(data, 'serviceAmount');

  // Calculate and round total due amount
  const totalDueAmount = calculateAndRoundTotal(data, 'dueAmount');

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
                <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'Date' })}</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StyledDatePicker
                    inputFormat="dd/MM/yyyy"
                    name="date"
                    value={date}
                    maxDate={maxDate}
                    onChange={handleDateChange}
                    renderInput={(params) =>
                      <TextField
                        size='large' {...params}
                        sx={{ width: matchDownSM ? 'auto' : '150px' }}
                        value={date ? date.toLocaleDateString() : ''} // Display the selected date value
                        inputProps={{
                          readOnly: true, // Disable direct input
                          onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                        }}
                      />
                    }
                  />
                </LocalizationProvider>
              </Stack>
              <Stack spacing={0.5}>
                <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'PaymentMethod' })}</InputLabel>
                <Select
                displayEmpty
                name="paymentMethod"
                id="paymentMethod"
                onChange={($event) => {
                  const value = $event.target.value;
                  setPaymentMethod(value)
                }}
                value={paymentMethod}
                className='pointer-event-none'
                MenuProps={MenuProps}
              >
                <MenuItem disabled value="">
                  {intl.formatMessage({ id: 'SelectPaymentMethod' })}
                </MenuItem>
                {paymentMethods?.map(({ id, name }) => (
                  <MenuItem key={id} value={id} sx={{ whiteSpace: 'normal' }}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
              </Stack>
            </Stack>
            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>            
              <Stack spacing={0.5} sx={{ pt: "17px" }}>
                <CSVExport
                  headers={csvHeaders}
                  data={csvExportData}
                  filename={`${intl.formatMessage({ id: 'DayWiseSale' })} for ${moment(date).local().format("DD-MM-YYYY")}.csv`}
                  getData={getData}
                  excelRef={excelRef}
                  isApiCallRequired={true}
                  idCSVExport="day-wise-sale-export-btn"
                  isDisabled={data.length ? false : true}
                />
              </Stack>
            </Stack>
          </Stack>
          <ScrollX sx={{ maxHeight: 'calc(100vh - 340px)' }} className='ottr-table'>
          <TableWrapper id='day-wise-sale-table'>
            <Table {...getTableProps()} stickyHeader>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow
                    key={i}
                    {...headerGroup.getHeaderGroupProps()}
                    sx={{ 
                      '& > th:first-of-type': { width: '120px' }, 
                      '& > th:nth-of-type(2)': { width: '200px' }, 
                      '& > th:nth-of-type(3)': { width: '200px' }, 
                      '& > th:nth-of-type(4)': { width: '100px' }, 
                      '& > th:nth-of-type(4) div': { justifyContent: 'end' }, 
                      '& > th:nth-of-type(5)': { width: '100px' }, 
                      '& > th:nth-of-type(5) div': { justifyContent: 'end' }, 
                      '& > th:nth-of-type(6)': { width: '100px' } ,
                      '& > th:nth-of-type(6) div': { justifyContent: 'end' } 
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
                            '& > td:last-of-type div': { justifyContent: 'end', paddingRight: '8px' },
                            '& > td:nth-of-type(4) div': { justifyContent: 'end', paddingRight: '8px' }, 
                            '& > td:nth-of-type(5) div': { justifyContent: 'end', paddingRight: '8px' }
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
                    <TableCell sx={{ textAlign: 'center' }} className='table-empty-data' colSpan={8}>
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
        <Grid container>
          <Grid item sx={{ pb: 2 }} xs={12} md={12}>
          <Stack spacing={1}>
            <Box sx={{ mx: "5px" }}>{intl.formatMessage({ id: 'TotalAmount' })} : {totalAmount ? totalAmount : "0.00"}</Box>
          </Stack>
          </Grid>
          <Grid item sx={{ pb: 2 }} xs={12} md={12}>
          <Stack spacing={1}>
            <Box sx={{ mx: "5px" }}>{intl.formatMessage({ id: 'TotalServiceAmount' })} : {totalServiceAmount ? totalServiceAmount : "0.00"}</Box>
          </Stack>
          </Grid>
          <Grid item sx={{ pb: 2 }} xs={12} md={12}>
          <Stack spacing={1}>
            <Box sx={{ mx: "5px" }}>{intl.formatMessage({ id: 'TotalPaymentAmount' })} : {totalDueAmount ? totalDueAmount : "0.00"}</Box>
          </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
    );
  
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func
};

// ==============================|| DAY WISE SALE - REPORT LIST ||============================== //

const CustomCell = ({ row, value }) => {
  const { values } = row;
  console.log('value',value,values['customerName'])
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Stack spacing={0}>
      <Typography variant="subtitle1" pl={values[value] == 0 || values[value] == null ? 6 : 0}>{values[value] == null ? 0 : value === 'amount' || value === 'dueAmount' || value === 'serviceAmount' ? values[value]?.toFixed(2) : ((value === 'customerMobile' && values[value] == 0)||(value === 'customerName' && values[value] == '')) ? '-' : values[value]}</Typography>

      </Stack>
    </Stack>
  );
};

/**
 * Day wise sale report list page
 * @returns
 */
const DayWiseSale = () => {
  const theme = useTheme();

  // Get report list, loading flag & another parameters
  const { isReportLoading, dayWiseSaleReports } = useSelector((state) => state.reportSlice);
  
  // Set updated flag
  const [updated, setUpdated] = useState(false);
  
  // Set date state
  const [date, setDate] = useState(new Date());

  // Filtered report list
  const [filteredReportData, setFilteredReportData] = useState([]);

  const intl = useIntl();

  const dispatch = useDispatch();

  // Get payment method list
  const [paymentMethods, setPaymentMethods] = useState([])

  // Set payment method
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    const defaultPaymentMethods = [
      {
        id: '',
        name: 'All'
      },
      {
        id: '0',
        name: 'Cash'
      },
      {
        id: '1',
        name: 'UPI'
      }
    ];
    setPaymentMethods(defaultPaymentMethods);
  }, []);

  useEffect(() => {
    if (paymentMethod) {
      const filteredItems = dayWiseSaleReports.filter(item => {
        return item.paymentMode == paymentMethod;
      });
      setFilteredReportData(filteredItems);  
    } else {
      setFilteredReportData(dayWiseSaleReports);  
    }
    
  }, [dayWiseSaleReports, paymentMethod]);

  useEffect(() => {
    if (isValidDate(date)) {
      // // Set the time to "00:00:00"
      // date.setUTCHours(0, 0, 0, 0);
      // Set model to get day wise sale report list
      const model = {
        date: encodeURIComponent(date.toISOString())
      };

      // Get day wise sale list api call
      dispatch(getDayWiseSaleReport({ model }))
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
        Header: `${intl.formatMessage({ id: 'InvoiceNo.' })}`,
        accessor: 'documentNumber',
        Cell: ({ row }) => <CustomCell row={row} value='documentNumber' />,
        // sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'CustomerName' })}`,
        accessor: 'customerName',
        Cell: ({ row }) => <CustomCell row={row} value='customerName' />,
        // sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'CustomerMobileNo' })}`,
        accessor: 'customerMobile',
        Cell: ({ row }) => <CustomCell row={row} value='customerMobile' />,
        // sortType: compareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'Amount' })}`,
        accessor: 'amount',
        Cell: ({ row }) => <CustomCell row={row} value='amount' />
      },
      {
        Header: `${intl.formatMessage({ id: 'ServiceAmount' })}`,
        accessor: 'serviceAmount',
        Cell: ({ row }) => <CustomCell row={row} value='serviceAmount' />
      },
      {
        Header: `${intl.formatMessage({ id: 'PaymentMethod' })}`,
        accessor: 'paymentMode',
        Cell: ({ row }) => <CustomCell row={row} value='paymentMode' />
      },
      {
        Header: `${intl.formatMessage({ id: 'PaymentAmt' })}`,
        accessor: 'dueAmount',
        Cell: ({ row }) => <CustomCell row={row} value='dueAmount' />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <>
      {isReportLoading && <Loader />}
      <MainCard content={false} className="ottr-table-section">
        <ScrollX>
          <ReactTable
            date={date}
            setDate={setDate}
            columns={columns}
            data={filteredReportData}
            paymentMethods={paymentMethods}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setUpdated={setUpdated}
            getHeaderProps={(column) => column.getSortByToggleProps()}
          />
        </ScrollX>
      </MainCard>
    </>
  );
};

export default DayWiseSale;
