import Cart from "../components/pages/cart/Cart";
import Home from "../components/pages/home/Home";
import ItemDetail from "../components/pages/itemDetail/ItemDetail";
import ItemListContainer from "../components/pages/itemlist/ItemListContainer";

export const routes = [
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
  // {
  //   id: "checkout",
  //   path: "/checkout",
  //   Element: Checkout,
  // },
  // {
  //   id: "userOrders",
  //   path: "/user-orders",
  //   Element: UserOrders,
  // },
  // {
  //   id: "dataUser",
  //   path: "/data-user",
  //   Element: DataUser,
  // },
];
