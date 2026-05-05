// import { Navigate, Outlet } from 'react-router-dom';

// function PrivateRoute() {
//  const token = sessionStorage.getItem('token');
//   return (token?<Outlet/>:<Navigate to="/login"/>)

// }

// export default PrivateRoute

import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
