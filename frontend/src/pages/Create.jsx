import { useState, useRef, useEffect } from "react";
import videoPlaceholder from '../assets/noVideo.jpg'

import { socket } from '../components/socket'

function Create() {
    const [room, setRoom] = useState("111");
    const [userName, setUserName] = useState("test1");
    const [remoteUserName, setRemoteUserName] = useState("other");
    const [error, setError] = useState();
    const [onVideoState, setOnVideoState] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isRemoteAudioOn, setIsRemoteAudioOn] = useState(true);
    const [stream, setStream] = useState(null);

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

        if (!socket.connected) {
            socket.connect();
            socket.once("connect", () => {
                socket.emit("createRoom", room);
            });
        } else {
            socket.emit("createRoom", room);
        }
    }

    useEffect(() => {
        pc.current.onicecandidate = e => {
            if (e.candidate)
                socket.emit("ice-candidate", { room, candidate: e.candidate })
        };

        // called when media track arrives
        pc.current.ontrack = e => {
            remoteVideo.current.srcObject = e.streams[0];
        }

        socket.on("userJoined", async ({ otherUser }) => {
            setRemoteUserName(otherUser);
            // create offer, send name too
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            socket.emit("offer", { offer, room, userName });
        });

        socket.on("answer", async answer => {
            await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async candidate => {
            try {
                await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error(err);
            }
        });
        socket.on("response", async ({ type }) => {
            if (type === "roomCreated") {
                // need to render video html before setting localVideo
                setOnVideoState(true);
                const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                
                media.getTracks().forEach(track => {
                    pc.current.addTrack(track, media);
                });
                localVideo.current.srcObject = media;
                setStream(media);
                setError("");
            }
            else if (type === "roomNotCreated") {
                setError("Error: room is already taken.")
            }
        })

        return () => {
            socket.off("userJoined");
            socket.off("answer");
            socket.off("response");
            socket.off("ice-candidate");
        }

    }, [room, userName, remoteUserName, error]);

    const toggleVideo = () => {
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
    }
    const toggleAudio = () => {
        const audioTrack = stream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
    }

    const disconnectCall = () => {
        if (stream)
            stream.getTracks().forEach(track => track.stop());
        if (pc.current) {
            pc.current.close();
        }

        setStream(null);
        setRoom("");
        setUserName("");
        setRemoteUserName("");
        setIsVideoOn(true);
        setIsAudioOn(true);
        setIsRemoteAudioOn(true);
        setOnVideoState(false);

        // maybe send exit signal
    }

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

                    <br />
                    <button onClick={onClickCreate}>Create</button>
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
                        <button onClick={toggleVideo}>{isVideoOn ? "Pause Video" : "Unpause Video"}</button>
                        <button onClick={toggleAudio}>{isAudioOn ? "Mute" : "Unmute"}</button>
                        <button>{isRemoteAudioOn ? "Mute Other" : "Unmute Other"}</button>
                        <button onClick={disconnectCall}>Disconnect</button>
                    </div>
                </div>
            }

        </div>
    )
}

export default Create;