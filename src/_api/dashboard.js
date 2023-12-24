// project import
import services from 'utils/mockAdapter';

// ==============================|| MENU ITEMS - DASHBOARD  ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'dashboard',
  type: 'group',
  // icon: 'dashboardOutlined',
  icon: 'icon-folder-open-outlined',
  classNameIcon: true, 
  children: [
    {
      id: 'dashboard',
      title: 'dashboard',
      type: 'collapse',
      url: '/newdashboard',
      // icon: 'dashboardOutlined',
      icon: 'icon-dashboard',
      classNameIcon: true, 
      target: false,
      
    }

    // {
    //   id: 'components',
    //   title: 'components',
    //   type: 'item',
    //   url: '/components-overview/buttons',
    //   icon: 'goldOutlined',
    //   target: true,
    //   chip: {
    //     label: 'new',
    //     color: 'primary',
    //     size: 'small',
    //     variant: 'combined'
    //   }
    // }
  ]
};

// ==============================|| MOCK SERVICES ||============================== //

services.onGet('/api/dashboard').reply(200, { dashboard: dashboard });
