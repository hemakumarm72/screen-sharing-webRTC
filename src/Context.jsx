/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { RecordRTCPromisesHandler, invokeSaveAsDialog } from 'recordrtc';
import { injectMetadata } from './utils/decode';

const SocketContext = createContext();
const socket = io('wss://githubevent.onrender.com'); // wss://githubevent.onrender.com
const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callScreenAccepted, setCallScreenAccepted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef();
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
  const userScreenShare = useRef({});
  const connectionRef = useRef();
  const [callScreenAccept, setCallScreenAccept] = useState({});
  const [client, setClient] = useState();
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
      setClient(from);
      console.log({ from, name: callerName, signal });
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
    socket.on('callScreen', ({ from, name: callerName, signal }) => {
      console.log('callscreen', { from, name: callerName, signal });

      setCallScreenAccept({
        isReceivingCall: true,
        from,
        name: callerName,
        signal,
      });
    });
  }, []);

  const callUser = (id) => {
    setClient(id);
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
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const answerCall = () => {
    try {
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
      });
      peer.signal(call.signal);
      connectionRef.current = peer;
    } catch (error) {
      console.log(error);
    }
  };
  const answerScreen = () => {
    try {
      setCallScreenAccepted(true);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        // wrtc: {
        //   RTCPeerConnection: {
        //     encodedInsertableStreams: true,
        //   },
        // },
      });
      peer.on('signal', (data) => {
        socket.emit('answerScreenCall', {
          signal: data,
          to: callScreenAccept?.from ?? call?.from,
        });
      });

      peer.on('stream', (currentStream) => {
        userScreenShare.current.srcObject = currentStream;
      });
      peer.signal(callScreenAccept.signal);
      connectionRef.current = peer;
    } catch (error) {}
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current = '';
    window.location.reload();
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = async () => {
    await screenRecordingStop(false);
    setIsOpen(false);
  };
  const handleConfirm = async () => {
    // Perform actions when user confirms (clicks Yes)
    await screenRecordingStop(true);
    handleClose(); // Close the dialog

    // Your logic for "Yes" action
    console.log('User clicked Yes');
  };
  const screenRecordingStart = async () => {
    await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: false,
      })
      .then((currentStream) => {
        currentStream.getVideoTracks()[0].addEventListener('ended', () => {
          // handleOpen();
        });
        setScreenStream(currentStream);
        if (commonScreenShare.current) {
          commonScreenShare.current.srcObject = currentStream;
        }
        let screenRecorder = new RecordRTCPromisesHandler(currentStream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9',
        });
        screenRecorder.startRecording();
        setScreenRecorder(screenRecorder);
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: currentStream,
        });

        peer.on('signal', (data) => {
          console.log(client, me);
          socket.emit('callScreen', {
            userToCall: client || Math.random(),
            signalData: data,
            from: me,
            name,
          });
        });
        socket.on('callScreenAccepted', (signal) => {
          console.log('screen share accept');
          setCallScreenAccepted(true);
          peer.signal(signal);
        });
        connectionRef.current = peer;
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const screenRecordingStop = async (executed = false) => {
    try {
      if (screenRecorder && executed) {
        console.log('recording stop vidoe');
        await screenRecorder.stopRecording();
        // let size = bytesToSize(videoRecorder.getBlob().size);

        const currentDate = new Date();
        const dateString = currentDate.toISOString().replace(/[:.]/g, '-'); // Formatting date string

        injectMetadata(await screenRecorder.getBlob()).then((seekableBlob) => {
          // seekableBlob use this blob to show video or want to store anywhere

          invokeSaveAsDialog(
            seekableBlob,
            `screenRecording-${dateString}.webm`
          );
        });

        await screenStream.getTracks().forEach((track) => track.stop()); // Stop tracks when done
        return Promise.resolve();
      } else {
        await screenStream.getTracks().forEach((track) => track.stop()); // Stop tracks when done
        return Promise.resolve();
      }
    } catch (error) {
      console.log(error);
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
        setCall,
        answerScreen,
        handleClose,
        handleConfirm,
        handleOpen,
        callScreenAccept,
        answerCall,
        callScreenAccepted,
        setCallScreenAccept,
        commonScreenShare,
        userScreenShare,
        cancelRef,
        isOpen,
        screenRecordingStart,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
export { ContextProvider, SocketContext };
