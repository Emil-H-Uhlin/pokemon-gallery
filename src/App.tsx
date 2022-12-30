import {BrowserRouter as Router, Link, Outlet, Route, Routes} from 'react-router-dom'

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BrowsingPage from "./pages/browse/BrowsingPage";

import './App.sass'

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
          <Route path="/browse/:page?" element={<BrowsingPage />} />
          <Route path={"*"} element={<p>page not found</p>}/>
        </Route>
      </Routes>
    </Router>
  </div>
</div>

export default App
