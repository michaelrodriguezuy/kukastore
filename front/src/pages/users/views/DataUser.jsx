import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1e1e1e',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const DataUser = () => {
  const [myDataUser, setMyDataUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user) {
      const userCollection = collection(db, "users");
      const userRef = doc(userCollection, user.id);

      try {
        const res = await getDoc(userRef);
        if (res.exists()) {
          const userData = res.data();
          setMyDataUser(userData);
          setEditedData(userData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        showNotification('Error al cargar los datos', 'error');
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedData(myDataUser);
  };

  const handleChange = (field) => (event) => {
    setEditedData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, editedData);
      setMyDataUser(editedData);
      setEditMode(false);
      showNotification('Datos actualizados correctamente');
    } catch (error) {
      console.error("Error al actualizar:", error);
      showNotification('Error al actualizar los datos', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ paddingTop: '20px' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h1"
          align="center"
          sx={{ 
            fontWeight: 500,
            mb: 2
          }}
        >
          Mis datos de usuario
        </Typography>
      </Container>

      <Container maxWidth="lg">
        <TableContainer 
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Información Personal
            </Typography>
            {!editMode ? (
              <IconButton 
                onClick={handleEdit}
                sx={{ color: '#1e1e1e' }}
              >
                <EditIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={handleSave}
                  sx={{ color: '#1e1e1e' }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton 
                  onClick={handleCancel}
                  sx={{ color: '#d32f2f' }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Table sx={{ minWidth: 650 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">Nombre</StyledTableCell>
                <StyledTableCell align="left">Apellido</StyledTableCell>
                <StyledTableCell align="left">Email</StyledTableCell>
                <StyledTableCell align="left">Dirección</StyledTableCell>
                <StyledTableCell align="left">Celular</StyledTableCell>              
                <StyledTableCell align="left">Localidad</StyledTableCell>              
                <StyledTableCell align="left">Ciudad</StyledTableCell>
                <StyledTableCell align="left">País</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.nombre || ''}
                      onChange={handleChange('nombre')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.nombre || '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.apellido || ''}
                      onChange={handleChange('apellido')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.apellido || '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>{user?.email || '-'}</StyledTableCell>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.direccion || ''}
                      onChange={handleChange('direccion')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.direccion || '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.celular || ''}
                      onChange={handleChange('celular')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.celular || '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.localidad || ''}
                      onChange={handleChange('localidad')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.localidad || '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.ciudad || ''}
                      onChange={handleChange('ciudad')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.ciudad || '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editMode ? (
                    <TextField
                      value={editedData.pais || ''}
                      onChange={handleChange('pais')}
                      variant="standard"
                      size="small"
                      fullWidth
                    />
                  ) : (
                    myDataUser.pais || '-'
                  )}
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataUser;
