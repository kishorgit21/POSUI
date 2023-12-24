import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Typography, Stack, Dialog, Tooltip } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Loader from 'components/Loader';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import { MainTable, CompareNumericString } from 'components/comman/MainTable';

// assets
import AddMaterialReturn from 'sections/apps/materialReturn/AddMaterialReturn';
import AlertMaterialReturnDelete from 'sections/apps/materialReturn/AlertMaterialReturnDelete';
import { CloseOutlined, EyeTwoTone } from '@ant-design/icons';

// Services
import { getMaterialReturn, deleteMaterialReturn, getByIdMaterialReturn } from '_api/transactions/material_Return';
import { getStore } from '_api/master_Store';
import { getReturnReason } from '_api/master_ReturnReason';
import { getVendor } from '_api/master_Vendor';
import { getProduct } from '_api/master_Product';
import { getByRole } from '_api/settings/settings';


//Store
import { useDispatch, useSelector, dispatch } from 'store';
import { useIntl } from 'react-intl';
import { openSnackbar } from 'store/reducers/snackbar';
import moment from 'moment';
import { setMaterialReturnData } from 'store/reducers/transactions/material_Return';

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
CustomCell.propTypes = {
  row: PropTypes.object
};

/**
* Get material return by id
* @param {*} selectedMaterialReturn
* @param {*} setMaterialReturn
* @param {*} handleAdd
* @param {*} status
*/
const getById = (selectedMaterialReturn, setMaterialReturn, handleAdd, status) => {
  // Set get material return by id model
  const model = {
    id: selectedMaterialReturn.id
  };

  // Get by id material return api call
  dispatch(getByIdMaterialReturn({ model })).then((response) => {
    // Process get by id api response
    if ((response.payload && response.payload.isError) || !!response.error) {
      if (response.error && response.error.code === 'ERR_BAD_REQUEST') {
        dispatch(
          openSnackbar({
            open: true,
            message: `${intl.formatMessage({ id: 'MasterReturnReasonGetByIdErrorMsg' })}`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
    } else {
      // Set material return
      setMaterialReturn(response.payload.data);

      // Handle add of specific task
      if (status === 'edit') {
        handleAdd('edit');
      } else if (status === 'view') {
        handleAdd('view');
      }
    }
  });
};

/**
 * Action cell
 * @param {*} row 
 * @param {*} setMaterialReturn 
 * @param {*} setMaterialReturnDeleteId 
 * @param {*} handleClose 
 * @param {*} handleAdd 
 */
const ActionCell = (row, setMaterialReturn, setMaterialReturnDeleteId, handleClose, handleAdd) => {
  const intl = useIntl();
  const theme = useTheme();
  const tableView = true;
  const collapseIcon = row.isExpanded ? (
    <CloseOutlined style={{ color: theme.palette.error.main }} />
  ) : (
    <EyeTwoTone twoToneColor={theme.palette.secondary.main} />
  );
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0} className='action-icons'>
      {!tableView && row.values && row.values.recordStatus === 0 && (
        <Tooltip title="View">
          <IconButton
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              getById(row.values, setMaterialReturn, handleAdd, 'view');
            }}>
            {collapseIcon}
          </IconButton>
        </Tooltip>
      )}
      {row.values && row.values.recordStatus === 0 ?
        <>
          <Tooltip title={intl.formatMessage({ id: 'View' })}>
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                getById(row.values, setMaterialReturn, handleAdd, 'view');
              }}
            >
              <i className='icon-eye ottr-icon'></i>
            </IconButton>
          </Tooltip>
          {row.values.role &&
            <Tooltip title={intl.formatMessage({ id: 'Delete' })}>
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setMaterialReturnDeleteId(row.values);
                  handleClose();
                }}
              >
                <i className='icon-trash ottr-icon'></i>
              </IconButton>
            </Tooltip>}
        </>
        :
        <span>{intl.formatMessage({ id: 'Deleted' })}</span>
      }
    </Stack>
  );
};

const Materialreturn = () => {
  const theme = useTheme();

  // Set add material return state
  const [add, setAdd] = useState(false);

  // Set add/edit material return  status state
  const [addEditStatus, setAddEditStatus] = useState('');

  // Set updated flag
  const [updated, setUpdated] = useState(false);

  //Set role state
  const [role, setRole] = useState(false);

  // Set open prompt state
  const [open, setOpen] = useState(false);

  // Set selected material return state
  const [materialReturn, setMaterialReturn] = useState('');

  // Set material return delete id state
  const [materialReturnDeleteId, setMaterialReturnDeleteId] = useState();

  const intl = useIntl()
  const dispatch = useDispatch();

  //Sort array for included deleted and without deleted
  const sortBy = [{ id: 'vendorName', desc: false }]
  const isDeletedSortBy = [{ id: 'recordStatus', desc: false }, { id: 'vendorName', desc: false }]

  // Get material return list, loading flag & another parameters
  const { isLoading, materialReturns } = useSelector((state) => state.materialReturnSlice);

  // Get the current date
  const currentDate = new Date();

  // Calculate yesterday's date
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  // Set material return date state
  const [date, setDate] = useState({ fromDate: yesterday, toDate: new Date() });


  // Get isDeleted flag from global store
  const { isDeleted } = useSelector((state) => state.isDeletedStateSlice);

  const [filteredData, setFilteredData] = useState([]);

  // Get search state from global store
  const { search } = useSelector((state) => state.searchStateSlice);

  useEffect(() => {
    const data = isDeleted ? materialReturns : materialReturns.filter((item) => item.recordStatus === 0);
    const filteredItems = data.filter(item => {
      const itemName = item.vendorName.toLowerCase(); // Convert item name to lowercase
      const searchTerm = search.toLowerCase(); // Convert search term to lowercase
      return itemName.includes(searchTerm)
    });
    const itemsWithRole = filteredItems.map((item) => {
      return {
        ...item, // Copy the original item properties
        role: role, // Add the role object as a property
      };
    });
    setFilteredData(itemsWithRole);
  }, [isDeleted, materialReturns, search, role]);


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
  }, []);

  useEffect(() => {
    // Get return reason list api call
    dispatch(getReturnReason())
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
              message: `${intl.formatMessage({ id: 'MasterReturnReasonListErrorMsg' })}`,
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

  useEffect(() => {
    // Get material return list api call
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
  }, []);

  useEffect(() => {
    // Set model to get purchase order list
    var paramObj = {
      model: {
        fromDate: encodeURIComponent(date.fromDate.toISOString()),
        toDate: encodeURIComponent(date.toDate.toISOString())
      }
    }

    // Get material return list api call
    dispatch(getMaterialReturn(paramObj))
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
              message: `${intl.formatMessage({ id: 'MaterialReturnListErrorMsg' })}`,
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
    // Get role data api call
    dispatch(getByRole())
      .unwrap()
      .then((payload) => {
        if (payload && payload.isError) {
          // Handle error
        } else {
          const getDeleteSetting = payload.data.filter((val) => val.featureName == 'DeleteMaterialReturn')
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

  /**
 * Handle add material return
 * @param {*} status
 */
  const handleAdd = (status) => {
    if (status === 'edit') {
      setAddEditStatus('edit');
      setAdd(true);
    } else if (status === 'add') {
      setMaterialReturn({});
      setAddEditStatus('add');
      setAdd(true);
    } else if (status === 'view') {
      setAddEditStatus('view');
      setAdd(true);
    } else {
      setAddEditStatus('');
      setAdd(false);

      // Reset Date
      setDate((prevDate) => ({
        ...prevDate,
        toDate: new Date(),
      }));
    }
  };

  const columns = useMemo(
    () => [
      // {
      //   title: 'Row Selection',
      //   Header: SelectionHeader,
      //   accessor: 'selection',
      //   Cell: SelectionCell,
      //   disableSortBy: true
      // },
      {
        Header: `${intl.formatMessage({ id: 'Id' })}`,
        accessor: 'id',
        Cell: CustomCell,
        disableGlobalFilter: true
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
        Header: `${intl.formatMessage({ id: 'VendorName' })}`,
        accessor: 'vendorName',
        Cell: ({ row }) => <CustomCell row={row} value='vendorName' />,
        sortType: CompareNumericString
      },
      {
        Header: `${intl.formatMessage({ id: 'RecordStatus' })}`,
        accessor: 'recordStatus',
        Cell: CustomCell,
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
        disableGlobalFilter: true,
        Cell: ({ row }) => ActionCell(row, setMaterialReturn, setMaterialReturnDeleteId, handleClose, handleAdd, theme)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  /**
   * Close prompt event
   * @param {*} isOpen
   * @param {*} status
   */
  const handleClose = (isOpen, status) => {
    if (status === 'delete') {
      // Set delete model
      const model = {
        id: materialReturnDeleteId.id
      };

      // Delete material return api call
      dispatch(deleteMaterialReturn({ model }))
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
                message: `${intl.formatMessage({ id: 'MaterialReturnTostDelete' })}`,
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
                message: `${intl.formatMessage({ id: 'MaterialReturnDeleteErrorMsg' })}`,
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

  useEffect(() => {
    if (date.fromDate > date.toDate) {
      setMaterialReturnData([]);
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
    <> {isLoading && <Loader />}
      <MainCard content={false} className="ottr-table-section">
        <ScrollX>
          <MainTable
            columns={columns}
            data={filteredData}
            handleAdd={handleAdd}
            getHeaderProps={(column) => column.getSortByToggleProps()}
            sortBy={sortBy}
            isDeletedSortBy={isDeletedSortBy}
            date={date}
            setDate={setDate}
            setUpdated={setUpdated}
            hiddenColumns={['id', 'recordStatus','role']}
            buttonLabel={intl.formatMessage({ id: 'AddMaterialReturn' })}
            deletelable={intl.formatMessage({ id: 'ShowDeletelabel' })}
            CSVExportFlag={true}
          // CSVExportFileName={`${intl.formatMessage({ id: 'Material-return' })}-${intl.formatMessage({ id: 'list' })}.csv`}
          // csvExportData={materialReturns}
          // isApiCallRequired={false}
          />
        </ScrollX>
        <AlertMaterialReturnDelete title={materialReturnDeleteId?.vendorName} open={open} handleClose={handleClose} />
        {/* add user dialog */}
        {add && (
          <Dialog
            className='ottr-model'
            // maxWidth="sm"
            maxWidth="md"
            TransitionComponent={PopupTransition}
            keepMounted
            fullWidth
            // onClose={handleAdd}
            open={add}
            sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <AddMaterialReturn addEditStatus={addEditStatus} materialReturn={materialReturn} onCancel={handleAdd} setUpdated={setUpdated} />
          </Dialog>
        )}
      </MainCard>
    </>
  );
};

export default Materialreturn;