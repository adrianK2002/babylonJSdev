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
    Sound
  } from "@babylonjs/core";
  import * as GUI from "@babylonjs/gui";
  import HavokPhysics from "@babylonjs/havok";
  import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  //----------------------------------------------------
  
  //----------------------------------------------------
  //Initialisation of Physics (Havok)
  let initializedHavok;
  HavokPhysics().then((havok) => {
    initializedHavok = havok;
  });

  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);

  globalThis.HK = await HavokPhysics();
  //-----------------------------------------------------

  //MIDDLE OF CODE - FUNCTIONS
  let keyDownMap: any[] = [];
  let currentSpeed: number = 0.1;
  let walkingSpeed: number = 0.1;
  let runningSpeed: number = 0.4;

  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1; 

      //adapted from: www.babylonjs-playground.com/#LL5BIQ#0
      //another good playground for this is: www.babylonjs-playground.com/#AHQEIB#17
      let idleRange: any = skeleton.getAnimationRange("YBot_Idle");
      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
      // let runRange: any = skeleton.getAnimationRange("YBot_Run");
      //let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
      //let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");

      //MOVE THESE IF YOU WANT TO TRIGGER ANYWHERE
      //let runAnim: any = scene.beginWeightedAnimation(skeleton, runRange.from, runRange.to, 1.0, true);
      //let leftAnim: any = scene.beginWeightedAnimation(skeleton, leftRange.from, leftRange.to, 1.0, true);
      //let rightAnim: any = scene.beginWeightedAnimation(skeleton, rightRange.from, rightRange.to, 1.0, true);

      //Speed and Rotation Variables
      let speed: number = 0.03;
      let speedBackward: number = 0.01;
      let rotationSpeed = 0.05;

      //Animation Variables
      let idleAnim: any;
      let walkAnim: any;
      let animating: boolean = false;

      scene.onBeforeRenderObservable.add(()=> {
        let keydown: boolean = false;
        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.moveWithCollisions(mesh.forward.scaleInPlace(speed));                
          //Previous code
          //mesh.position.z += 0.01;
          //mesh.rotation.y = 0;
          keydown = true;
        }
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.rotate(Vector3.Up(), -rotationSpeed);
          //Previous code
          //mesh.position.x -= 0.01;
          //mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.moveWithCollisions(mesh.forward.scaleInPlace(-speedBackward));
          //Previous code
          //mesh.position.z -= 0.01;
          //mesh.rotation.y = 2 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.rotate(Vector3.Up(), rotationSpeed);
          //Previous code
          //mesh.position.x += 0.01;
          //mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }

        if (keydown) {
          if (!animating) {
              animating = true;
              idleAnim = scene.stopAnimation(skeleton);
              walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
          }
          if (animating) {
            walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
          }
        } else {
          if (animating && !keydown) {
            animating = false;
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
          }
          if (!animating && !keydown) {
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
          }
        }

        //collision
        if (mesh.intersectsMesh(collider)) {
          console.log("COLLIDED");
        }
      });

      //physics collision
      item = mesh;
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
      playerAggregate.body.disablePreStep = false;

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

  function createSphere(scene: Scene, x: number, y: number, z: number) {
    let sphere: Mesh = MeshBuilder.CreateSphere("sphere", { });
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
     const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
    return sphere;
  }

  function createBox(scene: Scene, width: number) {
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
  //  const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return box;
}

  function createRoof(scene: Scene, width: number) {
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

  function createHouse(scene: Scene, width: number) {
    const box = createBox(scene, width);
    const roof = createRoof(scene, width);
    const house: any = Mesh.MergeMeshes([box, roof], true, false, undefined, false, true);
    //for the UNDEFINED parameter - the BabylonJS Documentation says to use null instead of undefined but this is in JAVASCRIPT.
    //TypeScript does not accept null.
   // const houseAggregate = new PhysicsAggregate(house, PhysicsShapeType.BOX, { mass: 1 }, scene);
    return house;
  }

  //This is adapted from the cloning and instances from the Village tutorial in the BabylonJS Documentation
  function cloneHouse(scene: Scene) {
    const detached_house = createHouse(scene, 1); //.clone("clonedHouse");
    const detached_houseAggregate = new PhysicsAggregate(detached_house, PhysicsShapeType.BOX, { mass: 1 }, scene);
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;

    const semi_house = createHouse(scene, 2); //.clone("clonedHouse");
    semi_house .rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;

    //each entry is an array [house type, rotation, x, z]
    const places: number[] [] = []; 
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
    
    const houses: Mesh[] = [];
    for (let i = 0; i < places.length; i++) {
      if (places[i][0] === 1) {
          houses[i] = detached_house.createInstance("house" + i);
         // const detached_houseAggregate = new PhysicsAggregate(detached_house, PhysicsShapeType.BOX, { mass: 1 }, scene);
          
      }
      else {
          houses[i] = semi_house.createInstance("house" + i);
          //const semi_houseAggregate = new PhysicsAggregate(semi_house, PhysicsShapeType.BOX, { mass: 1 }, scene);
      }
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
        const housesAggregate = new PhysicsAggregate(houses[i], PhysicsShapeType.BOX, { mass: 1 }, scene);
        
    }
    
    return houses;
  }


    

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
    const ground: Mesh = MeshBuilder.CreateGround("ground", {height: 28, width: 24, subdivisions: 4});
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    ground.material = groundMat;
     ground.receiveShadows = true;
    return ground;
  }

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

  //PREVIOUS METHODS
  // function createSpotLight(scene: Scene, px: number, py: number, pz: number) {
  //   var light = new SpotLight("spotLight", new Vector3(-1, 1, -1), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
  //   light.diffuse = new Color3(0.39, 0.44, 0.91);
	//   light.specular = new Color3(0.22, 0.31, 0.79);
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
  //----------------------------------------------------------
  
  //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function GameScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      sphere?: Mesh;
      ground?: Mesh;
      largeGround?: Mesh;
      importMesh?: any;
      tree?: Sprite;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    //initialise physics
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    //----------------------------------------------------------

    //any further code goes here-----------
    that.house = cloneHouse(that.scene);
    //that.box = createBox(that.scene);
    //that.roof = createRoof(that.scene);
    //that.house = createHouse(that.scene, 2); 
    //const house = Mesh.MergeMeshes([that.box, that.roof], true, false, undefined, false, true);
    that.box = createSphere(that.scene, 2, 2, 2);

    that.ground = createGround(that.scene);
    that.largeGround = createTerrain(that.scene);
    that.tree = createTrees(that.scene);
    that.importMesh = importPlayerMesh(that.scene, that.box, 0, 0);
    that.actionManager = actionManager(that.scene);

    that.skybox = createSkybox(that.scene);
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }
  //----------------------------------------------------