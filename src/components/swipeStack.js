import React, { useCallback, useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Animated, Image, PanResponder, Text } from 'react-native';
import { ProfileContext } from "../contexts/ProfileContext";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const API_ROOT = "https://dapp-server.ddns.net/api/getNarwhals";
const IMG_ROOT = "https://dapp-server.ddns.net/narwhals";

const Like = ({opacity}) => {
  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ rotate: "-30deg" }],
        position: "absolute",
        top: 50,
        left: 40,
        zIndex: 1000
      }}
    >
      <Text
        style={{
          borderWidth: 1,
          borderColor: "green",
          color: "green",
          fontSize: 32,
          fontWeight: "800",
          padding: 10
        }}
      >
        LIKE
      </Text>
    </Animated.View>
  );
};

const Nope = ({opacity}) => {
  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ rotate: "30deg" }],
        position: "absolute",
        top: 50,
        right: 40,
        zIndex: 1000
      }}
    >
      <Text
        style={{
          borderWidth: 1,
          borderColor: "red",
          color: "red",
          fontSize: 32,
          fontWeight: "800",
          padding: 10
        }}
      >
        NOPE
      </Text>
    </Animated.View>
  )
};

class SwipeStackView extends React.Component {

  static contextType = ProfileContext;

  constructor(props) {
    super(props);
    this.position = new Animated.ValueXY();
    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    });
    this.rotateAndTranslate = {
      transform: [{
        rotate: this.rotate
      },
        ...this.position.getTranslateTransform()
      ]
    };
    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    });
    this.nopeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    });
    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp'
    });
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    });

    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: false
          }).start(() => {
            props.onSwipe(true);
            this.position.setValue({ x: 0, y: 0 });
          })
        } else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: false
          }).start(() => {
            props.onSwipe(false);
            this.position.setValue({ x: 0, y: 0 });
          })
        } else {
          Animated.spring(this.position, {
             toValue: { x: 0, y: 0 },
             useNativeDriver: false,
             friction: 4
             }).start()
        }
      }
    });
  }

  renderProfiles = (profiles, currentIndex) => {
    return profiles.map((item, i) => {
      if (i < currentIndex) return null;
      if (i > currentIndex + 10) return null;

      const transform = (i == currentIndex) ?
        this.rotateAndTranslate :
        { scale: this.nextCardScale };
      
      const opacity = (i == currentIndex + 1) ?
        this.nextCardOpacity :
        (i == currentIndex ? 1 : 0);

        // console.log(`${IMG_ROOT}/${item.id}.jpg`);

       return (
         <Animated.View
            {...this.PanResponder.panHandlers}
            style={
              [transform,
                { opacity: opacity },
              { height: SCREEN_HEIGHT - 180, 
              width: SCREEN_WIDTH, 
              padding: 10, 
              position: 'absolute' }]
            }
            key={item.id}
         >
           {i == currentIndex && <Like opacity={this.likeOpacity}/>}
           {i == currentIndex && <Nope opacity={this.nopeOpacity}/>}

           <Text 
            style={{
              position: "absolute",
              bottom: 70,
              left: 30,
              zIndex: 1000,
              color: "#FFF",
              fontSize: 32,
              fontWeight: "800",
              padding: 10
            }}
            >{item.name}</Text>
           <Text
            style={{
              position: "absolute",
              bottom: 30,
              left: 30,
              zIndex: 1000,
              color: "#FFF",
              fontSize: 32,
              fontWeight: "800",
              padding: 10
            }}
          >{item.age}</Text>
           <Image
             style={{
               flex: 1,
               height: null,
               width: null,
               resizeMode: "cover",
               borderRadius: 20
             }}
             source={{
               uri: `${IMG_ROOT}/${item.id}.jpg`
             }}
             key={i}
           />
         </Animated.View>
       );
    }).reverse();
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 30 }} />
        <View style={{ flex: 1 }}>
          { this.renderProfiles(this.props.profiles, this.props.currentIndex) }
        </View>
        <View style={{ height: 60 }} />
      </View>
    );
  }
}

const SwipeStack = () => {

  const { profile } = useContext(ProfileContext);
  const [ profiles, setProfiles ] = useState([]);
  const [ profilePage, setProfilePage ] = useState(1);
  const [ currentIndex, setCurrentIndex ] = useState(0);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  const fetchProfiles = async () => {
    if (fetching) return;
    setFetching(true);
    const resourceURL = `${API_ROOT}?minAge=${profile.minValue + 3}&maxAge=${profile.maxValue + 3}&gender=${profile.gender}`;
    try {
      setError(resourceURL);
      console.log("hey");
      const newProfilesReq = await fetch(resourceURL);
      console.log("ho");
      setError(2);
      const newProfiles = await newProfilesReq.json();
      setError(3);
      setProfiles(oldp =>
        oldp.concat(newProfiles.map((p) => {
          return {
            id: p.id,
            age: p.age - 3,
            gender: p.gender,
            name: p.name
          };
        }))
      );
      setProfilePage(profilePage + 1);
    } catch(e) {
      console.log("heya");
      setError(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setProfiles([]);
      setCurrentIndex(0);
      fetchProfiles();
    }
  }, [profile]);

  useEffect(() => {
    if (profiles.length > 0 && profiles.length - currentIndex < 5) fetchProfiles();
  }, [profiles, currentIndex])

  const onSwipe = (didLike) => {
    setCurrentIndex(oldIdx => oldIdx + 1);
  }

  return (
    <SwipeStackView profiles={ profiles } currentIndex={ currentIndex } onSwipe={ onSwipe } error={error} />
  )
}

export default SwipeStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
