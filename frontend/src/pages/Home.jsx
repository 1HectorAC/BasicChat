import { Link } from "react-router-dom";
function Home(){
    return(
        <div>
            <h1>BasicChat Home Page</h1>
            <Link to="/Create">Create</Link>
            <br/>
            <Link to="/Join">Join</Link>
        </div>
    )
}

export default Home;