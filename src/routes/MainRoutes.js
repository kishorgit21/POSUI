import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import OttrAuthGuard from 'utils/route-guard/OttrAuthGuard';

// render - New dashboard
const NewDashboard = Loadable(lazy(() => import('pages/dashboard/NewDashboard')));
const NewMobileDashboard = Loadable(lazy(() => import('pages/dashboard/NewMobileDashboard')));


//render -Settings
const Settings = Loadable(lazy(()=> import('pages/settings/Settings')));

// new dashboard / drower menu
// master routes
const AppProduct = Loadable(lazy(() => import('pages/apps/product/product')));
const Appvendor = Loadable(lazy(() => import('pages/apps/vendor/vendor')));
const AppNewCustomer = Loadable(lazy(() => import('pages/apps/newcustomer/Newcustomer')));
const AppStore = Loadable(lazy(() => import('pages/apps/store/store')));
const AppReturnReasons = Loadable(lazy(() => import('pages/apps/returnReasons/ReturnResons')));
const AppProductCategory = Loadable(lazy(() => import('pages/apps/productCategory/ProductCategory')))

// Transaction routes
const AppPurchaseOrder = Loadable(lazy(() => import('pages/apps/purchaseOrder/Purchaseorder.js')));
const AppMaterialreturn = Loadable(lazy(() => import('pages/apps/materialReturn/Materialreturn')));
const AppMaterialinward = Loadable(lazy(() => import('pages/apps/materialInward/materialInward')));
const AppnewInvoice = Loadable(lazy(() => import('pages/apps/ottrInvoice/ottrInvoice')));
const AppBucket = Loadable(lazy(() => import('sections/apps/bucket/AddBucket')));
const AppNewBucket = Loadable(lazy(() => import('pages/apps/newbucket/newbucket')));
const AppNewBucketPayment = Loadable(lazy(() => import('sections/apps/newbucket/MobilePayment/MobilePayment')));

const AppAddMaterialreturn = Loadable(lazy(() => import('sections/apps/materialReturn/mobileViewMaterialReturn/MobileViewAddMaterialReturn')));
const AppMobileViewInvoiceDetails = Loadable(lazy(() => import('sections/apps/newbucket/mobileViewInvoiceDetails/MobileViewInvoiceDetails')));

//retort routes
const AppVendorPaymentDetails = Loadable(lazy(() => import('pages/apps/vendorPaymentDetails/vendorPaymentDetails')));
const AppDayWiseSale = Loadable(lazy(() => import('pages/apps/dayWiseSale/dayWiseSale')));
const AppDailysale = Loadable(lazy(() => import('pages/apps/dailySales/dailysales')));
const AppPurchesDetails = Loadable(lazy(() => import('pages/apps/purchaseDetails/purchasedetails')));
const AppVendorWiseSale = Loadable(lazy(() => import('pages/apps/vendorWiseSale/vendorWiseSale')));
const AppVendorWiseStock = Loadable(lazy(() => import('pages/apps/vendorWiseStock/vendorWiseStock')));
const AppVendorWiseExpiredStock = Loadable(lazy(() => import('pages/apps/vendorWiseExpiredStock/vendorWiseExpiredStock')));

// render - theme dashboard

// render - widget
const WidgetStatistics = Loadable(lazy(() => import('pages/widget/statistics')));
const WidgetData = Loadable(lazy(() => import('pages/widget/data')));
const WidgetChart = Loadable(lazy(() => import('pages/widget/chart')));

// render - applications

const AppCalendar = Loadable(lazy(() => import('pages/apps/calendar')));


const AppKanban = Loadable(lazy(() => import('pages/apps/kanban')));
const AppKanbanBacklogs = Loadable(lazy(() => import('sections/apps/kanban/Backlogs')));
const AppKanbanBoard = Loadable(lazy(() => import('sections/apps/kanban/Board')));

const AppInvoiceCreate = Loadable(lazy(() => import('pages/apps/invoice/create')));
const AppInvoiceDashboard = Loadable(lazy(() => import('pages/apps/invoice/dashboard')));
const AppInvoiceList = Loadable(lazy(() => import('pages/apps/invoice/list')));
const AppInvoiceDetails = Loadable(lazy(() => import('pages/apps/invoice/details')));
const AppInvoiceEdit = Loadable(lazy(() => import('pages/apps/invoice/edit')));

const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
const UserTabPayment = Loadable(lazy(() => import('sections/apps/profiles/user/TabPayment')));
const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));
const AccountTabRole = Loadable(lazy(() => import('sections/apps/profiles/account/TabRole')));
const UserTabSettings = Loadable(lazy(() => import('sections/apps/profiles/user/TabSettings')));

const AccountProfile = Loadable(lazy(() => import('pages/apps/profiles/account')));
const AccountTabProfile = Loadable(lazy(() => import('sections/apps/profiles/account/TabProfile')));
const AccountTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/account/TabPersonal')));
const AccountTabAccount = Loadable(lazy(() => import('sections/apps/profiles/account/TabAccount')));
const AccountTabPassword = Loadable(lazy(() => import('sections/apps/profiles/account/TabPassword')));
const AccountTabSettings = Loadable(lazy(() => import('sections/apps/profiles/account/TabSettings')));

const AppECommProducts = Loadable(lazy(() => import('pages/apps/e-commerce/product')));
const AppECommProductDetails = Loadable(lazy(() => import('pages/apps/e-commerce/product-details')));
const AppECommProductList = Loadable(lazy(() => import('pages/apps/e-commerce/products-list')));
const AppECommCheckout = Loadable(lazy(() => import('pages/apps/e-commerce/checkout')));
const AppECommAddProduct = Loadable(lazy(() => import('pages/apps/e-commerce/add-product')));

// render - forms & tables
const FormsValidation = Loadable(lazy(() => import('pages/forms/validation')));
const FormsWizard = Loadable(lazy(() => import('pages/forms/wizard')));

const FormsLayoutBasic = Loadable(lazy(() => import('pages/forms/layouts/basic')));
const FormsLayoutMultiColumn = Loadable(lazy(() => import('pages/forms/layouts/multi-column')));
const FormsLayoutActionBar = Loadable(lazy(() => import('pages/forms/layouts/action-bar')));
const FormsLayoutStickyBar = Loadable(lazy(() => import('pages/forms/layouts/sticky-bar')));

const FormsPluginsMask = Loadable(lazy(() => import('pages/forms/plugins/mask')));
const FormsPluginsClipboard = Loadable(lazy(() => import('pages/forms/plugins/clipboard')));
const FormsPluginsRecaptcha = Loadable(lazy(() => import('pages/forms/plugins/re-captcha')));
const FormsPluginsEditor = Loadable(lazy(() => import('pages/forms/plugins/editor')));
const FormsPluginsDropzone = Loadable(lazy(() => import('pages/forms/plugins/dropzone')));

const ReactTableBasic = Loadable(lazy(() => import('pages/tables/react-table/basic')));
const ReactTableSorting = Loadable(lazy(() => import('pages/tables/react-table/sorting')));
const ReactTableFiltering = Loadable(lazy(() => import('pages/tables/react-table/filtering')));
const ReactTableGrouping = Loadable(lazy(() => import('pages/tables/react-table/grouping')));
const ReactTablePagination = Loadable(lazy(() => import('pages/tables/react-table/pagination')));
const ReactTableRowSelection = Loadable(lazy(() => import('pages/tables/react-table/row-selection')));
const ReactTableExpanding = Loadable(lazy(() => import('pages/tables/react-table/expanding')));
const ReactTableEditable = Loadable(lazy(() => import('pages/tables/react-table/editable')));
const ReactTableDragDrop = Loadable(lazy(() => import('pages/tables/react-table/drag-drop')));
const ReactTableColumnHiding = Loadable(lazy(() => import('pages/tables/react-table/column-hiding')));
const ReactTableColumnResizing = Loadable(lazy(() => import('pages/tables/react-table/column-resizing')));
const ReactTableStickyTable = Loadable(lazy(() => import('pages/tables/react-table/sticky')));
const ReactTableUmbrella = Loadable(lazy(() => import('pages/tables/react-table/umbrella')));
const ReactTableEmpty = Loadable(lazy(() => import('pages/tables/react-table/empty')));

// render - charts & map
const ChartApexchart = Loadable(lazy(() => import('pages/charts/apexchart')));
const ChartOrganization = Loadable(lazy(() => import('pages/charts/org-chart')));

// table routing
const MuiTableBasic = Loadable(lazy(() => import('pages/tables/mui-table/basic')));
const MuiTableDense = Loadable(lazy(() => import('pages/tables/mui-table/dense')));
const MuiTableEnhanced = Loadable(lazy(() => import('pages/tables/mui-table/enhanced')));
const MuiTableDatatable = Loadable(lazy(() => import('pages/tables/mui-table/datatable')));
const MuiTableCustom = Loadable(lazy(() => import('pages/tables/mui-table/custom')));
const MuiTableFixedHeader = Loadable(lazy(() => import('pages/tables/mui-table/fixed-header')));
const MuiTableCollapse = Loadable(lazy(() => import('pages/tables/mui-table/collapse')));

// pages routing
const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/forgot-password')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/reset-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/check-mail')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/code-verification')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));

const AppContactUS = Loadable(lazy(() => import('pages/contact-us')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const PricingPage = Loadable(lazy(() => import('pages/extra-pages/pricing')));

// ==============================|| MAIN ROUTING ||============================== //

const isMobile = window.innerWidth < 768; // Set your own breakpoint
const DashboardRendor= isMobile ? NewMobileDashboard : NewDashboard

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <OttrAuthGuard>
          <MainLayout />
        </OttrAuthGuard>
      ),
      children: [
        {
          path: 'newdashboard',
          element: <DashboardRendor />
        },
        {
          path: 'settings',
          element: <Settings />
        },
        {
          path: 'widget',
          children: [
            {
              path: 'statistics',
              element: <WidgetStatistics />
            },
            {
              path: 'data',
              element: <WidgetData />
            },
            {
              path: 'chart',
              element: <WidgetChart />
            }
          ]
        },
        {
          path: 'apps',
          children: [
            {
              path: 'calendar',
              element: <AppCalendar />
            },
            {
              path: 'kanban',
              element: <AppKanban />,
              children: [
                {
                  path: 'backlogs',
                  element: <AppKanbanBacklogs />
                },
                {
                  path: 'board',
                  element: <AppKanbanBoard />
                }
              ]
            },
            

            {
              path: 'Master',
              children: [
                {
                  path: 'Customer',
                  element: <AppNewCustomer />
                },
                {
                  path: 'Vendors',
                  element: <Appvendor />
                },
                {
                  path: 'Product',
                  element: <AppProduct />
                },
                {
                  path: 'Store',
                  element: <AppStore />
                },
                {
                  path: 'ReturnReasons',
                  element: <AppReturnReasons />
                },
                {
                  path: 'CategoryProduct',
                  element: <AppProductCategory />
                }
              ]
            },
            {
              path: 'Transactions',
              children: [
                {
                  path: 'purchase-order',
                  element: <AppPurchaseOrder />
                },
                {
                  path: 'Material-return',
                  element: <AppMaterialreturn />
                },
                {
                  path: 'Material-inward',
                  element: <AppMaterialinward />
                },
                {
                  path: 'oldbucket',
                  element: <AppBucket />
                },
                {
                  path: 'bucket',
                  // element: <AppNewBucket />,
                  children: [
                    {
                      path: '', // This will be the default route for "bucket"
                      element: <AppNewBucket />
                    },
                    {
                      path: 'payment',
                      element: <AppNewBucketPayment />
                    }
                  ]
                },
                {
                  path: 'ottrinvoice',
                  element: <AppnewInvoice />
                },
                {
                  path: 'invoice',
                  children: [
                    {
                      path: 'dashboard',
                      element: <AppInvoiceDashboard />
                    },
                    {
                      path: 'create',
                      element: <AppInvoiceCreate />
                    },
                    {
                      path: 'details/:id',
                      element: <AppInvoiceDetails />
                    },
                    {
                      path: 'edit/:id',
                      element: <AppInvoiceEdit />
                    },
                    {
                      path: 'list',
                      element: <AppInvoiceList />
                    }
                  ]
                },
                {
                  path: 'add-material-return',
                  element: <AppAddMaterialreturn />
                },
                {
                  path: 'invoice-details',
                  element: <AppMobileViewInvoiceDetails />
                }
              ]
            },
            {
              path: 'Reports',
              children: [
                {
                  path: 'VendorPaymentDetails',
                  element: <AppVendorPaymentDetails />
                },
                {
                  path: 'DayWiseSale',
                  element: <AppDayWiseSale />
                },
                {
                  path: 'Dailysale',
                  element: <AppDailysale />
                },
                {
                  path: 'PurchesDetails',
                  element: <AppPurchesDetails />
                },
                {
                  path: 'VendorWiseSale',
                  element: <AppVendorWiseSale />
                },
                {
                  path: 'VendorWiseStock',
                  element: <AppVendorWiseStock />
                },
                {
                  path: 'VendorWiseExpiredStock',
                  element: <AppVendorWiseExpiredStock />
                }
              ]
            },
            {
              path: 'profiles',
              children: [
                {
                  path: 'account',
                  element: <AccountProfile />,
                  children: [
                    {
                      path: 'basic',
                      element: <AccountTabProfile />
                    },
                    {
                      path: 'personal',
                      element: <AccountTabPersonal />
                    },
                    {
                      path: 'my-account',
                      element: <AccountTabAccount />
                    },
                    {
                      path: 'password',
                      element: <AccountTabPassword />
                    },
                    {
                      path: 'role',
                      element: <AccountTabRole />
                    },
                    {
                      path: 'settings',
                      element: <AccountTabSettings />
                    }
                  ]
                },
                {
                  path: 'user',
                  element: <UserProfile />,
                  children: [
                    {
                      path: 'personal',
                      element: <UserTabPersonal />
                    },
                    {
                      path: 'payment',
                      element: <UserTabPayment />
                    },
                    {
                      path: 'password',
                      element: <UserTabPassword />
                    },
                    {
                      path: 'settings',
                      element: <UserTabSettings />
                    }
                  ]
                }
              ]
            },
            {
              path: 'e-commerce',
              children: [
                {
                  path: 'products',
                  element: <AppECommProducts />
                },
                {
                  path: 'product-details/:id',
                  element: <AppECommProductDetails />
                },
                {
                  path: 'product-list',
                  element: <AppECommProductList />
                },
                {
                  path: 'add-new-product',
                  element: <AppECommAddProduct />
                },
                {
                  path: 'checkout',
                  element: <AppECommCheckout />
                }
              ]
            }
          ]
        },
        {
          path: 'forms',
          children: [
            {
              path: 'validation',
              element: <FormsValidation />
            },
            {
              path: 'wizard',
              element: <FormsWizard />
            },
            {
              path: 'layout',
              children: [
                {
                  path: 'basic',
                  element: <FormsLayoutBasic />
                },
                {
                  path: 'multi-column',
                  element: <FormsLayoutMultiColumn />
                },
                {
                  path: 'action-bar',
                  element: <FormsLayoutActionBar />
                },
                {
                  path: 'sticky-bar',
                  element: <FormsLayoutStickyBar />
                }
              ]
            },
            {
              path: 'plugins',
              children: [
                {
                  path: 'mask',
                  element: <FormsPluginsMask />
                },
                {
                  path: 'clipboard',
                  element: <FormsPluginsClipboard />
                },
                {
                  path: 're-captcha',
                  element: <FormsPluginsRecaptcha />
                },
                {
                  path: 'editor',
                  element: <FormsPluginsEditor />
                },
                {
                  path: 'dropzone',
                  element: <FormsPluginsDropzone />
                }
              ]
            }
          ]
        },
        {
          path: 'tables',
          children: [
            {
              path: 'react-table',
              children: [
                {
                  path: 'basic',
                  element: <ReactTableBasic />
                },
                {
                  path: 'sorting',
                  element: <ReactTableSorting />
                },
                {
                  path: 'filtering',
                  element: <ReactTableFiltering />
                },
                {
                  path: 'grouping',
                  element: <ReactTableGrouping />
                },
                {
                  path: 'pagination',
                  element: <ReactTablePagination />
                },
                {
                  path: 'row-selection',
                  element: <ReactTableRowSelection />
                },
                {
                  path: 'expanding',
                  element: <ReactTableExpanding />
                },
                {
                  path: 'editable',
                  element: <ReactTableEditable />
                },
                {
                  path: 'drag-drop',
                  element: <ReactTableDragDrop />
                },
                {
                  path: 'column-hiding',
                  element: <ReactTableColumnHiding />
                },
                {
                  path: 'column-resizing',
                  element: <ReactTableColumnResizing />
                },
                {
                  path: 'sticky-table',
                  element: <ReactTableStickyTable />
                },
                {
                  path: 'umbrella',
                  element: <ReactTableUmbrella />
                },
                {
                  path: 'empty',
                  element: <ReactTableEmpty />
                }
              ]
            },
            {
              path: 'mui-table',
              children: [
                {
                  path: 'basic',
                  element: <MuiTableBasic />
                },
                {
                  path: 'dense',
                  element: <MuiTableDense />
                },
                {
                  path: 'enhanced',
                  element: <MuiTableEnhanced />
                },
                {
                  path: 'datatable',
                  element: <MuiTableDatatable />
                },
                {
                  path: 'custom',
                  element: <MuiTableCustom />
                },
                {
                  path: 'fixed-header',
                  element: <MuiTableFixedHeader />
                },
                {
                  path: 'collapse',
                  element: <MuiTableCollapse />
                }
              ]
            }
          ]
        },
        {
          path: 'charts',
          children: [
            {
              path: 'apexchart',
              element: <ChartApexchart />
            },
            {
              path: 'org-chart',
              element: <ChartOrganization />
            }
          ]
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'pricing',
          element: <PricingPage />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    },
    {
      path: '/auth',
      element: <CommonLayout />,
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'check-mail',
          element: <AuthCheckMail />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        }
      ]
    },
    {
      path: '/',
      element: <CommonLayout layout="simple" />,
      children: [
        {
          path: 'contact-us',
          element: <AppContactUS />
        }
      ]
    }
  ]
};

export default MainRoutes;
