import './App.sass'
import {BrowserRouter as Router, Outlet, Route, Routes} from 'react-router-dom'
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => <div className="App">
  <div className="container">
    <Router>
      <Routes>
        <Route index path="/" element={<LandingPage/>}/>
        <Route element={<div className="page-layout">
          <Header/>
          <div className="content">
            <Outlet/>
          </div>
          <Footer/>
        </div>}>
          <Route path="/home" element={<HomePage/>}/>
          <Route path={"*"} element={<p>page not found</p>}/>
        </Route>
      </Routes>
    </Router>
  </div>
</div>

export default App
