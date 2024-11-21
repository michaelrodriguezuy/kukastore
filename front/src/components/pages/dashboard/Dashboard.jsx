import { useContext, useEffect } from "react";
import { useState } from "react";
import { db, uploadFile } from "../../../fireBaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  addDoc,
} from "firebase/firestore";
import ProductsList from "./ProductsList";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Modal,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Importa el ícono que desees usar

import { MenuItem, Select, LinearProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [isChange, setIsChange] = useState(false);

  const [shipments, setShipments] = useState([]);
  const [currentShipmentId, setCurrentShipmentId] = useState("");
  const [currentShipmentName, setCurrentShipmentName] = useState("");
  const [currentShipmentDescription, setCurrentShipmentDescription] =
    useState("");
  const [currentShipmentCost, setCurrentShipmentCost] = useState(0);
  const [openModalShipment, setOpenModalShipment] = useState(false);

  const [forceUpdate, setForceUpdate] = useState(false);

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openModalCategory, setOpenModalCategory] = useState(false);

  const { getFormatCurrency } = useContext(CartContext);

  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setIsChange(false);
    let productsCollection = collection(db, "products");
    getDocs(productsCollection).then((res) => {
      const newArr = res.docs.map((product) => {
        return {
          ...product.data(),
          id: product.id,
        };
      });
      setProducts(newArr);
    });
  }, [isChange]);

  useEffect(() => {
    const fetchShipments = async () => {
      const shipmentCollection = collection(db, "shipment");
      const querySnapshot = await getDocs(shipmentCollection);
      const shipmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        cost: doc.data().cost,
      }));
      setShipments(shipmentList);
    };

    fetchShipments();
  }, [forceUpdate]);

  const updateShipment = async () => {
    try {
      if (currentShipmentId) {
        await updateDoc(doc(db, "shipment", currentShipmentId), {
          name: currentShipmentName,
          description: currentShipmentDescription,
          cost: currentShipmentCost,
        });
      } else {
        const newShipmentRef = await addDoc(collection(db, "shipment"), {
          name: currentShipmentName || "Nuevo envío",
          description: currentShipmentDescription || "Descripción",
          cost: currentShipmentCost,
        });

        setShipments((prevShipments) => [
          ...prevShipments,
          {
            id: newShipmentRef.id,
            name: currentShipmentName,
            description: currentShipmentDescription,
            cost: currentShipmentCost,
          },
        ]);
      }

      clearModalShipment();
      setForceUpdate((prev) => !prev);
    } catch (error) {
      console.error("Error al actualizar/crear el envío:", error);
    }
  };

  const clearModalShipment = () => {
    setOpenModalShipment(false);
    setCurrentShipmentId("");
    setCurrentShipmentName("");
    setCurrentShipmentDescription("");
    setCurrentShipmentCost(0);
  };

  const handleEditClick = (shipment) => {
    setCurrentShipmentId(shipment.id);
    setCurrentShipmentName(shipment.name);
    setCurrentShipmentDescription(shipment.description);
    setCurrentShipmentCost(shipment.cost);
    setOpenModalShipment(true);
  };

  useEffect(() => {
    const categoriesCollection = collection(db, "categories");
    const q = query(categoriesCollection);
    getDocs(q).then((querySnapshot) => {
      const categoryList = [];
      querySnapshot.forEach((doc) => {
        categoryList.push({ id: doc.id, ...doc.data() });
      });
      setCategories(categoryList);
    });
  }, []);

  const updateCategory = async () => {
    try {
      if (selectedCategory) {
        const categoryDocRef = doc(db, "categories", selectedCategory);
        await updateDoc(categoryDocRef, {
          name: category,
          img: imageUrl,
        });

        const updatedCategories = categories.map((c) => {
          if (c.id === selectedCategory) {
            return { ...c, name: category, img: imageUrl};
          }
          return c;
        });

        setCategories(updatedCategories);
      } else {
        const categoryCollection = collection(db, "categories");
        const newCategoryRef = await addDoc(categoryCollection, {
          name: category,
          img: imageUrl,
        });

        setCategories((prevCategories) => [
          ...prevCategories,
          { id: newCategoryRef.id, name: category, img: imageUrl },
        ]);
      }

      setOpenModalCategory(false);
    } catch (error) {
      console.error("Error al actualizar/crear la categoría:", error);
    }
  };

  const handleCloseCategory = () => {
    setOpenModalCategory(false);

    setCategory("");
    setSelectedCategory(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleImage = async () => {
    console.log("cargando imagen");
    setIsLoading(true);

    try {
      const url = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      console.log("url cargada", url);
      setImageUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Box style={{ display: "flex", justifyContent: "flex-end", gap: "5px" }}>
        <Link to="/dashboard/orders">
          <Button variant="contained">ordenes de compra</Button>
        </Link>

        <Button variant="contained" onClick={() => setOpenModalCategory(true)}>
          Categorías
        </Button>

        <Button variant="contained" onClick={() => setOpenModalShipment(true)}>
          Costo de envio
        </Button>
      </Box>

      <Modal
        open={openModalShipment}
        onClose={clearModalShipment}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Paper elevation={3} sx={{ padding: "20px", width: "100%" }}>
            <Typography variant="h6" component="h2" align="center">
              Retiros registrados
            </Typography>
            <div style={{ width: "100%" }}>
              {shipments.map((shipment) => (
                <div
                  key={shipment.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                    margin: "10px",
                  }}
                >
                  <Typography variant="body2">{shipment.name}</Typography>
                  <Typography variant="body2">
                    {getFormatCurrency(parseFloat(shipment.cost))}
                  </Typography>
                  <Tooltip title="Quieres editar el retiro?">
                    <IconButton onClick={() => handleEditClick(shipment)}>
                      <EditIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
          </Paper>

          <TextField
            label="Nuevo retiro"
            value={currentShipmentName}
            onChange={(e) => setCurrentShipmentName(e.target.value)}
          />
          <TextField
            label="Descripción"
            value={currentShipmentDescription}
            onChange={(e) => setCurrentShipmentDescription(e.target.value)}
          />
          <TextField
            label="Costo"
            type="number"
            value={currentShipmentCost}
            onChange={(e) => setCurrentShipmentCost(e.target.value)}
          />
          <Button onClick={updateShipment}>
            {currentShipmentId ? "Modificar" : "Crear"}
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openModalCategory}
        onClose={handleCloseCategory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <FormControl sx={{ marginTop: "20px" }}>
            <InputLabel>Selecciona una categoría</InputLabel>
            <Select
              value={selectedCategory || ""}
              onChange={(e) => {
                setSelectedCategory(e.target.value);

                const selectedCategoryName = categories.find(
                  (category) => category.id === e.target.value
                )?.name;
                setCategory(selectedCategoryName || "");
              }}
            >
              <MenuItem value="">
                <em>Creá una</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            <TextField
              label={
                selectedCategory ? "Modifca la categoría" : "Nueva categoría"
              }
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Typography>

          <TextField type="file" onChange={handleFileChange} />
          {file && (
            <div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={handleImage}
                  type="button"
                  disabled={isLoading}
                >
                  Cargar imágen
                </Button>
              </div>
              <div>
                {isLoading && (
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ marginBottom: "10px" }}
                  />
                )}
              </div>
            </div>
          )}

          {file && !isLoading && uploadProgress === 100 && (
            <Button
              variant="contained"
              type="submit"
              style={{ display: "flex", justifyContent: "center" }}
              onClick={updateCategory}
            >
              {selectedCategory ? "Modificar" : "Crear"}
            </Button>
          )}
        </Box>
      </Modal>

      <ProductsList
        products={products}
        categories={categories}
        setIsChange={setIsChange}
      />
    </div>
  );
};

export default Dashboard;
