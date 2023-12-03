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
  import { TextBlock } from "@babylonjs/gui";
  //----------------------------------------------------
  // Create a scoring variable
let score = 0;
let scoreText: TextBlock;
let gameOverText: TextBlock;
// Function to increase the score
function increaseScore(): void {
  score += 1;
  scoreText.text = "Score: " + score;
  console.log('Score: ' + score);
  // Additional logic based on your requirements
}


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
  //Buttons

  function reloadPage(): void {
    // Reload the page
    window.location.reload();
}

function createReloadButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
  const reloadButton = GUI.Button.CreateImageWithCenterTextButton("reloadButton", "Reload", "textures/reload.png");
reloadButton.width = "120px";
  reloadButton.width = "120px";
  reloadButton.height = "40px";
  reloadButton.color = "white";
  reloadButton.background = "green";
  reloadButton.fontSize = 14;
  reloadButton.cornerRadius = 8;
  reloadButton.thickness = 2;
  reloadButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  reloadButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  reloadButton.top = "20px";
  reloadButton.left = "20px";

  reloadButton.onPointerUpObservable.add(() => {
    console.log("THE BUTTON HAS BEEN CLICKED");
    // Call the reloadPage function when the button is clicked
    reloadPage();
  });

  advtex.addControl(reloadButton);
  return reloadButton;
}
    
function createSceneButton(scene: Scene, name: string, index: string, x: string, y: string, advtex) {
  let button = GUI.Button.CreateSimpleButton(name, index);
  button.width = "120px";
  button.width = "120px";
  button.height = "40px";
  button.color = "white";
  button.background = "green";
  button.fontSize = 14;
  button.cornerRadius = 8;
  button.thickness = 2;
  button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  button.top = "20px";
  button.left = "150px";


    
      const buttonClick = new Sound("MenuClickSFX", "./audio/menu-click.wav", scene, null, {
        loop: false,
        autoplay: false,
      });

      button.onPointerUpObservable.add(function() {
          console.log("THE BUTTON HAS BEEN CLICKED");
          buttonClick.play();
          setSceneIndex(0);
      });
      advtex.addControl(button);
      return button;
}



  //MIDDLE OF CODE - FUNCTIONS
  let keyDownMap: any[] = [];
  let currentSpeed: number = 0.1;
  let walkingSpeed: number = 0.1;
  let runningSpeed: number = 0.4;

  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number, scaleFactor: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups) {
      
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1; 
      mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);

      let idleRange: any = skeleton.getAnimationRange("YBot_Idle");
      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");

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
          console.log("Collision detected!");
          increaseScore();
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

  function createSphere(scene: Scene, x: number, y: number, z: number, scaleFactor: number) {
    const mat = new StandardMaterial("mat");
  const texture = new Texture("https://www.babylonjs-playground.com/textures/fur.jpg");
    let sphere: Mesh = MeshBuilder.CreateSphere("sphere", { });
    mat.diffuseTexture = texture;
    sphere.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
     const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
     sphere.material = mat;
    return sphere;
  }

  function createSphere1(scene: Scene, rotation: boolean) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/lava/lavatile.jpg");
    mat.diffuseTexture = texture;
    let sphere1 = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    sphere1.position = new Vector3(10, 20, 10);
    sphere1.material = mat;
    
    var alpha = 0;
    scene.registerBeforeRender(function () {
      sphere1.rotation.x += 0.01;
      sphere1.rotation.z += 0.02;
  
      sphere1.position = new Vector3(Math.cos(alpha) * 20, 10, Math.sin(alpha) * 20);
      alpha += 0.01;
  
    });
    
  
    return sphere1;
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

  function createHouse(scene: Scene, width: number, px: number, py:number, pz:number) {
    const box = createBox(scene, width);
    const roof = createRoof(scene, width);
    const house: any = Mesh.MergeMeshes([box, roof], true, false, undefined, false, true);
    house.position = new Vector3(1, 0, 10);
    //for the UNDEFINED parameter - the BabylonJS Documentation says to use null instead of undefined but this is in JAVASCRIPT.
    //TypeScript does not accept null.
    const houseAggregate = new PhysicsAggregate(house, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return house;
  }

  //This is adapted from the cloning and instances from the Village tutorial in the BabylonJS Documentation
  function cloneHouse(scene: Scene, Mesh: Mesh,scaleFactor: number) {
    const detached_house = createHouse(scene, 1, 0,0,0,); //.clone("clonedHouse");
    const detached_houseAggregate = new PhysicsAggregate(detached_house, PhysicsShapeType.BOX, { mass: 0 }, scene);
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;
    detached_house.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
    const semi_house = createHouse(scene, 2,0,0,0); //.clone("clonedHouse");
    semi_house .rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;
    semi_house.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
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
        const housesAggregate = new PhysicsAggregate(houses[i], PhysicsShapeType.BOX, { mass: 0 }, scene);
        
    }
    
    return houses;
  }


    

  function createTerrain(scene: Scene) {
    const largeGroundMat = new StandardMaterial("largeGroundMat");
    largeGroundMat.diffuseTexture = new Texture("https://www.babylonjs-playground.com/textures/lava/lavatile.jpg");
    const largeGround = MeshBuilder.CreateGroundFromHeightMap(
      "largeGround",
      "https://assets.babylonjs.com/environments/villageheightmap.png",
      { width: 150, height: 150, subdivisions: 20, minHeight: -0.01, maxHeight: 9.99 }
    );
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

  function createFootballPitch(scene: Scene, size: number = 10, width: number = 10,  position: Vector3 = Vector3.Zero()) {
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("https://t4.ftcdn.net/jpg/04/40/51/03/360_F_440510369_R1T9gwH1ZkpSBCjYDg47X2AhfL0AOOWf.jpg");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground1: Mesh = MeshBuilder.CreateGround("ground1", { height: size, width: width, subdivisions: 4 }, scene);
    ground1.material = groundMat;

  

    // Set the position of the ground
    ground1.position = position;

    const ground1Aggregate = new PhysicsAggregate(ground1, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return ground1;
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

// goal posts 
function createGoalPosts1(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Right Goal Post
  const GoalPost1 = MeshBuilder.CreateBox("GoalPost1", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost1.position = new Vector3(-11.5,0,-7); // Adjusted position
  const GoalPost1Physics = new PhysicsAggregate(GoalPost1, PhysicsShapeType.BOX, { mass: 0 }, scene);
  
  return GoalPost1;
}

function createGoalPosts2(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Left Goal Post
  const GoalPost2 = MeshBuilder.CreateBox("GoalPost2", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost2.position = new Vector3(-11.5,0,-9);
  const GoalPost2Physics = new PhysicsAggregate(GoalPost2, PhysicsShapeType.BOX, { mass: 0 }, scene);

  return GoalPost2;
}
  
function createGoalPosts3(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Right Goal Post
  const GoalPost3 = MeshBuilder.CreateBox("GoalPost3", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost3.position = new Vector3(-0.5,0,-9); // Adjusted position
  const GoalPost3Physics = new PhysicsAggregate(GoalPost3, PhysicsShapeType.BOX, { mass: 0 }, scene);
  
  return GoalPost3;
}

function createGoalPosts4(scene: Scene) {
  const goalPostHeight = 3;
  const goalPostWidth = 0.2;
  const goalPostDepth = 0.2;

  // Left Goal Post
  const GoalPost4 = MeshBuilder.CreateBox("GoalPost4", { height: goalPostHeight, width: goalPostWidth, depth: goalPostDepth }, scene);
  GoalPost4.position = new Vector3(-0.5,0,-7);
  const GoalPost4Physics = new PhysicsAggregate(GoalPost4, PhysicsShapeType.BOX, { mass: 0 }, scene);

  return GoalPost4;
}

// function createGoalPosts5(scene: Scene, diameter: number, height: number, rotationAxis: Vector3, rotationAngle: number): Mesh {
//   const mat = new StandardMaterial("mat");
//   const color = new Color3(1, 1, 1);
//   mat.diffuseColor = color;
//   const goalPosts5 = MeshBuilder.CreateCylinder("goalPosts5", { diameter, height }, scene);

//   // Rotate the goal post top based on the provided axis and angle
//   goalPosts5.rotate(rotationAxis, rotationAngle);

//   // Adjust the position and make the cylinder longer
//   goalPosts5.position = new Vector3(-0.5, 1.65, -7);
//   goalPosts5.scaling.y = 14; // Adjust the scaling factor to make the cylinder longer
//   goalPosts5.rotation.x = Math.PI / 3;
//   goalPosts5.material = mat;
//   const goalPosts5Physics = new PhysicsAggregate(goalPosts5, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

//   return goalPosts5;
// }

// function createGoalPosts6(scene: Scene, diameter: number, height: number, rotationAxis: Vector3, rotationAngle: number): Mesh {
//   const mat = new StandardMaterial("mat");
//   const color = new Color3(1, 1, 1);
//   mat.diffuseColor = color;
//   const goalPosts6 = MeshBuilder.CreateCylinder("goalPosts6", { diameter, height }, scene);

//   // Rotate the goal post top based on the provided axis and angle
//   goalPosts6.rotate(rotationAxis, rotationAngle);

//   // Adjust the position and make the cylinder longer
//   goalPosts6.position = new Vector3(-11.5, 1.65, -9);
//   goalPosts6.scaling.y = 14; // Adjust the scaling factor to make the cylinder longer
//   goalPosts6.material = mat;
//   const goalPosts6Physics = new PhysicsAggregate(goalPosts6, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

//   return goalPosts6;
// }

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
      ground1?: Mesh;
      largeGround?: Mesh;
      importMesh?: any;
      tree?: Sprite;
      GoalPost1?: Mesh;
      GoalPost2?: Mesh;
      GoalPost3?: Mesh;
      GoalPost4?: Mesh;
      GoalPost5?: Mesh;
      GoalPost6?: Mesh;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      sphere1?: Mesh;
      
      
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    //initialise physics
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    //----------------------------------------------------------
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    scoreText = new TextBlock();
    scoreText.text = "Score: " + score;
    scoreText.color = "white";
    scoreText.fontSize = 36; // Increase font size for better visibility
    scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT; // Align text to the right
    scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP; // Align text to the top
    scoreText.paddingTop = "20px";
    scoreText.paddingRight = "20px";
    advancedTexture.addControl(scoreText);

  
    
    let reloadButton = createReloadButton(that.scene, "Reload", "Reload", "-500px", "-280px", advancedTexture);
    let button1 = createSceneButton(that.scene, "but1", "Menu", "-500px", "-280px", advancedTexture);
    
    //any further code goes here-----------
    that.house = cloneHouse(that.scene, 0,1.1);

    that.box = createSphere(that.scene, 2, 2, 2,0.5);

    that.ground = createGround(that.scene);
    that.ground1 = createFootballPitch(that.scene, 10, 12, new Vector3(-6, 0.01, -8));
    that.largeGround = createTerrain(that.scene);
    that.importMesh = importPlayerMesh(that.scene, that.box, 0, 0, 0.8);
    that.actionManager = actionManager(that.scene);
    that.sphere1 = createSphere1(that.scene, true);
    that.skybox = createSkybox(that.scene);
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    //goal posts
    that.GoalPost1 = createGoalPosts1(that.scene);
    that.GoalPost2 = createGoalPosts2(that.scene);
    that.GoalPost3 = createGoalPosts3(that.scene);
    that.GoalPost4 = createGoalPosts4(that.scene);
    // that.GoalPost5 = createGoalPosts5(that.scene, 0.4, 0.2, Vector3.Forward(), Math.PI / 2);
    // that.GoalPost6 = createGoalPosts6(that.scene, 0.4, 0.2, Vector3.Forward(), Math.PI / 2);



    return that;
  }
  //----------------------------------------------------