import React from 'react';
import { StyleSheet, View, Dimensions, Animated, Image, PanResponder, Text } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width

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

class SwipeStack extends React.Component {

  constructor() {
    super();
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
    this.state = {
      currentIndex: 0,
      profiles: [],
      profilePage: 1
    };
  }

  async fetchProfiles() {
    const page = this.state.profilePage;
    const profiles = await (await fetch(`https://picsum.photos/v2/list?page=${page}&limit=10`)).json();
    this.setState({
      profiles: this.state.profiles.concat(profiles.map((p) => {
        return {
          id: p.id,
          uri: p.download_url
        };
      })),
      profilePage: page + 1
    });
  }

  componentWillMount() {
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            });
            if (this.state.profiles.length - this.state.currentIndex < 5) this.fetchProfiles();
          })
        } else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            });
            if (this.state.profiles.length - this.state.currentIndex < 5) this.fetchProfiles();
          })
        } else {
          Animated.spring(this.position, {
             toValue: { x: 0, y: 0 },
             friction: 4
             }).start()
        }
      }
    });

    this.fetchProfiles();
  }

  renderProfiles = () => {
    return this.state.profiles.map((item, i) => {
      if (i < this.state.currentIndex) return null;

      const transform = (i == this.state.currentIndex) ?
        this.rotateAndTranslate :
        { scale: this.nextCardScale };
      
      const opacity = (i == this.state.currentIndex + 1) ?
        this.nextCardOpacity :
        (i == this.state.currentIndex ? 1 : 0);


       return (
         <Animated.View
            {...this.PanResponder.panHandlers}
            style={
              [transform,
                { opacity: opacity },
              { height: SCREEN_HEIGHT - 120, 
              width: SCREEN_WIDTH, 
              padding: 10, 
              position: 'absolute' }]
            }
            key={item.id}
         >
           {i == this.state.currentIndex && <Like opacity={this.likeOpacity}/>}
           {i == this.state.currentIndex && <Nope opacity={this.nopeOpacity}/>}
           <Image
             style={{
               flex: 1,
               height: null,
               width: null,
               resizeMode: "cover",
               borderRadius: 20
             }}
             source={item.uri}
             key={i}
           />
         </Animated.View>
       );
    }).reverse();
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 60 }} />
        <View style={{ flex: 1 }}>
          { this.renderProfiles() }
        </View>
        <View style={{ height: 60 }} />
      </View>
    );
  }
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
