var colors = {
    artery: "#DD0000",
    vein: "#336699",
    general: "#ff8181",
}
var heartPartsInfo = {
    folder: "models/heart/",
    parts: [
        {
            "file": "Anterior Papillary Muscle of Right Ventricle.obj",
            "name": "Anterior Papillary Muscle of Right Ventricle",
            "color": colors.general,
            "description": "Papillary muscle of right venricle which is attached to the wall of right ventricle below the anteroposterior commissure of tricuspid valve and the septomarginal trabecula. "
        },
        {
            "file": "Circumflex branch of left coronary artery.obj",
            "name": "Circumflex branch of left coronary artery",
            "color": colors.artery,
            "description": "Branch of left coronary artery which runs perpendicular to the anterior interventricular branch of the left coronary artery on the left side of the interventricular sulcus and supplies the left side of the heart. "
        },
        {
            "file": "Coronary sinus.obj",
            "name": "Coronary sinus",
            "color": colors.vein,
            "description": "N/A"
        },
        {
            "file": "Great cardiac vein.obj",
            "name": "Great cardiac vein",
            "color": colors.vein,
            "description": "N/A"
        },
        {
            "file": "Marginal branch of right coronary artery.obj",
            "name": "Marginal branch of right coronary artery",
            "color": colors.artery,
            "description": "Anterior ventricular branch of right coronary artery which runs downward along the the acute margin and supplies the anterior wall of right ventricle and the apex. "
        },
        {
            "file": "Mitral valve.obj",
            "name": "Mitral valve",
            "color": colors.general,
            "description": "Atrioventricular valve which has as its parts the anterior and posterior leaflets, attached to the fibrous ring of mitral valve. "
        },
        {
            "file": "Posterior papillary muscle of left ventricle.obj",
            "name": "Posterior papillary muscle of left ventricle",
            "color": colors.general,
            "description": "Papillary muscle of left ventricle which has as its parts the posteromedial and anterior heads of the posterior papillary muscle of left ventricle and is continuous with the inferior wall of left ventricle.. "
        },
        {
            "file": "Posterior papillary muscle of right ventricle.obj",
            "name": "Posterior papillary muscle of right ventricle",
            "color": colors.general,
            "description": "Papillary muscle of right ventricle which is attached to the wall of right ventricle below the posteroseptal commissure of tricuspid valve. "
        },
        {
            "file": "Pulmonary valve.obj",
            "name": "Pulmonary valve",
            "color": colors.general,
            "description": "Cardiac valve which has as its parts the right anterior, left anterior and posterior cusps, attached to the fibrous ring of pulmonary valve. "
        },
        {
            "file": "Right posterolateral branch of right coronary artery.obj",
            "name": "Right posterolateral branch of right coronary artery",
            "color": colors.artery,
            "description": "N/A"
        },
        {
            "file": "Septal papillary muscle of right ventricle.obj",
            "name": "Septal papillary muscle of right ventricle",
            "color": colors.general,
            "description": "Papillary muscle of right ventricle which is attached to the septomarginal trabecula. "
        },
        {
            "file": "Tricuspid valve.obj",
            "name": "Tricuspid valve",
            "color": colors.general,
            "description": "Atrioventricular valve which has as its parts the anterior, posterior and septal leaflets, attached to the fibrous ring of tricuspid valve. "
        },
        {
            "file": "Trunk of right coronary artery.obj",
            "name": "Trunk of right coronary artery",
            "color": colors.artery,
            "description": "N/A"
        },
        {
            "file": "Wall of heart.obj",
            "name": "Wall of heart",
            "color": colors.general,
            "description": "Wall of organ which has as its parts the endocardium, myocardium , epicardium, and the cardiac septum, surrounded by the pericardial sac proper and is continuous with the walls of the systemic and pulmonary arterial and venous trees. "
        }
    ],
};

Template.heartLesson.onRendered(function () {
    Utils.waitForScene(function () {
        // Detect when player is looking left and right
        var sceneEl = $("a-scene").get(0)
        var cameraEl = sceneEl.camera.el;

        var controller = LeapUtils.createController();

        setupHeart(controller);
        setupVisuals(cameraEl);
        CameraUtils.setupLookEvents();
        setupHUD(sceneEl);
        
        var pin = new Pin();
        pin.position.set(0, 1.8, -1);
        pin.rotation.set(0, 0, -90);
        Utils.sceneEl.object3D.add(pin);
        
        setupTouchEvents(pin);
        
        var trash = new Trash($(".trash").get(0), true);
        setupTasks()
    });
});

function setupTasks() {
    var tasks = [
        {
            title: "Pick up the heart",
            description: "Use your left hand to pick up the heart, then drop it above the table",
        },
        {
            title: "Resize the heart",
            description: "To enter resize mode, grab the heart with your left hand then grab the heart with your right hand. Once in resize mode, make the heart as big as you can.",
        },
        {
            title: "Remove the wall of the heart",
            description: "Use your right hand to grab the wall of the heart and place it in the trash.",
        },
        {
            title: "Pin the pulmonary valves",
            description: "Grab the yellow pin. Place the pin in the pulmonary valves.",
        },
    ];
    
    var taskMenu = new TasksMenu(".taskMenu", "Heart Lesson 1", tasks);
    
    var taskOneEventHander = function (e) {
        if(e.originalEvent.detail.state != "hand.grabbing")
            return;
            
        if(TouchInfo.leftHand.toucherHand.isGrabbing()) {
            taskMenu.next();
            $(".heartContainer").on("stateremoved", taskTwoEventHander);
        }

        $(".heartContainer").off("stateadded", taskOneEventHander);
    };
    $(".heartContainer").on("stateadded", taskOneEventHander);
    
    var taskTwoEventHander = function (e) {
        if(e.originalEvent.detail.state != "hand.grabbing")
            return;

        if(!TouchInfo.leftHand.toucherHand.isGrabbing())
            return;

        var box = new THREE.Box3().setFromObject(TouchInfo.leftHand.toucherHand.grabbedObj);
        var boxSize = box.size();
        var maxDimension = Math.max(boxSize.x, Math.max(boxSize.y, boxSize.z));
        if(maxDimension > 1) {
            taskMenu.next();
            $(".heartContainer").off("stateremoved", taskTwoEventHander);
            $(".model[name='Wall of heart']").on("stateadded", taskThreeEventHandler);
        }
    };
    
    var taskThreeEventHandler = function (e) {
        if(e.originalEvent.detail.state != "trashed")
            return;
            
        taskMenu.next();
        $(".model[name='Wall of heart']").off("stateadded", taskThreeEventHandler);
    }
}

function setupHeart(controller) {
    var modelData = ModelUtils.load(heartPartsInfo, ".heartContainer", controller, 0.2);

    // Add Heart parts
    heartPartsInfo.parts.forEach(function (partInfo) {
        partInfo.organNameElement = $('<a-entity class="organName" visible="false" text="text: ' + partInfo.name + '" scale="0.05 0.05 0.05" material="color: black" width="1" height="0.5"></a-entity>')
        $(".organNames").append(partInfo.organNameElement)
    });

    $(".heartContainer .model")
    .on("stateadded", function (e) {
        if (modelData.selectedPartElement == null && e.originalEvent.detail.state == "pointerHovered") {
            // Update the HUD
            var organNameElement = $(modelData.highlightedPartElement).data("partInfo").organNameElement.get(0);
            updateHUDOrganName(organNameElement)
            organNameElement.setAttribute("visible", "true");
        }
        else if (e.originalEvent.detail.state == "selected")
            showDescription(modelData.selectedPartElement)
        else if (e.originalEvent.detail.state == "trashed")
            $(this).data("partInfo").organNameElement.get(0).setAttribute("visible", "false");
    })
    .on("stateremoved", function (e) {
        if (modelData.selectedPartElement == null && e.originalEvent.detail.state == "pointerHovered") 
            $(this).data("partInfo").organNameElement.get(0).setAttribute("visible", "false");
        else if(e.originalEvent.detail.state == "selected")
            hideDescription();
    })
}

function setupVisuals(cameraEl) {
    // Top
    /*
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "taskHeader",
		"images/heartLesson/taskCard.png",
		"0 1.95 0",
		"0 26 0",
		0.5,
		1746,
		246
	);*/

    // Left
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "taskDescription",
		"images/heartLesson/mainCard.png",
		"0 -0.1 0",
		"0 217 0",
		4,
		1674,
		2204
	);
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "quizIcon taskIcon",
		"images/heartLesson/quizIcon.png",
		"0 0.9 -0.01",
		"0 214 0",
		0.5,
		400,
		400
	);
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "soundIcon taskIcon",
		"images/heartLesson/soundIcon.png",
		"0 0.3 -0.01",
		"0 214 0",
		0.5,
		400,
		400
	);
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "simIcon taskIcon",
		"images/heartLesson/simIcon.png",
		"0 -0.3 -0.01",
		"0 214 0",
		0.5,
		400,
		400
	);
    $(cameraEl).on("lookingLeftStart", function () {
        $(".taskIcon").each(function () {
			$(this).get(0).emit("slideRight");
		});
    })
    .on("lookingLeftEnd", function () {
		$(".taskIcon").each(function () {
			$(this).get(0).emit("slideLeft");
		});
    });

    // Right
    DisplayUtils.addCurvedImageToContainer(
		"heartLessonCurvedImageContainer",
        "bodyImage",
		"images/heartLesson/body.png",
		"0 0 0",
		"0 124 0",
		3.8,
		1418,
		2960
	);
}

function setupHUD(sceneEl) {
	var hud = $(".hud").get(0);
	hud.object3D.parent.updateMatrixWorld();
	THREE.SceneUtils.attach( hud.object3D, sceneEl.object3D, sceneEl.camera.el.object3D );
}

function setupTouchEvents(pin) {
    controller.use("leap-motion-hand-grabbing", { leftHand: true, rightHand: true, debug: false });
    controller.use("leap-motion-hand-resizing");
    
    $(".heartContainer .model").on("model-loaded", function (e) {
        // Right hand grabs parts
        TouchInfo.rightHand.add( $(this).get(0).object3D,
            function (mesh, part) {
                if(TouchInfo.leftHand.toucherHand.isGrabbing()) {
                    var parent = part.parent;
                    while(parent && parent != TouchInfo.leftHand.toucherHand.grabbedObj)
                        parent = parent.parent;
                        
                    if(parent)
                        return TouchInfo.leftHand.toucherHand.grabbedObj;
                }
                
                return part;
            } );
        
        // Left hand can grab the whole organ
        TouchInfo.leftHand.add( $(this).get(0).object3D, function (mesh, part) {
            
            var container = $(".heartContainer").get(0).object3D;
            var parent = part.parent;
            while(parent && parent != container)
                parent = parent.parent;
        
            // If we walked all the way up the tree and didn't find the container, grab the box
            if(!parent)
                return part;
        
            return container;
        })
    });
    
    TouchInfo.rightHand.add( pin.sphere, function (mesh) {
        return pin;
    })
    
    TouchInfo.rightHand.add( pin.cylinder, function (mesh) {
        return pin;
    })
}

function updateHUDOrganName (textObject) {
    if(textObject.positionSet)
        return;
        
	// Center the text
	var box = new THREE.Box3().setFromObject(textObject.object3D);
	//console.log(box.min, box.max, box.size());
	textObject.setAttribute("position", -(box.size().x / 2) + " 0 0");
    textObject.positionSet = true;
}

function hideDescription() {
    $(".partDescription").get(0).setAttribute("visible", "false");
}

function showDescription(selectedPartElement) {
    var description = $(".partDescription").get(0);
    description.setAttribute("visible", "true");
}