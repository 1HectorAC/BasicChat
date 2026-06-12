import { useState, useRef, useEffect } from "react";
import videoPlaceholder from '../assets/noVideo.jpg'
import { socket } from "../components/socket";


function Join() {
    const [room, setRoom] = useState("111");
    const [userName, setUserName] = useState("test2");
    const [remoteUserName, setRemoteUserName] = useState("other");
    const [error, setError] = useState();
    const [onVideoState, setOnVideoState] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isRemoteAudioOn, setIsRemoteAudioOn] = useState(true);
    const [stream, setStream] = useState(null);
    const remoteAudioTrack = useRef();

    const pc = useRef(new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    }));

    const localVideo = useRef();
    const remoteVideo = useRef();

    async function onClickJoin() {
        if (!room || !userName) {
            setError("All fields must be entered");
            return;
        }

        if (!socket.connected) {
            socket.connect();
            socket.once("connect", () => {
                socket.emit("joinRoom", room );
            });
        } else {
            socket.emit("joinRoom", room );
        }

        setError("");
    }

    useEffect(() => {
        pc.current.onicecandidate = e => {
            if (e.candidate)
                socket.emit("ice-candidate", { room, candidate: e.candidate })
        };

        // called when media track arrives
        pc.current.ontrack = e => {
            const remoteStream = e.streams[0];
            remoteVideo.current.srcObject = remoteStream;
            const remoteAudioT = remoteStream.getAudioTracks()[0];
            remoteAudioTrack.current = remoteAudioT;
        };

        socket.on("ice-candidate", async candidate => {
            try {
                await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("offer", async ({ offer, otherUser }) => {
            setRemoteUserName(otherUser);
            //onicecandidate called with offer
            await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit("answer", { room, answer });
        })

        socket.on("response", async ({ type }) => {
            if (type === "roomJoined") {
                // need to render video html before setting localVideo
                setOnVideoState(true);
                /*
                const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(media);
                media.getTracks().forEach(track => {
                    pc.current.addTrack(track, media);
                });
                localVideo.current.srcObject = media;
                setStream(media);
        
                */
               socket.emit("userJoinedNotify", ({room, userName}));

                setError("");

            }
            else if (type === "roomNotJoined") {
                setError("Error: room does not exits.")
            }
            else if (type === "leaveRoom"){
                disconnectCall();
            }
        })

        return () => {
            socket.off("offer");
            socket.off("response");
            socket.off("ice-candidate");
        }

    }, [room, userName]);

    const toggleRemoteAudio = () => {
        const track = remoteAudioTrack.current;
        if (track) {
            track.enabled = !track.enabled;
            setIsRemoteAudioOn(track.enabled);
        }
    }

    const disconnectCall = () => {
        if (stream)
            stream.getTracks().forEach(track => track.stop());
        if (pc.current) {
            pc.current.close();
            pc.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
        }

        setStream(null);
        setRoom("");
        setUserName("");
        setRemoteUserName("");
        setIsVideoOn(true);
        setIsAudioOn(true);
        setIsRemoteAudioOn(true);
        setOnVideoState(false);

        socket.emit("leaveRoom", room);
    }
    return (
        <div>
            <h2 style={{textAlign:"center"}}>Join video Session</h2>
            {!onVideoState ?
                <div style={{ textAlign: "center" }}>
                    <div className="formSection">
                        <label className="labelStyle1" htmlFor="userName">UserName </label>
                        <input className="inputStyle1" name="userName" value={userName} id="userName" onChange={e => setUserName(e.target.value)} />
                    </div>
                    <div className="formSection">
                        <label className="labelStyle1" htmlFor="room">Room </label>
                        <input className="inputStyle1" name="room" value={room} id="room" onChange={e => setRoom(e.target.value)} />

                    </div>
                    <div className="formSection">
                    <label>
                        <input type="checkbox"
                            name="isVideoOn"
                            checked={isVideoOn}
                            onChange={e => setIsVideoOn(e.target.checked)}
                        />
                        Turn On video
                    </label>
                    <label>
                        <input type="checkbox"
                            name="localIsMuted"
                            checked={isAudioOn}
                            onChange={e => setIsAudioOn(e.target.checked)}
                        />
                        Turn On Audio
                    </label>
                    </div>

                    <button className="btnVersion1" onClick={onClickJoin}>Join</button>
                    {error && <p className="errorMessage">{error}</p>}
                </div>
                :
                <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                        <p>{userName} (me)</p>
                        <video ref={localVideo} poster={videoPlaceholder} autoPlay playsInline muted width={300} />
                    </div>
                    <div>
                        <p>{remoteUserName}</p>
                        <video ref={remoteVideo} poster={videoPlaceholder} autoPlay playsInline width={400} />
                    </div>
                    <div>
                        <button>{isVideoOn ? "Pause Video" : "unPause Video"}</button>
                        <button>{isAudioOn ? "Mute" : "Unmute"}</button>
                        <button onClick={toggleRemoteAudio}>{isRemoteAudioOn ? "Mute Other" : "Unmute Other"}</button>
                        <button onClick={disconnectCall}>Disconnect</button>
                    </div>
                </div>
            }
        </div>
    )
}
export default Join;