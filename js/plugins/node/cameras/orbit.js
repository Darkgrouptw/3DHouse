/**
 * Orbiting camera node type
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage</p>
 * <pre>
 * someNode.addNode({
 *      type: "cameras/orbit",
 *      eye:{ x: y:0 },
 *      look:{ y:0 },
 *      yaw: 340,,
 *      pitch: -20,
 *      zoom: 350,
 *      zoomSensitivity:10.0,
 * });
 * </pre>
 * <p>The camera is initially positioned at the given 'eye' and 'look', then the distance of 'eye' is zoomed out
 * away from 'look' by the amount given in 'zoom', and then 'eye' is rotated by 'yaw' and 'pitch'.</p>
 *
 */
SceneJS.Types.addType("cameras/orbit", {

    construct: function (params) {

        var lookat = this.addNode({
            type: "lookAt",

            // A plugin node type is responsible for attaching specified
            // child nodes within itself
            nodes: params.nodes
        });

        var yaw = params.yaw || 0;
        var pitch = params.pitch || 0;
        var zoom = params.zoom || 10;
        var minPitch = params.minPitch;
        var maxPitch = params.maxPitch;
        var zoomSensitivity = params.zoomSensitivity || 1.0;

        var lastX;
        var lastY;
        var last1X;
        var last1Y;
		
        var dragging = false;
        var lookatDirty = false;

        var eye = params.eye || { x: 0, y: 0, z: 0 };
        var look = params.look || { x: 0, y: 0, z: 0};

        lookat.set({
            eye: { x: eye.x, y: eye.y, z: -zoom },
            look: { x: look.x, y: look.y, z: look.z },
            up: { x: 0, y: 1, z: 0 }
        });

        var spin = params.spin;


        if (params.spin || params.spinYaw || params.spinPitch) {
            var spinYaw = 0;
            var spinPitch = 0;
            if (params.spin) {
                spinYaw = params.spin;
            } else {
                spinYaw = params.spinYaw || 0.0;
                spinPitch = params.spinPitch || 0.0;
            }

            this._tick = this.getScene().on("tick",
                function () {
                    yaw -= spinYaw;
                    pitch -= spinPitch;
                    update();
                });
        }

        var canvas = this.getScene().getCanvas();

        function mouseDown(event) {
            lastX = event.clientX;
            lastY = event.clientY;
            dragging = true;
        }

        function touchStart(event) {
			if(event.targetTouches.length != 1){
				lastX = event.targetTouches[0].clientX;
				lastY = event.targetTouches[0].clientY;
				last1X = event.targetTouches[1].clientX;
				last1Y = event.targetTouches[1].clientY;
				dragging = true;
			}
			else{
				lastX = event.targetTouches[0].clientX;
				lastY = event.targetTouches[0].clientY;
				dragging = true;
			}
        }

        function mouseUp() {
			if(tmpNormal != null)
            {
                rotateCamera();
            }
            dragging = false;
        }

        function touchEnd() {
			if(tmpNormal != null)
            {
                rotateCamera();
            }
            dragging = false;
        }

        function mouseMove(event) {
            var posX = event.clientX;
            var posY = event.clientY;
            actionMove(posX, posY);
        }

        function touchMove(event) {
			if(event.targetTouches.length != 1){
				if(isLock == false)
                {
                    var posX = event.targetTouches[0].clientX;
                    var posY = event.targetTouches[0].clientY;
                    var pos1X = event.targetTouches[1].clientX;
                    var pos1Y = event.targetTouches[1].clientY;
                    touchScale(posX, posY,pos1X, pos1Y);
                }
			}
			else{
                if(isRotation == true && partmode == -1)
                {
                    var posX = event.targetTouches[0].clientX;
                    var posY = event.targetTouches[0].clientY;
                    actionMove(posX, posY);
                }
			}
        }

        function actionMove(posX, posY) {
            if (dragging) {

                yaw -= (posX - lastX) * 0.3;
                pitch -= (posY - lastY) * 0.3;

                update();

                lastX = posX;
                lastY = posY;
            }
        }

		function touchScale(posX, posY,pos1X, pos1Y) {
            var delta = 0;
			var len_orix = lastX - last1X;	
			var len_oriy = lastY - last1Y;
			var len_ori = Math.sqrt(len_orix*len_orix + len_oriy*len_oriy);
			
			var len_movex = posX - pos1X;
			var len_movey = posY - pos1Y;
			var len_move = Math.sqrt(len_movex*len_movex + len_movey*len_movey);
			
            delta = (len_move - len_ori) / 120;
            //if (delta) {
                if (delta > 0) {
                    zoom -= zoomSensitivity;
                } else {
                    zoom += zoomSensitivity;
                }
            //}
            update();

			lastX = posX;
			lastY = posY;
			last1X = pos1X;
			last1Y = pos1Y;
        }
		
        function mouseWheel(event) {
            var delta = 0;
            if (!event) event = window.event;
            if (event.wheelDelta) {
                delta = event.wheelDelta / 120;
                if (window.opera) delta = -delta;
            } else if (event.detail) {
                delta = -event.detail / 3;
            }
            if (delta) {
                if (delta < 0) {
                    zoom -= zoomSensitivity;
                } else {
                    zoom += zoomSensitivity;
                }
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.returnValue = false;
            update();

        }

		function rotateCamera()
        {
            if(tmpNormal[0] == 0 && tmpNormal[1] == 0 && tmpNormal[2] == 1)
            {
                yaw = 0;
                pitch = 0;
                zoom = camDist;
                update();
            }
            else if(tmpNormal[0] == 0 && tmpNormal[1] == 0 && tmpNormal[2] == -1)
            {
                yaw = 0;
                pitch = 0;
                zoom = -camDist;
                update();
            }
            else if(tmpNormal[0] == 0 && tmpNormal[1] == 1 && tmpNormal[2] == 0)
            {
                yaw = 0;
                pitch = -90;
                zoom = camDist;
                update();
            }
            else if(tmpNormal[0] == 1 && tmpNormal[1] == 0 && tmpNormal[2] == 0)
            {
                yaw = 90;
                pitch = 0;
                zoom = camDist;
                update();
            }
            else if(tmpNormal[0] == -1 && tmpNormal[1] == 0 && tmpNormal[2] == 0)
            {
                yaw = -90;
                pitch = 0;
                zoom = camDist;
                update();
            }
        }
		
        canvas.addEventListener('mousedown', mouseDown, true);
        canvas.addEventListener('mousemove', mouseMove, true);
        canvas.addEventListener('mouseup', mouseUp, true);
        canvas.addEventListener('touchstart', touchStart, true);
        canvas.addEventListener('touchmove', touchMove, true);
        canvas.addEventListener('touchend', touchEnd, true);
		canvas.addEventListener('touchscale', touchScale, true);
        canvas.addEventListener('mousewheel', mouseWheel, true);
        canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

        function update() {

            if (minPitch != undefined && pitch < minPitch) {
                pitch = minPitch;
            }

            if (maxPitch != undefined && pitch > maxPitch) {
                pitch = maxPitch;
            }

            var eye = [0, 0, zoom];
            var look = [0, 0, 0];
            var up = [0, 1, 0];

            // TODO: These references are to private SceneJS math methods, which are not part of API

            var eyeVec = SceneJS_math_subVec3(eye, look, []);
            var axis = SceneJS_math_cross3Vec3(up, eyeVec, []);

            var pitchMat = SceneJS_math_rotationMat4v(pitch * 0.0174532925, axis);
            var yawMat = SceneJS_math_rotationMat4v(yaw * 0.0174532925, up);

            var eye3 = SceneJS_math_transformPoint3(pitchMat, eye);
            eye3 = SceneJS_math_transformPoint3(yawMat, eye3);

            lookat.setEye({x: eye3[0], y: eye3[1], z: eye3[2] });
        }

        update();
    },

    setLook: function (l) {


    },

    destruct: function () {
        this.getScene().off(this.tick);
        // TODO: remove mouse handlers
    }
});
