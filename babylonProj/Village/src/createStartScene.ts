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
const buildDwellings = () => {
  const ground = buildGround();

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


  const buildGround = () => {
  const mat = new StandardMaterial("mat");
  const color = new Color3(0, 1, 0);
  mat.diffuseColor = color;
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 15, height: 16 }
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
    buildDwellings();
    that.light = createLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }

//--------------------------------------------------------------------