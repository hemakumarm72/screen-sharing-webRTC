/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { RecordRTCPromisesHandler, invokeSaveAsDialog } from 'recordrtc';
import { injectMetadata } from './utils/decode';

const SocketContext = createContext();
const socket = io('wss://githubevent.onrender.com');
const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState({});
  const [screenStream, setScreenStream] = useState({});
  const [screenRecorder, setScreenRecorder] = useState({});

  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const myVideo = useRef({});
  const userVideo = useRef({});
  const commonScreenShare = useRef({});
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googNoiseReduction: true,
          volume: 1.0,
        },
      })
      .then((currentStream) => {
        setStream(currentStream);
        console.log(currentStream);
        myVideo.current.srcObject = currentStream;
      })
      .catch((error) => {
        console.log(error);
      });

    socket.on('me', (id) => setMe(id));
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      // wrtc: {
      //   RTCPeerConnection: {
      //     encodedInsertableStreams: true,
      //   },
      // },
    });
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
      console.log(currentStream);
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      // wrtc: {
      //   RTCPeerConnection: {
      //     encodedInsertableStreams: true,
      //   },
      // },
    });
    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });
    // peer.on('stream', (currentStream) => {
    //   userVideo.current.srcObject = currentStream;
    // });
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current = '';
    window.location.reload();
  };

  const screenRecordingStart = async () => {
    await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((currentStream) => {
        currentStream.getVideoTracks()[0].addEventListener('ended', () => {
          screenRecordingStop();
        });
        setScreenStream(currentStream);
        commonScreenShare.current.srcObject = currentStream;

        let screenRecorder = new RecordRTCPromisesHandler(currentStream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9',
        });
        screenRecorder.startRecording();
        setScreenRecorder(screenRecorder);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const screenRecordingStop = async () => {
    if (screenRecorder) {
      await screenRecorder.stopRecording();
      // let size = bytesToSize(videoRecorder.getBlob().size);

      const currentDate = new Date();
      const dateString = currentDate.toISOString().replace(/[:.]/g, '-'); // Formatting date string

      injectMetadata(await screenRecorder.getBlob()).then((seekableBlob) => {
        // seekableBlob use this blob to show video or want to store anywhere

        invokeSaveAsDialog(seekableBlob, `screenRecording-${dateString}.webm`);
      });

      await screenStream.getTracks().forEach((track) => track.stop()); // Stop tracks when done
    }
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        commonScreenShare,
        screenRecordingStart,
        screenRecordingStop,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
export { ContextProvider, SocketContext };
