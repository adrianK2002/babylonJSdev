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
} from "@babylonjs/core"
//-----------------------------------------------------


//--------------------------------------
//MIDDLE OF CODE - FUNCTIONS
  function createBox(scene: Scene, px: number, py:number, pz:number, sx: number, sy: number, sz: number) {
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);
    box.position = new Vector3(px, py, pz);
    box.scaling = new Vector3(sx, sy, sz);
    //box.position.y = 3;
    return box;
  }

  //faced box function
  function createFacedBox(scene: Scene, px: number, py: number, pz: number) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://assets.babylonjs.com/environments/numbers.jpg")
    mat.diffuseTexture = texture;

    const faceUV = new Array(6);

//    for (let i = 0; i < 6; i++) {
//      faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
//  }

    const options = {
        faceUV: faceUV,
        wrap: true
    };

    let box = MeshBuilder.CreateBox("tiledBox", options, scene);
    box.material = mat;
    box.position = new Vector3(px, py, pz);
    return box;
  }

  
  function createLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    return light;
  }

  function createSpotLight(scene: Scene, px: number, py: number, pz: number) {
    var light = new SpotLight("spotLight", new Vector3(-1, 1, -1), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
    light.diffuse = new Color3(0.74, 1, 0.03);
	  light.specular = new Color3(0.1, 0.04, 0.96);
    return light;
  }
  
  function createSphere(scene: Scene) {
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    sphere.position.y = 1;
    return sphere;
  }
  
  function createGround(scene: Scene) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      scene,
    );
    return ground;
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
      box?: Mesh;
      faceBox?: Mesh;
      light?: Light;
      spotlight?: SpotLight;
      sphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
    that.box = createBox(that.scene, 2, 5, 3, 3, 2, 1);
    that.faceBox = createFacedBox(that.scene, 6, 2, 8)
    that.light = createLight(that.scene);
    that.spotlight = createSpotLight(that.scene, 0, 6, 0);
    that.sphere = createSphere(that.scene);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }

//--------------------------------------------------------------------