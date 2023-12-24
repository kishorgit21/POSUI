import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, useRef, Fragment } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { FormControlLabel, TextField, Box, Switch, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, InputLabel, Tooltip } from '@mui/material';

// third-party
import NumberFormat from 'react-number-format';
import { useIntl } from 'react-intl';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

// project import
import ScrollX from 'components/ScrollX';
import { CSVExport, HeaderSort, IndeterminateCheckbox, TablePagination } from 'components/third-party/ReactTable';
import { renderFilterTypes, GlobalFilter } from 'utils/react-table';
import { setDeletedFlag } from 'store/reducers/deleteStateReducer';

// Date adapters and support
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// assets
import { useDispatch, useSelector } from 'react-redux';

// table style
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
  

// ==============================|| MAIN TABLE ||============================== //

export function MainTable({ columns, date, setDate, data, setUpdated, getHeaderProps, handleAdd, deletelable, buttonLabel, hiddenColumns, sortBy, isDeletedSortBy, CSVExportFlag, CSVExportFileName, getData, csvExportData, isApiCallRequired }) {
    const theme = useTheme();

    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    const filterTypes = useMemo(() => renderFilterTypes, []);

    // Get isDeleted flag from global store
    const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);

    const dispatch = useDispatch();

    const sortArray = !isDeleted ? sortBy : isDeletedSortBy

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
            initialState: { pageIndex: 0, pageSize: 10, hiddenColumns: hiddenColumns, sortBy: sortArray }
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
            setHiddenColumns(hiddenColumns);
        } else {
            setHiddenColumns(hiddenColumns);
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

    // Reset deleted flag globally
    const setShowDelete = (value) => {
        dispatch(setDeletedFlag(value));
    }

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
        if (date.toDate > date.fromDate) {
            setUpdated(true)
        }
    }, [setDate, date])

    // Ref for csv link
    const excelRef = useRef();

    useEffect(() => {
        if (data?.length) {
            excelRef.current?.link.click();
        }
    }, [csvExportData]);

    // Csv header list
    const csvHeaders = columns.map((column) => column.Header).slice(1, -1).map((label, index) => {
        const key = columns[index + 1].accessor;
        return { label, key };
    });

    return (
        <>
            {/* <TableRowSelection selected={selectedFlatRows.filter((item) => item.original.recordStatus === 0).length} /> */}
            <Stack spacing={3} className='table-filter'>
                <Stack
                    direction={matchDownSM ? 'column' : 'row'}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 1, pb: 0 }}>

                    <GlobalFilter
                        preGlobalFilteredRows={preGlobalFilteredRows}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        size="large"
                        className='transaction-search'
                    />
                    <Stack
                        direction={matchDownSM ? 'column' : 'row'}
                        spacing={1} >
                        <Stack spacing={0.5}>
                            <InputLabel sx={{ color: "#262626", fontSize: "12px" }}>{intl.formatMessage({ id: 'StartDate' })}</InputLabel>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <StyledDatePicker
                                    name="fromDate"
                                    inputFormat="dd/MM/yyyy"
                                    value={date.fromDate}
                                    onChange={handleFromDateChange}
                                    renderInput={(params) =>
                                        <TextField size='large'
                                            {...params}
                                            sx={{ width: matchDownSM ? 'auto' : '150px' }}
                                            value={date.fromDate ? date.fromDate.toLocaleDateString() : ''} // Display the selected date value
                                            inputProps={{
                                              readOnly: true, // Disable direct input
                                              onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                                            }}
                                        />}
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
                                    renderInput={(params) => <TextField
                                        size='large'
                                        {...params}
                                        sx={{ width: matchDownSM ? 'auto' : '150px' }}
                                        value={date.toDate ? date.toDate.toLocaleDateString() : ''} // Display the selected date value
                                        inputProps={{
                                            readOnly: true, // Disable direct input
                                            onClick: () => params.inputProps.onClick && params.inputProps.onClick() // Check if it's a function before calling it
                                        }}
                                    />}
                                />
                            </LocalizationProvider>
                        </Stack>


                        <Stack spacing={0} sx={{ width: "190px" }}>
                            <FormControlLabel
                                className='show-toggle'
                                value={isDeleted}
                                onChange={handleShowDelete}
                                style={{ pointerEvents: "none", marginLeft: 0 }}
                                control={<Switch color="primary" style={{ pointerEvents: "auto" }} />}
                                label={deletelable}
                                labelPlacement="start"
                                sx={{ mr: 1, mt: 2.5 }}
                            />
                        </Stack>

                        <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={1}>
                            <Tooltip title={buttonLabel}>
                                <Button sx={{ mt: 2 }} className="btn-outlined-primary add-product" variant="outlined" endIcon={<i className='icon-plus  ottr-icon'></i>} onClick={() => handleAdd('add')} size="large">
                                    {intl.formatMessage({ id: 'Add' })}
                                </Button>
                            </Tooltip>
                            {!CSVExportFlag && (
                                <CSVExport
                                    headers={csvHeaders}
                                    data={
                                        selectedFlatRows.length > 0
                                            ? selectedFlatRows.filter((item) => item.original.recordStatus === 0).map((d) => { const { id, ...rest } = d.original; return { id, ...rest } })
                                            : (isDeleted ? rows.map((data) => { const { id, ...rest } = data.original; return { id, ...rest } }) : rows.filter((item) => item.original.recordStatus === 0).map((data) => { const { id, ...rest } = data.original; return { id, ...rest } }))
                                    }
                                    filename={CSVExportFileName}
                                    getData={getData}
                                    excelRef={excelRef}
                                    isApiCallRequired={isApiCallRequired}
                                />
                            )}
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
                                        // sx={{ '& > th:first-of-type': { width: '50px' }, '& > th:last-of-type': { width: '150px' } }}
                                        sx={{
                                            '& > th:first-of-type': { width: '100px' },
                                            '& > th:last-of-type': { width: '150px' },
                                            '& > th:nth-of-type(2)': { width: '150px' },
                                            '& > th:nth-of-type(3)': { width: '500px' }
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

MainTable.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    getHeaderProps: PropTypes.func,
    handleAdd: PropTypes.func,
    buttonLabel: PropTypes.string,
    CSVExportFileName: PropTypes.string,
    CSVExportFlag: PropTypes.bool
};

// Sorting function
export function CompareNumericString(rowA, rowB, id) {
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

// Selection Cell
export const SelectionCell = ({ row }) => {
    // Set selected flag for each record action
    row.isSelected = row.values.recordStatus === 1 ? false : row.isSelected;

    return <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} disabled={row.values.recordStatus === 1} />
};

SelectionCell.propTypes = {
    row: PropTypes.object
};

// Selection Header
export const SelectionHeader = ({ getToggleAllPageRowsSelectedProps }) => (
    <IndeterminateCheckbox indeterminate {...getToggleAllPageRowsSelectedProps()} />
);

SelectionHeader.propTypes = {
    getToggleAllPageRowsSelectedProps: PropTypes.func
};

export const NumberFormatCell = ({ value }) => <NumberFormat displayType="text" format="##########" mask="_" defaultValue={value} />;

NumberFormatCell.propTypes = {
    value: PropTypes.string
};