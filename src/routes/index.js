import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';

// project import
// import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import ComponentsRoutes from './ComponentsRoutes';
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';

// render - landing page
// const PagesLanding = Loadable(lazy(() => import('pages/landing')));
// const Dashboard = Loadable(lazy(() => import('pages/dashboard/NewDashboard')));
const MobileNumberInput = Loadable(lazy(() => import('pages/auth/Mobilenumberauth')));



// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: '/',
      // element: <CommonLayout layout="landing" />,
      children: [
        {
          path: '/',

          element: <MobileNumberInput />
        }
      ]
    },
    
    LoginRoutes,
    ComponentsRoutes,
    MainRoutes
  ]);
}
