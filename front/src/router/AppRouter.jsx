import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ScrollToTop from "../components/common/ScrollToTop";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
import ProtectedUsers from "./guards/ProtectedUsers";
import ProtectedAdmin from "./guards/ProtectedAdmin";

const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Rutas Públicas */}
          {publicRoutes.map(({ id, path, Element }) => (
            <Route key={id} path={path} element={<Element />} />
          ))}

          {/* Rutas Privadas */}
          <Route element={<ProtectedUsers />}>
            {privateRoutes.map(({ id, path, Element }) => (
              <Route key={id} path={path} element={<Element />} />
            ))}
          </Route>

          {/* Rutas de Administrador */}
          <Route element={<ProtectedAdmin />}>
            {adminRoutes.map(({ id, path, Element }) => (
              <Route key={id} path={path} element={<Element />} />
            ))}
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRouter;
