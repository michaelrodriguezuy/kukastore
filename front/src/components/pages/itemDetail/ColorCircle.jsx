
const ColorCircle = ({
  colorCode,
  setSelectedColor,
  productID,
  setProduct,
  relatedProducts,
  selectedColor,
}) => {
  const handleClick = () => {
    setSelectedColor(colorCode);

    const selectedProduct = relatedProducts.find(
      (product) => product.id === productID
    );

    const updatedProduct = {
      ...selectedProduct,
      color: colorCode,
    };
    setProduct(updatedProduct);

    // Actualizar la URL con el nuevo id del producto y el color seleccionado
    window.history.pushState(
      null,
      "",
      `/itemDetail/${productID}?color=${colorCode}`
    );
    // history.push(`/itemDetail/${productID}?color=${colorCode}`);
  };

  return (
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: colorCode,
        margin: "0 5px",
        display: "inline-block",
        cursor: "pointer",
        position: "relative",
        border: `2px solid ${selectedColor === colorCode ? "black" : "transparent"}`,
      }}
      onClick={handleClick}
    ></div>
  );
};

export default ColorCircle;
