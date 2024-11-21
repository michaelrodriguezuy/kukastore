import { createContext, useState } from "react";

export const CartContext = createContext();

const CartContextComponent = ({ children }) => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  
  const addItem = (product) => {
    let existe = cart.some((elemento) => elemento.id === product.id);

    if (existe) {
      let nuevoCart = cart.map((elemento) => {
        if (elemento.id === product.id) {
          return { ...elemento, quantity: product.quantity };
        } else {
          return elemento;
        }
      });
      localStorage.setItem("cart", JSON.stringify(nuevoCart));
      setCart(nuevoCart);
    } else {
      localStorage.setItem("cart", JSON.stringify([...cart, product]));
      setCart([...cart, product]);
    }
  };

  const getQuantityById = (id) => {
    let product = cart.find((elemento) => elemento.id === id);
    return product?.quantity;
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");    
  };
  
  const deleteById = (id) => {
    let nuevoCart = cart.filter((elemento) => elemento.id !== id);
    localStorage.setItem("cart", JSON.stringify(nuevoCart));
    setCart(nuevoCart);
  };
  
  const getTotalPrice = () => {
    let total = cart.reduce((acumulador, elemento) => {      
      return acumulador + elemento.unit_price * elemento.quantity;
    }, 0);
    
    return total;
  };
  
  const getTotalItems = () => {
    let totalItems = cart.reduce((acumulador, elemento) => {      
      return acumulador + elemento.quantity;
    }, 0);
    return totalItems;
  };

  function getDateShort(date) {
    if (!date) {
      return "Fecha no disponible";
    }

    const laFecha =
      date instanceof Date
        ? date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : date.toDate().toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

    return laFecha;
  }

  const getFormatCurrency = (price) => {
    const formattedPrice = price.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
    });
    return formattedPrice;
  };

  function getDateLong(date) {
    if (!date) {
      return "Fecha no disponible";
    }

    const laFecha =
      date instanceof Date
        ? date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : date.toDate().toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

    return laFecha;
  }

  let data = {
    cart,
    addItem,
    getQuantityById,
    clearCart,
    deleteById,
    getTotalPrice,
    getTotalItems,
    getFormatCurrency,
    getDateShort,
    getDateLong,
  };

  return <CartContext.Provider value={data}>{children}</CartContext.Provider>;
};

export default CartContextComponent;