/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

import { RecordRTCPromisesHandler, invokeSaveAsDialog } from 'recordrtc';
import { injectMetadata } from './utils/decode';

import wrtc from 'wrtc';

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
  const [isRecording, setIsRecording] = useState(false);

  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef({});
  const userVideo = useRef({});
  const commonScreenShare = useRef({});
  const userScreenShare = useRef({});
  const connectionRef = useRef();
  const connectionRef1 = useRef();
  const [callScreenAccept, setCallScreenAccept] = useState({});
  const [client, setClient] = useState();
  useEffect(() => {
    async function test() {
      await navigator.mediaDevices
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
          if (currentStream && currentStream instanceof MediaStream) {
            setStream(currentStream);
            console.log(currentStream);
            myVideo.current.srcObject = currentStream;
          } else {
            console.error('Invalid or null stream obtained.');
          }
        })

        .catch((error) => {
          console.log(error);
        });
    }

    test();
    socket.on('me', (id) => setMe(id));
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setClient(from);
      console.log({ from, name: callerName, signal });
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
    socket.on('callScreen', ({ from, name: callerName, signal }) => {
      console.log('callscreen', { from, name: callerName, signal });
      setCallScreenAccepted(false);
      setCallScreenAccept({
        isReceivingCall: true,
        from,
        name: callerName,
        signal,
      });
    });
  }, []);

  const callUser = (id) => {
    // in your client code - create a wrapper and connect to your server

    try {
      console.log(id);
      console.log(stream);
      const peer = new Peer({
        initiator: true,
        trickle: false,

        wrtc,
        config: {
          iceServers: [
            {
              urls: 'turn:video.turn.thelifeplushospital.co.in',
              credential: 1234,
              username: 'lifeplus',
            },
          ],
        },

        stream,
      });
      // peer.addStream(stream);
      peer.on('signal', (data) => {
        socket.emit('callUser', {
          userToCall: id,
          signalData: data,
          from: me,
          name,
        });
      });

      setClient(id);
      peer.on('stream', (currentStream) => {
        userVideo.current.srcObject = currentStream;
      });
      socket.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });
      connectionRef.current = peer;
    } catch (error) {
      console.log(error);
    }
  };

  const test = (code) => {
    callUser(code);
  };
  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,

      wrtc,
      config: {
        iceServers: [
          {
            urls: 'turn:video.turn.thelifeplushospital.co.in',
            credential: 1234,
            username: 'lifeplus',
          },
        ],
      },
      // wrtc: {
      //   RTCPeerConnection: {
      //     encodedInsertableStreams: true,
      //   },
      // },
    });
    //peer.addStream(stream);
    setCall(call.from);
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

  const answerScreen = () => {
    try {
      setCallScreenAccepted(true);

      const peer = new Peer({
        initiator: false,
        trickle: false,
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

  const handleOpen = () => {
    setIsOpen(true);
    setIsRecording(false);
  };
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
    try {
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((currentStream) => {
          currentStream.getVideoTracks()[0].addEventListener('ended', () => {
            // handleOpen();
            handleOpen();
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
          setIsRecording(true);
          const peer = new Peer({
            initiator: true,
            trickle: false,
            config: {
              iceServers: [
                {
                  urls: 'turn:video.turn.thelifeplushospital.co.in',
                  credential: 1234,
                  username: 'lifeplus',
                },
              ],
            },
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
          connectionRef1.current = peer;
        });
    } catch (error) {
      console.log(error);
    }
  };
  const screenRecordingStop = async (executed) => {
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
        connectionRef1.current.destroy();

        setCallScreenAccepted(false);

        return Promise.resolve();

        // Stop tracks when done        return Promise.resolve();
      }
      await screenStream.getTracks().forEach((track) => track.stop()); // Stop tracks when done
      connectionRef1.current.destroy();
      setCallScreenAccepted(false);

      return Promise.resolve();
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
        test,
        callScreenAccepted,
        setCallScreenAccept,
        commonScreenShare,
        userScreenShare,
        isRecording,
        setIsRecording,
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
