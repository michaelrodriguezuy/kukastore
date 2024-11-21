import {
  Box,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
  TextField,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "../../../fireBaseConfig";
import DashboardIcon from "@mui/icons-material/Dashboard";
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState("asc");

  const [openModalOrder, setOpenModalOrder] = useState(false);
  const [theOrder, setTheOrder] = useState(null);

  const { getDateLong, getFormatCurrency } = useContext(CartContext);

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const ordersCollection = collection(db, "orders");

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(ordersCollection);

        const ordersData = [];

        if (querySnapshot !== undefined && querySnapshot !== null) {
          querySnapshot.forEach((orderDoc) => {
            const order = orderDoc.data();
            const orderId = orderDoc.id;
            const codigoCompra = orderId;

            // Convierte el Timestamp a Date
            const fecha = getDateLong(order.date);

            const cliente = order.email;
            // quiero mostrar el nombre del cliente no su email

            const total = order.total;

            ordersData.push({
              id: orderId,
              codigoCompra,
              fecha,
              cliente,
              total,
            });
          });

          // Filtrar los resultados según el campo de búsqueda
      const filteredOrders = ordersData.filter(order =>
        order.codigoCompra.toLowerCase().includes(searchInput.toLowerCase())
      );


          setOrders(filteredOrders);
        } else {
          console.log("querySnapshot es undefined o null");
        }
      } catch (error) {
        console.error("Error al cargar datos de orders:", error);
      }
    };

    fetchData();
  }, [searchInput]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && orderDirection === "asc";
    setOrderBy(property);
    setOrderDirection(isAsc ? "desc" : "asc");
  };

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return (a, b) => {
      if (order === "asc") {
        return a[orderBy] < b[orderBy] ? -1 : 1;
      } else {
        return b[orderBy] < a[orderBy] ? -1 : 1;
      }
    };
  }

  const sortedOrders = stableSort(
    orders,
    getComparator(orderDirection, orderBy)
  );

  const handleOrder = async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        const orderDetails = orderDoc.data();

        const userEmail = orderDetails.email;
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", userEmail)
        );

        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.docs.length > 0) {
          const userDetails = userQuerySnapshot.docs[0].data();

          setTheOrder({
            ...orderDetails,
            id: orderId,
            cliente: userDetails
              ? `${userDetails.name} ${userDetails.lastname}`
              : "Cliente no disponible",
          });
          setOpenModalOrder(true);
        } else {
          console.log(
            "No se encontró el usuario con el correo electrónico:",
            userEmail
          );
        }

        setOpenModalOrder(true);
      } else {
        console.log("La orden no existe.");
      }
    } catch (error) {
      console.error("Error al obtener detalles de la orden:", error);
    }
  };

  const handleCloseOrder = () => {
    setOpenModalOrder(false);
  };

  function caluclarSubtotal() {
    let subtotal = 0;
    theOrder.items.forEach((item) => {
      subtotal += item.unit_price * item.quantity;
    });
    return subtotal;
  }

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const getColorByHex = (colorHex) => {
    
    const colorMap = {
      "#FF0000" : "rojo",
      "#0000FF" : "azul",
       "#00FF00" : "verde",
      "#FFFF00" : "amarillo",
      "#FFA500" : "naranja",
      "#EE82EE"   : "violeta",
      "#FFC0CB" : "rosa",
      "#8B4513" : "marrón",
      "#808080" : "gris",
    };    
    
    return colorMap[colorHex] || colorHex
  }

  return (
    <>
      <Tooltip title="Volver atras">
        <DashboardIcon
          onClick={() => window.history.back()}
          style={{
            cursor: "pointer",
            fontSize: "30px",
            marginLeft: "10px",
            marginTop: "10px",
          }}
        />
      </Tooltip>

      <Typography
        variant="h5"
        color="textPrimary"
        marginBottom="15px"
        align="center"
      >
        Ordenes de compra
      </Typography>

      <Grid item xs={12} sm={6} sx={{ padding: "20px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <TextField
              id="search"
              label="Buscar orden de compra por código"
              variant="outlined"
              value={searchInput}
              onChange={handleSearchInputChange}
              fullWidth
            />
          </Grid>

      <TableContainer component={Paper} style={{ marginTop: "5px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Código</StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Ordena por fecha">
                  <span onClick={() => handleRequestSort("fecha")}>Fecha</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Ordena por cliente">
                  <span onClick={() => handleRequestSort("cliente")}>
                    Cliente
                  </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Ordena por monto">
                  <span onClick={() => handleRequestSort("total")}>Total</span>
                </Tooltip>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <StyledTableRow
                  key={order.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell component="th" scope="row" align="center">
                    <Tooltip title="Haga clic para ver la compra">
                      <span
                        style={{
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOrder(order.codigoCompra)}
                      >
                        {order.codigoCompra}
                      </span>
                    </Tooltip>
                  </StyledTableCell>

                  {/* aqui solo quisiera mostra la fecha, no el horario, eso lo hago en el Modal */}

                  <StyledTableCell align="center">
                    {order.fecha}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {order.cliente}
                  </StyledTableCell>

                  <StyledTableCell align="center">
                    {getFormatCurrency(order.total)}
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <StyledTableRow>
                <StyledTableCell colSpan={4} align="center">
                  No hay datos disponibles.
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {theOrder && (
        <Modal
          open={openModalOrder}
          onClose={handleCloseOrder}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              ...style,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
              width: "auto",
              overflow: "auto",
            }}
          >
            <Typography variant="h5" color="textPrimary" marginBottom="8px">
              Detalles de la compra
            </Typography>

            <Paper
              elevation={3}
              sx={{
                border: "1px solid #000",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <Typography sx={{ marginBottom: 2 }}>
                <strong>Código:</strong> {theOrder.id}
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                <strong>Fecha:</strong>{" "}
                {theOrder.date
                  ? getDateLong(theOrder.date)
                  : "Fecha no disponible"}
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                <strong>Cliente:</strong> {theOrder.cliente}
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                <strong>Documento:</strong> {theOrder.document || "No disponible"}
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                <strong>Teléfono:</strong> {theOrder.phone || "No disponible"}
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                <strong>Dirección:</strong> {theOrder.address || "No disponible"}
              </Typography>
              <Typography>
                <strong>Ciudad:</strong> {theOrder.city || "No disponible"}
              </Typography>
            </Paper>

            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{ border: "1px solid #000", padding: "16px" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      {/* sx={{ fontSize: "12px", flex: "1", fontWeight: "bold", whiteSpace: "nowrap" }} */}
                      <TableCell
                        style={{
                          fontSize: "12px",
                          flex: "1",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        Código
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: "12px",
                          flex: "1",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        Artículo
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: "12px",
                          flex: "1",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        Color
                      </TableCell>
                      <TableCell
                        style={{
                          fontSize: "12px",
                          flex: "1",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        Costo unitario
                      </TableCell>

                      <TableCell
                        style={{
                          fontSize: "12px",
                          flex: "1",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        Cantidad
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {theOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {item.code}
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {item.title}
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {getColorByHex(item.color)}
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {getFormatCurrency(item.unit_price)}
                        </TableCell>

                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            <Box
              sx={{
                alignSelf: "flex-end",
                marginTop: "16px",
                textAlign: "right",
              }}
            >
              <Typography variant="h6">
                Sub total: {getFormatCurrency(caluclarSubtotal())}
              </Typography>
              <Typography variant="h7">
                Envío: {getFormatCurrency(theOrder.shipmentCost)}
              </Typography>
              <Typography variant="h4">
                Total: {getFormatCurrency(theOrder.total)}
              </Typography>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default Orders;
