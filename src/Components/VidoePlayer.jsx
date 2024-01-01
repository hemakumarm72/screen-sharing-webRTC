import { Grid, Box } from '@chakra-ui/react';
import { SocketContext } from '../Context';
import { useContext, useEffect, useState } from 'react';

const VideoPlayer = () => {
  const [vidoe, setVidoe] = useState(true);
  const [mic, setMic] = useState(true);

  const {
    name,
    commonScreenShare,
    callAccepted,
    myVideo,
    isRecording,
    handleOpen,
    userVideo,
    callEnded,
    stream,
    call,
    userScreenShare,
    callScreenAccepted,
    screenRecordingStart,
  } = useContext(SocketContext);
  function muteMic() {
    stream.getAudioTracks().forEach((track) => {
      return (track.enabled = !track.enabled);
    });
    setMic(mic ? false : true);
  }

  function muteCam() {
    // stream.getTracks()[0].stop();
    // stream.getVideoTracks().forEach((track) => {
    //   if (track.readyState === 'live') {
    //     track.stop();
    //   }
    // });
    stream.getVideoTracks().forEach((track) => {
      return (track.enabled = !track.enabled);
    });

    setVidoe(vidoe ? false : true);
  }
  useEffect(() => {
    console.log(vidoe, mic);
  }, [vidoe, mic]);
  return (
    <div className='card'>
      {commonScreenShare && (
        <Box
          width='100%'
          height='100vh'
          border='2px'
          borderColor='purple'
          borderStyle='solid'
        >
          <Grid>
            <video
              className='screenShare'
              playsInline
              muted
              ref={callScreenAccepted ? userScreenShare : commonScreenShare}
              autoPlay
              width='90%'
              style={{
                transform: 'scaleX(1)',
              }}
            />
          </Grid>
        </Box>
      )}
      <Grid
        grid-template-areas={
          ('header header side', 'header header side', 'header header side')
        }
        templateColumns='repeat(1fr, 2)'
      >
        {/* my video */}

        {stream && (
          <Box>
            <Grid colSpan={1}>
              <p as='h1'>{name || 'Name'}</p>
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                width='500'
                style={{ transform: 'scaleX(-1)' }}
              />
            </Grid>
            <button
              className='button'
              style={{ backgroundColor: !vidoe ? 'red' : '#ea4c89' }}
              onClick={muteCam}
            >
              Vidoe Mute
            </button>
            <button
              className='button'
              style={{ backgroundColor: !mic ? 'red' : '#ea4c89' }}
              onClick={muteMic}
            >
              Mic Mute
            </button>

            <button
              className={`button ${isRecording ? 'Rec' : ''}`}
              onClick={isRecording ? handleOpen : screenRecordingStart}
            >
              {!isRecording ? 'ScreenSharing' : 'StopSharing'}
            </button>
            {/* <button className='button' onClick={handleOpen}>
              Screen Record Stop
            </button> */}
          </Box>
        )}
        {/* user's video */}
        {callAccepted && !callEnded && (
          <Box>
            <Grid colSpan={1}>
              <p as='h1'>{call.name || 'Name'}</p>

              <video
                playsInline
                ref={userVideo}
                autoPlay
                width='500'
                style={{ transform: 'scaleX(-1)' }}
              />
            </Grid>
          </Box>
        )}
      </Grid>
    </div>
  );
};
export default VideoPlayer;
