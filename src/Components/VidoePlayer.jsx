import { Grid, Box, Heading } from '@chakra-ui/react';
import { SocketContext } from '../Context';
import { useContext, useEffect, useState } from 'react';

const VideoPlayer = () => {
  const [vidoe, setVidoe] = useState(true);
  const [mic, setMic] = useState(true);

  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } =
    useContext(SocketContext);
  function muteMic() {
    stream.getAudioTracks().forEach((track) => {
      return (track.enabled = !track.enabled);
    });
    setMic(mic ? false : true);
  }

  function muteCam() {
    stream.getVideoTracks().forEach((track) => {
      return (track.enabled = !track.enabled);
    });
    setVidoe(vidoe ? false : true);
  }
  useEffect(() => {
    console.log(vidoe, mic);
  }, [vidoe, mic]);
  return (
    <Grid justifyContent='center' templateColumns='repeat(2, 1fr)' mt='12'>
      {/* my video */}
      {stream && (
        <Box>
          <Grid colSpan={1}>
            <Heading as='h5'>{name || 'Name'}</Heading>
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              width='600'
              style={{ transform: 'scaleX(-1)' }}
            />
          </Grid>
          <button
            className='button'
            style={{ backgroundColor: !vidoe ? 'red' : '#ea4c89' }}
            onClick={muteCam}
          >
            Vidoes Mute
          </button>
          <button
            className='button'
            style={{ backgroundColor: !mic ? 'red' : '#ea4c89' }}
            onClick={muteMic}
          >
            Mic Mute
          </button>
        </Box>
      )}
      {/* user's video */}
      {callAccepted && !callEnded && (
        <Box>
          <Grid colSpan={1}>
            <Heading as='h5'>{call.name || 'Name'}</Heading>
            <video
              playsInline
              ref={userVideo}
              autoPlay
              width='600'
              style={{ transform: 'scaleX(-1)' }}
            />
          </Grid>
        </Box>
      )}
    </Grid>
  );
};
export default VideoPlayer;
