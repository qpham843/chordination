$(document).ready(()=>{
 
  // INITIALIZATION
  var canvas = document.getElementById('myCanvas');
  var tool = new paper.Tool();
  paper.setup(canvas);
  var socket = new WebSocket('wss://p3-websockets-qpham843-qpham843667163.codeanyapp.com/ws/draw');
  var circArray = [];
  var circTextArray = [];
  var numDancers = 10;
  
  createDotList(numDancers);
  paper.view.draw();
  
  var selectedCirc = null;
  var selectedCircText = null;
  
  // MOUSE EVENTS
  
  tool.onMouseDown = function(event) {
    event.stopPropagation();
    if (!document.getElementById("switchCheckBox").checked) {
      normalMouseDown(event);
    }
  }
  
  tool.onMouseUp = function(event) {
    if (document.getElementById("switchCheckBox").checked) {
      switchMouseUp(event);
    } else if (selectedCirc) {
      deselect();
    }
  }
  
  tool.onMouseDrag = function(event) {
    event.stopPropagation();
    if (!document.getElementById("switchCheckBox").checked) {
      selectedCirc.position = new paper.Point(gridPoint(event.point));
      selectedCircText.position = new paper.Point(gridPoint(event.point));
    }
  }
  
  
  // FUNCTIONS
  
  function createDotList(numDancers) {
    for (var i = 0; i < numDancers; i ++) {
      var circ = new paper.Path.Circle(new paper.Point(40, 40 + 80*i), 30);
      circ.fillColor = 'red';
      circ.strokeColor = '#000000';
      var circText = new paper.PointText(new paper.Point(40-10, (40 + 80*i)+15));
      circText.content = i;
      circText.fontSize = 40;
      
      circArray.push(circ);
      circTextArray.push(circText);
    }
  }
  
  function findCirc(event) {
    for (var i = 0; i < circArray.length; i++) {
      var circ = circArray[i];
      var hit = circ.hitTest(event.point, { tolerance: 0, fill: true });
      if (hit) {
        return i;
      }
    }
    return -1;
  }
  
  function normalMouseDown(event) {
    var circIndex = findCirc(event);
    if (circIndex != -1) {
      select(circIndex);
    }
  }
  
  function switchMouseUp(event) {
    var circIndex = findCirc(event);
    if (selectedCirc) {
      if (circIndex != -1) {
        var tempPos = selectedCirc.position;
        var circ = circArray[circIndex];
        var circText = circTextArray[circIndex];
        selectedCirc.position = circ.position;
        selectedCircText.position = circText.position;
        circ.position = tempPos;
        circText.position = tempPos;
      }
      deselect();
    } else {
      if (circIndex != -1) {
        select(circIndex);
      }
    }
  }
  
  function select(circIndex) {
    selectedCirc = circArray[circIndex];
    selectedCirc.selected = true;
    selectedCircText = circTextArray[circIndex];
  }
  
  function deselect() {
    selectedCirc.selected = false;
    selectedCirc = null;
    selectedCircText = null;
  }
  
  function gridPoint(point) {
    var gridStep = document.getElementById("gridStep").value;
    var x = Math.floor(point.x/gridStep)*gridStep;
    var y = Math.floor(point.y/gridStep)*gridStep;
    return new paper.Point(x, y)
  }
});