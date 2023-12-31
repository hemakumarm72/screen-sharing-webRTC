/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef } from 'react';
import { Button } from '@chakra-ui/react';
import { SocketContext } from '../Context';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import AcceptCallTone from '../assets/music/tones.mp3';
import notifSound from '../assets/music/notif.mp3';
const Notifications = () => {
  const {
    answerCall,
    call,
    setCall,
    answerScreen,
    setCallScreenAccept,
    callScreenAccept,
    callScreenAccepted,
    callAccepted,
  } = useContext(SocketContext);

  const cancelRef = useRef();

  const handleClose = () => {
    setCall({
      isReceivingCall: false,
    });
  };
  const handleClose1 = () => {
    setCallScreenAccept({
      isReceivingCall: false,
    });
  };

  const AnswerCallTone = () => {
    new Audio(AcceptCallTone).play();
  };

  useEffect(() => {
    if (
      (call.isReceivingCall && !callAccepted) ||
      (callScreenAccept.isReceivingCall && !callScreenAccepted)
    ) {
      console.log('dsfd');
      new Audio(notifSound).play();
    }
  }, [call, callScreenAccept, callAccepted, callScreenAccepted]);

  return (
    <>
      <AlertDialog
        isOpen={call.isReceivingCall && !callAccepted}
        leastDestructiveRef={cancelRef}
        onClose={handleClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Confirmation</AlertDialogHeader>
          <AlertDialogBody>Do you Accept Vidoe Call Request?</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleClose}>
              No
            </Button>
            <Button
              colorScheme='red'
              onClick={() => {
                answerCall();
                AnswerCallTone();
              }}
              ml={3}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        isOpen={callScreenAccept.isReceivingCall && !callScreenAccepted}
        leastDestructiveRef={cancelRef}
        onClose={handleClose1}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Confirmation</AlertDialogHeader>
          <AlertDialogBody>
            Do you Accept ScreenSharing Request?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleClose1}>
              No
            </Button>
            <Button
              colorScheme='red'
              onClick={() => {
                answerScreen();
                AnswerCallTone();
              }}
              ml={3}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default Notifications;
