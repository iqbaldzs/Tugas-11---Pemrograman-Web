var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');

if (!gl) { 
    console.log('Browser tidak mendukung WebGL'); 
} else { 
    console.log('Browser mendukung WebGL.'); 
}

const canvasWidth = 650;
const canvasHeight = 650;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

gl.viewport(0, 0, canvas.width, canvas.height);

gl.clearColor(0.4343, 0.2422, 0.3343, 1.0); 
gl.clear(gl.COLOR_BUFFER_BIT);

var vertexShaderSource = `
    attribute vec2 a_position;
    uniform float u_rotationAngle;
    
    void main() {
        float c = cos(u_rotationAngle);
        float s = sin(u_rotationAngle);
        mat2 rotationMatrix = mat2(c, -s, s, c);
        
        vec2 rotatedPosition = rotationMatrix * a_position;
        
        gl_Position = vec4(rotatedPosition, 0.0, 1.0);
    }
`;

var fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() { 
        gl_FragColor = u_color;
    }
`;

var vShader = gl.createShader(gl.VERTEX_SHADER); 
gl.shaderSource(vShader, vertexShaderSource); 
gl.compileShader(vShader);

var fShader = gl.createShader(gl.FRAGMENT_SHADER); 
gl.shaderSource(fShader, fragmentShaderSource); 
gl.compileShader(fShader);

var shaderProgram = gl.createProgram(); 
gl.attachShader(shaderProgram, vShader); 
gl.attachShader(shaderProgram, fShader); 
gl.linkProgram(shaderProgram); 
gl.useProgram(shaderProgram);

var rotationAngle = 0;
var rotationSpeed = 0.1;
var time = 0;

var defaultColor = [0.0, 0.5, 1.0, 1.0];
var colorLocation = gl.getUniformLocation(shaderProgram, 'u_color');
gl.uniform4fv(colorLocation, defaultColor);

function drawBlades(rotationAngle, centerX, centerY) {
    var numBlades = 4;
    var angleIncrement = (2 * Math.PI) / numBlades;

    for (var i = 0; i < numBlades; i++) {
        var angle = rotationAngle + i * angleIncrement;

        var center = [centerX, centerY];

        var p1 = [Math.cos(angle) * 0.05 + center[0], Math.sin(angle) * 0.05 + center[1]];
        var p2 = [Math.cos(angle + angleIncrement) * 0.15 + center[0], Math.sin(angle + angleIncrement) * 0.15 + center[1]];
        var p3 = [center[0], center[1]];

        var vertices = [center[0], center[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]];

        var vBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var positionLocation = gl.getAttribLocation(shaderProgram, 'a_position'); 
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0); 
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); 
    }
}

function drawCircles() {
    var numCircles = 4;
    var radius = 0.3;

    for (var i = 0; i < numCircles; i++) {
        var angle = (i / numCircles) * 2 * Math.PI + rotationAngle;
        var centerX = Math.cos(angle) * 0.8;
        var centerY = Math.sin(angle) * 0.8;

        var vertices = [];
        for (var j = 0; j <= 360; j += 10) {
            var radians = j * Math.PI / 180;
            var x = centerX + radius * Math.cos(radians);
            var y = centerY + radius * Math.sin(radians);
            vertices.push(x, y);
        }

        var vBuffer = gl.createBuffer(); 
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var positionLocation = gl.getAttribLocation(shaderProgram, 'a_position'); 
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0); 
        gl.drawArrays(gl.LINE_LOOP, 0, vertices.length / 2); 
    }
}

function updatePosition() { 
    rotationAngle += rotationSpeed; 
    time += 0.03;

    var horizontalPosition = Math.cos(time) * 0.8;
    var verticalPosition = Math.sin(time) * 0.2;

    return [horizontalPosition, verticalPosition];
}

function animateBlades() { 
    gl.clear(gl.COLOR_BUFFER_BIT);
    var [horizontalPosition, verticalPosition] = updatePosition();
    
    drawBlades(rotationAngle, horizontalPosition, verticalPosition); 
    drawCircles();

    requestAnimationFrame(animateBlades);
}

document.addEventListener('keydown', handleSpaceKeyDown);

animateBlades();

function handleSpaceKeyDown(event) {
    if (event.code === 'Space') {
        rotationSpeed = -rotationSpeed;
        var newColor = generateRandomColor();
        gl.uniform4fv(colorLocation, newColor);
    }
}

function generateRandomColor() {
    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    return [r, g, b, 1.0];
}
