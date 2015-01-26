/**
 * @author snooze82 / http://henklein.com
 */


THREE.Trails = function (object, bone) {

	this.root = object;

	this.bones = this.getBoneList(object);

	this.referenceBone = this.getBone(bone);

	this.maxSegments = 16;

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
	var texture = THREE.ImageUtils.loadTexture( "images/schweif2.png" );
	texture.repeat.set(0.05,0.05);
	texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
	
	this.assignUVs2(geometry);

	this.mesh = new THREE.Mesh(
				geometry,

			//	new THREE.MeshFaceMaterial([
					new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide, wireframe: false, overdraw:true, transparent: true})
			//	])
				
			);


	this.mesh.matrix =  object.matrixWorld;
	this.mesh.matrixAutoUpdate = false;
	this.geometry = this.mesh.geometry;
}
THREE.Trails.prototype.assignUVs2 = function (geometry) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}
THREE.Trails.prototype.assignUVs = function( geometry ){

    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

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

	geometry.faces[i * 2] = new THREE.Face3( i6 , i6 + 1 , i6 + 2, null, null, 0 );
	geometry.faces[(i * 2) + 1] = new THREE.Face3( i6 + 3 , i6 + 4 , i6 + 5 , null, null, 0);
	
	geometry.verticesNeedUpdate = true;
	this.assignUVs2(geometry);
	
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
