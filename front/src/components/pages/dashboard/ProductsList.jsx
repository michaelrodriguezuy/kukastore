import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, IconButton, Tooltip, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { deleteDoc, doc } from "firebase/firestore";
import { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ProductsForm from "./ProductsForm";
import { db } from "../../../fireBaseConfig";
import { CartContext } from "../../../context/CartContext";
import Swal from "sweetalert2";

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

const ProductsList = ({ products, categories, setIsChange }) => {
  const [open, setOpen] = useState(false);
  const [productSelected, setProductSelected] = useState(null);

  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState("asc");

  const { getFormatCurrency } = useContext(CartContext);

  const deleteProduct = (id, code) => {
    Swal.fire({
      title: `Estas queriendo eliminar el artículo '${code}'`,
      text: "¿Estás segura? ¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDoc(doc(db, "products", id));
        setIsChange(true); //actualizo la lista de productos
        Swal.fire("Eliminado!", "El producto ha sido eliminado.", "success");
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (product) => {
    setProductSelected(product);
    setOpen(true);
  };

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

  const sortedProducts = stableSort(
    products,
    getComparator(orderDirection, orderBy)
  );

  return (
    <div>
      <Button variant="contained" onClick={() => handleOpen(null)}>
        Agregar producto
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "5px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("code")}>Código</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("title")}>Título</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("unit_price")}>
                    Precio
                  </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("stock")}>Stock</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Color </span>
              </StyledTableCell>

              <StyledTableCell align="center">Imágen</StyledTableCell>

              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span onClick={() => handleRequestSort("category")}>
                    Categoría
                  </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map((product) => (
              <StyledTableRow
                key={product.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <StyledTableCell component="th" scope="row" align="left">
                  {product.code}
                </StyledTableCell>
                <StyledTableCell align="left">{product.title}</StyledTableCell>
                <StyledTableCell align="center">
                  {getFormatCurrency(product.unit_price)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {product.stock}
                </StyledTableCell>

                <StyledTableCell align="center">
                  {product.color}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <img src={product.image} alt="" style={{ height: "80px" }} />
                </StyledTableCell>

                <StyledTableCell align="left">
                  {product.category}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton onClick={() => handleOpen(product)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  {/* tengo que consultar si realmente desea eliminar */}

                  <IconButton
                    onClick={() => deleteProduct(product.id, product.code)}
                  >
                    <DeleteForeverIcon color="primary" />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <ProductsForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            productSelected={productSelected}
            setProductSelected={setProductSelected}
            categories={categories}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ProductsList;
