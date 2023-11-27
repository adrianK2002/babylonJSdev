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
    ShadowLight,
    SpriteManager,
    Sprite,
    PointLight,
} from "@babylonjs/core"
import { shadowMapFragment } from "@babylonjs/core/Shaders/ShadersInclude/shadowMapFragment";
import { lightFragment } from "@babylonjs/core/Shaders/ShadersInclude/lightFragment";
//-----------------------------------------------------


//--------------------------------------
//MIDDLE OF CODE - FUNCTIONS
//create terrain
function createTerrain(scene: Scene) {
  const largeGroundMat = new StandardMaterial("largeGroundMat");
  largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png");
  const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://www.babylonjs-playground.com/textures/heightMapTriPlanar.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
  largeGround.material = largeGroundMat;
  return largeGround;
}

function createGround(scene: Scene) {
  const groundMat = new StandardMaterial("groundMat");
  groundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/villagegreen.png");
  groundMat.diffuseTexture.hasAlpha = true;

  const ground = MeshBuilder.CreateGround("ground", {width:24, height:28});
  ground.material = groundMat;
  return ground;
}

//creating trees
function createTrees(scene: Scene) {
  const spriteManagerTrees = new SpriteManager("treesManager", "textures/palmtree.png", 2000, {width: 512, height: 1024}, scene);

    //We create trees at random positions
    for (let i = 0; i < 500; i++) {
        const tree = new Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (-30);
        tree.position.z = Math.random() * 20 + 8;
        tree.position.y = 0.5;
    }

    for (let i = 0; i < 500; i++) {
        const tree = new Sprite("tree", spriteManagerTrees);
        tree.position.x = Math.random() * (25) + 7;
        tree.position.z = Math.random() * -35  + 8;
        tree.position.y = 0.5;
    }
    
    return tree;
}

//create skybox
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


  
  function createLight(scene: Scene) {
    const light = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
    light.position = new Vector3(10, 20, 10);
    light.shadowEnabled = true;
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.useExponentialShadowMap = true;
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
  
  
  function createHouse(scene: Scene) {
    const box = createBox(scene);
    const roof = createRoof(scene);
    const house = Mesh.MergeMeshes([box, roof]);
    return house;

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

  const buildDwellings = () => {
    
  
    const detached_house = buildHouse(1);
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;
  
    

    const semi_house = buildHouse(2);
    semi_house .rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;
  
    const places = []; //each entry is an array [house type, rotation, x, z]
    places.push([1, -Math.PI / 16, -6.8, 2.5 ]);
    places.push([2, -Math.PI / 16, -4.5, 3 ]);
    places.push([2, -Math.PI / 16, -1.5, 4 ]);
    places.push([2, -Math.PI / 3, 1.5, 6 ]);
    places.push([2, 15 * Math.PI / 16, -6.4, -1.5 ]);
    places.push([1, 15 * Math.PI / 16, -4.1, -1 ]);
    places.push([2, 15 * Math.PI / 16, -2.1, -0.5 ]);
    places.push([1, 5 * Math.PI / 4, 0, -1 ]);
    places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3 ]);
    places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5 ]);
    places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7 ]);
    places.push([2, Math.PI / 1.9, 4.75, -1 ]);
    places.push([1, Math.PI / 1.95, 4.5, -3 ]);
    places.push([2, Math.PI / 1.9, 4.75, -5 ]);
    places.push([1, Math.PI / 1.9, 4.75, -7 ]);
    places.push([2, -Math.PI / 3, 5.25, 2 ]);
    places.push([1, -Math.PI / 3, 6, 4 ]);
  
    //Create instances from the first two that were built 
    const houses = [];
    for (let i = 0; i < places.length; i++) {
        if (places[i][0] === 1) {
            houses[i] = detached_house.createInstance("house" + i);
        }
        else {
            houses[i] = semi_house.createInstance("house" + i);
        }
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }
  }
  const buildHouse = (width) => {
    const box = buildBox(width);
    const roof = buildRoof(width);
  
    return Mesh.MergeMeshes([box, roof], true, false, null, false, true);
  }

  const buildBox = (width) => {
    //texture
    const boxMat = new StandardMaterial("boxMat");
    if (width == 2) {
       boxMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/semihouse.png") 
    }
    else {
        boxMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/cubehouse.png");   
    }

    //options parameter to set different images on each side
    const faceUV = [];
    if (width == 2) {
        faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0); //rear face
        faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0); //front face
        faceUV[2] = new Vector4(0.4, 0, 0.6, 1.0); //right side
        faceUV[3] = new Vector4(0.4, 0, 0.6, 1.0); //left side
    }
    else {
        faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
        faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
        faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
        faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    }

    const box = MeshBuilder.CreateBox("box", {width: width, faceUV: faceUV, wrap: true});
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
}


const buildRoof = (width) => {
  //texture
  const roofMat = new StandardMaterial("roofMat");
  roofMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/roof.jpg");

  const roof = MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
  roof.material = roofMat;
  roof.scaling.x = 0.75;
  roof.scaling.y = width;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;

  return roof;
}

//----------------------------------------------------------------


//BOTTOM OF CODE - MAIN RENDERING AREA 

  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      roof?: Mesh;
      house?: Mesh;
      largeGround?: Mesh;
      skybox?: Mesh;
      ground?: Mesh;
      tree?: Sprite;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
  
   // that.house = createHouse(that.scene);
   buildDwellings();
   that.hemisphericLight = createHemiLight(that.scene);
    that.largeGround = createTerrain(that.scene);
    that.ground = createGround(that.scene);
    that.tree = createTrees(that.scene);
    that.skybox = createSkyBox(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }

//--------------------------------------------------------------------