import './App.css';
import { Box, Container } from '@chakra-ui/react';
import Notifications from './Components/Notifications';
import Options from './Components/Options';
import VideoPlayer from './Components/VidoePlayer';

function App() {
  return (
    <Box>
      <Container maxW='100vw'>
        <VideoPlayer />
        <Options />
        <Notifications />
      </Container>
    </Box>
  );
}

export default App;
