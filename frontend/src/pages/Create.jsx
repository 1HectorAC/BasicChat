import { useState, useRef, useEffect } from "react";
import videoPlaceholder from '../assets/noVideo.jpg'

import {socket} from '../components/socket'

function Create() {
    const [room, setRoom] = useState();
    const [userName, setUserName] = useState();
    const [remoteUserName, setRemoteUserName] = useState("other");
    const [error, setError] = useState();
    const [onVideoState, setOnVideoState] = useState(false);
    const [localIsPaused, setLocalIsPaused] = useState(true);
    const [localIsMute, setLocalIsMute] = useState(true);
    const [remoteIsMute, setRemoteIsMute] = useState(true);

    const pc = useRef(new RTCPeerConnection({
        iceServers: [{urls: "stun:stun.l.google.com:19302"}]
    }));

    const localVideo = useRef();
    const remoteVideo = useRef();

    function onClickCreate() {
        if (!room || !userName) {
            setError("All fields must be entered");
            return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        stream.getTracks().forEach(track => {
            pc.current.addTrack(track, stream);
        })
        localVideo.current.srcObject = stream;
        socket.connect();

        // give socket time to connect before emitting join
        setTimeout(() => {
            socket.emit("join", room);
        }, 100);

        setError("");
        setOnVideoState(true);
    }

    useEffect(() => {
        pc.current.onicecandidate = e => {
            if(e.candidate)
                socket.emit("ice-candidate", {room, candidate: e.candidate})
        };

        // called when media track arrives
        pc.current.ontrack = e => {
            remoteVideo.current.srcObject = e.stream[0];
        }

        socket.on("userJoined", async name => {
            setRemoteUserName(name);
            // create offer, send name too
        })

        socket.on("ice-candidate", async candidate => {
            try{
                await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch(err){
                console.error(err);
            }
        });

        return ()=> {
            socket.off("userJoined");
            socket.off("ice-candidate");
        }

    },[]);

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
                        <p>{remoteUserName}</p>
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