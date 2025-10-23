import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  // Just render the outlet directly - let Login/Register handle their own styling
  return <Outlet />;
};

export default AuthLayout;

