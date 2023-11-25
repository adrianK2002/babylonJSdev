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
    ShadowGenerator,
    Animation, 
    CubeTexture,
    PointLight,
    Space,
} from "@babylonjs/core"
import { shadowMapFragment } from "@babylonjs/core/Shaders/ShadersInclude/shadowMapFragment";
import { lightFragment } from "@babylonjs/core/Shaders/ShadersInclude/lightFragment";
//-----------------------------------------------------


//--------------------------------------
//MIDDLE OF CODE - FUNCTIONS

//ground + skybox
function createGround(scene: Scene) {
  const mat = new StandardMaterial("mat");
  const color = new Color3(0.22, 0.03, 0.89);
  mat.diffuseColor = color;
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 30, height: 25 },
    scene,
  );
  ground.material = mat;

  ground.receiveShadows = true;
  return ground;
}

function createSkyBox(scene: Scene) {
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

//objects

  function createBox(scene: Scene, px: number, py:number, pz:number, sx: number, sy: number, sz: number) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/sphereMap.png");
    mat.diffuseTexture = texture;
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);
    box.position = new Vector3(px, py, pz);
    box.scaling = new Vector3(sx, sy, sz);
    //box.position.y = 3;
    box.material = mat;
    return box;
  }

  function createFacedBox(scene: Scene, px: number, py: number, pz: number, ) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/bloc.jpg");
    mat.diffuseTexture = texture;
    var columns = 6;
    var rows = 1;
    const faceUV = new Array(6);
      for (let i = 0; i < 6; i++) {
         faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
      }

    const options = {
        faceUV: faceUV,
        wrap: true
    };
    
    let box = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true});
    box.material = mat;
    box.position = new Vector3(px, py, pz);
    scene.registerAfterRender(function () {
      box.rotate(new Vector3(2, 6, 4)/*axis*/, 0.02/*angle*/, Space.LOCAL);
  });
    
    return box;
  }

  function createLightSphere(scene: Scene) {
    const mat = new StandardMaterial("light");
    const color = new Color3(1,1,0);
     mat.diffuseColor = color;
    var lightSphere = Mesh.CreateSphere("sphere", 10, 2, scene);
    lightSphere.material = mat;
    lightSphere.position = new Vector3(10, 20, 10);
    return lightSphere;
  }

  function createTorus(scene: Scene, px: number, py: number, pz: number) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/leopard_fur.JPG");
    mat.diffuseTexture = texture;
    var torus = Mesh.CreateTorus("torus", 4, 2, 30, false);
    torus.position = new Vector3(px, py, pz);
    const frameRate = 10;
    torus.material = mat;
 
    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
  const keyFrames = []; 

    keyFrames.push({
        frame: 0,
        value: 2
    });

    keyFrames.push({
        frame: frameRate,
        value: -2
    });

    keyFrames.push({
        frame: 2 * frameRate,
        value: 2
    });

    xSlide.setKeys(keyFrames);

    scene.beginDirectAnimation(torus, [xSlide], 0, 2 * frameRate, true);  
    return torus;
  }

  function createSphere(scene: Scene) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/lava/lavatile.jpg");
    mat.diffuseTexture = texture;
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    sphere.position.y = 2.5;
    sphere.position.x = 10;
    sphere.material = mat;
    return sphere;
  }

//lights, shadows and camera

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
    light.intensity = 0.6;
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

  

//----------------------------------------------------------------


//BOTTOM OF CODE - MAIN RENDERING AREA 

  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      faceBox?: Mesh;
      torus?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      skybox?: Mesh;
      shadowGen?: ShadowGenerator;
      sphere?: Mesh; 
      lightSphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
    that.box = createBox(that.scene, 2, 5, 8, 3, 2, 1, true);
   
    //light sphere aka sun
    that.lightSphere = createLightSphere(that.scene);
    //that.light = createAnyLight(that.scene, 2, 10, 20, 10, 0.39, 0.44, 0.91, that.lightSphere);

    //faced box light and shadow
    that.faceBox = createFacedBox(that.scene, -10, 2, 0,);
    that.light = createAnyLight(that.scene, 2, -10, 5, 0, 0.75, 0.12, 0.91, that.faceBox);
   
    //torus and light/shadow
    that.torus = createTorus(that.scene, 0, 2, 0);
    that.light = createAnyLight(that.scene, 2, 0, 5, 0, 0.12, 0.64, 0.86, that.torus);

    //sphere and lights/shadow
    that.sphere = createSphere(that.scene);
    that.light = createAnyLight(that.scene, 2, 10, 5, 0, 0.24, 0.24, 0.91, that.sphere);
    
    //enviroment and map
    that.skybox = createSkyBox(that.scene);
    that.ground = createGround(that.scene);
    
   
    //lights
    that.hemisphericLight = createHemiLight(that.scene);

    //camera
    that.camera = createArcRotateCamera(that.scene);
    
    
    return that;
  }

//--------------------------------------------------------------------