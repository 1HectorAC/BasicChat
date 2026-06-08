import { useState, useRef, useEffect } from "react";
import videoPlaceholder from '../assets/noVideo.jpg'

import { socket } from '../components/socket'

function Create() {
    const [room, setRoom] = useState("111");
    const [userName, setUserName] = useState("test1");
    const [remoteUserName, setRemoteUserName] = useState("other");
    const [error, setError] = useState();
    const [onVideoState, setOnVideoState] = useState(false);
    const [localIsPaused, setLocalIsPaused] = useState(false);
    const [localIsMute, setLocalIsMute] = useState(false);
    const [remoteIsMute, setRemoteIsMute] = useState(false);

    const localVideo = useRef();
    const remoteVideo = useRef();

    const pc = useRef(new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    }));

    async function onClickCreate() {
        if (!room || !userName) {
            setError("All fields must be entered");
            return;
        }
        // need to render video html before setting localVideo
        setOnVideoState(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => {
            pc.current.addTrack(track, stream);
        });
        localVideo.current.srcObject = stream;

        if (!socket.connected) {
            socket.connect();
            socket.once("connect", () => {
                socket.emit("createRoom", room);
            });
        } else {
            socket.emit("createRoom", room);
        }

        setError("");
    }

    useEffect(() => {
        pc.current.onicecandidate = e => {
            if (e.candidate)
                socket.emit("ice-candidate", { room, candidate: e.candidate })
        };

        // called when media track arrives
        /*
        pc.current.ontrack = e => {
            remoteVideo.current.srcObject = e.streams[0];
        }
        */

        socket.on("userJoined", async ({otherUser}) => {
            setRemoteUserName(otherUser);
            // create offer, send name too
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            socket.emit("offer", { offer, room, userName });
        });

        socket.on("answer", async answer => {
            console.log("answer is received")
            await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async candidate => {
            try {
                await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error(err);
            }
        });

        return () => {
            socket.off("userJoined");
            socket.off("answer");
            socket.off("ice-candidate");
        }

    }, [room, userName, remoteUserName]);

    return (
        <div>
            <h1>Host video Session</h1>
            {!onVideoState ?
                <div>
                    <label htmlFor="userName">userName</label>
                    <input name="userName" value={userName} id="userName" onChange={e => setUserName(e.target.value)} />
                    <br />
                    <label htmlFor="room">room</label>
                    <input name="room" value={room} id="room" onChange={e => setRoom(e.target.value)} />
                    <br />
                    <label>
                        <input type="checkbox"
                            name="localIsPaused"
                            checked={localIsPaused}
                            onChange={e => setLocalIsPaused(e.target.checked)}
                        />
                        Turn off video
                    </label>
                    <label>
                        <input type="checkbox"
                            name="localIsMuted"
                            checked={localIsMute}
                            onChange={e => setLocalIsMute(e.target.checked)}
                        />
                        Mute video
                    </label>

                    <br />
                    <button onClick={onClickCreate}>Create</button>
                    {error && <p className="errorMessage">{error}</p>}
                </div>
                :
                <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                        <p>me</p>
                        <video ref={localVideo} poster={videoPlaceholder} autoPlay playsInline muted width={300} />
                    </div>
                    <div>
                        <p>{remoteUserName}</p>
                        <video ref={remoteVideo} poster={videoPlaceholder} autoPlay playsInline width={400} />

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