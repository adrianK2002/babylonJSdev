//--------------------------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    SpotLight,
    Color3,
    DirectionalLight,
    ShadowGenerator,
    GroundMesh,
    Animation, 
    SceneLoader,
    CubeTexture,
} from "@babylonjs/core"
import { shadowMapFragment } from "@babylonjs/core/Shaders/ShadersInclude/shadowMapFragment";
//-----------------------------------------------------

function createSkyBox(scene: Scene) {
  var skybox = MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
	var skyboxMaterial = new StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new CubeTexture("textures/earth.jpg", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	skyboxMaterial.specularColor = new Color3(0, 0, 0);
	skybox.material = skyboxMaterial;	
  return skybox;
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
  
//----------------------------------------------------------------


//BOTTOM OF CODE - MAIN RENDERING AREA 

  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      skybox?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
    that.skybox = createSkyBox(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }

//--------------------------------------------------------------------