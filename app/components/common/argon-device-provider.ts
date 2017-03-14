import * as application from "application";
import * as utils from 'utils/utils';
import * as geolocation from 'speigg-nativescript-geolocation';
import * as dialogs from 'ui/dialogs';
import * as enums from 'ui/enums';

import * as vuforia from 'nativescript-vuforia';
import * as frames from 'ui/frame';
import {NativescriptVuforiaServiceProvider} from './argon-vuforia-provider'
import * as Argon from "@argonjs/argon";

import {getScreenOrientation} from './util'

const Cartesian3 = Argon.Cesium.Cartesian3;
const Quaternion = Argon.Cesium.Quaternion;
const CesiumMath = Argon.Cesium.CesiumMath;
const Matrix4    = Argon.Cesium.Matrix4;

const z90 = Quaternion.fromAxisAngle(Cartesian3.UNIT_Z, CesiumMath.PI_OVER_TWO);
const ONE = new Cartesian3(1,1,1);

@Argon.DI.autoinject
export class NativescriptDeviceService extends Argon.DeviceService {

    constructor(
        sessionService:Argon.SessionService, 
        contextService:Argon.ContextService, 
        viewService:Argon.ViewService,
        vuforiaServiceProvider:Argon.VuforiaServiceProvider) {
        super(sessionService, contextService, viewService);

        const vsp = <NativescriptVuforiaServiceProvider>vuforiaServiceProvider;
        let now:number;

        const executeCallback = (cb, id) => {
            cb(now);
        };

        vsp.stateUpdateEvent.addEventListener(()=>{
            now = global.performance.now();
            // swap callback maps
            const callbacks = this._callbacks;
            this._callbacks = this._callbacks2;
            this._callbacks2 = callbacks;
            callbacks.forEach(executeCallback);
            callbacks.clear();
        });

        if (!vuforia.api) {
            setInterval(() => vsp.stateUpdateEvent.raiseEvent(Argon.Cesium.JulianDate.now()), 34);
        }
    }

    private _application = application;
    private _scratchDisplayOrientation = new Quaternion;
    private _scratchDeviceOrientation = new Quaternion;

    private _id = 0;
    private _callbacks = new Map<number, Function>();
    private _callbacks2 = new Map<number, Function>();

    requestAnimationFrame = (cb:(timestamp:number)=>void) => {
        this._id++;
        this._callbacks.set(this._id, cb);
        return this._id;
    }

    cancelAnimationFrame = (id:number) => {
        this._callbacks.delete(id);
    }
    
    getScreenOrientationDegrees() {
        return getScreenOrientation();
    }
    
    onUpdateFrameState() {

        const viewport = this.deviceState.viewport = this.deviceState.viewport || <Argon.Viewport>{};
        const contentView = frames.topmost().currentPage.content;
        viewport.x = 0;
        viewport.y = 0;
        viewport.width = contentView.getMeasuredWidth();
        viewport.height = contentView.getMeasuredHeight();

        super.onUpdateFrameState();

        if (this._application.ios) {
            const motionManager = this._getMotionManagerIOS();
            const motion = motionManager && motionManager.deviceMotion;

            if (motion) {
                const motionQuaternion = <Argon.Cesium.Quaternion>motion.attitude.quaternion;

                // Apple's orientation is reported in NWU, so we convert to ENU by applying a global rotation of
                // 90 degrees about +z to the NWU orientation (or applying the NWU quaternion as a local rotation 
                // to the starting orientation of 90 degress about +z). 
                // Note: With quaternion multiplication the `*` symbol can be read as 'rotates'. 
                // If the orientation (O) is on the right and the rotation (R) is on the left, 
                // such that the multiplication order is R*O, then R is a global rotation being applied on O. 
                // Likewise, the reverse, O*R, is a local rotation R applied to the orientation O. 
                const deviceOrientation = Quaternion.multiply(z90, motionQuaternion, this._scratchDeviceOrientation);

                const screenOrientationDegrees = this.frameState.screenOrientationDegrees;

                const deviceUser = this.user;
                const deviceLocalOrigin = this.localOrigin;

                if (!deviceUser.position) deviceUser.position = new Argon.Cesium.ConstantPositionProperty();
                if (!deviceUser.orientation) deviceUser.orientation = new Argon.Cesium.ConstantProperty();

                (deviceUser.position as Argon.Cesium.ConstantPositionProperty).setValue(
                    Cartesian3.ZERO,
                    deviceLocalOrigin
                );

                const screenOrientation = 
                    Quaternion.fromAxisAngle(
                        Cartesian3.UNIT_Z, 
                        screenOrientationDegrees * CesiumMath.RADIANS_PER_DEGREE, 
                        this._scratchDisplayOrientation
                    );

                const screenBasedDeviceOrientation = 
                    Quaternion.multiply(
                        deviceOrientation, 
                        screenOrientation, 
                        this._scratchDeviceOrientation
                    );

                (deviceUser.orientation as Argon.Cesium.ConstantProperty).setValue(screenBasedDeviceOrientation);
                
                const locationManager = this._getLocationManagerIOS();
                const heading = locationManager.heading;
                deviceUser['meta'] = deviceUser['meta'] || {};
                deviceUser['meta'].geoHeadingAccuracy = heading && heading.headingAccuracy;
            }
        }
    }

    private _motionManagerIOS?:CMMotionManager;

    private _getMotionManagerIOS() : CMMotionManager|undefined {
        if (this._motionManagerIOS) return this._motionManagerIOS;

        const motionManager = CMMotionManager.alloc().init();
        motionManager.showsDeviceMovementDisplay = true
        motionManager.deviceMotionUpdateInterval = 1.0 / 100.0;
        if (!motionManager.deviceMotionAvailable || !motionManager.magnetometerAvailable) {
            console.log("NO Magnetometer and/or Gyro. " );
            alert("Need a device with gyroscope and magnetometer to get 3D device orientation");
            return undefined;
        } else {
            let effectiveReferenceFrame:CMAttitudeReferenceFrame;
            if (CMMotionManager.availableAttitudeReferenceFrames() & CMAttitudeReferenceFrame.XTrueNorthZVertical) {
                effectiveReferenceFrame = CMAttitudeReferenceFrame.XTrueNorthZVertical;
                motionManager.startDeviceMotionUpdatesUsingReferenceFrame(effectiveReferenceFrame);
            } else {
                alert("Need a device with magnetometer to get full 3D device orientation");
                console.log("NO  CMAttitudeReferenceFrameXTrueNorthZVertical" );
                return undefined;
            }
        }
        this._motionManagerIOS = motionManager;
        return motionManager;
    }

    private _locationManagerIOS?:CLLocationManager;

    private _getLocationManagerIOS() {
        if (!this._locationManagerIOS) {
            this._locationManagerIOS = CLLocationManager.alloc().init();

            switch (CLLocationManager.authorizationStatus()) {
                case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse:
                case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways: 
                    break;
                case CLAuthorizationStatus.kCLAuthorizationStatusNotDetermined:
                    this._locationManagerIOS.requestWhenInUseAuthorization();
                    break;
                case CLAuthorizationStatus.kCLAuthorizationStatusDenied:
                case CLAuthorizationStatus.kCLAuthorizationStatusRestricted:
                default:
                    dialogs.action({
                        title: "Location Services",
                        message: `In order to provide the best Augmented Reality experience, 
                            please open this app's settings and enable location services`,
                        cancelButtonText: "Cancel",
                        actions: ['Settings']
                    }).then((action)=>{
                        if (action === 'Settings') {
                            const url = NSURL.URLWithString(UIApplicationOpenSettingsURLString);
                            utils.ios.getter(UIApplication, UIApplication.sharedApplication).openURL(url);
                        }
                    })
            }
        }
        return this._locationManagerIOS;
    }
}

@Argon.DI.autoinject
export class NativescriptDeviceServiceProvider extends Argon.DeviceServiceProvider {
    constructor(
        container, 
        sessionService:Argon.SessionService, 
        deviceService:Argon.DeviceService, 
        contextService:Argon.ContextService, 
        viewService:Argon.ViewService,
        contextServiceProvidere:Argon.ContextServiceProvider,
        private focusServiceProvider:Argon.FocusServiceProvider,
        realityService:Argon.RealityService) {
        super(
            sessionService, 
            deviceService, 
            contextService, 
            viewService,         
            contextServiceProvidere
        );
    }

    private locationWatchId?:number;

    // private _scratchCartesian = new Argon.Cesium.Cartesian3;
    private _scratchPerspectiveFrustum = new Argon.Cesium.PerspectiveFrustum;

    protected onUpdateDeviceState(deviceState:Argon.DeviceState) {

        if (!this.deviceService.isPresentingHMD || !vuforia.api) {
            deviceState.viewport = undefined;
            deviceState.subviews = undefined;
            deviceState.strict = false;
            return;
        }

        const subviews = deviceState.subviews = deviceState.subviews || [];
    

        const device = vuforia.api.getDevice();
        const renderingPrimitives = device.getRenderingPrimitives();
        const renderingViews = renderingPrimitives.getRenderingViews();
        const numViews = renderingViews.getNumViews();

        const contentScaleFactor = (<UIView>vuforia.videoView.ios).contentScaleFactor;

        subviews.length = numViews;

        for (let i = 0; i < numViews; i++) {
            const view = renderingViews.getView(i);

            // TODO: support PostProcess rendering subview
            if (view === vuforia.View.PostProcess) {
                subviews.length--;
                continue;
            }

            const subview = subviews[i] = subviews[i] || <Argon.SerializedSubview>{};

            // Set subview type
            switch (view) {
                case vuforia.View.LeftEye:
                    subview.type = Argon.SubviewType.LEFTEYE; break;
                case vuforia.View.RightEye:
                    subview.type = Argon.SubviewType.RIGHTEYE; break;
                case vuforia.View.Singular:
                    subview.type = Argon.SubviewType.SINGULAR; break;
                default:
                    subview.type = Argon.SubviewType.OTHER; break;
            }

            // Update subview viewport
            const vuforiaSubviewViewport = renderingPrimitives.getViewport(view);
            const subviewViewport = subview.viewport = subview.viewport || <Argon.Viewport>{};
            subviewViewport.x = vuforiaSubviewViewport.x;
            subviewViewport.y = vuforiaSubviewViewport.y;
            subviewViewport.width = vuforiaSubviewViewport.z;
            subviewViewport.height = vuforiaSubviewViewport.w;

            // Start with the projection matrix for this subview
            // Note: Vuforia uses a right-handed projection matrix with x to the right, y down, and z as the viewing direction.
            // So we are converting to a more standard convention of x to the right, y up, and -z as the viewing direction. 
            let projectionMatrix = <any>renderingPrimitives.getProjectionMatrix(view, vuforia.CoordinateSystemType.Camera);
            
            if (!isFinite(projectionMatrix[0])) {

                // if our projection matrix is giving null values then the
                // surface is not properly configured for some reason, so reset it
                // (not sure why this happens, but it only seems to happen after or between 
                // vuforia initializations)
                if (i === 0) {
                    vuforia.api.onSurfaceChanged(
                        vuforia.videoView.ios.frame.size.width * contentScaleFactor,
                        vuforia.videoView.ios.frame.size.height * contentScaleFactor
                    );
                }

                const frustum = this._scratchPerspectiveFrustum;
                frustum.fov = Math.PI/2;
                frustum.near = 0.01;
                frustum.far = 10000;
                frustum.aspectRatio = subviewViewport.width / subviewViewport.height;
                if (!isFinite(frustum.aspectRatio) || frustum.aspectRatio === 0) frustum.aspectRatio = 1;
                subview.projectionMatrix = Matrix4.clone(frustum.projectionMatrix, subview.projectionMatrix);

            } else {

                // Undo the video rotation since we already encode the interface orientation in our view pose
                // Note: the "base" rotation for vuforia's video (at least on iOS) is the landscape right orientation,
                // which is the orientation where the device is held in landscape with the home button on the right. 
                // This "base" video rotatation is -90 deg around +z from the portrait interface orientation
                // So, we want to undo this rotation which vuforia applies for us.  
                // TODO: calculate this matrix only when we have to (when the interface orientation changes)
                const inverseVideoRotationMatrix = Matrix4.fromTranslationQuaternionRotationScale(
                    Cartesian3.ZERO,
                    Quaternion.fromAxisAngle(Cartesian3.UNIT_Z, (CesiumMath.PI_OVER_TWO - getScreenOrientation() * Math.PI / 180), this._scratchVideoQuaternion),
                    ONE,
                    this._scratchMatrix4
                );
                Argon.Cesium.Matrix4.multiply(projectionMatrix, inverseVideoRotationMatrix, projectionMatrix);

                // convert from the vuforia projection matrix (+X -Y +Z) to a more standard convention (+X +Y -Z)
                // by negating the appropriate columns. 
                // See https://developer.vuforia.com/library/articles/Solution/How-To-Use-the-Camera-Projection-Matrix
                projectionMatrix[0] *= -1; // x
                projectionMatrix[1] *= -1; // y
                projectionMatrix[2] *= -1; // z
                projectionMatrix[3] *= -1; // w

                projectionMatrix[8] *= -1;  // x
                projectionMatrix[9] *= -1;  // y
                projectionMatrix[10] *= -1; // z
                projectionMatrix[11] *= -1; // w

                // Argon.Cesium.Matrix4.multiplyByScale(projectionMatrix, Cartesian3.fromElements(1,-1,-1, this._scratchCartesian), projectionMatrix)

                // Scale the projection matrix to fit nicely within a subview of type SINGULAR
                // (This scale will not apply when the user is wearing a monocular HMD, since a
                // monocular HMD would provide a subview of type LEFTEYE or RIGHTEYE)
                // if (subview.type == Argon.SubviewType.SINGULAR) {
                //     const widthRatio = subviewWidth / videoMode.width;
                //     const heightRatio = subviewHeight / videoMode.height;

                //     // aspect fill
                //     const scaleFactor = Math.max(widthRatio, heightRatio);
                //     // or aspect fit
                //     // const scaleFactor = Math.min(widthRatio, heightRatio);

                //     // scale x-axis
                //     projectionMatrix[0] *= scaleFactor; // x
                //     projectionMatrix[1] *= scaleFactor; // y
                //     projectionMatrix[2] *= scaleFactor; // z
                //     projectionMatrix[3] *= scaleFactor; // w
                //     // scale y-axis
                //     projectionMatrix[4] *= scaleFactor; // x
                //     projectionMatrix[5] *= scaleFactor; // y
                //     projectionMatrix[6] *= scaleFactor; // z
                //     projectionMatrix[7] *= scaleFactor; // w
                // }

                subview.projectionMatrix = Matrix4.clone(projectionMatrix, subview.projectionMatrix);
            }


            // const eyeAdjustmentMatrix = renderingPrimitives.getEyeDisplayAdjustmentMatrix(view);
            // let projectionMatrix = Argon.Cesium.Matrix4.multiply(rawProjectionMatrix, eyeAdjustmentMatrix, []);
            // projectionMatrix = Argon.Cesium.Matrix4.fromRowMajorArray(projectionMatrix, projectionMatrix);
            
            // default to identity subview pose (in relation to the overall view pose)
            // TODO: use eye adjustment matrix to get subview poses (for eye separation). See commented out code above...
            subview.pose = undefined; 
        }
    }

    protected onStartGeolocationUpdates(options:Argon.GeolocationOptions) : Promise<void> {
        if (typeof this.locationWatchId !== 'undefined') return Promise.resolve();;
        
        return new Promise<void>((resolve, reject)=>{

            // Note: the d.ts for nativescript-geolocation is wrong. This call is correct. 
            // Casting the module as <any> here for now to hide annoying typescript errors...
            this.locationWatchId = (<any>geolocation).watchLocation((location:geolocation.Location)=>{
                // Note: iOS documentation states that the altitude value refers to height (meters) above sea level, but 
                // if ios is reporting the standard gps defined altitude, then this theoretical "sea level" actually refers to 
                // the WGS84 ellipsoid rather than traditional mean sea level (MSL) which is not a simple surface and varies 
                // according to the local gravitational field. 
                // In other words, my best guess is that the altitude value here is *probably* GPS defined altitude, which 
                // is equivalent to the height above the WGS84 ellipsoid, which is exactly what Cesium expects...
                this.configureLocalOrigin(
                    location.longitude, 
                    location.latitude, 
                    location.altitude, 
                    location.horizontalAccuracy, 
                    location.verticalAccuracy
                );
            }, 
            (e)=>{
                reject(e);
            }, <geolocation.Options>{
                desiredAccuracy: options && options.enableHighAccuracy ? 
                    application.ios ? 
                        kCLLocationAccuracyBest : 
                        enums.Accuracy.high : 
                    application.ios ? 
                        kCLLocationAccuracyKilometer :
                        enums.Accuracy.any,
                updateDistance: application.ios ? kCLDistanceFilterNone : 0
            });
            
            console.log("Creating location watcher. " + this.locationWatchId);
        });
    }

    
    protected onStopGeolocationUpdates() : void {
        if (Argon.Cesium.defined(this.locationWatchId)) {
            geolocation.clearWatch(this.locationWatchId);
            this.locationWatchId = undefined;
        }
    }

    private _scratchMatrix4 = new Argon.Cesium.Matrix4;
    private _scratchVideoQuaternion = new Argon.Cesium.Quaternion;

    private _ensurePermission(session:Argon.SessionPort) {
        if (this.focusServiceProvider.session == session) return; 
        if (session == this.sessionService.manager) return;
        throw new Error('Session does not have focus.')
    }
    
    handleRequestPresentHMD(session:Argon.SessionPort) {
        this._ensurePermission(session);
        const device = vuforia.api && vuforia.api.getDevice();
        device && device.setViewerActive(true);
        return Promise.resolve();
    }

    handleExitPresentHMD(session:Argon.SessionPort) {
        this._ensurePermission(session);
        const device = vuforia.api && vuforia.api.getDevice();
        device && device.setViewerActive(false);
        return Promise.resolve();
    }

    public _isHmdActive() {
        const device = vuforia.api && vuforia.api.getDevice();
        return device.isViewerActive();
    }

}