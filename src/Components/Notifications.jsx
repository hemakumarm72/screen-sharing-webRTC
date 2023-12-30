import { useContext } from 'react';
import { Box, Button, Heading } from '@chakra-ui/react';
import { SocketContext } from '../Context';

const Notifications = () => {
  const {
    answerCall,
    call,
    answerScreen,
    callScreenAccept,
    callScreenAccepted,
    callAccepted,
  } = useContext(SocketContext);

  return (
    <>
      {call.isReceivingCall && !callAccepted && (
        <Box display='flex' justifyContent='space-around' mb='20'>
          <Heading as='h3'> {call.name} is calling </Heading>
          <Button
            variant='outline'
            onClick={answerCall}
            border='1px'
            borderStyle='solid'
            borderColor='black'
          >
            Answer Call
          </Button>
        </Box>
      )}
      {callScreenAccept.isReceivingCall && !callScreenAccepted && (
        <Box display='flex' justifyContent='space-around' mb='20'>
          <Heading as='h3'> {callScreenAccept.name} is calling </Heading>
          <Button
            variant='outline'
            onClick={answerScreen}
            border='1px'
            borderStyle='solid'
            borderColor='black'
          >
            Answer screen Call
          </Button>
        </Box>
      )}
    </>
  );
};
export default Notifications;
