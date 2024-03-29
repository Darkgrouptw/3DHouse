var zigzagOut = 1.5;
SceneJS.Types.addType("roof/cross_gable", 
{ 
    construct:function (params) 
    {
        this._layer;
        this._paramana = new ParameterManager(params, function(property)
	    {
            var ratio_boundary = function(val)
            {
                var reval = val;
                switch(reval)
                {
                    case (reval < 0):
                        reval = 0; break;
                    case (reval > 1):
                        reval = 1; break;
                }
                return reval;
            };

            var bs = property.back_side == 'on' ? true: false;

            var w = property.width;
            var d = property.depth;
            var h = property.height;

            var t = property.thickness;

	        var r = property.ratio;
            r.a = ratio_boundary(r.a);
            r.b = ratio_boundary(r.b);

            var el = property.extrude_len * 2;
            var eb = property.extrude_bas * 2;

            var eh = property.extrude_hgt;
            eh = ratio_boundary(eh);

            var ep = property.extrude_pos;
            ep = ratio_boundary(ep);

            var td = d - (3 * t);
            if(eb > (2 * td)) { eb = 2 * td; }

	        var wr = (w * r.a + -w * r.b) / 2;
            var db = (d - (eb * 0.5)) - (3 * t);
			
            var dr = (2 * db) * (1 - ep), dl = (2 * db) * ep;			
            var ldb = db * 2 * ep, rdb = db * 2 * (1 - ep);
			property.exactlyExtrudePos = ((-d+dr)+(d-dl))/2;
            
            var base_len = w + (2 * t);
            if(base_len < (wr + el)) { base_len = wr + el; }
            property.exactlyExtrudeLen = base_len - (0.5 * t);

            var dt = t;
            var st = (2 * h / ( w * r.a + w * r.b)) * dt, sh = h * eh;
            var whr = (w / 2) * (1 - eh);

            var hrate = st / (sh + h);
            var dtt = eb * 0.5 * hrate;

            var gs = property.back_grasp * 0.7;
            var gsr = property.back_grasp / Math.sqrt((Math.pow((2 * h),2) + Math.pow((2 * w), 2)));
            var mh = (gsr * h * 2), mw = (gsr * w);
			
			var gable_hypotenuse = Math.sqrt(Math.pow((2*h+st),2) + Math.pow((w+dt),2));
			var upper_hypotenuse = Math.sqrt(Math.pow((h-sh),2)+Math.pow((wr+whr),2));  //上面那塊的斜邊長
			var lower_hypotenuse = gable_hypotenuse-upper_hypotenuse;
			
			
			
			var length_each_tiles = 2;
			
			var num_upper_tiles= parseInt(upper_hypotenuse / length_each_tiles);
			if(upper_hypotenuse !=0 && num_upper_tiles == 0){
				num_upper_tiles = 1;
			}
            var num_lower_tiles = parseInt(lower_hypotenuse / length_each_tiles);
			var num_back_tiles = parseInt(gable_hypotenuse / length_each_tiles);
			
                //front bottom
            var fbtm =
            [
                -td + ldb - dtt, -h, w + dt, -d, -h, w + dt, -d, -h, w, -td + ldb, -h, w,
                d, -h, w + dt, td - rdb + dtt, -h, w + dt, td - rdb, -h, w, d, -h, w,
            ];
            property.shared.front = {};
            property.shared.front.bottom = fbtm;

                // backside: nesseary part, L M R
            var bside = [];
			
			if(!bs){ //打勾
				
				var bside = [
                -d, h, wr, -d, -h, -w, -d + gs, -h, -w, -d + gs, h - mh, wr - mw,
                -d, h, wr, -d + gs, h - mh, wr - mw, d - gs, h - mh, wr - mw, d, h, wr,
                d - gs, h - mh, wr - mw, d - gs, -h, -w, d, -h, -w, d, h, wr,

                -d, h + st, wr, -d + gs, h - mh + st, wr - mw, -d + gs, -h, -w - dt, -d, -h, -w - dt,
                -d, h + st, wr, d, h + st, wr, d - gs, h - mh + st, wr - mw, -d + gs, h - mh + st, wr - mw,
                d - gs, h - mh + st, wr - mw, d, h + st, wr, d, -h, -w - dt, d - gs, -h, -w - dt,
                ];
			}else{
				
				var bside = [
                             0,0,0,0,0,0,0,0,0,0,0,0,
							 0,0,0,0,0,0,0,0,0,0,0,0,
							 0,0,0,0,0,0,0,0,0,0,0,0,
							 
							 0,0,0,0,0,0,0,0,0,0,0,0,
							 0,0,0,0,0,0,0,0,0,0,0,0,
							 0,0,0,0,0,0,0,0,0,0,0,0,
                
                ];
				
			}
			
			
            property.shared.back = {};
            property.shared.back.side = bside;

                // extrude
            var exd =
            [
                //-db + dl, sh, wr + el, -td + ldb, -h, base_len, -td + ldb, -h, w, -db + dl, sh, wr + whr,
                //-db + dl, sh + st, wr + el, -db + dl, sh + st, wr + whr, -td + ldb - dtt, -h, w + dt, -td + ldb - dtt, -h, base_len,

                //-db + dl, sh, wr + whr, td - rdb, -h, w, td - rdb, -h, base_len, -db + dl, sh, wr + el,
                //db - dr, sh + st, wr + whr, -db + dl, sh + st, wr + el, td - rdb + dtt, -h, base_len, td - rdb + dtt, -h, w + dt,

                -db + dl, sh, base_len, -td + ldb, -h, base_len, -td + ldb, -h, w, -db + dl, sh, wr + whr,
               // -db + dl, sh + st, base_len, -db + dl, sh + st, wr + whr, -td + ldb - dtt, -h, w + dt, -td + ldb - dtt, -h, base_len,//左斜

                -db + dl, sh, wr + whr, td - rdb, -h, w, td - rdb, -h, base_len, -db + dl, sh, base_len,
             //   db - dr, sh + st, wr + whr, -db + dl, sh + st, base_len, td - rdb + dtt, -h, base_len, td - rdb + dtt, -h, w + dt,//右斜

            ];
			
			var plane_right_exd = [   td - rdb + dtt, -h, base_len,
			                         -db + dl, sh + st, base_len,
                          			 db - dr, sh + st, wr + whr,
									 td - rdb + dtt, -h, w + dt,
							      ];
			var zigzag_right_exd = buildZigzag(plane_right_exd, 6 , [zigzagOut, 0, 0], 0.1);
			
			var plane_left_exd = [  
									-td + ldb - dtt, -h, w + dt,
									-db + dl, sh + st, wr + whr, 
									-db + dl, sh + st, base_len,
									-td + ldb - dtt, -h, base_len, 
								];
			var zigzag_left_exd = buildZigzag(plane_left_exd, 6 , [-zigzagOut, 0, 0], 0.1);
			
			
			
			//var plane_exd_left = [ -db + dl, sh + st, base_len, -db + dl, sh + st, wr + whr, -td + ldb - dtt, -h, w + dt, -td + ldb - dtt, -h, base_len];
            
			//var zigzag_a = buildZigzag(plane_exd_left, 5, [-1, 0, 0], 0.1);
			//exd= exd.concat(zigzag_a.positions);
			
            property.shared.extrude = {};
            property.shared.extrude.content = exd;
            property.shared.extrude.paraH = sh + st + h;
            property.shared.extrude.paraW = base_len - (wr + whr); 
            property.shared.extrude.minH = -h;
            property.shared.extrude.minW = wr + whr;

                // extrude bottom 
            var ebtm = 
            [
                -td + ldb, -h, base_len, -td + ldb - dtt, -h, base_len, -td + ldb - dtt, -h, w + dt, -td + ldb, -h, w, 
                td - rdb, -h, w, td - rdb + dtt, -h, w + dt, td - rdb + dtt, -h, base_len, td - rdb, -h, base_len,
            ];
            property.shared.extrude.bottom = ebtm;

                // extrude side
            var eside =
            [
                -db + dl, sh, base_len, -db + dl, sh + st, base_len, -td + ldb - dtt, -h, base_len, -td + ldb, -h, base_len, 
                -db + dl, sh + st, base_len, -db + dl, sh, base_len, td - rdb, -h, base_len, td - rdb + dtt, -h, base_len, 
            ];
            property.shared.extrude.side = eside;

                // backside bottom 
            var bbtm = 
            [
                d - gs, -h, -w - dt, d, -h, -w - dt, d, -h, -w, d - gs, -h, -w,
                -d, -h, -w - dt, -d + gs, -h, -w - dt, -d + gs, -h, -w, -d, -h, -w,
            ];
            property.shared.back.bottom = bbtm;

                // side 
            var oside = 
            [
                -d, h, wr, -d, h + st, wr, -d, -h, -w - dt, -d, -h, -w,
                -d, h + st, wr, -d, h, wr, -d, -h, w, -d, -h, w + dt, 
                d, h, wr, d, h + st, wr, d, -h, w + dt, d, -h, w,
                d, h + st, wr, d, h, wr, d, -h, -w, d, -h, -w - dt
	        ]; 
            property.shared.side = oside;

            var bspet = [];
			
            if(!bs)//打勾
            {
                bspet = 
                [
                    -d + gs, h - mh + st, wr - mw, d - gs, h - mh + st, wr - mw, 
                    d - gs, h - mh, wr - mw, -d + gs, h - mh, wr - mw, 

                    -d + gs, h - mh + st, wr - mw, -d + gs, h - mh, wr - mw,
                    -d + gs, -h, -w, -d + gs, -h, -w - dt,

                    d - gs, h - mh, wr - mw, d - gs, h - mh + st, wr - mw,
                    d - gs, -h, -w - dt, d - gs, -h, -w,
                ];
				
				var plane_back = [     0,0,0,
				                       0,0,0,
									   0,0,0,
									   0,0,0
							     ];
			    var zigzag_back = buildZigzag(plane_back, num_back_tiles , [0, 0, -zigzagOut], 0.1);
				
				
            }
            else
            {
                bspet = 
                [
                    // full backside
                   // -d + gs, h - mh, wr - mw, -d + gs, -h, -w, d - gs, -h, -w, d - gs, h - mh, wr - mw,
                    //-d + gs, h - mh + st, wr - mw, d - gs, h - mh + st, wr - mw, d - gs, -h, -w - dt, -d + gs, -h, -w - dt,
					-d , h , wr , -d , -h, -w, d , -h, -w, d , h , wr ,
                   // -d , h  + st, wr , d , h + st, wr , d , -h, -w - dt, -d , -h, -w - dt,

                    // bottom
                    -d + gs, -h, -w - dt, d - gs, -h, -w - dt, d - gs, -h, -w, -d + gs, -h, -w,
					
					0,0,0,0,0,0,0,0,0,0,0,0
                ];
				var plane_back = [      d , -h, -w - dt,
				                        d , h + st, wr,
				                        -d , h  + st, wr ,
										-d , -h, -w - dt,
										
							     ];
			    var zigzag_back = buildZigzag(plane_back, num_back_tiles , [0, 0, -zigzagOut], 0.1);
				
            }
            property.shared.back.cover = bspet;
	        
            // if seperate below two part, the normals will not consistence
            var fcont =
            [
                // frontside
                -db + dl, sh, wr + whr, -td + ldb, -h, w, -d, -h, w, -d, sh, wr + whr,  // 左前後
                d, sh, wr + whr, d, -h, w, td - rdb, -h, w, db - dr, sh, wr + whr, // 右前後
               
               // d, sh + st, wr + whr, db - dr, sh + st, wr + whr, td - rdb + dtt, -h, w + dt, d, -h, w + dt, // 右前
               // -db + dl, sh + st, wr + whr, -d, h + st, wr, -d, -h, w + dt, -td + ldb - dt, -h, w + dt,
              // -db + dl, sh + st, wr + whr, -d, sh + st, wr + whr, -d, -h, w + dt, -td + ldb - dtt, -h, w + dt//左前

            ];
            property.shared.front.content = fcont;
			
			var plane_right_lower = [  td - rdb + dtt, -h, w + dt,
			                           db - dr, sh + st, wr + whr,
									   d, sh + st, wr + whr,
			                           d, -h, w + dt,
			                           
									]; 
			var zigzag_right_lower = buildZigzag(plane_right_lower, num_lower_tiles ,[0, 0, zigzagOut], 0.1);
			
			var plane_left_lower = [-d, -h, w + dt,
			                        -d, sh + st, wr + whr,
			                        -db + dl, sh + st, wr + whr,
			                        -td + ldb - dtt, -h, w + dt,
									
									];
			var zigzag_left_lower = buildZigzag(plane_left_lower, num_lower_tiles , [0, 0, zigzagOut], 0.1);
			
			
            /*var ap = [-db + dl, sh + st, wr + whr];
            var bp = [-td + ldb - dtt, -h, w + dt];
            var cp = [-td + ldb, -h, w];
            var dp = [-db + dl, sh, wr + whr];

            var a = [], b = [], c = [];
            SceneJS_math_subVec3(ap, dp, a);
            SceneJS_math_subVec3(bp, cp, b);
            SceneJS_math_subVec3(cp, dp, c);

            console.log(a);
            console.log(b);
            console.log(c);

            var tmpr = [];
            SceneJS_math_cross3Vec3(b,c,tmpr);
            var rr = SceneJS_math_dotVec3(a, tmpr);
            console.log(rr);*/

            var apet = [];
            if(1 != eh)
            {
                apet = 
                [
                    -d, sh, wr + whr,
					-d, h, wr,	
					d, h, wr,
					d, sh, wr + whr,
               	
                ];
				
				var plane_upper = [   
									   -d, sh + st, wr + whr,
                                       -d, h + st, wr,
									   d, h + st, wr,
									   d, sh + st, wr + whr
								];
                var zigzag_upper = buildZigzag(plane_upper, num_upper_tiles, [0, 0, zigzagOut], 0.1);
				
				//d, h + st, wr,d, sh + st, wr + whr,-db + dl, sh + st, wr + whr,0, h + st, wr
				//var plane_left_upper = [0, h + st, wr,-db + dl, sh + st, wr + whr,-d, sh + st, wr + whr,-d, h + st, wr];
                //var zigzag_left_upper = buildZigzag(plane_left_upper, 1, [0, 0, 1.5], 0.1);
			
            }
            else { 
			        apet = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 
			      //  var plane_upper = [  
					//				    0,0,0,
						//			    0,0,0,
							//		    0,0,0,
								//	    0,0,0
								  //    ];
                   //var zigzag_upper = buildZigzag(plane_upper, num_upper_tiles, [0, 0, 1.5], 0.1);
			
			}
            property.shared.append = apet;

            var pset = [];
	        pset = pset.concat(fbtm).concat(bside).concat(exd).concat(ebtm).concat(eside).concat(bbtm)
                .concat(oside).concat(bspet).concat(fcont).concat(apet);
			
			var all_positions = zigzag_right_lower.positions.concat(zigzag_left_lower.positions)
							   .concat(zigzag_upper.positions)
							   .concat(zigzag_right_exd.positions).concat(zigzag_left_exd.positions)
							   .concat(zigzag_back.positions);
							   
							   
            var max_base = Math.max(...zigzag_right_lower.indices) + 1;
            var ori_indices = utility.makeIndices(0, (pset.length / 3) - 1);
			
            property.all_indices = zigzag_right_lower.indices.concat(zigzag_left_lower.indices.map(function(c) { return c + max_base; }));
		    var max_base_1 = Math.max(...property.all_indices)+1;
			property.all_indices = property.all_indices.concat(zigzag_upper.indices.map(function(c) { return c + max_base_1; }));
		    var max_base_2 = Math.max(...property.all_indices)+1;
			property.all_indices = property.all_indices.concat(zigzag_right_exd.indices.map(function(c) { return c + max_base_2; }));
			var max_base_3 = Math.max(...property.all_indices)+1;
			property.all_indices = property.all_indices.concat(zigzag_left_exd.indices.map(function(c) { return c + max_base_3; }));
			var max_base_4 = Math.max(...property.all_indices)+1;
			property.all_indices = property.all_indices.concat(zigzag_back.indices.map(function(c) { return c + max_base_4; }));
			
			
            
            
			
			property.zigzag_texture = zigzag_right_lower.uv.concat(zigzag_left_lower.uv)
									  .concat(zigzag_upper.uv)                                  
									  .concat(zigzag_right_exd.uv).concat(zigzag_left_exd.uv)
									  .concat(zigzag_back.uv);
	
		    
			property.all_indices = ori_indices.concat(property.all_indices.map(function(c){ return c + (pset.length / 3); }));
            return pset.concat(all_positions);

	    });
		
		this._paramana.addAttribute('all_indices', []);
		this._paramana.addAttribute('zigzag_texture', []);
		

        this._paramana.addAttribute('extrude_pos', params.extrude_pos);
        this._paramana.addAttribute('extrude_hgt', params.extrude_hgt);
        this._paramana.addAttribute('extrude_len', params.extrude_len);
        this._paramana.addAttribute('extrude_bas', params.extrude_bas);
        this._paramana.addAttribute('back_side', params.back_side);
        this._paramana.addAttribute('back_grasp', params.back_grasp);

        // for texture
        this._paramana.addAttribute('shared', {});

        this._paramana.addAttribute('exactlyExtrudeLen', undefined);
		this._paramana.addAttribute('exactlyExtrudePos', undefined);

        this._paramana.addFunction('texture', function(property)
        {
            var tmpUV = [[0, 0], [1, 0], [0, 1], [1, 1]];
            var uvs = [];

            var ts = property.shared;
            var fd = property.depth * 2;
            var fh = property.height * 2;
            var efw = property.shared.extrude.paraW;
            //var efh = property.shared.extrude.paraH;
            var eminw = property.shared.extrude.minW;
            var eminh = property.shared.extrude.minH;

            var sideTexture = function(points)
            {
                var tmpcat = [];
                for(var i = 0; i < points.length; i = i + 3) { tmpcat = tmpcat.concat(tmpUV[0]); }
                return tmpcat;
            };

            var randomTexture = function(points)
            {
                var tmpcat = [];
                for(var i = 0; i < points.length; i = i + 3) { tmpcat = tmpcat.concat(tmpUV[Math.floor(Math.random() * 3)]); }
                return tmpcat;
            };

            var depthHeightTexture = function(points)
            {
                var tmpcat = [];
                for(var i = 0; i < points.length; i = i + 3)
                {
                   tmpcat = tmpcat.concat([(points[i] + (fd * 0.5)) / fd, (points[i + 1] + (fh * 0.5)) / fh]); 
                }
                return tmpcat;
            };

            var extrudeTexture = function(points)
            {
                var tmpcat = [];
                for(var i = 0; i < points.length; i = i + 3)
                {
                    tmpcat = tmpcat.concat([(points[i + 2] - eminw) / efw, (points[i + 1] - eminh) / fh]);
                }
                return tmpcat;
            };
            
            uvs = uvs.concat(sideTexture(ts.front.bottom))
                .concat(depthHeightTexture(ts.back.side))
                .concat(extrudeTexture(ts.extrude.content))
                .concat(sideTexture(ts.extrude.bottom))
                .concat(sideTexture(ts.extrude.side))
                .concat(sideTexture(ts.back.bottom))
                .concat(sideTexture(ts.side))
                .concat(depthHeightTexture(ts.back.cover))
                .concat(depthHeightTexture(ts.front.content))
                .concat(depthHeightTexture(ts.append))
				.concat(property.zigzag_texture);

            return uvs;
        });
        
        this.addNode(roof_cross_gable_build.call(this, params)); 
		
    },
   
    update: function()
    {
		this.addNode(roof_cross_gable_build.call(this));
        var geometry_id = scene.getNode(this.id).nodes[0].id;
		scene.getNode(geometry_id).destroy();
		
        this._paramana.updateGeometryNode(this);
        this._paramana.updateTextureCoord(this);
		
    },

    getLayer:function(){ return this._layer; },
    setLayer:function(l){ this._layer = l; },

    getWidth: function() { return this._paramana.get('width'); },
	setWidth: function(w) { this._paramana.set('width', w); this.update(); },
	
	getHeight: function() { return this._paramana.get('height'); },
	setHeight: function(h) { this._paramana.set('height', h); this.update(); },
	
	getDepth: function() { return this._paramana.get('depth'); },
	setDepth: function(d) { this._paramana.set('depth', d); this.update(); },
	
	getRatio: function() { return this._paramana.get('ratio'); },
	setRatio: function(r) { return this._paramana.set('ratio', r); this.update(); },
	
	getThickness: function() { return this._paramana.get('thickness'); },
	setThickness: function(t) { this._paramana.set('thickness', t); this.update(); },

    getExactlyExtrudeLen: function() { return this._paramana.get('exactlyExtrudeLen'); },
	getExactlyExtrudePos: function() { return this._paramana.get('exactlyExtrudePos'); },

    getExtrudePos: function() { return this._paramana.get('extrude_pos'); },
    setExtrudePos: function(ep) { this._paramana.set('extrude_pos', ep); this.update(); },

    getExtrudeHgt: function() { return this._paramana.get('extrude_hgt'); },
    setExtrudeHgt: function(eh) { this._paramana.set('extrude_hgt', eh); this.update(); },

    getExtrudeLen: function() { return this._paramana.get('extrude_len'); },
    setExtrudeLen: function(el) { this._paramana.set('extrude_len', el); this.update(); },

    getExtrudeBas: function() { return this._paramana.get('extrude_bas'); },
    setExtrudeBas: function(eb) { this._paramana.set('extrude_bas', eb); this.update(); },

    getBackGrasp: function() { return this._paramana.get('back_grasp'); },
    setBackGrasp: function(bg) { this._paramana.set('back_grasp', bg); this.update(); },

    getBackSide: function() { return this._paramana.get('back_side'); },
    setBackSide: function(bs) { this._paramana.set('back_side', bs); this.update(); },

	getScale: function() { return this._paramana.get('scale'); },
	setScale: function(svec) { this._paramana.set('scale', svec); this._paramana.updateMatirxNode(this); },
	
	getRotate: function() { return this._paramana.get('rotate'); },
	setRotate: function(rvec) { this._paramana.set('rotate', rvec); this._paramana.updateMatirxNode(this); },
	
	getTranslate: function() { return this._paramana.get('translate'); },
	setTranslate: function(tvec) { this._paramana.set('translate', tvec); this._paramana.updateMatirxNode(this); },
	
	setTranslateX: function(x) { var t = this.getTranslate(); this.setTranslate([x, t[1], t[2]]); },
    setTranslateY: function(y) { var t = this.getTranslate(); this.setTranslate([t[0], y, t[2]]); },
    setTranslateZ: function(z) { var t = this.getTranslate(); this.setTranslate([t[0], t[1], z]); },
    
	callBaseCalibration: function()
	{
    	var backWall=-1, rightWall=-1, leftWall=-1,frontWall=-1, roof=-1, base=-1;
        var nodes=scene.findNodes();
        
        //                                 material     name   matrix  texture  element
        var mnmte = function(n) { return n.nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0]; }
        
        for(var i = 0; i < nodes.length; i++)
        {
            var n = nodes[i];
            if(n.getType() == "name")
            {
                if(n.getName() == "backWall") { backWall = mnmte(n); }
                else if(n.getName() == "frontWall") { frontWall = mnmte(n); }
                else if(n.getName() == "leftWall") { leftWall = mnmte(n); }
                else if(n.getName() == "rightWall") { rightWall = mnmte(n); }
                else if(n.getName() == "roof") { roof = mnmte(n); }
                else if(n.getName() == "base" && mnmte(n).getLayer && mnmte(n).getLayer() == this.getLayer() - 1) { base = mnmte(n); }
            }
        }
        if(base == -1){ console.log("ERROR"); return; }
        if(roof.getID() == this.getID())
        {
            if(base.setRealWidth)base.setRealWidth(this.getDepth());
            if(base.setRealHeight)base.setRealHeight(this.getWidth());
        	base.setWidth(this.getDepth());
        	base.setHeight(this.getWidth());
        	base.callBaseCalibration();
        }
    },
    
    adjustChildren: function()
    {
    	var baseCenter = this.getTranslate();
        var baseCenterX = baseCenter[0];
        var baseCenterY = baseCenter[1];
        var baseCenterZ = baseCenter[2];

    	var leftTriangle = -1, rightTriangle = -1, roof = -1, base = -1;
        var nodes = scene.findNodes();
        var roof_base = -1;
        var frontTriangle = -1;
        //                                 material     name   matrix  texture  element
        var mnmte = function(n) { return n.nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0]; }
        
        for(var i = 0; i < nodes.length; i++)
        {
            var n = nodes[i];
            if(n.getType() == "name")
            {
                if(n.getName() =="roof") { roof = mnmte(n); }
                else if(n.getName() == "leftTriangle") { leftTriangle = mnmte(n); }
                else if(n.getName() == "rightTriangle") { rightTriangle = mnmte(n); }
                else if(n.getName() == "base") { base = mnmte(n); }
				else if(n.getName() == "frontTriangle"){frontTriangle = mnmte(n);}
                else if(n.getName() == "roof_base") { roof_base = Pos2housenode(n);}
            }
        }
        
        if(roof == -1) { console.log("ERROR"); return; }
        if(leftTriangle != -1)
        {
        	leftTriangle.setHeight(this.getHeight());
        	leftTriangle.setWidth(this.getWidth());
            
            var translateV = [];
        	translateV.push(baseCenterX - this.getDepth() + leftTriangle.getThickness());
        	translateV.push(baseCenterY);
        	translateV.push(baseCenterZ);
        	
        	leftTriangle.setTranslate(translateV);

            leftTriangle.setLayer(this.getLayer());
        }
        if(rightTriangle != -1)
        {
        	rightTriangle.setHeight(this.getHeight());
        	rightTriangle.setWidth(this.getWidth());
            
            var translateV = [];
        	translateV.push(baseCenterX + this.getDepth() - rightTriangle.getThickness());
        	translateV.push(baseCenterY);
        	translateV.push(baseCenterZ);
        	
        	rightTriangle.setTranslate(translateV);

            rightTriangle.setLayer(this.getLayer());
        }
		if(frontTriangle != -1){
			frontTriangle.setHeight(this.getHeight() * (0.5 + 0.5 * this.getExtrudeHgt()));
            frontTriangle.setWidth(this.getExtrudeBas());
            var translateV = [];
            translateV.push(this.getExactlyExtrudePos());
			//console.log("Pos " + this.getExactlyExtrudePos());
            translateV.push(baseCenterY - this.getHeight() + frontTriangle.getHeight());
            translateV.push(-this.getExactlyExtrudeLen() + this.getThickness());
			//console.log("Len " + this.getExactlyExtrudeLen());

            frontTriangle.setTranslate(translateV);
            frontTriangle.setLayer(this.getLayer());
		}
        if(roof_base != -1 ){
            roof_base.setWidth(this.getDepth() - roof_base.getThickness() * 2);
            roof_base.setHeight(this.getWidth() - roof_base.getThickness());
            roof_base.setTranslateZ(baseCenterZ + roof_base.getThickness());
            roof_base.setTranslateX(baseCenterX);
            roof_base.setTranslateY(baseCenterY - this.getHeight() - roof_base.getThickness());
        }
    },
    KillChildren: function(){


        var baseCenter = this.getTranslate();
        var baseCenterX = baseCenter[0];
        var baseCenterY = baseCenter[1];
        var baseCenterZ = baseCenter[2];

        var leftTriangle = -1, rightTriangle = -1, roof = -1, base = -1;
        var nodes = scene.findNodes();
        var frontTriangle = -1;
        //                                 material     name   matrix  texture  element
        var mnmte = function(n) { return n.nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0]; }
        
        for(var i = 0; i < nodes.length; i++)
        {
            var n = nodes[i];
            if(n.getType() == "name")
            {
                if(n.getName() =="roof") { roof = mnmte(n); }
                else if(n.getName() == "leftTriangle") { leftTriangle = mnmte(n); }
                else if(n.getName() == "rightTriangle") { rightTriangle = mnmte(n); }
                else if(n.getName() == "base") { base = mnmte(n); }
                else if(n.getName() == "frontTriangle"){frontTriangle = mnmte(n);}
            }
        }
        
        if(roof == -1) { console.log("ERROR"); return; }
        if(leftTriangle != -1)
        {
            leftTriangle.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().destroy();
        }
        if(rightTriangle != -1)
        {
            rightTriangle.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().destroy();
        }
        if(frontTriangle != -1)
        {
            housenode2flag(frontTriangle).destroy();
        }
    }
 });

function roof_cross_gable_build(params) 
{
    var positionSet = this._paramana.createPositions();
    var indiceSet = this._paramana.get('all_indices');
    var uvSet = this._paramana.createTextures();
   	
    var geometry = 
	{
        type: "geometry",
        primitive: "triangles",
        positions: positionSet,
		uv: uvSet,
		normals: "auto",
        indices: indiceSet
    };
	
	return geometry;
}