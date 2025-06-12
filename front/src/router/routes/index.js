import About from "../../pages/about/About";
import Cart from "../../pages/cart/Cart";
import CartPage from "../../pages/cart/CartPage";
import Contact from "../../pages/contact/Contact";
import Home from "../../pages/home/Home";
import ItemDetail from "../../pages/products/views/ItemDetail";
import ItemListContainer from "../../pages/products/views/ItemListContainer";
import Politicas from "../../pages/politicas/Politicas";
import Devoluciones from "../../pages/devoluciones/Devoluciones";
import OpcionesPago from "../../pages/opcionesPago/OpcionesPago";
import Checkout from "../../pages/checkout/Checkout";
import DataUser from "../../pages/users/views/DataUser";
import UserOrders from "../../pages/users/views/UserOrders";
import Dashboard from "../../pages/dashboard/views/Dashboard";
import ProductsList from "../../pages/dashboard/views/ProductsList";
import ProductsForm from "../../pages/dashboard/components/ProductsForm";
import Orders from "../../pages/dashboard/views/Orders";
import Login from "../../pages/auth/views/Login";
import Logout from "../../pages/auth/views/Logout";
import Register from "../../pages/auth/views/Register";
import ForgotPassword from "../../pages/auth/views/ForgotPassword";
import ConfirmCheckout from "../../pages/checkout/ConfirmCheckout";
import CompraFinalizada from "../../pages/checkout/CompraFinalizada";
import Delivery from '../../pages/delivery/Delivery';

// Rutas públicas
export const publicRoutes = [
  {
    id: "home",
    path: "/",
    Element: Home,
  },
  {
    id: "shop",
    path: "/shop",
    Element: ItemListContainer,
  },
  {
    id: "detalle",
    path: "/itemDetail/:id",
    Element: ItemDetail,
  },
  {
    id: "cart",
    path: "/cart",
    Element: Cart,
  },
  {
    id: "cartPage",
    path: "/cartPage",
    Element: CartPage,
  },
  {
    id: "checkout",
    path: "/checkout",
    Element: Checkout,
  },
  {
    id: "about",
    path: "/about",
    Element: About,
  },
  {
    id: "contact",
    path: "/contact",
    Element: Contact,
  },
  {
    id: "politicas",
    path: "/politicas",
    Element: Politicas,
  },
  {
    id: "devoluciones",
    path: "/devoluciones",
    Element: Devoluciones,
  },
  {
    id: "opcionesPago",
    path: "/opcionesPago",
    Element: OpcionesPago,
  },
  {
    id: "login",
    path: "/login",
    Element: Login,
  },
  {
    id: "logout",
    path: "/logout",
    Element: Logout,
  },
  {
    id: "register",
    path: "/register",
    Element: Register,
  },
  {
    id: "forgotPassword",
    path: "/forgot-password",
    Element: ForgotPassword,
  },
  {
    id: "confirmCheckout",
    path: "/confirm-checkout",
    Element: ConfirmCheckout,
  },
  {
    id: "compraFinalizada",
    path: "/compra-finalizada",
    Element: CompraFinalizada,
  },
  {
    id: "delivery",
    path: "/delivery/:orderId",
    Element: Delivery
  },
];

// Rutas privadas (requieren autenticación)
export const privateRoutes = [
  {
    id: "userOrders",
    path: "/user-orders",
    Element: UserOrders,
  },
  {
    id: "dataUser",
    path: "/data-user",
    Element: DataUser,
  }
];

// Rutas administrativas (requieren autenticación de admin)
export const adminRoutes = [
  {
    id: "dashboard",
    path: "/dashboard",
    Element: Dashboard,
  },
  {
    id: "dashboardOrders",
    path: "/dashboard/orders",
    Element: Orders,
  },
  {
    id: "productsList",
    path: "/dashboard/products",
    Element: ProductsList,
  },
  {
    id: "productsForm",
    path: "/dashboard/products/form",
    Element: ProductsForm,
  },
  {
    id: "productsEdit",
    path: "/dashboard/products/edit/:id",
    Element: ProductsForm,
  }
]; 