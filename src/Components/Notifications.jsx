import { useContext, useRef, useState } from 'react';
import { Box, Button, Heading } from '@chakra-ui/react';
import { SocketContext } from '../Context';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';

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

  const [isOpen, setIsOpen] = useState(false);
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
            <Button colorScheme='red' onClick={answerCall} ml={3}>
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
            <Button colorScheme='red' onClick={answerScreen} ml={3}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default Notifications;
