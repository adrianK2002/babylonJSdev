//-----------------------------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
import setSceneIndex from "./index";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    SpotLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    Color3,
    Space,
    ShadowGenerator,
    PointLight,
    DirectionalLight,
    CubeTexture,
    Sprite,
    SpriteManager,
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    Sound,
  } from "@babylonjs/core";
  import * as GUI from "@babylonjs/gui";
  import HavokPhysics from "@babylonjs/havok";
  import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  //----------------------------------------------------
  
  function createMusic(scene: Scene) {
    const volume = 0.075;
    var music = new Sound("Theme", "./audio/song.mp3", scene, null, { loop: true, autoplay: true });
    music.setVolume(volume);
    return music;
  }
  function reloadPage(): void {
    // Reload the page
    window.location.reload();
}

  function createSceneButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
    let button = GUI.Button.CreateSimpleButton(name, index);
        button.left = x;
        button.top = y;
        button.width = "160px";
        button.height = "60px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = "green";
  

      
        const buttonClick = new Sound("MenuClickSFX", "./audio/menu-click.wav", scene, null, {
          loop: false,
          autoplay: false,
        });

        button.onPointerUpObservable.add(function() {
            console.log("THE BUTTON HAS BEEN CLICKED");
            buttonClick.play();
            setSceneIndex(1);
        });
        advtex.addControl(button);
        return button;
 }

 function createReloadButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
  let reloadButton = GUI.Button.CreateSimpleButton(name, index);
  reloadButton.left = x;
  reloadButton.top = y;
  reloadButton.width = "160px";
  reloadButton.height = "60px";
  reloadButton.color = "white";
  reloadButton.cornerRadius = 20;
  reloadButton.background = "green";

  reloadButton.onPointerUpObservable.add(() => {
    console.log("THE BUTTON HAS BEEN CLICKED");
    // Call the reloadPage function when the button is clicked
    reloadPage();
  });

  advtex.addControl(reloadButton);
  return reloadButton;
}

function createMuteButton(scene: Scene, name: string, index: string, x: string, y: string, advtex: GUI.AdvancedDynamicTexture, sound: BABYLON.Sound) {
  let muteButton = GUI.Button.CreateSimpleButton(name, index);
  muteButton.left = x;
  muteButton.top = y;
  muteButton.width = "160px";
  muteButton.height = "60px";
  muteButton.color = "white";
  muteButton.cornerRadius = 20;
  muteButton.background = "green";

  let isMuted = false;

  muteButton.onPointerUpObservable.add(() => {
    console.log("THE MUTE SOUND BUTTON HAS BEEN CLICKED");

    // Toggle the mute state
    isMuted = !isMuted;

    // Mute or unmute the sound based on the mute state
    if (isMuted) {
      console.log("Sound Muted");
      sound.setVolume(0); // Mute the sound by setting volume to 0
    } else {
      console.log("Sound Unmuted");
      sound.setVolume(1); // Unmute the sound by setting volume to 1 (or the desired volume)
    }
  });

  advtex.addControl(muteButton);
  return muteButton;
}

  //----------------------------------------------------------------------------------------------
  //Create Skybox
  function createSkybox(scene: Scene) {
    //Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }

  function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
    // only spotlight, point and directional can cast shadows in BabylonJS
    switch (index) {
      case 1: //hemispheric light
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
        hemiLight.intensity = 0.1;
        return hemiLight;
        break;
      case 2: //spot light
        const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3, 10, scene);
        spotLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        let shadowGenerator = new ShadowGenerator(1024, spotLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return spotLight;
        break;
      case 3: //point light
        const pointLight = new PointLight("pointLight", new Vector3(px, py, pz), scene);
        pointLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        shadowGenerator = new ShadowGenerator(1024, pointLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return pointLight;
        break;
    }
  }
 
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }
  
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  //----------------------------------------------------------
  
  //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function MenuScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      music?: Sound;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    //----------------------------------------------------------

    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true);
    let button1 = createSceneButton(that.scene, "but1", "Start Game", "0px", "-75px", advancedTexture);
    let reloadButton = createReloadButton(that.scene, "Reload", "Reload", "0px", "0px", advancedTexture);
    let muteButton = createMuteButton(that.scene, "Mute", "Mute", "0px", "75px", advancedTexture);
    that.skybox = createSkybox(that.scene);
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    that.music = createMusic(that.scene);
    return that;
  }
  //----------------------------------------------------