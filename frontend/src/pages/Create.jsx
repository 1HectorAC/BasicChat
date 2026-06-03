import { useState, useRef } from "react";
import videoPlaceholder from '../assets/noVideo.jpg'

function Create() {
    const [room, setRoom] = useState();
    const [userName, setUserName] = useState();
    const [error, setError] = useState();
    const [onVideoState, setOnVideoState] = useState(false);
    const [localIsPaused, setLocalIsPaused] = useState(true);
    const [localIsMute, setLocalIsMute] = useState(true);
    const [remoteIsMute, setRemoteIsMute] = useState(true);

    const localVideo = useRef();
    const remoteVideo = useRef();

    function onClickCreate() {
        if (!room || !userName) {
            setError("All fields must be entered");
            return;
        }
        setError("");
        setOnVideoState(true);
    }
    return (
        <div>
            <h1>Host video Session</h1>
            {!onVideoState ?
                <div>
                    <label htmlFor="userName">userName</label>
                    <input name="userName" id="userName" onChange={e => setRoom(e.target.value)} />
                    <br />
                    <label htmlFor="room">room</label>
                    <input name="room" id="room" onChange={e => setUserName(e.target.value)} />
                    <br />
                    <button onClick={onClickCreate}>Create</button>
                    {error && <p className="errorMessage">{error}</p>}
                </div>
                :
                <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                        <p>me</p>
                        <video ref={localVideo} poster={videoPlaceholder} autoPlay playsInline muted width={300}></video>
                    </div>
                    <div>
                        <p>Other</p>
                        <video ref={remoteVideo} poster={videoPlaceholder} autoPlay playsInline width={400}></video>

                    </div>
                    <div>
                        <button>{localIsPaused ? "Unpause Video" : "Pause Video"}</button>
                        <button>{localIsMute ? "Unmute" : "Mute"}</button>
                        <button>{remoteIsMute ? "Unmute Other" : "Mute Other"}</button>
                        <button>Disconnect</button>

                    </div>

                </div>
            }


        </div>
    )
}

export default Create;