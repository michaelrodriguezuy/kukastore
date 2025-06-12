import { createContext, useState } from "react";

export const CartContext = createContext();

const CartContextComponent = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [orderData, setOrderData] = useState(() => {
    const storedOrderData = localStorage.getItem("orderData");
    return storedOrderData ? JSON.parse(storedOrderData) : {
      shippingMethod: '',
      shippingCost: 0,
      paymentMethod: '',
      customerData: {},
      totals: {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0
      }
    };
  });

  const addItem = (product) => {
    // Asegurar que siempre haya un SKU: si no hay variantes, usar el code
    const sku = product.sku || product.code;
    // Buscar si ya existe ese SKU en el carrito
    let existe = cart.some((elemento) => elemento.sku === sku);

    if (existe) {
      let nuevoCart = cart.map((elemento) => {
        if (elemento.sku === sku) {
          return { ...elemento, quantity: product.quantity };
        } else {
          return elemento;
        }
      });
      localStorage.setItem("cart", JSON.stringify(nuevoCart));
      setCart(nuevoCart);
    } else {
      // Asegurarse de guardar el SKU en el producto
      const productoConSku = { ...product, sku };
      localStorage.setItem("cart", JSON.stringify([...cart, productoConSku]));
      setCart([...cart, productoConSku]);
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

  const clearAll = () => {
    setCart([]);
    setOrderData({
      shippingMethod: '',
      shippingCost: 0,
      paymentMethod: '',
      customerData: {},
      totals: {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0
      }
    });
    localStorage.removeItem("cart");
    localStorage.removeItem("orderData");
  };
  
  const deleteById = (sku) => {
    let nuevoCart = cart.filter((elemento) => elemento.sku !== sku);
    localStorage.setItem("cart", JSON.stringify(nuevoCart));
    setCart(nuevoCart);
  };
  
  const calculateDiscountedPrice = (item) => {
    if (item.discount) {
      return item.unit_price - (item.unit_price * (item.discount / 100));
    }
    return item.unit_price;
  };

  const getTotalDiscount = () => {
    if (!cart || cart.length === 0) return 0;
    
    return cart.reduce((total, item) => {
      if (item.discount) {
        const descuento = (item.unit_price * item.quantity) - (calculateDiscountedPrice(item) * item.quantity);
        return total + descuento;
      }
      return total;
    }, 0);
  };

  const updateOrderData = (newData) => {    
    const updatedOrderData = {
      ...orderData,
      ...newData,
      totals: {
        subtotal: getTotalPrice(),
        discount: getTotalDiscount(),
        shipping: orderData.shippingCost,
        total: getTotalWithShipment()
      }
    };    
    setOrderData(updatedOrderData);    
    localStorage.setItem('orderData', JSON.stringify(updatedOrderData));    
   
  };

  const getTotalPrice = () => {
    if (!cart || cart.length === 0) return 0;
    
    return cart.reduce((acc, item) => {
      const priceWithDiscount = item.discount > 0 
        ? item.unit_price - (item.unit_price * item.discount / 100)
        : item.unit_price;
      return acc + (priceWithDiscount * item.quantity);
    }, 0);
  };

  const getTotalWithShipment = () => {
    const subtotal = parseFloat(getTotalPrice()) || 0;
    const shipping = parseFloat(orderData.shippingCost) || 0;
    return Math.round(subtotal + shipping);
  };

  const getSubtotal = () => {
    if (!cart || cart.length === 0) return 0;
    
    return cart.reduce((acc, item) => {
      const priceWithDiscount = item.discount > 0 
        ? item.unit_price - (item.unit_price * item.discount / 100)
        : item.unit_price;
      return acc + (priceWithDiscount * item.quantity);
    }, 0);
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
    // Asegurarnos que price sea un número
    const numericPrice = Number(price);
    
    // Verificar si es un número válido
    if (isNaN(numericPrice)) {
      return "$ 0,00";
    }

    return numericPrice.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
    });
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

  const updateQuantity = (id, newQuantity) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity
        };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const contextValue = {
    cart,
    orderData,
    addItem,
    getQuantityById,
    clearCart,
    clearAll,
    deleteById,
    getTotalPrice,
    getTotalWithShipment,
    getSubtotal,
    getTotalItems,
    getFormatCurrency,
    getDateShort,
    getDateLong,
    calculateDiscountedPrice,
    getTotalDiscount,
    updateOrderData,
    updateQuantity
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContextComponent;