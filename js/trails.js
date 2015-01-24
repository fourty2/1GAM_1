/**
 * @author snooze82 / http://henklein.com
 */


THREE.Trails = function (object, bone) {
	this.root = object;
	this.bones = this.getBoneList(object);
	console.log(this.bones);
	this.referenceBone = this.getBone(bone);
	//this.matrix = object.matrixWorld;
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
	this.mesh = new THREE.Mesh(
				geometry,
				new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide, wireframe: true})
			);
	// huh?
	this.mesh.matrix =  object.matrixWorld;
	this.mesh.matrixWorld =  object.matrixWorld;
	//this.mesh.updateMatrixWorld();
	this.mesh.matrixAutoUpdate = false;
	this.geometry = this.mesh.geometry;

	console.log(this.mesh);

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
	var geometry = this.mesh.geometry;

	var matrixWorldInv = new THREE.Matrix4().getInverse( this.root.matrixWorld );

	var bone = this.referenceBone;

	this.oldPosMatrix = new THREE.Matrix4();
	this.oldPosParentMatrix = new THREE.Matrix4();

	this.oldPosMatrix.multiplyMatrices( matrixWorldInv, bone.matrixWorld );
	this.oldPosParentMatrix.multiplyMatrices( matrixWorldInv, bone.matrixWorld );
	this.oldPosParentMatrix.multiplyMatrices( matrixWorldInv, bone.parent.matrixWorld );

} 

THREE.Trails.prototype.addSegment = function() {
	if (this.currentIndex >= this.maxSegments) {
		return;
	}
	var geometry = this.mesh.geometry;

	var matrixWorldInv = new THREE.Matrix4().getInverse( this.root.matrixWorld );

	var boneMatrix = new THREE.Matrix4();

	var bone = this.referenceBone;

	var i = this.currentIndex;
	var i6 = ( i * 6 );
	
	boneMatrix.multiplyMatrices( matrixWorldInv, bone.matrixWorld );

	geometry.vertices[ i6 ].setFromMatrixPosition( this.oldPosMatrix );
	geometry.vertices[ i6 + 1 ].setFromMatrixPosition( this.oldPosParentMatrix );
	geometry.vertices[ i6 + 2].setFromMatrixPosition( boneMatrix );
	
	geometry.vertices[ i6 + 3].setFromMatrixPosition( boneMatrix );
	geometry.vertices[ i6 + 4].setFromMatrixPosition( this.oldPosParentMatrix );
	
	boneMatrix.multiplyMatrices( matrixWorldInv, bone.parent.matrixWorld );
	geometry.vertices[ i6 + 5 ].setFromMatrixPosition( boneMatrix );

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
