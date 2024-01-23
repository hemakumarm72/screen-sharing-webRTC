/* eslint-disable no-unused-expressions */
import './App.css';
import { Box, Container } from '@chakra-ui/react';
import Notifications from './Components/Notifications';
import Options from './Components/Options';
import VideoPlayer from './Components/VidoePlayer';
import { SocketContext } from './Context';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import * as process from 'process';
import AcceptCallTone from '././assets/music/tones.mp3';

function App() {
  const { handleClose, handleConfirm, cancelRef, isOpen, callUser } =
    useContext(SocketContext);
  const renderAfterCalled = useRef(false);
  const [code, setCode] = useState();
  const [pop, setPop] = useState(false);
  const closePop = () => {
    setPop(false);
  };
  const callToTone = () => {
    new Audio(AcceptCallTone).play();
  };
  useEffect(() => {
    if (!renderAfterCalled.current) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const code = urlSearchParams.get('code');
      // Check if the code parameter is present
      if (code !== null) {
        setCode(code);
        setPop(true);
      }
    }
    renderAfterCalled.current = true;
  }, []);
  window.global = window;
  window.process = process;
  window.Buffer = [];

  return (
    <Box>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Confirmation</AlertDialogHeader>
          <AlertDialogBody>Do you need Recording Vidoe ?</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={handleClose}>
              No
            </Button>
            <Button colorScheme='red' onClick={handleConfirm} ml={3}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* JOIN call */}

      <Box>
        <AlertDialog isOpen={pop} onClose={closePop}>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>Confirmation</AlertDialogHeader>
            <AlertDialogBody>Do you join Meeting ?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closePop}>
                No
              </Button>
              <Button
                colorScheme='red'
                onClick={() => {
                  callUser(code);
                  setPop(false);
                  callToTone();
                }}
                ml={3}
              >
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Box>
      <Container maxW='100vw'>
        <VideoPlayer />
        <Options />
        <Notifications />
      </Container>
    </Box>
  );
}

export default App;
