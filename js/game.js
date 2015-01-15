/**

	ein paar notizen

	* player kann nur in x-richtung (oder z?) bewegen, oder springen (y)
	* kamera versucht, beide player im auge zu behalten (erstmal nur einen)
	* erstmal eine feste y-ebene
	* springen geht
	* 

*/

var game = {
	gamecanvas: null,
	renderer: null,
	scene: null,
	camera: null,
	cameraControls: null,

	loader: null,
	clock: null,
	velocityY: 0,

	renderer: null,
	init: function() {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 1000;
		var FOV = 45; 

		this.gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: gamecanvas});

    	this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;		

		this.loader = new THREE.JSONLoader();
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH/ HEIGHT, NEAR, FAR);
	    this.camera.position.set(0, -10, -100 );

	    this.scene.add(this.camera);

	    this.buildWorld();
	    this.animate();


	},
	buildWorld: function() {
		// light
			var light = new THREE.DirectionalLight( 0xFFA030 );
 		light.intensity = 2;
        light.position.set( -100, 0, -100 );
        light.castShadow = true;
        light.shadowCameraNear = 1;
        light.shadowCameraFar = 350;
        
        light.shadowCameraTop = 150;
        light.shadowCameraLeft = -150;
        light.shadowCameraRight = 150;
        light.shadowCameraBottom = -150;
        
        light.shadowDarkness = 0.6;
        light.shadowMapWidth = 4048;
        light.shadowMapHeight = 4048;
       //light.shadowCameraVisible = true;
		this.scene.add(light);

		// plane
		this.plane = new THREE.Mesh(
				new THREE.PlaneGeometry(300,60,8,8),
				new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide})
			);
		this.plane.rotateX(Math.PI/2);
		this.plane.position.set(0,-50,0);
		this.scene.add(this.plane);

		var self = this; // scope
		//  player
		this.loader.load('models/player.json', function(geometry, materials) {
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			//	materials[i].skinning = true;
			}
			var facematerial = new THREE.MeshFaceMaterial(materials);

			self.player = new THREE.SkinnedMesh(
				geometry,
				facematerial
				//new THREE.MeshBasicMaterial({color: 0xffff00})
			//	new THREE.MeshLambertMaterial({color: 0x00ff00, shading: THREE.FlatShading})
			);
			self.player.scale.set(10.0,10.0,10.0);
			self.player.position.set(0,30,0);
			self.player.rotateY(Math.PI);
			self.scene.add(self.player);
			self.animatePlayer();
			self.camera.lookAt(new THREE.Vector3(0, -20, 0 ));		
		});

/*		this.player = new THREE.Mesh(
				new THREE.SphereGeometry(5,8,8),
				new THREE.MeshBasicMaterial({color: 0xffff00})
			);*/
		

	},
	animatePlayer: function() {
		var self = this;
		var materials = self.player.material.materials;
		for (var k in materials) {
			var mat = self.player.material.materials[k];
			mat.skinning = true;
			//materials[k].skinning = true;
		}



	//	console.log(materials);

    	  //THREE.AnimationHandler.add( self.player.geometry.animations[0]);
		self.animation = new THREE.Animation(self.player, self.player.geometry.animations[0]);
		
		//self.animation.play(0.4);
		//self.animation.loop = false;
	},
	updateAnimation: function(delta) {
		if (this.animation) {
			this.animation.update(delta);
		}
	},
	movePlayer: function() {
		if (!this.player) {
			return;
		}

		var oldVelocity = this.velocityY;
		// gravity test
		if (this.player.position.y > -45 ) {
			this.velocityY -= 0.2; //0.4;
		} else {

			this.velocityY = 0;//-this.velocityY  ;
		}

		this.player.position.y += this.velocityY;


		var diff = Math.abs(oldVelocity - this.velocityY);

		this.player.scale.x = 10 + diff;// * 0.1;
		this.player.scale.y = 10 + Math.abs(this.velocityY * 2) - (diff );

		// gamepad
		var pads = Gamepad.getStates();
		var pad = pads[0];
		var horizontal = 0;
		var vertical = 0;
		if (pad) {
			if (!horizontal) {
				horizontal = pad.leftStickX;
				if (horizontal < 0.1 && horizontal > -0.1) {
					horizontal = 0;
				}
			}
			if (!vertical) {
				vertical = pad.leftStickY;
				if (vertical < 0.1 && vertical > -0.1) {
					vertical = 0;
				}
			}
		}

	// rotation stuff
	/*
		var stickDirection = new THREE.Vector3(horizontal, 0, vertical);

		var targetMatrix = new THREE.Matrix4();
		targetMatrix.extractRotation(self.player.matrix);
		var targetDirection = new THREE.Vector3(1,0,1); // root direction
		targetDirection = targetDirection.applyMatrix4(targetMatrix);

			
		// get camera direction
		var cameraMatrix = new THREE.Matrix4();
		cameraMatrix.extractRotation(self.cameraControls.camera.matrix);
		var cameraDirection = new THREE.Vector3(1,1,1); // root direction
		cameraDirection = cameraDirection.applyMatrix4(cameraMatrix);

		cameraDirection.y = 0;

		var referentialShift = new THREE.Quaternion();
		referentialShift.setFromUnitVectors(new THREE.Vector3(0,0,1), cameraDirection);
		
		var moveDirection = new THREE.Vector3();
		moveDirection.copy(stickDirection);
		moveDirection.applyQuaternion(referentialShift);

		var axisSign = new THREE.Vector3();
		axisSign.crossVectors(moveDirection, targetDirection);

	
		var rootAngle = targetDirection.angleTo(moveDirection) * (axisSign.y >= 0 ? -1.0 : 1.0);
		rootAngle = rootAngle;
		if (rootAngle) {
		 self.player.rotateY( rootAngle * 0.2 );

		}
		*/

		this.player.translateX(horizontal);


	},
	render: function() {
		this.updateAnimation(this.clock.getDelta());
		this.movePlayer();
		this.renderer.render(this.scene, this.camera);
	},
	animate: function() {
		requestAnimationFrame(game.animate);
		game.render();
	}
}

game.init();