//-----------------------------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
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
  } from "@babylonjs/core";
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
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups, ) {
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

        let isPlaying: boolean = false;
        if (keydown && !isPlaying) {
          if (!animating) {
              idleAnim = scene.stopAnimation(skeleton);
              walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
              animating = true;
          }
          if (animating) {
            //walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
            isPlaying = true;
          }
        } else {
          if (animating && !keydown) {
            walkAnim = scene.stopAnimation(skeleton);
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
            animating = false;
            isPlaying = false;
          }
          // if (!animating && !keydown) {
          //   idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
          // }
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

  function createSphere(scene: Scene, x: number, y: number, z: number, scale: number = 1) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://static.vecteezy.com/system/resources/thumbnails/007/686/503/small/black-and-white-panoramic-texture-football-background-ball-vector.jpg");
    mat.diffuseTexture = texture;
    let sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 * scale });
    
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    sphere.material = mat;
    const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
    return sphere;
  }
    
  function createGround(scene: Scene, size: number = 10, width: number = 10, rotationAngle: number = 0) {
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("https://t4.ftcdn.net/jpg/04/40/51/03/360_F_440510369_R1T9gwH1ZkpSBCjYDg47X2AhfL0AOOWf.jpg");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground: Mesh = MeshBuilder.CreateGround("ground", { height: size, width: width, subdivisions: 4 }, scene);
    ground.material = groundMat;

    // Rotate the ground by the specified angle (in radians)
    ground.rotate(Vector3.Up(), rotationAngle);

    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return ground;
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

  //fence around pitch
  function createFence1(scene: Scene) {
        // Create a fence
        const mat = new StandardMaterial("mat");
        const texture = new Texture("https://ichef.bbci.co.uk/news/624/mcs/media/images/59704000/jpg/_59704491_compositeadvertswithburger.jpg");
         mat.diffuseTexture = texture;
        const fenceHeight = 1;
        const fenceWidth = 0.1;
        const fenceColor = new Color3(0.5, 0.5, 0.5);

        const fence1 = MeshBuilder.CreateBox("fence1", { height: fenceHeight, width: fenceWidth, depth: 25 }, scene);
        fence1.position = new Vector3(-7.55, fenceHeight / 2, 0);
        fence1.material = new StandardMaterial("fenceMaterial", scene);
        fence1.material = mat;
        const fence1Physics = new PhysicsAggregate(fence1, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return fence1;
  }

  function createFence2(scene: Scene) {
    const mat = new StandardMaterial("mat");
        const texture = new Texture("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTWGcDuakfr8DBX1bAuaRsA8ZM5oefyOkkWg&usqp=CAU");
         mat.diffuseTexture = texture;
    const fenceHeight = 1;
    const fenceWidth = 0.1;
    const fenceColor = new Color3(0.5, 0.5, 0.5);

    const fence2 = MeshBuilder.CreateBox("fence2", { height: fenceHeight, width: fenceWidth, depth: 25 }, scene);
    fence2.position = new Vector3(7.55, fenceHeight / 2, 0);
    fence2.material = new StandardMaterial("fenceMaterial", scene);
    const fence2Physics = new PhysicsAggregate(fence2, PhysicsShapeType.BOX, { mass: 0 }, scene);
    fence2.material = mat;
return fence2;
}

function createFence3(scene: Scene) {
  const mat = new StandardMaterial("mat");
  const texture = new Texture("https://i.guim.co.uk/img/static/sys-images/Media/Pix/pictures/2010/12/17/1292593803419/Meerkat-007.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctb3BpbmlvbnMtYWdlLTIwMTAucG5n&enable=upscale&s=2cec5d50f6e7d73f8adec142e7d9990f");
   mat.diffuseTexture = texture;
  const fenceHeight = 1;
  const fenceWidth = 0.1;
  const fenceColor = new Color3(0.5, 0.5, 0.5);
   
  const fence3 = MeshBuilder.CreateBox("fence3", { height: fenceHeight, width: 15, depth: fenceWidth }, scene);
  fence3.position = new Vector3(0, fenceHeight / 2, 12.55);
  fence3.material = new StandardMaterial("fenceMaterial", scene);
  const fence3Physics = new PhysicsAggregate(fence3, PhysicsShapeType.BOX, { mass: 0 }, scene);
  fence3.material = mat;

return fence3;
}

function createFence4(scene: Scene) {
  const mat = new StandardMaterial("mat");
  const texture = new Texture("https://ichef.bbci.co.uk/news/624/mcs/media/images/59704000/jpg/_59704491_compositeadvertswithburger.jpg");
   mat.diffuseTexture = texture;
  const fenceHeight = 1;
  const fenceWidth = 0.1;
  const fenceColor = new Color3(0.5, 0.5, 0.5);

  const fence4 = MeshBuilder.CreateBox("fence4", { height: fenceHeight, width: 15, depth: fenceWidth }, scene);
        fence4.position = new Vector3(0, fenceHeight / 2, -12.55);
        fence4.material = new StandardMaterial("fenceMaterial", scene);
        fence4.material = mat;
        const fence4Physics = new PhysicsAggregate(fence4, PhysicsShapeType.BOX, { mass: 0 }, scene);
return fence4;
}
        
// goal posts 
function createGoalPosts1(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Right Goal Post
  const GoalPost1 = MeshBuilder.CreateBox("GoalPost1", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost1.position = new Vector3(1.25,0,11.5); // Adjusted position
  const GoalPost1Physics = new PhysicsAggregate(GoalPost1, PhysicsShapeType.BOX, { mass: 0 }, scene);
  
  return GoalPost1;
}

function createGoalPosts2(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Left Goal Post
  const GoalPost2 = MeshBuilder.CreateBox("GoalPost2", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost2.position = new Vector3(-1.25,0,11.5);
  const GoalPost2Physics = new PhysicsAggregate(GoalPost2, PhysicsShapeType.BOX, { mass: 0 }, scene);

  return GoalPost2;
}
  
function createGoalPosts3(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Right Goal Post
  const GoalPost3 = MeshBuilder.CreateBox("GoalPost3", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost3.position = new Vector3(1.25,0,-11.5); // Adjusted position
  const GoalPost3Physics = new PhysicsAggregate(GoalPost3, PhysicsShapeType.BOX, { mass: 0 }, scene);
  
  return GoalPost3;
}

function createGoalPosts4(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Left Goal Post
  const GoalPost4 = MeshBuilder.CreateBox("GoalPost4", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost4.position = new Vector3(-1.25,0,-11.5);
  const GoalPost4Physics = new PhysicsAggregate(GoalPost4, PhysicsShapeType.BOX, { mass: 0 }, scene);

  return GoalPost4;
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
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      sphere?: Mesh;
      ground?: Mesh;
      fence1?: Mesh;
      fence2?: Mesh;
      fence3?: Mesh;
      fence4?: Mesh;
      GoalPost1?: Mesh;
      GoalPost2?: Mesh;
      GoalPost3?: Mesh;
      GoalPost4?: Mesh;
      GoalPost5?: Mesh;
      GoalPost6?: Mesh;
      importMesh?: any;
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
    that.sphere = createSphere(that.scene, 2, 2, 2, 0.5);
    that.ground = createGround(that.scene, 15, 25, Math.PI / 2);

    that.importMesh = importPlayerMesh(that.scene, that.sphere, 0, 0);
    that.actionManager = actionManager(that.scene);

    that.skybox = createSkybox(that.scene);
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    
    //fence
    that.fence1 = createFence1(that.scene);
    that.fence2 = createFence2(that.scene);
    that.fence3 = createFence3(that.scene);
    that.fence4 = createFence4(that.scene);

     //goal posts
    that.GoalPost1 = createGoalPosts1(that.scene);
    that.GoalPost2 = createGoalPosts2(that.scene);
    that.GoalPost3 = createGoalPosts3(that.scene);
    that.GoalPost4 = createGoalPosts4(that.scene);
    
    return that;


  }
  //----------------------------------------------------