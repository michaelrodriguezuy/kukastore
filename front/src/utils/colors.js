export const customBlack = "#1e1e1e";
export const customGray = "#585858";
export const customWhite = "#ffffff";

export const getColorByHex = (colorHex) => {

  if (!colorHex) return "No especificado";  
  
  const colorMap = {
    "#FF0000": "rojo",
    "#0000FF": "azul",
    "#00FF00": "verde",
    "#FFFF00": "amarillo",
    "#FFA500": "naranja",
    "#EE82EE": "violeta",
    "#FFC0CB": "rosa",
    "#8B4513": "marrón",
    "#808080": "gris",
    "#000000": "negro",
    "#FFFFFF": "blanco",    
  };

  return colorMap[colorHex] || colorHex;
};

export const getColorByName = (colorName) => {
  const colorMap = {
    rojo: "#FF0000",
    azul: "#0000FF",
    verde: "#00FF00",
    negro: "#000000",
    blanco: "#FFFFFF",
    gris: "#808080",
    amarillo: "#FFFF00",
    naranja: "#FFA500",
    rosa: "#FFC0CB",
    morado: "#800080",
    marron: "#A52A2A",
    // Agrega aquí más colores según necesites
  };
  return colorMap[colorName.toLowerCase()] || colorName;
}; 