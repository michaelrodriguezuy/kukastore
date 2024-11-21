import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../fireBaseConfig";
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";

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

const DataUser = () => {
  const [myDataUser, setMyDataUser] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const userCollection = collection(db, "users");
      const userRef = doc(userCollection, user.id);

      getDoc(userRef).then((res) => {
        if (res.exists()) {
          setMyDataUser(res.data());
        } else {
          console.log("El documento no existe");
        }
      });
    }
  }, [user]);

  return (
    <>
      

      <TableContainer component={Paper} style={{ marginTop: "5px", maxWidth:800, margin:'0 auto' }}>
        <Table sx={{ minWidth: 650 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">Nombre</StyledTableCell>
              <StyledTableCell align="left">Apellido</StyledTableCell>
              <StyledTableCell align="left">Email</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow key={0}>
              <StyledTableCell component="th" scope="row">
                {myDataUser.name}
              </StyledTableCell>
              <StyledTableCell align="left">
                {myDataUser.lastname}
              </StyledTableCell>
              <StyledTableCell align="left">{user.email}</StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DataUser;
