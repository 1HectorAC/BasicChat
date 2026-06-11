import { Link } from "react-router-dom";
function Home() {
    return (
        <div style={{ textAlign: "center" }}>
            <h2>Home Page</h2>
            <br/>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <Link to="/Create" className="btnVersion1">
                    Create
                </Link>
                <p>|</p>
                <Link to="/Join" className="btnVersion1">
                    Join
                </Link>
            </div>

        </div>
    )
}

export default Home;