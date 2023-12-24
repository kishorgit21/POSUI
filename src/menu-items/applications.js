// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  CodeSandboxOutlined,
  TeamOutlined,
  CreditCardOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
  RestOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  FileOutlined,
  ExportOutlined,
  TagsOutlined,
  ProfileOutlined
} from '@ant-design/icons';

// icons
const icons = {
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  CodeSandboxOutlined,
  TeamOutlined,
  CreditCardOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
  RestOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  FileOutlined,
  ExportOutlined,
  TagsOutlined,
  ProfileOutlined
};
// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications = {
  id: 'group-applications',
  title: <FormattedMessage id="applications" />,
  icon: icons.AppstoreAddOutlined,
  type: 'group',
  children: [
    {
      id: 'Master',
      title: <FormattedMessage id="Master" />,
      url: '',
      type: 'collapse',
      // icon: icons.FolderOpenOutlined, 
      icon: 'icon-folder-open-outlined',
      classNameIcon: true, 
      breadcrumbs: true,
      children: [
        {
          id: 'Product',
          title: <FormattedMessage id="Product" />,
          type: 'item',
          url: '/apps/Master/Product',
          icon: 'icon-product', 
          classNameIcon: true,
          breadcrumbs: true
        },
        {
          id: 'Vendors',
          title: <FormattedMessage id="Vendors" />,
          type: 'item',
          url: '/apps/Master/Vendors',
          icon: 'icon-vendor', 
          classNameIcon: true,
          breadcrumbs: true
        },
        {
          id: 'Customer',
          title: <FormattedMessage id="Customer" />,
          type: 'item',
          url: '/apps/Master/Customer',
          icon: 'icon-customer', 
          classNameIcon: true,
          breadcrumbs: true
        },
        {
          id: 'Store',
          title: <FormattedMessage id="Store" />,
          type: 'item',
          url: '/apps/Master/Store',
          icon: 'icon-store', 
          classNameIcon: true,
          breadcrumbs: true
        },
        {
          id: 'ReturnReason',
          title: <FormattedMessage id="ReturnReason" />,
          type: 'item',
          url: '/apps/Master/ReturnReasons',
          icon: 'icon-return-reason', 
          classNameIcon: true,
          breadcrumbs: true
        },
        {
          id: 'ProductCategory',
          title: <FormattedMessage id="ProductCategory" />,
          type: 'item',
          url: '/apps/Master/CategoryProduct',
          icon: 'icon-product-category', 
          classNameIcon: true,
          breadcrumbs: true
        },
      ]
    },
    {
      id: 'Transactions',
      title: <FormattedMessage id="Transactions" />,
      url: '',
      type: 'collapse',
      icon: 'icon-transaction',
      classNameIcon: true,
      breadcrumbs: true,
      children: [
        {
          id: 'Purchase-order',
          icon: 'icon-purchase-order',
          classNameIcon: true,
          title: <FormattedMessage id="purchaseOrder" />,
          type: 'item',
          url: '/apps/Transactions/purchase-order',
          breadcrumbs: true
        },

        {
          id: 'Material-inward',
          icon: 'icon-material-inward',
          classNameIcon: true,
          title: <FormattedMessage id="Material-inward" />,
          type: 'item',
          url: '/apps/Transactions/Material-inward',
          breadcrumbs: true
        },
        {
          id: 'Material-return',
          icon: 'icon-material-return',
          classNameIcon: true,
          title: <FormattedMessage id="Material-return" />,
          type: 'item',
          url: '/apps/Transactions/Material-return',
          breadcrumbs: true
        },
        // {
        //   id: 'oldbucket',
        //   icon: 'icon-bucket',
        //   classNameIcon: true,
        //   title:'Old Bucket',
        //   type: 'item',
        //   url: '/apps/Transactions/oldbucket',
        //   breadcrumbs: true
        // },
        {
          id: 'bucket',
          icon: 'icon-bucket',
          classNameIcon: true,
          title: <FormattedMessage id="bucket" />,
          type: 'item',
          url: '/apps/Transactions/bucket',
          breadcrumbs: true
        },
        {
          id: 'invoice',
          icon: 'icon-invoice',
          classNameIcon: true,
          title: <FormattedMessage id="invoice" />,
          type: 'item',
          url: '/apps/Transactions/ottrinvoice',
          breadcrumbs: true
        }
      ]
    },
    {
      id: 'reports',
      title: <FormattedMessage id="Reports" />,
      url: '',
      type: 'collapse',
      icon: icons.FileTextOutlined,
      breadcrumbs: true,
      children: [
        {
          id: 'VendorPaymentDetails',
          icon: icons.SolutionOutlined,
          title: <FormattedMessage id="VendorPaymentDetails" />,
          type: 'item',
          url: '/apps/Reports/VendorPaymentDetails'
        },
        {
          id: 'DayWiseSale',
          icon: icons.CalendarOutlined,
          title: <FormattedMessage id="DayWiseSale" />,
          type: 'item',
          url: '/apps/Reports/DayWiseSale'
        },
        {
          id: 'Dailysale',
          icon: icons.CalendarOutlined,
          title: <FormattedMessage id="Dailysale" />,
          type: 'item',
          url: '/apps/Reports/Dailysale'
        },
        {
          id: 'PurchesDetails',
          icon: icons.FileDoneOutlined,
          title: <FormattedMessage id="Purchase Detail" />,
          type: 'item',
          url: '/apps/Reports/PurchesDetails'
        },
        {
          id: 'VendorWiseSale',
          icon: icons.TeamOutlined,
          title: <FormattedMessage id="VendorWiseSale" />,
          type: 'item',
          url: '/apps/Reports/VendorWiseSale'
        },
        {
          id: 'VendorWiseStock',
          icon: icons.TeamOutlined,
          title: <FormattedMessage id="VendorWiseStock" />,
          type: 'item',
          url: '/apps/Reports/VendorWiseStock'
        },
        {
          id: 'ExpiredStock',
          icon: icons.TeamOutlined,
          title: <FormattedMessage id="ExpiredStock" />,
          type: 'item',
          url: '/apps/Reports/VendorWiseExpiredStock'
        }
      ]
    }
  ]
};

export default applications;
