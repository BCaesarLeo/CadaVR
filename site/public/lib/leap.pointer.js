// this should get a new name, now that it includes grabEvent.
Leap.plugin('pointer', function(scope){

	this.use('handHold');
  	//this.use('pinchEvent');
	
	scope.detectionInterval = scope.detectionInterval || 10; // Default is 100 milliseconds
	scope.touchDistance = scope.touchDistance || 0.1; // default is one centimeter
	scope.handType = scope.handType || "right"; // default hand is the right hand 

    var scene = $("a-scene").get(0);

    var detectCollision = false;
    setInterval(function () { detectCollision = true }, scope.detectionInterval);

    var pointer = new Pointer(scope, scene, controller);

    Leap.loop({ background: true }, function (frame) {
        if (!detectCollision || frame.hands.length <= 0)
            return;

        frame.hands.forEach(function (hand) {
            if (hand.type == scope.handType) {
                hand.data("pointer", pointer)
                pointer.update(hand, detectCollision);
            }

            detectCollision = false;
        })
    });
});

function Pointer(scope, scene, controller) {
    var raycaster = new THREE.Raycaster();

    this.hand = null;
    this.touchDistance = scope.touchDistance;
    this.position = null;
    this.direction = null;
    this.intersectedEl = null;
    this.childContainer = null;
    this.childElement = null;

    this.update = function (hand, detectIntersection) {
        this.hand = hand;
        var indexFinger = this.getIndexFinger();
        if (!indexFinger)
            return;

        this.setPointerPositionAndDirection();

        // Show the debug arrow?
        if (scope.debug)
            showArrowHelper(this.position, this.direction);

        if (detectIntersection)
            this.detectIntersection();

        controller.emit("pointerUpdated", this)
    };

    this.getWorldPosition = function () {
        var position = new THREE.Vector3();
        scene.object3D.updateMatrixWorld();
        position.setFromMatrixPosition(this.getIndexFinger().tip.matrixWorld);
        return position;
    }

    this.setPointerPositionAndDirection = function (indexFinger) {
        this.position = this.getWorldPosition()

        // Get the direction
        this.direction = this.getIndexFinger().worldDirection;
    };

    this.detectIntersection = function (hand) {
        var intersectedObj = this.getClosestObject();

        var newIntersectedEl = intersectedObj != null ? intersectedObj.object.el : null;
        if (this.intersectedEl != newIntersectedEl && this.intersectedEl != null)
            this.intersectedEl.removeState("hovered");

        this.intersectedEl = newIntersectedEl;

        if (this.intersectedEl)
            this.intersectedEl.addState("hovered");

        if (!this.intersectedEl)
            return;

        if (intersectedObj.distance <= this.touchDistance)
            this.intersectedEl.emit("pointerTouch", { intersectedObj: intersectedObj });
    }

    this.getClosestObject = function (indexFinger) {
        // Detect intersected objects
        var raycaster = new THREE.Raycaster();
        raycaster.set(this.position, this.direction);
        var intersectedObjects = raycaster.intersectObjects(scene.object3D.children, true);
        for (var i = 0; i < intersectedObjects.length; ++i) {
            var intersectedObj = intersectedObjects[i];

            while (intersectedObj.object.parent && intersectedObj.object.el === undefined) {
                intersectedObj.object = intersectedObj.object.parent;
            }

            // If the intersected object is the cursor itself
            // or the object is further than the max distance

            if (intersectedObj.object.el === undefined) { continue; }
            if (!intersectedObj.object.visible) { continue; }

            return intersectedObj
        }

        return null;
    }

    this.attachChild = function (childElement) {
        if (this.childElement != null)
            throw "attempting to attach a child when a child already exists";

        if (!this.childContainer) {
            this.childContainer = new THREE.Group()
            this.getIndexFinger().tip.add(this.childContainer);
        }

        this.childElement = childElement;
        childElement.object3D.parent.updateMatrixWorld();
        THREE.SceneUtils.attach(childElement.object3D, scene.object3D, this.childContainer);
        return childElement;
    }

    this.detachChild = function (newParentElement) {
        if (this.childElement == null)
            throw "attempting to detach a child when no child exists";

        var childElement = this.childElement;
        childElement.object3D.parent.updateMatrixWorld();
        THREE.SceneUtils.detach(childElement.object3D, childElement.object3D.parent, newParentElement.object3D);
        this.childElement = null;
        return childElement;
    }

    this.hasChild = function () {
        return this.childElement != null;
    }

    this.getIndexFinger = function () {
        var handMesh = this.hand.data("riggedHand.mesh");
        if (!handMesh)
            return null;

        return handMesh.fingers[1];
    }

    var arrowHelper = null;
    var showArrowHelper = function (origin, dir) {
        var length = 1;
        var hex = 0xffff00;

        if (arrowHelper)
            scene.object3D.remove(arrowHelper)

        arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        scene.object3D.add(arrowHelper);
    }
}