(function () {

    SceneJS.Types.addType("architectures/wall", {

        construct:function (params) {
            this.addNode(build.call(this, params));
        }
    });

    function build(params) {

        var x, y, z;
        if (params.size) {
            x = params.size[0];
            y = params.size[1];
            z = params.size[2];
        } else {
            // Deprecated
            x = params.xSize || 1;
            y = params.ySize || 1;
            z = params.zSize || 1;
        }

        var coreId = "architecture/wall" + x + "_" + y + "_" + z + (params.wire ? "wire" : "_solid");

        // If a node core already exists for a prim with the given properties,
        // then for efficiency we'll share that core rather than create another geometry
        if (this.getScene().hasCore("geometry", coreId)) {
            return {
                type:"geometry",
                coreId:coreId
            };
        }

        // Otherwise, create a new geometry
        return {
            type:"geometry",
            primitive:params.wire ? "lines" : "triangles",
            coreId:coreId,
            positions:new Float32Array([
                -12.35 , 1 , -7.30488 , 12.35 , 1 , -7.30488 , 12.35 , 14.5028 , -7.30488 , -12.35 , 14.5028 , -7.30488,
				12.35 , 14.5028 , -7.30488 , 12.35 , 1 , -7.30488 , 12.35 , 1 , 7.39429 , 12.35 , 14.5028 , 7.39429,
				-12.35 , 14.5028 , 7.39429 , -12.35 , 1 , 7.39429 , -12.35 , 1 , -7.30488 , -12.35 , 14.5028 , -7.30488,
				12.9712 , 1 , -8 , -13 , 1 , -8 , -13 , 14.503 , -8 , 12.9712 , 14.503 , -8,
				12.9712 , 14.503 , -8 , 12.9712 , 14.503 , 7.39236 , 12.9712 , 1 , 7.39236 , 12.9712 , 1 , -8,
				-13 , 14.503 , 7.39236 , -13 , 14.503 , -8 , -13 , 1 , -8 , -13 , 1 , 7.39236,
				12.35 , 14.5028 , 7.39429 , 12.35 , 1 , 7.39429 , 12.9712 , 1 , 7.39236 , 12.9712 , 14.503 , 7.39236,
				-12.35 , 1 , 7.39429 , -12.35 , 14.5028 , 7.39429 , -13 , 14.503 , 7.39236 , -13 , 1 , 7.39236,
				-12.35 , 14.5028 , 7.39429 , -12.35 , 14.5028 , -7.30488 , -13 , 14.503 , -8 , -13 , 14.503 , 7.39236,
				-12.35 , 14.5028 , -7.30488 , 12.35 , 14.5028 , -7.30488 , 12.9712 , 14.503 , -8 , -13 , 14.503 , -8,
				12.35 , 14.5028 , -7.30488 , 12.35 , 14.5028 , 7.39429 , 12.9712 , 14.503 , 7.39236 , 12.9712 , 14.503 , -8,
				12.35 , 1 , 7.39429 , 12.35 , 1 , -7.30488 , 12.9712 , 1 , -8 , 12.9712 , 1 , 7.39236,
				12.35 , 1 , -7.30488 , -12.35 , 1 , -7.30488 , -13 , 1 , -8 , 12.9712 , 1 , -8,
				-12.35 , 1 , -7.30488 , -12.35 , 1 , 7.39429 , -13 , 1 , 7.39236 , -13 , 1 , -8
            ]),
            normals:new Float32Array([
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
				0.003106, 0, 0.999995, 0.003106, 0, 0.999995, 0.003106, 0, 0.999995, 0.003106, 0, 0.999995,
                -0.002969, 0, 0.999996, -0.002969, 0, 0.999996, -0.002969, 0, 0.999996, -0.002969, 0, 0.999996,
                0.000314, 1, 0, 0.000314, 1, 0, 0.000314, 1, 0, 0.000314, 1, 0,
                0, 1, 0.000295, 0, 1, 0.000295, 0, 1, 0.000295, 0, 1, 0.000295,
                -0.000329, 1, 0, -0.000329, 1, 0, -0.000329, 1, 0, -0.000329, 1, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
				0, -1, -0, 0, -1, -0, 0, -1, -0, 0, -1, -0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0 
            ]),
            // uv:new Float32Array([
                // x, y, 0, y, 0, 0, x, 0, // v0-v1-v2-v3 front
                // 0, y, 0, 0, x, 0, x, y, // v0-v3-v4-v5 right
                // x, 0, x, y, 0, y, 0, 0, // v0-v5-v6-v1 top
                // x, y, 0, y, 0, 0, x, 0, // v1-v6-v7-v2 left
                // 0, 0, x, 0, x, y, 0, y, // v7-v4-v3-v2 bottom
                // 0, 0, x, 0, x, y, 0, y    // v4-v7-v6-v5 back
            // ]),
            indices:[
                 0,  1,  2,  0,  2,  3,
				 4,  5,  6,  4,  6,  7,
				 8,  9, 10,  8, 10, 11,
				12, 13, 14, 12, 14, 15,
				16, 17, 18, 16, 18, 19,
				20, 21, 22, 20, 22, 23,
				24, 25, 26, 24, 26, 27,
				28, 29, 30, 28, 30, 31,
				32, 33, 34, 32, 34, 35,
				36, 37, 38, 36, 38, 39,
				40, 41, 42, 40, 42, 43,
				44, 45, 46, 44, 46, 47,
				48, 49, 50, 48, 50, 51,
				52, 53, 54, 52, 54, 55
			]
        };
    }
})();