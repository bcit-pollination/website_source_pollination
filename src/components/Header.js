import '../css/App.css';
import PollinationLogo from './PollinationLogo';
import BackButton from './BackButton';
import { withRouter } from "react-router-dom";

const Header = (props) => {
    function renderLogout() {
        const loggedInList = ['/', '/login', '/register', '/electionResults'];

        for (let i = 0; i < loggedInList.length; i++) {
            if (loggedInList[i] === props.location.pathname) {
                return;
            }
        }

        return(
            <div className="">
                <button className="btn btn-danger" onClick={() => handleLogout()}>Logout</button>
            </div>
        )
    
    }
    function handleLogout() {
        sessionStorage.removeItem("jwt");
        props.history.push('/login')
    }

    return (
        <div>
            <header className={props.className?props.className:'App-header'}>
                <BackButton onClick={props.onBackClick}/>
                <PollinationLogo/>
                {renderLogout()}
            </header>
        </div>
    )
}

export default withRouter(Header);