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
    SpotLight,
    StandardMaterial,
    Color3,
    Texture,
} from "@babylonjs/core"
//-----------------------------------------------------


//--------------------------------------
//MIDDLE OF CODE - FUNCTIONS

//***Set camera and light


function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
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


function createBox1(Scene: Scene) {
  const faceUV = [];
  faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
  faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
  faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
  faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
  const mat = new StandardMaterial("mat");
    const texture = new Texture("https://assets.babylonjs.com/environments/cubehouse.png")
    mat.diffuseTexture = texture;
  const box1 = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true});
  box1.material = mat;
  box1.position.y = 0.5;
  return box1;
}



function createRoof1(Scene: Scene) {
  const mat = new StandardMaterial("mat");
  const texture = new Texture("https://assets.babylonjs.com/environments/roof.jpg")
  mat.diffuseTexture = texture;
  const roof1 = MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
  roof1.material = mat;
  roof1.scaling.x = 0.75;
  roof1.rotation.z = Math.PI / 2;
  roof1.position.y = 1.22;
  return roof1;
}

function createGround(scene: Scene) {
  const mat = new StandardMaterial("mat");
  const color = new Color3(0, 1, 0);
  mat.diffuseColor = color;
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 10, height: 10 },
    scene,
  );
  ground.material = mat;
  return ground;
}



  



  

  
//----------------------------------------------------------------


//BOTTOM OF CODE - MAIN RENDERING AREA 

  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      Box1?: Mesh;
      Roof1?: Mesh;
      ground?: Mesh;
      light?: Light;
      spotlight?: SpotLight;
      sphere?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
    that.Box1 = createBox1(that.scene);
    that.Roof1 = createRoof1(that.scene);
    that.ground = createGround(that.scene);
    that.light = createLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }

//--------------------------------------------------------------------