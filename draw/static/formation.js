$(document).ready(()=>{
  $("#menu").on("click",function () {
      location.href = "/draw/menu/";
  });
  $("#s-formations").on("click", function() { 
      location.href = "/draw/saved_formations/";
  });

  // INITIALIZATION
  var canvas = document.getElementById('myCanvas');
  //Save SVG from paper.js as a file.
  
  paper.setup(canvas);
  var tool = new paper.Tool();
  
  //show formation images function
  function formationPics(){
    $.get("/draw/formation_data").done(function(formation_json) {
      $(".image-container").empty();
      $(".image-container").append("Saved Formations <br>");
      $.each(formation_json, function(form_name, data ) {
      $(".image-container").append("<img id='"+ form_name + "'" +"src=" + data.image + "><br> <b>" + form_name +"</b><hr>");
    }); 
  });
  }
  // load formation images from db
  formationPics();
  
  var dancers = null;
  var circArray = [0]; 
  //Each entry in here is a Paper JS Group containing the Path (Circle) and Text (TextPosition). To get the position, just do circArray[i].position
  // [Group, Group, Group, ...]
  var circToDancer = {};
  var grid = new paper.Group([]);
  //Each entry in here is a key value pair. The key is the group from circArray, and the value is the index of that dancer in the data. 
  // {{Group: 1}, {Group: 2}, ...}
  
  function loadRoster() {
    $.get("/draw/roster_data").done(function(data) {
      dancers = data;
      var roster = "";
      for (var index in dancers) {
        roster += "<option id='dancer" + parseInt(index) + "'>" + parseInt(index) + ". " + dancers[index].name + "</option>";
      }
      document.getElementById("rosterList").innerHTML = roster;
      createDancerList(dancers);
    })
  }
  
  function updateRoster() {
    $.get("/draw/roster_data").done(function(data) {
      dancers = data;
      var roster = "";
      for (var index in dancers) {
        roster += "<option id='dancer" + parseInt(index) + "'>" + parseInt(index) + ". " + dancers[index].name + "</option>";
      }
      document.getElementById("rosterList").innerHTML = roster;
    })
  }
  
  function loadFormation(preset) {
    $.get("/draw/formation_data").done(function(data) { /* Removing the reassignment of dancers, and replaced with modifying attributes.**/
      //dancers = {};
      // [x, y, name, id, color]
      $("#notes").val(data[preset].notes);
      
      updateRoster();
      var tempList = data[preset].positions;
      formationList = {};
      nullVal = -1;
      for (var i = 0; i < tempList.length; i++) {
        temp = tempList[i];
        var dancer_id = temp[3];
        if (formationList[dancer_id]) {
          dancer_id = nullVal;
          nullVal -= 1;
        }
        formationList[dancer_id] = {};
        formationList[dancer_id].position = {};
        formationList[dancer_id].position.x = temp[0];
        formationList[dancer_id].position.y = temp[1];
        if (dancer_id > 0) {
          formationList[dancer_id].name = temp[2];
        }
        formationList[dancer_id].color = temp[4];
      }
      paper.project.activeLayer.removeChildren();
      
      circArray = [0];
      circToDancer = {};
      grid = new paper.Group([]);
      createDancerList(formationList);
    })
  }
  
  loadRoster();
  //loadFormation("Preset 1");
  paper.view.draw();
  
  var selectedCirc = null;
  
  var selectedCircs = new Set();
  var selectedStart = null;
  var selectionComplete = false;
  var selectionBox = null;
  var selectionGroup = null;
 
  var namePopup = new paper.PointText(0,0);
  var popupRect = new paper.Path.Rectangle(namePopup.bounds)
  
  // MOUSE EVENTS    /* Changed tool elements to handle positive if statements, rather than negative **/
  
  tool.onMouseDown = function(event) {
    namePopup.remove();
    popupRect.remove();
    if (document.getElementById("normalCheckBox").selected) {
      normalMouseDown(event);
    }
    if (document.getElementById("groupCheckBox").selected) {
      selectionMouseDown(event);
    }
  }
  
  tool.onMouseUp = function(event) {
    if (document.getElementById("switchCheckBox").selected) {
      switchMouseUp(event);
    }
    if (document.getElementById("groupCheckBox").selected) {
      selectionMouseUp(event);
    }
    if (document.getElementById("colorCheckBox").selected) {
      colorMouseUp(event);
    }
    if (document.getElementById("dancerAssignment").selected) {
      dancerAssignmentMouseUp(event);
    }
    if (document.getElementById("addCheckBox").selected) {
      addCircMouseUp(event);
    }
    if (document.getElementById("removeCheckBox").selected) {
      removeCircMouseUp(event);
    }
    if (!document.getElementById("groupCheckBox").selected && !document.getElementById("switchCheckBox").selected && selectedCirc) {
      deselect();
    }
  }
  
  tool.onMouseDrag = function(event) {
    if (document.getElementById("normalCheckBox").selected && selectedCirc) {
      selectedCirc.position = new paper.Point(gridPoint(event.point));
    }
    if (document.getElementById("groupCheckBox").selected) {
      selectionMouseDrag(event);
    }
  }
  
  tool.onMouseMove = function(event) {
    normalMouseMove(event);
  }
  
  $('.preset').hide();
  document.getElementById("presetCheckBox").addEventListener('change', function() {
    $('.preset').toggle();
  });
  
  document.getElementById("selectionOptions").addEventListener('change', function() { /* Added an event for the color check box. **/
    deselect();
    if (document.getElementById("colorCheckBox").selected) {
      document.getElementById("colorOptions").style.display = "block";
    } else {
      document.getElementById("colorOptions").style.display = "none";
    }
    if (document.getElementById("dancerAssignment").selected) {
      document.getElementById("rosterAssignment").style.display = "block";
    } else {
      document.getElementById("rosterAssignment").style.display = "none";
    }
  });
  
  document.getElementById("gridCheckBox").addEventListener('change', function() {
    if (document.getElementById("gridStep").value < 5) {
      this.checked = false;
    }
    if (this.checked) {
      var gridStep = parseInt(document.getElementById("gridStep").value);
      drawGridLines(gridStep);
    } else {
      grid.removeChildren();
    }
  })
  
  
  // FUNCTIONS
  function createDancerList(dancerList) {
    for (var i in dancerList) {
      var dancer = dancerList[i];
      var x = 40;
      var y = -40 + 80*i;
      if (y + 50 > canvas.height) {
        x = 40 + 40*2*(Math.floor((y+50)/canvas.height));
        y = 15 + (80*i) - canvas.height;
      }
      if (dancer.position) {
        x = parseInt(dancer.position.x);
        y = parseInt(dancer.position.y);
      }
      var circ = new paper.Path.Circle(new paper.Point(x, y), 30);
      
      var color = 'white'
      if (dancer.color) {
        color = dancer.color;
      }
      circ.strokeColor = "black";
      circ.fillColor = color;
      var circText = new paper.PointText(new paper.Point(x, y + 15));
      if (i > 0) {
        circText.content = i;
      }
      circText.fontSize = 40;
      circText.fontFamily = 'Avenir';
      circText.justification = 'center';
      
      var group = new paper.Group([circ, circText]);
      if (i > 0) {
        circToDancer[group] = i;
      }
      circArray.push(group);
    }
  }

  
  function findCirc(event) {
    for (var i = 1; i < circArray.length + 1; i ++) {
      var circ = circArray[i];
      if (!circ) {
        continue;
      }
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
  
  function selectionMouseDown(event) {
    selectionStart = event.point;
    selectionBox = new paper.Path.Rectangle(event.point, event.point);
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
      deselect();
      selectedCircs = new Set();
      selectionComplete = false;
    } else {
      selectionComplete = true;
      selectionGroup = new paper.Group(Array.from(selectedCircs));
      selectionBox.remove();
    }
  }
  
  function switchMouseUp(event) {
    var circIndex = findCirc(event);
    if (selectedCirc) {
      if (circIndex != -1) {
        var tempPos = selectedCirc.position;
        var circ = circArray[circIndex];
        selectedCirc.position = circ.position;
        circ.position = tempPos;
      }
      deselect();
    } else {
      if (circIndex != -1) {
        select(circIndex);
      }
    }
  }
  
  function normalMouseMove(event) {
    var circIndex = findCirc(event);
    namePopup.remove();
    popupRect.remove();
    if (circIndex != -1) {
      var dancerIndex = circToDancer[circArray[circIndex]];
      if (dancerIndex) {
        var dancer = dancers[dancerIndex];
        namePopup = new paper.PointText(event.point);
        namePopup.point.x += 5;
        namePopup.point.y -= 5;
        if (dancer.name) {
          namePopup.content = " " + dancer.name + " "; /* Added the if condition so that we don't get as many errors. **/
        }
        namePopup.fillColor = "white";
        namePopup.fontSize = 20;
        namePopup.fontFamily = 'Avenir';
        popupRect = new paper.Path.Rectangle(namePopup.bounds);
        popupRect.fillColor = 'black';
        popupRect.strokeColor = 'black';
        namePopup.insertAbove(popupRect);
      }
      
    }
  }
  
  function colorMouseUp(event) {      /* The color mouse up event. **/
    var circIndex = findCirc(event);
    if (circIndex != -1) {
      var circ = circArray[circIndex];
      for (var i = 0; i < document.getElementById("colorList").children.length; i++) {
        if (document.getElementById("color" + i).selected) {
          circ.children[0].fillColor = document.getElementById("color" + i).style.backgroundColor;
        }
      }
    }
  }
  
  function dancerAssignmentMouseUp(event) {   /* The dancer assignment mouse up event. **/
    var circIndex = findCirc(event);
    if (circIndex != -1) {
      var circ = circArray[circIndex];
      for (var index in dancers) {
        if (document.getElementById("dancer" + index).selected) {
          circToDancer[circ] = index;
          circ.children[1].content = index;
          circ.children[1].justification = 'center';
        }
      }
    }
  }
  
  function addCircMouseUp(event) {
    var circ = new paper.Path.Circle(event.point, 30);
    circ.strokeColor = "black";
    circ.fillColor = 'white';
    var circText = new paper.PointText(event.point);
    circ.position.y -= 15;
    circText.content = "";
    circText.fontSize = 40;
    circText.justification = 'center';
    var group = new paper.Group([circ, circText]);
    circArray.push(group);
  }
  
  function removeCircMouseUp(event) {
    var circIndex = findCirc(event);
    if (circIndex != -1) {
      var circ = circArray[circIndex];
      delete circToDancer[circ];
      circ.remove();
      circArray.splice(circIndex, 1);
    }
  }
  
  function select(circIndex) {
    selectedCirc = circArray[circIndex];
    selectedCirc.selected = true;
    selectedCirc.children[1].selected = false;
    selectedCircs.add(selectedCirc);
  }
  
  function deselect() {
    for (var i = 1; i < circArray.length; i++) {
      circArray[i].selected = false;
    }
    selectedCirc = null;
    selectedCircs = new Set();
  }
  
  function gridPoint(point) {
    var gridStep = document.getElementById("gridStep").value;
    var x = Math.floor(point.x/gridStep)*gridStep;
    var y = Math.floor(point.y/gridStep)*gridStep;
    return new paper.Point(x, y)
  }
  
  function dynamicSelection(event) {
    deselect();
    for (var i = 1; i < circArray.length; i++) {
      var circ = circArray[i];
      var box = new paper.Rectangle(selectionStart, event.point);
      if (circ.position.isInside(box)) {
        select(i);
      }
    }
  }
  
  function drawGridLines(stepSize) {
    var x = 0;
    while (x < canvas.width) {
      x += stepSize;
      var topPoint = new paper.Point(x, 0);
      var botPoint = new paper.Point(x, canvas.height);
      var vline = new paper.Path.Line(topPoint, botPoint);
      vline.strokeColor = 'black';
      grid.addChild(vline);
    }
    var y = 0;
    while (y < canvas.height) {
      y += stepSize;
      var leftPoint = new paper.Point(0, y);
      var rightPoint = new paper.Point(canvas.width, y);
      var hline = new paper.Path.Line(leftPoint, rightPoint);
      hline.strokeColor = 'black';
      grid.addChild(hline);
    }
  }
  
  
  
  // save formation button functionality/ adding data in django db
  $("#save").on("click", function(){ 
    var dataURL = canvas.toDataURL();
    var formation_data = {fname: $("#finput").val(), csrfmiddlewaretoken: csrf_thing, action: 'save', image: dataURL ,'notes': $("#notes").val()};
    var length_circArray = circArray.length;
    var positions = [];
    for (var i = 1; i < length_circArray; i++){
      /* Start of QM's added code **/
      var x = circArray[i].children[0].position.x;
      var y = circArray[i].children[0].position.y;
      var color = circArray[i].children[0].fillColor.toCanvasStyle();
      var dancer_id = circToDancer[circArray[i]];
      var dancer_firstName = "";
      if (dancer_id) {
        dancer_firstName = dancers[dancer_id].name;
      }
      
      positions.push([x, y, color, dancer_firstName]);
      /* End of QM's added code **/
      //positions.push([circArray[i].children[0].position.x, circArray[i].children[0].position.y, circArray[i].children[0].fillColor.toCanvasStyle()]);
    }
    formation_data.positions = JSON.stringify(positions);
    console.log(formation_data);
    $.post("/draw/formation_data/", 
           formation_data, (callback_data) => {
           formationPics();
    });
    return false;
  });
  
  // delete formation
  $("#delete").on("click", ()=>{
    var dataURL = canvas.toDataURL();
    var formation_data = {fname: $("#finput").val(), csrfmiddlewaretoken: csrf_thing, action: 'delete', image: dataURL ,'notes': $("#notes").val()};
    $.post("/draw/formation_data/", 
           formation_data, (callback_data) => {
           formationPics();
    });
    return false;
  });
  
  // load formations from images
  $("body").on("click", "img", function(){
    loadFormation(this.id); 
    console.log("Image selected with id:" + this.id);
  });
    //Fill Color: circArray[i].children[0].fillColor.toCanvasStyle()
    //Position: circArray[i].children[0].position
    //Dancer Index: circToDancer[circArray[i]]   circToDancer = {group:1, ..}
    //Dancer Name: data[Dancer Index]
    //Dancer Number: Dancer Index
      
});
//https://cors-anywhere.herokuapp.com/