// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// project import
import chat from './chat';
import calendar from './calendar';
import menu from './menu';
import snackbar from './snackbar';
import productReducer from './product';
import cartReducer from './cart';
import kanban from './kanban';
import invoice from './invoice';
import authReducer from './authReducer';
import vendorSlice from './master_Vendors';
import customerSlice from './master_Customers'
import returnReasonSlice from './master_ReturnReasons'; 
import productSlice from './master_Products';
import storeSlice from './master_Stores';
import materialInwardsSlice from './transactions/material_Inwards';
import purchaseOrderSlice from './transactions/purchase-order';
import Buckets from "./buckets";
import productCategorySlice from './master/product_category';
import materialReturnSlice from './transactions/material_Return';
import invoiceSlice from './ottrInvoices';
import isDeletedStateSlice from './deleteStateReducer';
import searchStateSlice from './searchStateReducer';
import dialogSlice from './sessionTimout/dialogReducer';
import activeBucketsSlice from './transactions/new_Bucket';
import settingsSlice from './settings/settings';
import reportSlice from './reports/report';
import newbucketFlagSlice from './newbucketFlagReducer'

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  chat,
  authReducer ,
  calendar,
  menu,
  snackbar,
  cart: persistReducer(
    {
      key: 'cart',
      storage,
      keyPrefix: 'mantis-js-'
    },
    cartReducer
  ),
  product: productReducer,
  productSlice,
  kanban,
  storeSlice,
  invoice,
  returnReasonSlice,
  vendorSlice,
  customerSlice,
  materialInwardsSlice,
  purchaseOrderSlice,
  productCategorySlice,
  invoiceSlice,
  Buckets,
  materialReturnSlice,
  isDeletedStateSlice,
  searchStateSlice,
  dialogSlice,
  activeBucketsSlice,
  settingsSlice,
  reportSlice,
  newbucketFlagSlice
});

export default reducers;
