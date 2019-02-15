import * as React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
  PlatformIOS,
  Dimensions,
} from 'react-native';
import { Camera, Permissions, CameraObject, ImageManipulator } from 'expo';
import { string } from 'prop-types';

interface CameraState {
  hasCameraPermission: boolean;
  ratio: string | undefined;
  takingPicture: boolean;
}
interface CameraProps {
  onPictureTaken: (imageData: string) => void;
}

export default class CameraView extends React.Component<
  CameraProps,
  CameraState
> {
  private camera: React.RefObject<CameraObject> = React.createRef();

  constructor(props: any) {
    super(props);
    this.state = {
      takingPicture: false,
      ratio: undefined,
      hasCameraPermission: false,
    };

    this.takePicture = this.takePicture.bind(this);
    this.prepareRatio = this.prepareRatio.bind(this);
  }

  public async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({ hasCameraPermission: status === 'granted' });
    if (this.camera.current) {
      // console.log(await this.camera.current.getAvailablePictureSizesAsync());

      // console.log('failed');
      return;
    }
    // console.log(await this.camera.current.getSupportedRatiosAsync());
  }

  public render() {
    const { hasCameraPermission, ratio, takingPicture } = this.state;
    if (!hasCameraPermission) {
      return <Text>Permission to camera not granted</Text>;
    }

    return (
      <View style={{ flex: 1 }}>
        <Camera
          style={{ flex: 1 }}
          ref={this.camera as any}
          ratio={ratio}
          onCameraReady={this.prepareRatio}
        >
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={this.takePicture}
              disabled={takingPicture}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: 'white',
                  marginBottom: 10,
                }}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </Camera>
      </View>
    );
  }

  private async prepareRatio() {
    if (Platform.OS === 'android' && this.camera.current) {
      const { width, height } = Dimensions.get('screen');
      const screenRatio = height / width;
      const ratios = await this.camera.current.getSupportedRatiosAsync();
      const ratiosRatio = ratios.map((r) => {
        const [h, w] = r.split(':');
        return parseFloat(h) / parseFloat(w);
      });
      const ratioIndex = ratiosRatio.reduce((prev, curr, index) => {
        return Math.abs(curr - screenRatio) <
          Math.abs(ratiosRatio[prev] - screenRatio)
          ? index
          : prev;
      });
      const ratio = ratios[ratioIndex];
      this.setState({ ratio });
    }
  }

  private async takePicture() {
    await this.setState({ takingPicture: true });
    // take a picture
    if (!this.camera.current) return;
    const picture = await this.camera.current.takePictureAsync();
    // resize and lower quality
    const resizedImage = await ImageManipulator.manipulateAsync(
      picture.uri,
      [{ resize: { width: 1000 } }],
      {
        compress: 0.8,
        format: 'jpeg',
        base64: true,
      },
    );
    this.props.onPictureTaken(resizedImage.base64!);
    this.setState({ takingPicture: false });
  }

  private async getBestRatio() {
    if (Platform.OS === 'ios' || !this.camera.current) return undefined;
    const ratios = await this.camera.current.getSupportedRatiosAsync();
    if (ratios.length === 0) return undefined;
    return ratios[0];
  }
}
