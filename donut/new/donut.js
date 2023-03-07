// import vertexShaderSource from './shaders/vertex.glsl'
// import fragmentShaderSource from './shaders/fragment.glsl'

// 'use strict'

const vertexShaderSource = `
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

attribute vec3 aPosition;
attribute vec2 aCoords;
attribute vec3 aVertexColor;

varying vec2 vCoords;
varying vec3 vColor;

void main()
{ 
    vec4 position = vec4(aPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * position;
    vColor = aVertexColor;
    vCoords = aCoords;
}
`

const fragmentShaderSource = `
precision highp float;

varying vec2 vCoords;
varying vec3 vColor;

uniform sampler2D uSampler;

void main()
{
    // gl_FragColor = vec4(vColor,1.0); //set color as static color
    gl_FragColor = texture2D(uSampler, vCoords)*vec4(vColor, 1.0); //set color as texture: assign texture coords to color
}
`
// geometry functions

// creating single rectangle
function createRect2(p1x,p1y,p1z,p2x,p2y,p2z,p3x,p3y,p3z,p4x,p4y,p4z)
  {
    let vertexPosition = [p1x,p1y,p1z, p2x,p2y,p2z, p4x,p4y,p4z,  //first triangle
                          p1x,p1y,p1z, p4x,p4y,p4z, p3x,p3y,p3z]; //second triangle
                  
    return vertexPosition;
}

// coloring rectangle
function createRectColor(r,g,b)
{
  let vertexColor = [r,g,b, r,g,b, r,g,b,  //first triangle
                     r,g,b, r,g,b, r,g,b]; //second triangle
                        
  return vertexColor;
}

// creating texture coordinates
function createRectCoords(mu,mv,dau,dav,dbu,dbv)
{
  p1u = mu;             p1v = mv;            
  p2u = mu + dau;       p2v = mv + dav;
  p3u = mu + dbu;       p3v = mv + dbv;      
  p4u = mu + dau + dbu; p4v = mv + dav + dbv;


  let vertexCoord = [p1u,p1v, p2u,p2v, p4u,p4v,  //first triangle
                     p1u,p1v, p4u,p4v, p3u,p3v]; //second triangle
               
  return vertexCoord;
}


// webGL functions
function initShaders()
{
    //creating a shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    //creating shader program
    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
}

function initBuffers()
{ 
    let vertexPosition = []; // X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 
    
    //donut geometry
    let stepElevation = 360/36;
    let stepAngle = 360/36;
    let radius = 2.0;
    let R = 5.0;
    for(let elevation=0; elevation< 360; elevation+= stepElevation)
    {
      let radiusXY = R+radius*Math.cos(elevation*Math.PI/180);
      let radiusZ  = radius*Math.sin(elevation*Math.PI/180);
      
      let radiusXY2 = R+radius*Math.cos((elevation+stepElevation)*Math.PI/180);
      let radiusZ2  = radius*Math.sin((elevation+stepElevation)*Math.PI/180);
      
      for(let angle = 0; angle < 360; angle+= stepAngle)
      {
        
        let px1 = radiusXY*Math.cos(angle*Math.PI/180);
        let py1 = radiusXY*Math.sin(angle*Math.PI/180);
        let pz1 = radiusZ;
        
        let px2 = radiusXY*Math.cos((angle+stepAngle)*Math.PI/180);
        let py2 = radiusXY*Math.sin((angle+stepAngle)*Math.PI/180);
        let pz2 = radiusZ;
        
        let px3 = radiusXY2*Math.cos(angle*Math.PI/180);
        let py3 = radiusXY2*Math.sin(angle*Math.PI/180);
        let pz3 = radiusZ2;
        
        let px4 = radiusXY2*Math.cos((angle+stepAngle)*Math.PI/180);
        let py4 = radiusXY2*Math.sin((angle+stepAngle)*Math.PI/180);
        let pz4 = radiusZ2;
        
        vertexPosition.push(...createRect2(px1,py1,pz1,px2,py2,pz2,px3,py3,pz3,px4,py4,pz4)); // Ściana XZ
      }
    }

    let vertexColor = []; //3 punkty po 3 składowe - R1,G1,B1, R2,G2,B2, R3,G3,B3 - 1 trójkąt
  
    for(let elevation=0; elevation< 360; elevation+= stepElevation)
    {
      for(let angle = 0; angle < 360; angle+= stepAngle)
      {
        vertexColor.push(...createRectColor(1.0,1.0,1.0));
      }
    }


    let vertexCoords = []; //3 punkty po 2 składowe - U1,V1, U2,V2, U3,V3 - 1 trójkąt
  
    for(let elevation = 0; elevation < 360; elevation+= stepElevation)
    {
      for(let angle = 0; angle < 360; angle+= stepAngle)
      {
        vertexCoords.push(...createRectCoords(1,0,0,0,1,1));
      }
    }

    //creating buffers 
    vertexPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW)
    vertexPositionBuffer.itemSize = 3
    vertexPositionBuffer.numItems = vertexPosition.length/9;

    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 3;
    vertexColorBuffer.numItems = vertexColor.length/9;
    

    vertexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoords), gl.STATIC_DRAW);
    vertexCoordsBuffer.itemSize = 2;
    vertexCoordsBuffer.numItems = vertexCoords.length/6;
    

}

function initTexture(url)
{
    textureBuffer = gl.createTexture()

    var textureImg = new Image()
    textureImg.onload = () =>
    {
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    textureImg.src = url
}

function matrixUpdate()
{  
    //matrix multiplying
    function MatrixMul(a,b) 
    {
      let c = [
      0,0,0,0,
      0,0,0,0,
      0,0,0,0,
      0,0,0,0
      ]
      for(let i=0;i<4;i++)
      {
        for(let j=0;j<4;j++)
        {
          c[i*4+j] = 0.0;
          for(let k=0;k<4;k++)
          {
            c[i*4+j]+= a[i*4+k] * b[k*4+j];
          }
        }
      }
      return c;
    }

    //model view matrix
    viewMatrix = [
    1,0,0,0, //identity matrix
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
    ];

    let zRotation = [
    +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
    -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
    0,0,1,0,
    0,0,0,1
    ];

    let yRotation = [
    +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
    0,1,0,0,
    +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
    0,0,0,1
    ];

    let xRotation = [
    1,0,0,0,
    0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
    0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
    0,0,0,1
    ];

    let zTranslation = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,tz,1
    ];
    
    viewMatrix = MatrixMul(viewMatrix,xRotation);
    viewMatrix = MatrixMul(viewMatrix,yRotation);
    viewMatrix = MatrixMul(viewMatrix,zRotation);

    viewMatrix = MatrixMul(viewMatrix,zTranslation);
}

function render()
{
    matrixUpdate()

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
    gl.clearColor(0.0,0.0,0.0,0.1); 
    gl.clearDepth(1.0);             
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shaderProgram)   
    
    gl.enable(gl.DEPTH_TEST);           
    gl.depthFunc(gl.LEQUAL);            
    
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "projectionMatrix"), false, new Float32Array(uPMatrix)); //Uploading the camera matrix to the memory of the graphics card

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "viewMatrix"), false, new Float32Array(viewMatrix));
    
    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aPosition"));  //pass the geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //pass the colors values
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);  

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aCoords"));  //Pass the coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aCoords"), vertexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //draw trinagles

    angleY += 0.5;  //autorotate 

    requestAnimationFrame(render)
}

function camera(afov = 45, far = 100, near = 0.1 )
{
    let aspect = gl.viewportWidth/gl.viewportHeight;
    let fov = afov * Math.PI / 180.0; //Określenie pola widzenia kamery
    let zFar = far; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
    let zNear = near;
    uPMatrix = [
     1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
     0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
     0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
     0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
    ]
}

// camera position
var angleZ = 180.0;
var angleY = 0.0;
var angleX = 0.0;
var tz = -30; //starting camera distance
var distance = tz;

function startGL()
{
    const canvas = document.getElementById('canvas')
    gl = canvas.getContext("experimental-webgl"); 

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    const texture = 'texture.jpg'

    initShaders()
    initBuffers()
    initTexture(texture)
    camera(45)

    render()
}

// controll camera
function handlekeydown(e)
{
 if(e.keyCode==87) angleX=angleX+5.0; //W
 if(e.keyCode==83) angleX=angleX-5.0; //S
 if(e.keyCode==68) angleY=angleY+5.0;
 if(e.keyCode==65) angleY=angleY-5.0;
 if(e.keyCode==81) angleZ=angleZ+5.0;
 if(e.keyCode==69) angleZ=angleZ-5.0;
}

// update camera and canvas on resizing
window.addEventListener('resize', () => 
{
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  //update camera distance based on viewport 
  aspectRatio = canvas.width / canvas.height * 0.5 //viewport ratio from 0 to 1
  tz = aspectRatio > 0.5 ? distance : (1 - aspectRatio) * distance * 2; 

  camera()
})