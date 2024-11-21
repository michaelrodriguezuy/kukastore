import Checkout from "../components/pages/checkout/Checkout";
import DataUser from "../components/pages/userData/DataUser";
import UserOrders from "../components/pages/userOrders/UserOrders";

export const routes2 = [
//   {
//     id: "home",
//     path: "/",
//     Element: Home,
//   },
//   {
//     id: "shop",
//     path: "/shop",
//     Element: ItemListContainer,
//   },
//   {
//     id: "detalle",
//     path: "/itemDetail/:id",
//     Element: ItemDetail,
//   },
//   {
//     id: "cart",
//     path: "/cart",
//     Element: Cart,
//   },
  {
    id: "checkout",
    path: "/checkout",
    Element: Checkout,
  },
  {
    id: "userOrders",
    path: "/user-orders",
    Element: UserOrders,
  },
  {
    id: "dataUser",
    path: "/data-user",
    Element: DataUser,
  },
];
