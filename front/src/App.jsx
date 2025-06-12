import { BrowserRouter } from "react-router-dom";
import CartContextComponent from "./context/CartContext";
import AuthContextComponent from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthContextComponent>
        <CartContextComponent>
          <AppRouter />
        </CartContextComponent>
      </AuthContextComponent>      
    </BrowserRouter>
  );
}

export default App;
