import './App.sass'
import {BrowserRouter as Router, Outlet, Route, Routes} from 'react-router-dom'
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";

const App = () => <div className="App">
    <div className="container">
        <Router>
            <Routes>
                <Route index path="/" element={<LandingPage />}/>
                <Route path="/home" element={<HomePage />}/>
            </Routes>
        </Router>
    </div>
</div>

export default App
