import * as React from 'react';
import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableHighlightBase,
  Image,
  Animated,
  ScrollView,
} from 'react-native';

import Carousel, { Pagination } from 'react-native-snap-carousel';

import StorySegment from './StorySegment';
import { IArtwork, IStorySegment } from '../../services/ArtworkService';
import StoryFrontSegment from './StoryFrontSegment';
import styles from './styles';

interface ArtworkStoryProps extends IArtwork {}

interface ArtworkStoryState {
  activeSegmentIndex: number;
  backgroundOpacity: Animated.Value;
}

interface ArtworkFront {
  type: 'ArtworkFront';
  image_url: string;
  title: string;
}

type Segment = ArtworkFront | IStorySegment;

export default class ArtworkStory extends React.Component<
  ArtworkStoryProps,
  ArtworkStoryState
> {

  private readonly carousel: React.RefObject<Carousel<IStorySegment>>;

  constructor(props: ArtworkStoryProps) {
    super(props);
    this.state = {
      activeSegmentIndex: 0,
      backgroundOpacity: new Animated.Value(0),
    };
    this.carousel = React.createRef();
    this.renderItem = this.renderItem.bind(this);
    this.getActiveDotColor = this.getActiveDotColor.bind(this);
    this.getInactiveDotColor = this.getInactiveDotColor.bind(this);

  }

  public render() {

    const { width, height } = Dimensions.get('window');
    const segments: Segment[] = [
      {
        type: 'ArtworkFront',
        image_url: this.props.image_url,
        title: this.props.title,
      },
      ...this.props.stories,
    ];

    return (
      <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
        <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
          <ImageBackground
            blurRadius={20}
            resizeMode="cover"
            source={{ uri: this.props.image_url }}
            style={styles.ViewBoxContainer}
          />
        </Animated.View>

        <View style={styles.CarouselContainer}>
          <Carousel
            data={segments}
            renderItem={this.renderItem}
            sliderWidth={width}
            itemWidth={width * 0.8}
            itemHeight={height}
            useScrollView={true}
            onSnapToItem={(index: number) => {
              this.setState({ activeSegmentIndex: index });
            }}
          />
          <Pagination
            dotsLength={segments.length}
            activeDotIndex={this.state.activeSegmentIndex}
            dotColor={this.getActiveDotColor()}
            dotStyle={{
              width: 11,
              height: 11,
              borderRadius: 5,
              marginHorizontal: 0,
            }}
            inactiveDotOpacity={1.0}
            inactiveDotScale={1.0}
            inactiveDotColor={this.getInactiveDotColor()}
          />
        </View>
      </View>
    );
  }

  private renderItem({ item }: { item: Segment; index: number }) {
    return (
      <View style={{ flex: 1 }}>
        {'type' in item ? (
          <StoryFrontSegment artwork={this.props} />
        ) : (
          <StorySegment artwork={this.props} text={item.text} id={item.id} />
        )}
      </View>
    );
  }

  private getActiveDotColor(): string {
    return 'rgba(0, 0, 0, 0.7)';
  }

  private getInactiveDotColor(): string {
    return '#FCFCFC';
  }
}
