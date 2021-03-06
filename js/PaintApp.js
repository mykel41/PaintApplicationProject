
//global variables
var canvas;
var context;

//this variable stores the name of the
//current shape the user is interested in drawing.
var currentShape;

//a flag to indicate whether the mouse button has been
// held down prior to dragging
var isDragging = false;

//variable to store the point at which dragging started
var dragStartPoint = 0;

//variable to store the point at which dragging stopped
var dragStopPoint = 0;

//variable to store a snapshot of the canvas
var snapshot;

/*
 * The setup function initializes all variables 
 * and event listeners that will be required 
 * throughout the use of the app
 */
function setup() {
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.lineCap = 'round';

  //add event listeners to the canvas element
  canvas.addEventListener('mousedown', onDragStart, false);
  canvas.addEventListener('mousemove', onDrag, false);
  canvas.addEventListener('mouseup', onDragStop, false);
}

/*
 * 
 * @param {type} event
 * @returns {PaintApp.getMouseCoordinates.canvasCoords}
 * The getMouseCoordinates method is a helper method that
 * calculates the correct of the mouse relative 
 * to the canvas origin
 */
function getMouseCoordinates(event) {
  var xCoord = event.clientX - canvas.getBoundingClientRect().left;
  var yCoord = event.clientY - canvas.getBoundingClientRect().top;

  //create an object to store the canvas coordinates
  var canvasCoords = {x: xCoord, y: yCoord};
  return canvasCoords;
}

/*The function dynamically sets the stroke value
 * for the brush
 * 
 * @returns {undefined}
 */
function setLineWidth(){
  var value = document.getElementById('strokeBox').value;
  value = parseInt(value);
  context.lineWidth = value;
}
/*
 *This function required the current mouse position
 *as a parameter and uses it to draw a straight line.
 *The line starts drawing from the point the mouse button
 *is held down till it is released. 
 * @param {type} mousePosition
 * @returns {undefined}
 */
function drawLine(mousePosition) {
  context.beginPath();
  context.moveTo(dragStartPoint.x, dragStartPoint.y);
  context.lineTo(mousePosition.x, mousePosition.y);
}

/*
 * Calculates the straight line distance between 
 * 2 cartesian coordinates
 * @param {type} mousePosition
 * @returns {Number}
 */
function getDistanceBetweenPoints(mousePosition) {
  return Math.sqrt(
          Math.pow((dragStartPoint.x - mousePosition.x), 2) + Math.pow((dragStartPoint.y - mousePosition.y), 2)
          );
}

/*
 * The drawSemiCircle method simple renders a semi circle
 * @param {type} mousePosition
 * @returns {undefined}
 */
function drawSemiCircle(mousePosition) {
  var radius = getDistanceBetweenPoints(mousePosition);
  context.beginPath();
  context.arc(dragStartPoint.x, dragStartPoint.y, radius, 0, Math.PI, false);
  context.closePath();
}

/*
 * The drawCircle function requires a parameter which is
 * the current mouse position. Using a formula for calculating
 * the distance between two points, we can deduce the radius of 
 * resulting circle that should be drawn.
 * @param {type} mousePosition
 * @returns {undefined}
 */
function drawCircle(mousePosition) {
  //(The radius is same as the distance between 
  //the dragStart and dragStop
  var radius = getDistanceBetweenPoints(mousePosition);
  context.beginPath();
  context.arc(dragStartPoint.x, dragStartPoint.y, radius, 0, 2 * Math.PI, false);
}

/*
 * The drawRectangle function renders a rectangle based
 * on the startpoint and end point of the mouse drag.
 * @param {type} mousePosition
 * @returns {undefined}
 */
function drawRectangle(mousePosition) {
  //fetch the width of the rectangle by substracting the
  //current mouse position from the point where mouse drag
  //commenced
  var width = mousePosition.x - dragStartPoint.x;
  //similar process for the height of the rectangle
  var height = mousePosition.y - dragStartPoint.y;

  context.beginPath();
  context.clearRect(dragStartPoint.x, dragStartPoint.y, width, height);
  context.rect(dragStartPoint.x, dragStartPoint.y, width, height);
}

/*
 * The drawPolygon function is a reusable function
 * that can render any shape irrespective of the number
 * of sides
 * @param {type} mousePosition
 * @param {type} sides
 * @param {type} angle
 * @returns {undefined}
 */
function drawPolygon(mousePosition, sides, angle) {
  var coordinates = [];
  //to draw any shape we will have to inscribe that shape
  //in a circle. Hence we need to have a radius for the circle
  var radius = Math.sqrt(Math.pow((dragStartPoint.x - mousePosition.x), 2) + Math.pow((dragStartPoint.y - mousePosition.y), 2));

  //determine the coordinates of the edges of the shape
  //so as to be able to draw a lines to connect these points
  for (var index = 0; index < sides; index++) {
    coordinates.push({x: dragStartPoint.x + radius * Math.cos(angle), y: dragStartPoint.y + radius * Math.sin(angle)});
    angle += (2 * Math.PI) / sides;
  }

  context.beginPath();
  context.moveTo(coordinates[0].x, coordinates[0].y);
  //draw lines to connect all the points
  for (var index = 1; index < sides; index++) {
    context.lineTo(coordinates[index].x, coordinates[index].y);
  }

  context.closePath();
}

/*
 * drawShape is a helper method that enables 
 * us to dynamically choose what kind
 * of shape we want to draw.
 * @param {type} mousePosition
 * @returns {undefined}
 */
function drawShape(mousePosition) {
  switch (currentShape) {
    case 'line':
      drawLine(mousePosition);
      break;
    case 'semicircle':
      drawSemiCircle(mousePosition);
      break;
    case 'circle':
      drawCircle(mousePosition);
      break;
    case 'triangle':
      drawPolygon(mousePosition, 3, 0.65 * Math.PI / 4);
      break;
    case 'rectangle':
      drawRectangle(mousePosition);
      break;
    case 'pentagon':
      drawPolygon(mousePosition, 5, 1.15 * Math.PI / 4);
      break;
    case 'hexagon':
      drawPolygon(mousePosition, 6, 0.65 * Math.PI / 4);
      break;
    default:
      drawLine(mousePosition);
  }
  var fill = document.getElementById('fillBox');

  //fill the shape if the fill checkbox is checked
  if (fill.checked && currentShape !== 'line') {
    context.fillStyle = document.getElementById('colorBox').value;
    setLineWidth();
    context.fill();
  } else {
    setLineWidth();
    context.strokeStyle = document.getElementById('colorBox').value;
    context.stroke();
  }
}
/*
 * The takeSnapshot function captures an image
 * of the canvas along with the bitmap drawn on it
 * @returns {undefined}
 */
function getCanvasSnapShot() {
  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

/*
 * The redrawSnapshot function takes the image stored in
 * the snapshot variable and draws it again on the screen
 * @returns {undefined}
 */
function redrawSnapshot() {
  context.putImageData(snapshot, 0, 0);
}

/*
 * This functions enables us to update
 * the value of the currentShape variable
 * @param {type} shape
 * @returns {undefined}
 */
function setCurrentShape(shape) {
  currentShape = shape;
}
/*
 * The onDragStart method is called once the mouse 
 * button is pressed down within the canvas
 */
function onDragStart(event) {
  isDragging = true;
  dragStartPoint = getMouseCoordinates(event);

  //as soon as the mouse starts moving we need to 
  //take a snapshot of the canvas and store the image
  getCanvasSnapShot();
}

/*
 * The onDrag method is called repeatedly while 
 * the mouse is being moved around within the canvas
 */
function onDrag(event) {
  if (isDragging) {

    //while dragging the mouse we need to
    //restore the snapshot of the previous image
    //so that we do not have multiple lines
    redrawSnapshot();

    drawShape(getMouseCoordinates(event));
  }
}

/*
 * The onDragStop method is called when the mouse
 * button is released.
 */
function onDragStop(event) {
  isDragging = false;
  //we are redrawing the snapshot for the same reason
  //as in the onDrag() function
  redrawSnapshot();
  drawShape(getMouseCoordinates(event));
}

/*
 * This function creates a snapshot of the canvas image
 * and displays it on a new window
 */
function saveImage() {
  var data = canvas.toDataURL();
  window.open(data, '_blank', 'location=0, menubar=0');
}
//Test program
setup();