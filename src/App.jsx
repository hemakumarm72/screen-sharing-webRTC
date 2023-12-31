import './App.css';
import { Box, Container } from '@chakra-ui/react';
import Notifications from './Components/Notifications';
import Options from './Components/Options';
import VideoPlayer from './Components/VidoePlayer';
import { SocketContext } from './Context';
import { useContext } from 'react';
import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';

function App() {
  const { handleClose, handleConfirm, cancelRef, isOpen } =
    useContext(SocketContext);
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
      <Container maxW='100vw'>
        <VideoPlayer />
        <Options />
        <Notifications />
      </Container>
    </Box>
  );
}

export default App;
