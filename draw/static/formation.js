$(document).ready(()=>{
  document.getElementById("menu").onclick = function () {
      location.href = "http://p3-websockets-qpham843-qpham843667163.codeanyapp.com/draw/menu/";
  };  

  var dancers = '{"dancers":[' +
  '{"name":"John","number":"1" },' +
  '{"name":"Anna","number":"2" },' +
  '{"name":"Doe","number":"3" },' +
  '{"name":"Smith","number":"4" },' +
  '{"name":"Elissa","number":"5" },' +
  '{"name":"Aeden","number":"6" },' +
  '{"name":"Sarah","number":"7" },' +
  '{"name":"Steven","number":"8" },' +
  '{"name":"Jean","number":"9" },' +
  '{"name":"Conny","number":"10" },' +
  '{"name":"Peter","number":"11" }]}';
  
  var tempDancers = '{"dancers":[' +
  '{"name":"John","number":"1","position":[123,123],"color":"#808080" },' +
  '{"name":"Anna","number":"2","position":[321,321],"color":"#ffffff" }]}';
  
  // INITIALIZATION
  var canvas = document.getElementById('myCanvas');
  var tool = new paper.Tool();
  paper.setup(canvas);
  var socket = new WebSocket('wss://p3-websockets-qpham843-qpham843667163.codeanyapp.com/ws/draw');
  var circArray = [];
  var circTextArray = [];
  var circToDancer = {};
  
  createDancerList(dancers);
  paper.view.draw();
  
  var selectedCirc = null;
  var selectedCircText = null;
  
  var selectedCircs = new Set();
  var selectedStart = null;
  var selectionComplete = false;
  var selectionBox = null;
  var selectionGroup = null;
  
  // MOUSE EVENTS
  
  tool.onMouseDown = function(event) {
    if (!document.getElementById("switchCheckBox").checked && !document.getElementById("groupCheckBox").checked) {
      normalMouseDown(event);
    }
    if (document.getElementById("groupCheckBox").checked) {
      selectionMouseDown(event);
    }
    if (document.getElementById("presetCheckBox").checked) {
      presetMouseDown(event);
    }
  }
  
  tool.onMouseUp = function(event) {
    if (document.getElementById("switchCheckBox").checked) {
      switchMouseUp(event);
    } else if (document.getElementById("groupCheckBox").checked) {
      selectionMouseUp(event);
    }  else if (selectedCirc) {
      deselect();
    } 
  }
  
  tool.onMouseDrag = function(event) {
    if (!document.getElementById("switchCheckBox").checked && !document.getElementById("groupCheckBox").checked) {
      selectedCirc.position = new paper.Point(gridPoint(event.point));
      selectedCircText.position = new paper.Point(gridPoint(event.point));
    } else if (document.getElementById("groupCheckBox").checked) {
      selectionMouseDrag(event);
    }
  }
  
  // FUNCTIONS
  function createDancerList(dancers) {
    var dancerList = JSON.parse(dancers).dancers;
    for (var i = 0; i < dancerList.length; i ++) {
      var dancer = dancerList[i];
      var x = 40;
      var y = 40 + 80*i;
      if (dancer.position) {
        x = parseInt(dancer.position[0]);
        y = parseInt(dancer.position[1]);
      }
      var circ = new paper.Path.Circle(new paper.Point(x, y), 30);
      
      var color = 'white'
      if (dancer.color) {
        color = dancer.color;
      }
      circ.fillColor = color;
      circ.strokeColor = '#000000';
      
      var circText = new paper.PointText(new paper.Point(x-10, y+15));
      circText.content = dancer.number;
      circText.fontSize = 40;
      circToDancer[circ] = i;
      circArray.push(new paper.Group([circ, circText]));
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
      circTextArray[circIndex].selected = false;
    }
  }
  
  function selectionMouseDown(event) {
    selectionStart = event.point;
    selectionBox = new paper.Path.Rectangle(event.point, event.point);
  }
 
  function presetMouseDown(event) {
    var preset = document.getElementById('preset');
    preset.style.display = "none";
  }
  
  function selectionMouseDrag(event) {
    if (selectionComplete) {
      var hit = selectionGroup.hitTest(event.point, { tolerance: 100, fill: true });
      if (hit) {
        selectionGroup.position = event.point;
      }
    } else {
      selectionBox.remove();
      selectionBox = new paper.Path.Rectangle(selectionStart, event.point);
      selectionBox.strokeColor = "black";
      selectionBox.dashArray = [4,10];
      dynamicSelection(event);
    }
  }
  
  function selectionMouseUp(event) {
    if (selectionComplete) {
      // Then deselect all and delete group.
      deselect();
      selectedCircs = new Set();
      selectionComplete = false;
    } else {
      selectionComplete = true;
      selectionGroup = new paper.Group(Array.from(selectedCircs));
      selectionBox.remove();
      // Then complete selection and create group.
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
    circTextArray[circIndex].selected = false;
    selectedCircText = circTextArray[circIndex];
    selectedCircs.add(selectedCirc);
    var dancerList = JSON.parse(dancers).dancers;
    var dancer = dancerList[circIndex];
    document.getElementById("Name").innerHTML = "<strong>Name: </strong>" + dancer.name;
    document.getElementById("Number").innerHTML = "<strong>Number: </strong>" + dancer.number;
  }
  
  function deselect() {
    for (var i = 0; i < circArray.length; i++) {
      circArray[i].selected = false;
    }
    selectedCirc = null;
    selectedCircText = null;
    selectedCircs = new Set();
    document.getElementById("Name").innerHTML = "Name: ";
    document.getElementById("Number").innerHTML = "Number: ";
  }
  
  function gridPoint(point) {
    var gridStep = document.getElementById("gridStep").value;
    var x = Math.floor(point.x/gridStep)*gridStep;
    var y = Math.floor(point.y/gridStep)*gridStep;
    return new paper.Point(x, y)
  }
  
  function dynamicSelection(event) {
    deselect();
    for (var i = 0; i < circArray.length; i++) {
      var circ = circArray[i];
      var box = new paper.Rectangle(selectionStart, event.point);
      if (circ.position.isInside(box)) {
        select(i);
      }
    }
  }
});