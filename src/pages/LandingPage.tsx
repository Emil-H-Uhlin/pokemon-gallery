import "../styles/landing.sass"
import {useNavigate} from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate()

  return <div className="landing-page">
    <h1>Ye old Pokemayn collector</h1>
    <p>This application is built using the PokeAPI in order to practice working with <i>React</i>,
      styling with <i>CSS</i> or <i>SASS</i> and working towards an existing API</p>
    <button onClick={_ => navigate("/home")}>Enter</button>
  </div>
}
