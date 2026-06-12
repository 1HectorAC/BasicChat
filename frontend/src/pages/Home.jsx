import { Link } from "react-router-dom";
function Home() {
    return (
        <div style={{ textAlign: "center" }}>
            <h2>Home Page</h2>
            <br />
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                <Link to="/Create" >
                    <button className="btnVersion1">
                        Create
                    </button>

                </Link>
                <p>|</p>
                <Link to="/Join" >
                    <button className="btnVersion1">
                        Join
                    </button>
                </Link>
            </div>
            <br />
            <hr />
            <p>This is a a basic two way video chat applciation. One user first creates a room and the second joins the same room to start.</p>

        </div>
    )
}

export default Home;