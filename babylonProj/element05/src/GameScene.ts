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
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    Space,
    Sound,
} from "@babylonjs/core"
import { shadowMapFragment } from "@babylonjs/core/Shaders/ShadersInclude/shadowMapFragment";
import { lightFragment } from "@babylonjs/core/Shaders/ShadersInclude/lightFragment";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core"; 
//-----------------------------------------------------


//--------------------------------------
//MIDDLE OF CODE - FUNCTIONS
//create terrain
function createTerrain(scene: Scene) {
  const largeGroundMat = new StandardMaterial("largeGroundMat");
  largeGroundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/valleygrass.png");
  const largeGround = MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
  largeGround.material = largeGroundMat;
  return largeGround;
}

function createGround(scene: Scene) {
  const groundMat = new StandardMaterial("groundMat");
  groundMat.diffuseTexture = new Texture("https://assets.babylonjs.com/environments/villagegreen.png");
  groundMat.diffuseTexture.hasAlpha = true;

  const ground = MeshBuilder.CreateGround("ground", {width:24, height:28});
  ground.material = groundMat;
  ground.receiveShadows = true;
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

function createSphere(scene: Scene, rotation: boolean) {
  const mat = new StandardMaterial("mat");
  const texture = new Texture("https://www.babylonjs-playground.com/textures/lava/lavatile.jpg");
  mat.diffuseTexture = texture;
  let sphere = MeshBuilder.CreateSphere(
    "sphere",
    { diameter: 2, segments: 32 },
    scene,
  );
  sphere.position = new Vector3(10, 20, 10);
  sphere.material = mat;
  
  var alpha = 0;
	scene.registerBeforeRender(function () {
		sphere.rotation.x += 0.01;
		sphere.rotation.z += 0.02;

		sphere.position = new Vector3(Math.cos(alpha) * 20, 10, Math.sin(alpha) * 20);
		alpha += 0.01;

	});
  

  return sphere;
}
  
  // function createLight(scene: Scene) {
  //   const light = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
  //   light.position = new Vector3(10, 20, 10);
  //   light.shadowEnabled = true;
  //   const shadowGenerator = new ShadowGenerator(1024, light);
  //   shadowGenerator.useExponentialShadowMap = true;
  //   return light;
  // }
 

  
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
  


  function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
    // only spotlight, point and directional can cast shadows in BabylonJS
    switch (index) {
      case 1: //hemispheric light
      var light = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
      light.position = new Vector3(20, 40, 20);
      light.intensity = 0.5;
      var shadowGenerator = new ShadowGenerator(1024, light);
	shadowGenerator.addShadowCaster(mesh);
	shadowGenerator.useExponentialShadowMap = true;
        return light;
        break;
      case 2: //spot light
        var light2 = new SpotLight("spot02", new Vector3(30, 40, 20),
        new Vector3(-1, -2, -1), 1.1, 16, scene);
          light2.intensity = 0.5;
          var shadowGenerator2 = new ShadowGenerator(1024, light2);
	shadowGenerator2.addShadowCaster(mesh);
	shadowGenerator2.usePoissonSampling = true;
        return light2;
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

//music

  function createMusic(scene: Scene) {
    const volume = 0.075;
    var music = new Sound("Theme", "./audio/song.mp3", scene, null, { loop: true, autoplay: true });
    music.setVolume(volume);
    return music;
  }

//player
let keyDownMap: any[] = [];
let currentSpeed: number = 0.1;
let walkingSpeed: number = 0.1;
let runningSpeed: number = 0.4;

function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
  let tempItem = { flag: false } 
  let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons) {
    let mesh = newMeshes[0];
    let skeleton = skeletons[0];
    skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    skeleton.animationPropertiesOverride.enableBlending = true;
    skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    skeleton.animationPropertiesOverride.loopMode = 1; 

    
    let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
    // let runRange: any = skeleton.getAnimationRange("YBot_Run");
    // let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
    // let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");
    // let idleRange: any = skeleton.getAnimationRange("YBot_Idle");

    let animating: boolean = false;

    scene.onBeforeRenderObservable.add(()=> {
      let keydown: boolean = false;
      let shiftdown: boolean = false;
      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        mesh.position.z += 0.1;
        mesh.rotation.y = 0;
        keydown = true;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        mesh.position.x -= 0.1;
        mesh.rotation.y = 3 * Math.PI / 2;
        keydown = true;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        mesh.position.z -= 0.1;
        mesh.rotation.y = 2 * Math.PI / 2;
        keydown = true;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        mesh.position.x += 0.1;
        mesh.rotation.y = Math.PI / 2;
        keydown = true;
      }
      if (keyDownMap["Shift"] || keyDownMap["LeftShift"]) {
        currentSpeed = runningSpeed;
        shiftdown = true;
      } else {
        currentSpeed = walkingSpeed;
        shiftdown = false;
      }

      if (keydown) {
        if (!animating) {
          animating = true;
          scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
        }
      } else {
        animating = false;
        scene.stopAnimation(skeleton);
      }


    });
    
 

  });
 

  return item;
}



function actionManager(scene: Scene){
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
  new ExecuteCodeAction(
  {
  trigger: ActionManager.OnKeyDownTrigger,
  //parameters: 'w'
  },
  function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
  )
  );
  scene.actionManager.registerAction(
  new ExecuteCodeAction(
  {
  trigger: ActionManager.OnKeyUpTrigger
 
  },
  function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
  )
  );
  return scene.actionManager;
 } 

function ufo(scene: Scene) {
  let item: any = SceneLoader.ImportMesh("", "models/", "ufo.glb", scene, function (meshes) {    
    item.position.x = 10;   
    item.position.y = 10;
    item.position.z = 5;
    var alpha = 0;
    // scene.registerBeforeRender(function () {
    //   // item.rotation.x += 0.01;
    //   // item.rotation.z += 0.02;
  
    //   // item.position = new Vector3(Math.cos(alpha) * 20, 10, Math.sin(alpha) * 20);
    //   // alpha += 0.01;
  
    // });
    return item;
});

}
 
//----------------------------------------------------------------


//BOTTOM OF CODE - MAIN RENDERING AREA 

  export default function GameScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      roof?: Mesh;
      house?: Mesh;
      importMesh?: any; 

      actionManager?: any;
      sphere?: Mesh;
      largeGround?: Mesh;
      skybox?: Mesh;
      ground?: Mesh;
      tree?: Sprite;
      light?: Light;
      light2?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      music?: Sound;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();


    //any further code goes here-----------

    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
  
   // that.house = createHouse(that.scene);
   buildDwellings();
   that.hemisphericLight = createHemiLight(that.scene);
    that.largeGround = createTerrain(that.scene);
    that.ground = createGround(that.scene);
    that.tree = createTrees(that.scene);
    that.skybox = createSkyBox(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    that.importMesh = importPlayerMesh(that.scene, 0, 0);
    that.importMesh = ufo(that.scene)
    that.actionManager = actionManager(that.scene);
    that.sphere = createSphere(that.scene, true);
    that.light = createAnyLight(that.scene, 2, 0, 5, 0, 0.12, 0.64, 0.86, that.sphere);
    
    that.music = createMusic(that.scene);

    
    return that;
  }

//--------------------------------------------------------------------