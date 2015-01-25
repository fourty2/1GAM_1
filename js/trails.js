/**
 * @author snooze82 / http://henklein.com
 */


THREE.Trails = function (object, bone) {

	this.root = object;

	this.bones = this.getBoneList(object);

	this.referenceBone = this.getBone(bone);

	this.maxSegments = 20;

	var geometry = new THREE.Geometry();
	for ( var i = 0; i <= this.maxSegments * 2; i ++ ) {
		geometry.vertices.push(
				new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 0, 0, 0 )
		);
		geometry.faces.push( new THREE.Face3( 0, 0, 0 ) );
	}

	this.currentIndex = 0;	
	var texture = THREE.ImageUtils.loadTexture( "images/schweif.png" );

	this.mesh = new THREE.Mesh(
				geometry,
				new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide, wireframe: true})
			);

	this.mesh.matrix =  object.matrixWorld;
	this.mesh.matrixAutoUpdate = false;
	this.geometry = this.mesh.geometry;
}

THREE.Trails.prototype.getMesh = function() {
	return this.mesh;
}

THREE.Trails.prototype.getBone = function(boneName) {
	for ( var i = 0; i < this.bones.length; i ++ ) {
		var bone = this.bones[ i ];
		if ( bone.name == boneName && bone.parent instanceof THREE.Bone ) {
			return this.bones[i];
		}
	}
}

THREE.Trails.prototype.setOldPosition = function() {
	var bone = this.referenceBone;
	this.oldPosMatrix = bone.matrixWorld.clone();
	this.oldPosParentMatrix = bone.parent.matrixWorld.clone();
} 

THREE.Trails.prototype.addSegment = function() {
	if (this.currentIndex >= this.maxSegments) {
		return;
	}

	var geometry = this.mesh.geometry;

	var bone = this.referenceBone;
	var i = this.currentIndex;
	var i6 = ( i * 6 );
	
	geometry.vertices[ i6 ].setFromMatrixPosition( this.oldPosMatrix );
	geometry.vertices[ i6 + 1 ].setFromMatrixPosition( this.oldPosParentMatrix );
	geometry.vertices[ i6 + 2].setFromMatrixPosition( bone.matrixWorld );
	
	geometry.vertices[ i6 + 3].setFromMatrixPosition( bone.matrixWorld );
	geometry.vertices[ i6 + 4].setFromMatrixPosition( this.oldPosParentMatrix );
	geometry.vertices[ i6 + 5 ].setFromMatrixPosition( bone.parent.matrixWorld );

	geometry.faces[i * 2] = new THREE.Face3( i6 , i6 + 1 , i6 + 2 );
	geometry.faces[(i * 2) + 1] = new THREE.Face3( i6 + 3 , i6 + 4 , i6 + 5 );

	geometry.verticesNeedUpdate = true;

	this.currentIndex++;
	this.setOldPosition();	
}

THREE.Trails.prototype.getBoneList = function( object ) {

	var boneList = [];

	if ( object instanceof THREE.Bone ) {

		boneList.push( object );

	}

	for ( var i = 0; i < object.children.length; i ++ ) {

		boneList.push.apply( boneList, this.getBoneList( object.children[ i ] ) );

	}

	return boneList;

};
