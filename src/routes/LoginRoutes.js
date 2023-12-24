import { lazy } from 'react';

// project import
import OttrGuestGuard from 'utils/route-guard/OttrGuestGuard';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';

// render - login
// const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
const AuthMobileOTP = Loadable(lazy(() => import('pages/auth/MobileOTP')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/code-verification')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <OttrGuestGuard>
          <CommonLayout />
        </OttrGuestGuard>
      ),

      children: [
        { 
          path: 'mobileotp',
          element: <AuthMobileOTP />
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
          path: 'check-mail',
          element: <AuthCheckMail />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        }
      ]
    }
  ]
};

export default LoginRoutes;
