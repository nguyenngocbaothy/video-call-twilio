import React, {useRef, useState} from 'react';
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from 'react-native-twilio-video-webrtc';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
const dimensions = Dimensions.get('window');
const isIos = Platform.OS === 'ios';

const App = props => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [status, setStatus] = useState('disconnected');
  const [participants, setParticipants] = useState(new Map());
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [isButtonDisplay, setIsButtonDisplay] = useState(true);
  const twilioRef = useRef(null);

  const fetchToken = async () => {
    try {
      const res = await fetch(
        `https://657a-2001-ee0-d709-2fb0-f905-b511-94ef-fd1b.ngrok.io/getToken?&username=${username}&room=${room}`,
      );

      if (!res.ok) {
        console.log('error', error);
        Alert.alert('API not available');
        return null;
      }
      const jwt = await res.text();
      return jwt;
    } catch (error) {
      console.log('error', error);
      Alert.alert('An Error occurred');
      return null;
    }
  };

  const _onConnectButtonPress = async () => {
    const token = await fetchToken();

    twilioRef.current.connect({
      accessToken: token,
    });
    setStatus('connecting');
  };

  const _onEndButtonPress = () => {
    twilioRef.current.disconnect();
  };

  const _onMuteButtonPress = () => {
    twilioRef.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then(isEnabled => setIsAudioEnabled(isEnabled));
  };

  const _onFlipButtonPress = () => {
    twilioRef.current.flipCamera();
  };

  const _onRoomDidConnect = ({roomName, error}) => {
    console.log('onRoomDidConnect: ', roomName);

    setStatus('connected');
  };

  const _onRoomDidDisconnect = ({roomName, error}) => {
    console.log('[Disconnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const _onRoomDidFailToConnect = error => {
    console.log('[FailToConnect]ERROR: ', error);

    setStatus('disconnected');
  };

  const _onParticipantAddedVideoTrack = ({participant, track}) => {
    console.log('onParticipantAddedVideoTrack: ', participant, track);

    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          {participantSid: participant.sid, videoTrackSid: track.trackSid},
        ],
      ]),
    );
  };

  const _onParticipantRemovedVideoTrack = ({participant, track}) => {
    console.log('onParticipantRemovedVideoTrack: ', participant, track);

    const videoTracksLocal = videoTracks;
    videoTracksLocal.delete(track.trackSid);

    setVideoTracks(videoTracksLocal);
  };

  return (
    <View style={styles.container}>
      {status === 'disconnected' && (
        <View style={styles.signinContainer}>
          <KeyboardAvoidingView behavior={isIos ? 'padding' : 'height'}>
            <Text style={styles.welcome}>React Native Twilio Video</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={username}
              onChangeText={text => setUsername(text)}
              placeholder="username"
            />
            <TextInput
              placeholder="room"
              style={styles.input}
              autoCapitalize="none"
              value={room}
              onChangeText={text => setRoom(text)}
            />
            <TouchableOpacity
              style={styles.buttonConnect}
              onPress={_onConnectButtonPress}>
              <Text style={{color: '#fff'}}>Connect</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      )}

      {(status === 'connected' || status === 'connecting') && (
        <View style={styles.callContainer}>
          {status === 'connected' && (
            <View style={styles.remoteGrid}>
              {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                return (
                  <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={trackSid}
                    trackIdentifier={trackIdentifier}
                  />
                );
              })}
            </View>
          )}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onEndButtonPress}>
              <Text style={{fontSize: 12}}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onMuteButtonPress}>
              <Text style={{fontSize: 12}}>
                {isAudioEnabled ? 'Mute' : 'Unmute'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onFlipButtonPress}>
              <Text style={{fontSize: 12}}>Flip</Text>
            </TouchableOpacity>

            <TwilioVideoLocalView enabled={true} style={styles.localVideo} />
          </View>
        </View>
      )}

      <TwilioVideo
        ref={twilioRef}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onRoomDidFailToConnect={_onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  signinContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  callContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    minHeight: '100%',
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    paddingTop: 20,
    marginTop: 50,
    marginBottom: 50,
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginRight: 70,
    marginLeft: 70,
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  buttonConnect: {
    marginTop: 0,
    height: 50,
    backgroundColor: 'blue',
    color: '#fff',
    width: dimensions.width - 55,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  localVideoOnButtonEnabled: {
    bottom: '40%',
    width: '35%',
    left: '64%',
    height: '25%',
    zIndex: 2,
  },
  localVideoOnButtonDisabled: {
    bottom: '30%',
    width: '35%',
    left: '64%',
    height: '25%',
    zIndex: 2,
  },
  remoteGrid: {
    flex: 1,
    flexDirection: 'column',
  },
  remoteVideo: {
    width: dimensions.width,
    height: dimensions.height,
    zIndex: 1,
  },
  optionsContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    zIndex: 2,
  },
  optionButton: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100 / 2,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacing: {
    padding: 10,
  },
  inputLabel: {
    fontSize: 18,
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: dimensions.width - 55,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: '#1E3378',
    width: dimensions.width - 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 10,
  },
  Buttontext: {
    color: 'white',
    fontWeight: '500',
    fontSize: 18,
  },
  inputBox: {
    borderBottomColor: '#cccccc',
    fontSize: 16,
    width: dimensions.width - 55,
    borderBottomWidth: 1,
  },
  callWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  localVideo: {
    position: 'absolute',
    right: 5,
    bottom: 100,
    width: dimensions.width / 4,
    height: dimensions.height / 4,
  },
});
