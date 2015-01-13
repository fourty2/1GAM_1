var game = {
	gamecanvas: null,
	renderer: null,
	scene: null,
	camera: null,
	cameraControls: null,

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

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH/ HEIGHT, NEAR, FAR);
	    this.camera.position.set(0, 60, -300 );

	    this.scene.add(this.camera);

	    this.buildWorld();
	    this.animate();


	},
	buildWorld: function() {
		// plane
		this.plane = new THREE.Mesh(
				new THREE.PlaneGeometry(60,60,8,8),
				new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide})
			);
		this.plane.rotateX(Math.PI/2);
		this.plane.position.set(0,-50,0);
		this.scene.add(this.plane);

		this.player = new THREE.Mesh(
				new THREE.SphereGeometry(5,8,8),
				new THREE.MeshBasicMaterial({color: 0xffff00})
			);
		this.player.position.set(0,30,0);
		this.scene.add(this.player);
		this.camera.lookAt(this.player.position);

	},
	movePlayer: function() {
		var oldVelocity = this.velocityY;
		// gravity test
		if (this.player.position.y > -45 ) {
			this.velocityY -= 0.02; //0.4;
		} else {

			this.velocityY = -this.velocityY  ;
		}

		this.player.position.y += this.velocityY;


		var diff = Math.abs(oldVelocity - this.velocityY);

		this.player.scale.x = 1 + diff * 0.1;
		this.player.scale.y = 1 + Math.abs(this.velocityY * 0.3) - (diff * 0.1);

	},
	render: function() {
		this.movePlayer();
		this.renderer.render(this.scene, this.camera);
	},
	animate: function() {
		requestAnimationFrame(game.animate);
		game.render();
	}
}

game.init();