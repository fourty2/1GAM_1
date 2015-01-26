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
	test: null,

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
		this.loader.load('models/player2.json', function(geometry, materials) {
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			//	materials[i].skinning = true;
			}
			var facematerial = new THREE.MeshFaceMaterial(materials);
			

			self.player = new THREE.SkinnedMesh(
				geometry,
				facematerial
				//new THREE.MeshBasicMaterial({color: 0xffff00})
			//	new THREE.MeshBasicMaterial({map: texture, shading: THREE.FlatShading})
			);
			self.player.scale.set(10.0,10.0,10.0);
			self.player.position.set(0,30,0);
			self.player.rotateY(Math.PI);
			self.scene.add(self.player);
			
			self.trailHelper = new THREE.Trails(self.player, 'weapon');
			trailMesh = self.trailHelper.getMesh();
			//trailMesh.scale.set(20.0,20.0,20.0);
			//	trailMesh.position.set(0,-30,0);
			self.scene.add(trailMesh);

			self.helper = new THREE.SkeletonHelper( self.player );
			self.helper.material.linewidth = 3;
			self.helper.visible = true;
			console.log(self.helper);
			self.scene.add( self.helper );

			self.animatePlayer();
			self.camera.lookAt(new THREE.Vector3(0, -20, 0 ));		
		});

	
	},
	animatePlayer: function() {
		var self = this;
		var materials = self.player.material.materials;
		for (var k in materials) {
			var mat = self.player.material.materials[k];
			mat.skinning = true;
			//materials[k].skinning = true;
		}

		self.animation = new THREE.Animation(self.player, self.player.geometry.animations[0]);
		
		self.animation.play(0);
		console.log(self.animation);
		//self.animation.loop = false;
	},
	updateAnimation: function(delta) {
		if (this.animation) {
			this.animation.update(delta * 5);
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
			this.highest = false;

			this.velocityY = 0;//-this.velocityY  ;
		}

		this.player.position.y += this.velocityY;


		var diff = Math.abs(oldVelocity - this.velocityY);

		this.player.scale.x = 10 + diff;// * 0.1;
		this.player.scale.y = 10 + Math.abs(this.velocityY * 2) - (diff );

		// gamepad
		var pads = navigator.getGamepads(); //Gamepad.getStates();
		var pad = pads[0];
		var horizontal = 0;
		var vertical = 0;
		if (pad) {

			if (!horizontal) {
				horizontal = pad.axes[0]
				if (horizontal < 0.1 && horizontal > -0.1) {
					horizontal = 0;

				}
				if (horizontal == 0 && this.player.rotation.y < (Math.PI*2)) {

					this.player.rotation.y += 0.2;				
				}
				else if (horizontal != 0 && this.player.rotation.y > (3 * (Math.PI/2))){
					// opponent direction
					this.player.rotation.y -= 0.2;
				}


			}
			if (!vertical) {
				vertical = pad.axes[1];
				if (vertical < 0.1 && vertical > -0.1) {
					vertical = 0;
				}
			}
			//console.log(pad.axes[0]);
			if (pad.axes[1] < -0.1) {
				// jump
				if (this.player.position.y < 0 && !this.highest) {
					this.velocityY = 1.5;
					this.player.position.y += this.velocityY;					
				} else if (this.player.position.y >= 0) {
					this.highest = true;
				}
				
			}

		}

		if (pad.buttons[0].pressed && !this.punching) {
			this.punching = true;
				if (!this.verticesAdded) {
				
						this.trailHelper.setOldPosition();
						this.verticesAdded = true;	
				}
		}


		// update animation
		if (this.animation) {

			if (this.punching && this.animation.currentTime < 1.58) {				
			
				this.animation.play(1.6);
			} else if (this.animation.currentTime > 3.68) {
				this.punching = false;
			} else if (this.punching && this.animation.currentTime > 2.0) {
				if (((this.animation.currentTime - 2.0) * 10) > this.trailHelper.currentIndex ) {			
					console.log(this.animation.currentTime);
					console.log ((this.animation.currentTime - 2.0) * 10);
					console.log(this.trailHelper.currentIndex);
					this.trailHelper.addSegment();
				}
			} else if (!this.punching) {

				if (horizontal == 0 ) {
					this.animation.stop();
					//console.log(thi)
				} else if (!this.animation.isPlaying || this.animation.currentTime >= 1.5){
					console.log("play anim");
					this.animation.play(0);
				}
			}
		}


	
		this.player.position.x -= horizontal;


	},
	render: function() {
		this.updateAnimation(this.clock.getDelta());
		this.movePlayer();
		if (this.helper) {
			this.helper.update();
		}
		this.renderer.render(this.scene, this.camera);
	},
	animate: function() {
		requestAnimationFrame(game.animate);
		game.render();
	}
}

game.init();