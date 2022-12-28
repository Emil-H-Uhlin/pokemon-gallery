import {useNavigate} from "react-router-dom";

const Header = () => <div className="main-header">
  <div className="logo">
    <img src="/pokemon-logo.png" alt="Pokemon Logo"/>
  </div>
  <div className="navbar">
    <ul>
      <li>
        <NavButton target={"/home"}>
          About
        </NavButton>
      </li>
      <li>
        <NavButton target={"/browse"}>
          Browse
        </NavButton>
      </li>
    </ul>
  </div>
</div>

function NavButton({target, children:text}: { children: string, target: string}) {
  const navigate = useNavigate()
  const active = (() => {
    const {href:path, host} = window.location
    return path.substring(path.indexOf(host) + host.length) === target
  })()

  const navigateToTarget = () => navigate(target)

  return <button
    onClick={active
      ? () => { /* no-op */ }
      : navigateToTarget}
    className={active
      ? "active-nav-button"
      : "nav-button"}>
    {text}
  </button>
}

export default Header