import {BrowserRouter,Routes,Route} from 'react-router-dom';
import './App.css';
import Login from "./pages/Login";
import Publisher from './pages/Publisher';
import Reader from './pages/Reader';
import Register from './pages/Register';
import Staff from './pages/Staff';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Login />} />
          <Route path="register">
            <Route index element={<Register />} />
          </Route>
          <Route path="staff">
            <Route index element={<Staff />} />
          </Route>
          <Route path="publisher">
            <Route index element={<Publisher />} />
          </Route>
          <Route path="reader">
            <Route index element={<Reader />} />
          </Route>
        </Route>
        <Route path="*" element={<h1 align="center">404 Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;