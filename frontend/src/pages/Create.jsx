import { useState } from "react";

function Create() {
    const [room, setRoom] = useState();
    const [userName, setUserName] = useState();
    const [error, setError] = useState();
    function onClickCreate() {
        if (!room || !userName) {
            setError("All fields must be entered");
        }
    }
    return (
        <div>
            <h1>Create Session</h1>
            <label htmlFor="userName">userName</label>
            <input name="userName" id="userName" onChange={e => setRoom(e.target.value)} />
            <br />
            <label htmlFor="room">room</label>
            <input name="room" id="room" onChange={e => setUserName(e.target.value)} />
            <br />
            <button onClick={onClickCreate}>Create</button>
            {error && <p className="errorMessage">{error}</p>}
        </div>
    )
}

export default Create;