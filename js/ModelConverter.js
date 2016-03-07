///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Wouldn't be changed stuff
var typeDefined = ["roof", "base", "wall"];
var modelExactLatchArea = ["base"];	//Storing the models which latch faces output with exact area

//Storing the priority of the dependency used for puzzling
var treePrior = [["base", 0], ["interWall", 1], ["backWall", 2], ["rightWall", 3], ["leftWall", 3], ["rightTriangle", 4], ["leftTriangle", 4], ["roof", 5]];
var treePriorMap = new Map(treePrior);
var maxPrior = treePrior[treePrior.length-1][1];
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Global variables
var outNodeIndex = 0;
var infoStr = "";	//Storing the string in info.txt
var posArray;	//Storing values of pos in each elements 
var typeArray;	//Storing values of type in each elements 
var layerArray;	//Storing values of layer number in each nodes

//mesh manipulating (latch faces)
//faceArray[x][3]: vertex[3]
var connector;	//:faceArray      Storing array of mesh with faceArray in each elements
var nonConnector;	//:faceArray      Storing array of mesh with faceArray in each elements
var connector_No;	//Storing the corresponding model index
var nonConnector_No;	//Storing the corresponding model index

function traverse(curNode, target){
	var newArr = new Array;
	newArr = target;
	if(newArr.length == 1){
		for(;newArr.indexOf(curNode.type) == -1;curNode = curNode.nodes[0]);
	}else{
		for(;newArr.indexOf(String(curNode.type).substring(0, 4)) == -1;curNode = curNode.nodes[0]);
	}
	return curNode;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Here are the exporting functions
function exportMultiObj(inputNode){
	convertToMultiObj(inputNode, true);
}

function exportMultiStl(inputNode){
	var objs = convertToMultiObj(inputNode, false);

	//Parsing roof part number
	var parseRoof = 0;
	//Using the faceArray in connector and nonConnector to construct the stl models
	//Only normals in objs are needed
	for(var modelNo = 0;modelNo<objs.length;modelNo++){
		//String storing stl
		var outStr = "solid model" + modelNo + "\n\n";

		var curObj = parseObj(objs[modelNo]);
		var indexConn = Math.max(connector_No.indexOf(modelNo), nonConnector_No.indexOf(modelNo));
		var faceArr;
		if(connector_No.indexOf(modelNo) != -1){
			faceArr = connector[indexConn];
		}else{
			faceArr = nonConnector[indexConn];
		}
		var sum = [0, 0];
		var minZ = 99999999;

		//Storing the vec and angle of current rotation
		var angle = [], vec = [];
		//Rotating
		switch(posArray[modelNo]){
			case "roof":
				switch(typeArray[modelNo]){
					case "roof/gable":
						if(parseRoof == 0){
							angle = [-39.5];
							vec = [0];
						}else{
							angle = [219.5];
							vec = [0];
						}
						break;
					case "roof/hip":
						switch(parseRoof){
							case 0:
								// angle = -90;
								// vec = 0;
								// curObj = rotateOneAxis(curObj, angle, vec);
								// faceArr = rotateOneAxis_faceArr(faceArr, angle, vec);
								// vec = 1;
								// angle = 41.58;
								angle = [-90, 41.58];
								vec = [0, 1];
								break;
							case 1:
								vec = [0];
								angle = [-17.5];
								break;
							case 2:
								// angle = 90;
								// vec = 0;
								// curObj = rotateOneAxis(curObj, angle, vec);
								// faceArr = rotateOneAxis_faceArr(faceArr, angle, vec);
								// vec = 1;
								// angle = 221.58;
								angle = [90, 221.58];
								vec = [0, 1];
								break;
							case 3:
								vec = [0];
								angle = [-162.5];
								break;
							default:
								angle = [0];
								vec = [0];
								break;
						}
						break;
					default:
						angle = [0];
						vec = [0];
						break;
				}
				parseRoof++;
				break;
			case "leftTriangle":
				vec = [1];
				angle = [90];
				break;
			case "rightTriangle":
				vec = [1];
				angle = [90];
				break;
			case "base":
				angle = [90];
				vec = [0];
				break;
			case "interWall":
				angle = [90];
				vec = [1];
				break;
			case "backWall":
				angle = [-90, -90];
				vec = [2, 2];
				break;
			case "leftWall":
				angle = [90];
				vec = [1];
				break;
			case "rightWall":
				angle = [90];
				vec = [1];
				break;
			default:
				angle = [0];
				vec = [0];
				break;
		}

		curObj = rotateOneAxis(curObj, angle, vec);
		faceArr = rotateOneAxis_faceArr(faceArr, angle, vec);
		//Finding sum and min to align
		for(var nv = 0;nv<curObj.vertices.length;nv++){
			for(var nd = 0;nd<2;nd++){
				sum[nd] += parseFloat(curObj.vertices[nv][nd]);
			}
			if(curObj.vertices[nv][2] < minZ)	minZ = parseFloat(curObj.vertices[nv][2]);
		}
		for(var nd = 0;nd<2;nd++){
			sum[nd] /= parseFloat(curObj.vertices.length);
		}

		//Storing calculated normals
		var norms = new Array;
		for(var i = 0;i<faceArr.length;i++){
			//finding corresponding normal
			var curNorm = [0, 0, 0];
			for(var pointI = 0;pointI < 3;pointI++){
				for(var dimen = 0;dimen < 3;dimen++){
					curNorm[dimen] += parseFloat(curObj.normals[curObj.faces[i][pointI] - 1][dimen]);
				}
			}
			normalize(curNorm);
			norms.push(curNorm);
		}

		for(var i = 0;i<faceArr.length;i++){
			//Aligning
			for(var nv = 0;nv<3;nv++){
				for(var nd = 0;nd<2;nd++){
					faceArr[i][nv][nd] -= sum[nd];
				}
				faceArr[i][nv][2] -= minZ;
			}

			//Saving string
			outStr += "facet normal " + norms[i][0] + " " + norms[i][1] + " " + norms[i][2] + "\n";
			outStr += "    outer loop\n";
			for(var j = 0;j<3;j++){
				outStr += "        vertex ";
				for(k = 0;k < 3;k++){
					outStr += faceArr[i][j][k] + " ";
				}
				outStr += "\n";
			}
			outStr += "    endloop\nendfacet\n\n";
		}

		outStr += "endsolid model" + modelNo + "\n";
		download(outStr, "model_part" + modelNo + ".stl", 'text/plain');
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Function used for converting the model in multiple .obj (NO DOWNLOADING)
function convertToMultiObj(inputNode, isDownload){
	//Return object of .objs (strings)
	var objs = new Array;

	infoStr = "";
	//Init the arrays
	connector = new Array;
	nonConnector = new Array;
	connector_No = new Array;
	nonConnector_No = new Array;

	var nodesArr = inputNode.nodes;
	outNodeIndex = 0;
	var matList = new Array();	//Stores the transformation matrices

	//Init posArray
	posArray = new Array;
	typeArray = new Array;
	layerArray = new Array;
	for(var i = 0;i<nodesArr.length;i++){
		//duplicate if "roof" in posArray and typeArray only,  used in infotext indicating pos
		var curPos = traverse(nodesArr[i], "name")._core.name, curType = traverse(nodesArr[i], typeDefined).type;
		var curLayer = traverse(nodesArr[i], typeDefined).getLayer();
		var dup = 1;
		switch(curType){
			case "roof/gable":
				dup = 2;
				break;
			case "roof/hip":
				dup = 4;
				break;
		}
		for(var j = 0;j<dup;j++){
			posArray.push(curPos);
			typeArray.push(curType);
			layerArray.push(curLayer);
		}
	}
	//Looping all matrices of nodes
	for(nodeI = 0;nodeI<nodesArr.length;nodeI++){
		var tmpMat = traverse(nodesArr[nodeI], "matrix").getModelMatrix();
		matList.push(tmpMat);

		var curNode = traverse(nodesArr[nodeI], "geometry");
		var tmpPos = curNode.getPositions();
		var tmpNorm = curNode.getNormals();
		var tmpFaces = curNode.getIndices();				//Start from zero!!

		//vStr stores the output string of vertices positions
		//vnStr stores the output string of vertices normals
		//fStr stores the output string of face definition indices		
		var vStr = "", vnStr = "", fStr = "";
		for(i = 0;i<tmpPos.length;i += 3){
			var vec = [tmpPos[i], tmpPos[i+1], tmpPos[i+2], 1.0];
			var outVec = new Array();
			for(j = 0;j<16;j+=4){
				outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
			}
			vStr += "v " + outVec[0]/outVec[3] + " " + outVec[1]/outVec[3] + " " + outVec[2]/outVec[3] + "\n";
		}
		vStr += "\n";
		for(i = 0;i<tmpNorm.length;i += 3){
			var vec = [tmpNorm[i], tmpNorm[i+1], tmpNorm[i+2], 1.0];
			var outVec = new Array();
			for(j = 0;j<16;j+=4){
				outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
			}
			vnStr += "vn " + outVec[0] + " " + outVec[1] + " " + outVec[2] + "\n";
		}
		vnStr += "\n";
		
		switch(traverse(nodesArr[nodeI], typeDefined).type){
			case "roof/gable":
				//Functions about modifying the vertices' number of each face
				function decrFace1(param){
					return (param<32?16:20);
				}

				function decrFace2(param){
					return (param<16?0:16);
				}

				//Divides the roof into two .obj
				var vArr = new Array(), vnArr = new Array();
				var iter = 0, lastIter = 0;
				for(iter = 0, lastIter = 0;iter < vStr.length; iter++){
					if(vStr[iter] == "\n"){

						vArr.push(vStr.substring(lastIter, ++iter));
						lastIter = iter;
					}
				}
				
				for(iter = 0, lastIter = 0;iter < vnStr.length; iter++){
					if(vnStr[iter] == "\n"){
						vnArr.push(vnStr.substring(lastIter, ++iter));
						lastIter = iter;
					}
				}
				var f1Str = "", f2Str = "";
				var m1VIndex = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 36, 37, 38, 39];
				for(i = 0;i<tmpFaces.length;i += 3){
					if(m1VIndex.indexOf(tmpFaces[i]) > -1 && m1VIndex.indexOf(tmpFaces[i+1]) > -1 && m1VIndex.indexOf(tmpFaces[i+2]) > -1)
						f1Str += "f " + (tmpFaces[i]+1 - decrFace1(tmpFaces[i])) + "//" + (tmpFaces[i]+1 - decrFace1(tmpFaces[i])) + " " + (tmpFaces[i+1]+1 - decrFace1(tmpFaces[i+1])) + "//" + (tmpFaces[i+1]+1 - decrFace1(tmpFaces[i+1])) + " " + (tmpFaces[i+2]+1 - decrFace1(tmpFaces[i+2])) + "//" + (tmpFaces[i+2]+1 - decrFace1(tmpFaces[i+2])) + "\n";
					else
						f2Str += "f " + (tmpFaces[i]+1 - decrFace2(tmpFaces[i])) + "//" + (tmpFaces[i]+1 - decrFace2(tmpFaces[i])) + " " + (tmpFaces[i+1]+1 - decrFace2(tmpFaces[i+1])) + "//" + (tmpFaces[i+1]+1 - decrFace2(tmpFaces[i+1])) + " " + (tmpFaces[i+2]+1 - decrFace2(tmpFaces[i+2])) + "//" + (tmpFaces[i+2]+1 - decrFace2(tmpFaces[i+2])) + "\n";
				}
				//Dealing with inter face
				f1Str += "f " + (4) + "//" + (4) + " " + (18) + "//" + (18) + " " + (1) + "//" + (1) + "\n";
				f1Str += "f " + (1) + "//" + (1) + " " + (18) + "//" + (18) + " " + (17) + "//" + (17) + "\n";
				f2Str += "f " + (4) + "//" + (4) + " " + (18) + "//" + (18) + " " + (1) + "//" + (1) + "\n";
				f2Str += "f " + (1) + "//" + (1) + " " + (18) + "//" + (18) + " " + (17) + "//" + (17) + "\n";
				vStr = "";
				vnStr = "";
				var v2Str = "", vn2Str = "";
				for(i = 0;i<vArr.length;i++){
					if(m1VIndex.indexOf(i) > -1){
						vStr += vArr[i];
					}else{
						v2Str += vArr[i];
					}
				}
				vStr += "\n";
				v2Str += "\n";
				for(i = 0;i<vnArr.length;i++){
					if(m1VIndex.indexOf(i) > -1){
						vnStr += vnArr[i];
					}else{
						vn2Str += vnArr[i];
					}
				}
				vnStr += "\n";
				vn2Str += "\n";

				parseObj_withStoring(vStr + vnStr + f1Str, false);
				if(isDownload)	download(vStr + vnStr + f1Str, "model_part" + outNodeIndex + ".obj", 'text/plain');
				outNodeIndex++;
				parseObj_withStoring(v2Str + vn2Str + f2Str, false);
				if(isDownload)	download(v2Str + vn2Str + f2Str, "model_part" + outNodeIndex + ".obj", 'text/plain');
				outNodeIndex++;

				//Append string of .objs
				objs.push(vStr + vnStr + f1Str);
				objs.push(v2Str + vn2Str + f2Str);
				break;
			case "roof/hip":
				//Divides the roof into two .obj
				var vArr = new Array(), vnArr = new Array();
				var iter = 0, lastIter = 0;
				for(iter = 0, lastIter = 0;iter < vStr.length; iter++){
					if(vStr[iter] == "\n"){

						vArr.push(vStr.substring(lastIter, ++iter));
						lastIter = iter;
					}
				}
				
				for(iter = 0, lastIter = 0;iter < vnStr.length; iter++){
					if(vnStr[iter] == "\n"){
						vnArr.push(vnStr.substring(lastIter, ++iter));
						lastIter = iter;
					}
				}
				var vStr = ["", "", "", ""], vnStr = ["", "", "", ""], fStr = ["", "", "", ""];
				var mVIndex = new Array;			//Array of 4 elements storing model's vertices (original face indices)
				mVIndex.push([0, 2, 3, 4, 6, 7, 12, 13, 14, 20, 22, 23, 36, 37, 38, 39]);		//Model1(quad)
				mVIndex.push([12, 14, 15, 20, 21, 22, 32, 33, 34, 35]);							//Model2(triangle)
				mVIndex.push([0, 1, 2, 4, 5, 6, 8, 9, 10, 16, 18, 19, 28, 29, 30, 31]);			//Model3(quad)
				mVIndex.push([8, 10, 11, 16, 17, 18, 24, 25, 26, 27]);							//Model4(triangle)

				var mVFacesI = new Array;			//Array of 4 elements storing model's vertices (output face indices, ordered)
				mVFacesI.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 13, 16, 15, 1, 4, 2, 1, 5, 4, 2, 4, 6, 3, 2, 6, 7, 11, 10, 7, 9, 11]);	//For quad models ; later is the interfaces
				mVFacesI.push([1, 2, 3, 4, 5, 6, 7, 9, 8, 7, 10, 9, 1, 9, 4, 9, 10, 4, 4, 8, 1, 8, 4, 7]);							//For triangular models
				mVFacesI.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 13, 16, 15, 16, 13, 7, 10, 7, 13, 15, 1, 14, 6, 14, 1, 3, 4, 6, 1, 3, 6]);	//For quad models ; later is the interfaces
				mVFacesI.push([1, 2, 3, 4, 5, 6, 7, 9, 8, 7, 10, 9, 1, 10, 4, 10, 7, 4, 4, 9, 1, 9, 4, 8]);							//For triangular models

				//Adding to fStr
				for(var i = 0;i<4;i++){
					for(var j = 0;j<mVFacesI[i].length;j+=3){
						fStr[i] += "f " + mVFacesI[i][j] + "//" + mVFacesI[i][j] + " " + mVFacesI[i][j+1] + "//" + mVFacesI[i][j+1] + " " + mVFacesI[i][j+2] + "//" + mVFacesI[i][j+2] + "\n";
					}
				}

				for(i = 0;i<vArr.length;i++){
					for(var modelNo = 0;modelNo<4;modelNo++){
						if(mVIndex[modelNo].indexOf(i) > -1){
							vStr[modelNo] += vArr[i];
							vnStr[modelNo] += vnArr[i];
						}
					}
				}

				for(var i = 0;i<4;i++){
					vStr[i] += "\n";
					vnStr[i] += "\n";

					parseObj_withStoring(vStr[i] + vnStr[i] + fStr[i], false);
					if(isDownload)	download(vStr[i] + vnStr[i] + fStr[i], "model_part" + outNodeIndex + ".obj", 'text/plain');
					//Append string of .objs
					objs.push(vStr[i] + vnStr[i] + fStr[i]);
					outNodeIndex++;
				}

				break;

			default:
				for(i = 0;i<tmpFaces.length;i += 3){
					fStr += "f " + (tmpFaces[i]+1) + "//" + (tmpFaces[i]+1) + " " + (tmpFaces[i+1]+1) + "//" + (tmpFaces[i+1]+1) + " " + (tmpFaces[i+2]+1) + "//" + (tmpFaces[i+2]+1) + "\n";
				}
				fStr += "\n";

				parseObj_withStoring(vStr + vnStr + fStr, isConnector(outNodeIndex));
				if(isDownload)	download(vStr + vnStr + fStr, "model_part" + outNodeIndex + ".obj", 'text/plain');
				outNodeIndex++;
				objs.push(vStr + vnStr + fStr);
				break;		
		}
	}

	// if(isDownload){
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//-------------------------------------------Dealing with latch faces------------------------------------------
		//Printing total model number
		// infoStr = outNodeIndex + "\n";
		//Put two array, stores convex and concave string
		var latchStrArr = new Array(outNodeIndex);
		var latch2StrArr = new Array(outNodeIndex);
		for(var i = 0;i<outNodeIndex;i++){
			latchStrArr[i] = new Array;
			latch2StrArr[i] = new Array;
		}

		var maxLayer = 2;
		layerArray.forEach(function(element){
			if(element > maxLayer)	maxLayer = element;
		});
		var connTree = new Array((maxLayer-1)*5 + 1);
		//Init connTree
		for(var i = 0;i<connTree.length;i++){
			connTree[i] = new Array();
		}
		function findModelNo(no){
			for(var i = 0;i<connTree.length;i++){
				for(var j = 0;j<connTree[i].length;j++){
					if(connTree[i][j].modelNo == no){
						return [i, j];
					}
				}
			}
			return;
		}
		for(var conIter = 0;conIter < connector.length;conIter++){
			for(var faceIter = 0;faceIter<connector[conIter].length;faceIter++){
				//Comparing with nonConnector
				for(var model = 0;model<nonConnector.length;model++){
					var result = isInside(nonConnector[model], connector[conIter][faceIter]);
					if(result){
						//Adding string to vexStr & caveStr
						// var isCave = 0;		//The nonConnector model convex or concave??
						// var pointStr = "", point2Str = "";
						// var curPos = String(posArray[nonConnector_No[model]]);
						// switch(curPos){
						// 	case "roof":
						// 		break;
						// 	case "base":
						// 		isCave = 1;
						// 		break;
						// 	default:
						// 		break;
						// }
						// for(var i = 0;i<3;i++){
						// 	for(var j = 0;j<3;j++){
						// 		pointStr += connector[conIter][faceIter][i][j] + " ";
						// 		if(modelExactLatchArea.indexOf(curPos) != -1)
						// 			//output the exact area of latch faces
						// 			point2Str += connector[conIter][faceIter][i][j] + " ";
						// 		else
						// 			point2Str += nonConnector[model][result[0]][i][j] + " ";
						// 	}
						// 	pointStr += String((isCave + 1)%2) + "\n";
						// 	point2Str += String(isCave) + "\n";
						// }
						// //Split into 2 elements
						// if(latchStrArr[nonConnector_No[model]].indexOf(point2Str) == -1){
						// 	latchStrArr[nonConnector_No[model]].push(point2Str);
						// }
						// if(modelExactLatchArea.indexOf(curPos) == -1){
						// 	point2Str = "";
						// 	for(var i = 0;i<3;i++){
						// 		for(var j = 0;j<3;j++){

						// 			point2Str += nonConnector[model][result[1]][i][j] + " ";
						// 		}
						// 		point2Str += String(isCave) + "\n";
						// 	}
						// 	if(latchStrArr[nonConnector_No[model]].indexOf(point2Str) == -1){
						// 		latchStrArr[nonConnector_No[model]].push(point2Str);
						// 	}
						// }
						// if(latchStrArr[connector_No[conIter]].indexOf(pointStr) == -1){
						// 	latchStrArr[connector_No[conIter]].push(pointStr);
						// }

						//The above handling latches

						//These are handling dependency

						//Checking their priority
						var nonConPrior = treePriorMap.get(posArray[nonConnector_No[model]]);
						var conPrior = treePriorMap.get(posArray[connector_No[conIter]]);
						var newObj;
						if(nonConPrior + maxPrior*layerArray[nonConnector_No[model]] > conPrior + maxPrior*layerArray[connector_No[conIter]]){
							newObj = {modelNo:nonConnector_No[model], 
									connecting:[connector_No[conIter]], 
									priority:nonConPrior, 
									layer:layerArray[nonConnector_No[model]]};
						}else{
							newObj = {modelNo:connector_No[conIter],
									connecting:[nonConnector_No[model]],
									priority:conPrior,
									layer:layerArray[connector_No[conIter]]};
						}
						var i = new Array(2);
						if(i = findModelNo(newObj.modelNo)){
							if(connTree[i[0]][i[1]].connecting.indexOf(newObj.connecting[0]) == -1){
								connTree[i[0]][i[1]].connecting.push(newObj.connecting[0]);
							}
						}else{
							if(maxLayer == layerArray[newObj.modelNo]){
								//Dealing with 5 4
								connTree[(newObj.layer-1)*5 - 1 + (newObj.priority-4)].push(newObj);
							}else{
								//Dealing with 3 2 1 0 4
								connTree[(newObj.layer-1)*5 - 1 + (newObj.priority + 1)%5].push(newObj);
							}
						}
					}
				}

				//Comparing with connector
				for(var model = 0;model<connector.length;model++){
					var result = isInside(connector[model], connector[conIter][faceIter]);
					if(model != conIter && result){
						// var pointStr = "", point2Str = "";
						// for(var i = 0;i<3;i++){
						// 	for(var j = 0;j<3;j++){
						// 		pointStr += connector[conIter][faceIter][i][j] + " ";
						// 		point2Str += connector[model][result[0]][i][j] + " ";
						// 	}
						// 	pointStr += 1 + "\n";
						// 	point2Str += 0 + "\n";
						// }

						// //Split into 2 elements
						// if(latch2StrArr[connector_No[model]].indexOf(point2Str) == -1){
						// 	latch2StrArr[connector_No[model]].push(point2Str);
						// }
						// point2Str = "";

						// for(var i = 0;i<3;i++){
						// 	for(var j = 0;j<3;j++){
						// 		point2Str += connector[model][result[1]][i][j] + " ";
						// 	}
						// 	point2Str += 0 + "\n";
						// }

						// if(latch2StrArr[connector_No[model]].indexOf(point2Str) == -1){
						// 	latch2StrArr[connector_No[model]].push(point2Str);
						// }
						// if(latch2StrArr[connector_No[conIter]].indexOf(pointStr) == -1){
						// 	latch2StrArr[connector_No[conIter]].push(pointStr);
						// }

						//The above handling latches

						//These are handling dependency

						//Checking their priority
						var nonConPrior = treePriorMap.get(posArray[connector_No[model]]);
						var conPrior = treePriorMap.get(posArray[connector_No[conIter]]);
						var newObj;
						if(nonConPrior + maxPrior*layerArray[connector_No[model]] > conPrior + maxPrior*layerArray[connector_No[conIter]]){
							newObj = {modelNo:connector_No[model], 
									connecting:[connector_No[conIter]], 
									priority:nonConPrior, 
									layer:layerArray[connector_No[model]]};
						}else{
							newObj = {modelNo:connector_No[conIter],
									connecting:[connector_No[model]],
									priority:conPrior,
									layer:layerArray[connector_No[conIter]]};
						}
						var i = new Array(2);
						if(i = findModelNo(newObj.modelNo)){
							if(connTree[i[0]][i[1]].connecting.indexOf(newObj.connecting[0]) == -1){
								connTree[i[0]][i[1]].connecting.push(newObj.connecting[0]);
							}
						}else{
							if(maxLayer == layerArray[newObj.modelNo]){
								//Dealing with 5 4
								connTree[(newObj.layer-1)*5 - 1 + (newObj.priority-4)].push(newObj);

							}else{
								//Dealing with 3 2 1 0 4
								connTree[(newObj.layer-1)*5 - 1 + (newObj.priority + 1)%5].push(newObj);
							}
						}
					}
				}
			}
		}
		


		// for(var i = 0;i<latchStrArr.length;i++){
		// 	infoStr += "model_part" + i + " " + posArray[i] + "\n";
		// 	var total = latchStrArr[i].length + latch2StrArr[i].length;
		// 	infoStr += total + "\n";
		// 	for(var j = 0;j<latchStrArr[i].length;j++){
		// 		infoStr += latchStrArr[i][j];
		// 	}
		// 	for(var j = 0;j<latch2StrArr[i].length;j++){
		// 		infoStr += latch2StrArr[i][j];
		// 	}
		// }

		//Adding dependency text info
		for(var i = connTree.length - 1;i>=0;i--){
			for(var j = 0;j<connTree[i].length;j++){
				infoStr += "model_part" + connTree[i][j].modelNo + ": layer " + connTree[i][j].layer + "\n";
				infoStr += "connecting with models: ";
				for(var k = 0;k<connTree[i][j].connecting.length;k++){
					infoStr += connTree[i][j].connecting[k] + " ";
				}
				infoStr += "\n\n";
			}
		}
		download(infoStr, "info" + ".txt", 'text/plain');
	// }
	return objs;
}

function deg2Rad(degree){
	return parseFloat(degree * Math.PI) / 180.0;
}



//Dealing with array
function rotateOneAxis(obj, angle, vec){

    for(var main = 0;main<angle.length;main++){
    	var radAngle = deg2Rad(angle[main]);
		var matrices = new Array;
		matrices.push([[1.0, 0.0, 0.0], [0.0, Math.cos(radAngle), -Math.sin(radAngle)], [0.0, Math.sin(radAngle), Math.cos(radAngle)]]);
		matrices.push([[Math.cos(radAngle), 0.0, Math.sin(radAngle)], [0.0, 1.0, 0.0], [-Math.sin(radAngle), 0.0, Math.cos(radAngle)]]);
		matrices.push([[Math.cos(radAngle), -Math.sin(radAngle), 0.0], [Math.sin(radAngle), Math.cos(radAngle), 0.0], [0, 0, 1]]);
		function mulMat(mat, point){
			var vecOut = [0.0, 0.0, 0.0];
			for(var i = 0;i<3;i++){
				var cur = 0.0;
				for(var j = 0;j<3;j++){
					cur += mat[i][j] * point[j];
				}
				vecOut[i] = cur;
			}
			return vecOut;
		}
		for(var i = 0;i<obj.vertices.length;i++){
			obj.vertices[i] = mulMat(matrices[vec[main]], obj.vertices[i]);
			obj.normals[i] = mulMat(matrices[vec[main]], obj.normals[i]);
		}
    }
	
	return obj;
}

//Dealing with array
function rotateOneAxis_faceArr(faceArr, angle, vec){
    for(var main = 0;main<angle.length;main++){
    	var radAngle = deg2Rad(angle[main]);
		var matrices = new Array;
		matrices.push([[1.0, 0.0, 0.0], [0.0, Math.cos(radAngle), -Math.sin(radAngle)], [0.0, Math.sin(radAngle), Math.cos(radAngle)]]);
		matrices.push([[Math.cos(radAngle), 0.0, Math.sin(radAngle)], [0.0, 1.0, 0.0], [-Math.sin(radAngle), 0.0, Math.cos(radAngle)]]);
		matrices.push([[Math.cos(radAngle), -Math.sin(radAngle), 0.0], [Math.sin(radAngle), Math.cos(radAngle), 0.0], [0, 0, 1]]);
		function mulMat(mat, point){
			var vecOut = [0.0, 0.0, 0.0];
			for(var i = 0;i<3;i++){
				var cur = 0.0;
				for(var j = 0;j<3;j++){
					cur += mat[i][j] * point[j];
				}
				vecOut[i] = cur;
			}
			return vecOut;
		}
		for(var i = 0;i<faceArr.length;i++){
			for(var j = 0;j<3;j++){
				faceArr[i][j] = mulMat(matrices[vec[main]], faceArr[i][j]);
			}
		}
    }
	return faceArr;
}

//Adding convex or concave marks(0 or 1) , //
function addSubMark(str){
	var lines = str.split("\n");
	var outStr = "";
	if(lines.length <2){
		return "";
	}
	var count = 0, outNum = 0;
	for(var i = 0;i<lines.length;i++){

		if(i>2 && lines[i] != "" && lines[i].substring(0, 5) != "model"){
			outStr += lines[i] + String(outNum % 2) + "\n";
			if(++count == 6){
				count = 0;
				outNum++;
			}
		}else{
			outStr += lines[i] + "\n";
		}
	}
	return outStr;
}

function isConnector(nodeNum){
	if(typeArray[nodeNum].substring(0, 4) == "wall"){
		return true;
	}
	return false;
}

function faceNormal(points){
	var u = new Array, v = new Array;
	for(var i = 0;i<3;i++){
		u.push(parseFloat(points[1][i] - points[0][i]));
		v.push(parseFloat(points[2][i] - points[0][i]));
	}

	var out = new Array;
	out.push(u[1] * v[2] - u[2] * v[1]);
	out.push(u[2] * v[0] - u[0] * v[2]);
	out.push(u[0] * v[1] - u[1] * v[0]);

	normalize(out);

	return out;
}

function pointsEqual(points){
	return((Math.abs(parseFloat(points[0][0] - points[1][0])) < 0.0000001) && (Math.abs(parseFloat(points[0][1] - points[1][1])) < 0.0000001) && (Math.abs(parseFloat(points[0][2] - points[1][2])) < 0.0000001));
}

function isInside(meshFaces, testPoints){
	//Storing the faces of latch
	var meshFacesArr = new Array;
	var meshFacesArrNo = new Array;	//Storing the quantity of that face appears
	for(var testI = 0;testI<testPoints.length;testI++){
		//Comparing Area
		var inside = false;
		for(var meshFaceIter = 0;meshFaceIter < meshFaces.length;meshFaceIter++){
			//1.Finding other triangle to become a rectangle
			//2.Inside that rectangle??

			//Finding other triangle
			//2Points matching
			var triMatch = new Array;
			var triMatchNo = new Array;
			for(var i = 0;i<meshFaces.length;i++){
				if(i != meshFaceIter){
					var noMatch = 0;	//Number of matching
					for(var j = 0;j<3;j++){
						for(var k = 0;k<3;k++){
							if(pointsEqual([meshFaces[meshFaceIter][j], meshFaces[i][k]])){
								noMatch++;
							}
						}
					}
					if(noMatch == 2){
						triMatch.push(meshFaces[i]);
						triMatchNo.push(i);
					}
				}
			}
			//normal Matching
			var count = 0;
			var otherTri, otherTriNo;
			for(var i = 0;i<triMatch.length;i++){
				var negNormal = faceNormal(triMatch[i]);
				for(var j = 0;j<3;j++){
					negNormal[i] *= -1.0;
				}
				if(pointsEqual([faceNormal(triMatch[i]), faceNormal(meshFaces[meshFaceIter])])){
					otherTri = triMatch[i];
					otherTriNo = triMatchNo[i];
					count++;
				}
			}

			if(otherTri){
				//Combine into a rectangle
				var rect = [otherTri[0], otherTri[1], otherTri[2]];
				var pInsert;
				for(var i = 0;i<3;i++){
					var exist = false;
					for(var j = 0;j<3;j++){
						if(pointsEqual([rect[j], meshFaces[meshFaceIter][i]]))	exist = true;
					}
					if(!exist){
						pInsert = meshFaces[meshFaceIter][i];
						break;
					}
				}
				//To confirm the correctness of ordering
				//1.Find the point in triangle is the farthest
				//2.insert to index: +2&mod3
				var maxDis = 0.0;
				var maxI = 0;
				for(var i = 0;i<3;i++){
					var tmpMag = magnitude([pInsert, rect[i]]);
					if(maxDis < tmpMag){
						maxDis = tmpMag;
						maxI = i;
					}
				}
				rect.splice((maxI + 2) % 3, 0, pInsert);

				//Calculating if inside
				var sumArea = 0.0;
				var originalArea = areaOfRectangle(rect);
				for(var i = 0;i<4;i++){
					sumArea += areaOfTriangle([rect[i], testPoints[testI], rect[(i+1)%4]]);
				}

				if(Math.abs(sumArea - originalArea) < 0.0000001){
					inside = true;
					if (meshFacesArr.indexOf(meshFaceIter) == -1){
						meshFacesArr.push(meshFaceIter);
						meshFacesArrNo.push(1);
					}else{
						meshFacesArrNo[meshFacesArr.indexOf(meshFaceIter)]++;
					}
					if(meshFacesArr.indexOf(otherTriNo) == -1){
						meshFacesArr.push(otherTriNo);
						meshFacesArrNo.push(1);
					}else{
						meshFacesArrNo[meshFacesArr.indexOf(otherTriNo)]++;
					}
				}
			}
		}
		if(!inside){
			return false;
		}
	}
	var indices = new Array;
	for(var i = 0;i<meshFacesArrNo.length;i++){
		if(meshFacesArrNo[i] >= 6){
			indices.push(meshFacesArr[i]);
		}
	}
	return indices;
}

function areaOfTriangle(points){
	var ab = new Array, bc = new Array, ac = new Array;
	for(var i = 0;i<3;i++){
		ab.push(points[0][i] - points[1][i]);
		bc.push(points[1][i] - points[2][i]);
		ac.push(points[0][i] - points[2][i]);
	}

	if((Math.abs(ab[0]) + Math.abs(ab[1]) + Math.abs(ab[2])) < 0.0000001 || (Math.abs(bc[0]) + Math.abs(bc[1]) + Math.abs(bc[2])) < 0.0000001 || (Math.abs(ac[0]) + Math.abs(ac[1]) + Math.abs(ac[2])) < 0.0000001)	return 0;
	var angle = Math.acos(dot([ab, bc])/(magnitude([points[0], points[1]])*magnitude([points[1], points[2]])));
	return(0.5*(magnitude([points[0], points[1]])*magnitude([points[1], points[2]]))*Math.sin(angle));
}

function areaOfRectangle(points){
	var sum = 0;
	sum += areaOfTriangle([points[0], points[1], points[2]]);
	sum += areaOfTriangle([points[0], points[1], points[3]]);
	sum += areaOfTriangle([points[0], points[2], points[3]]);
	sum += areaOfTriangle([points[1], points[2], points[3]]);
	sum /= 2.0;
	return sum;
}

function dot(vecs){
	return(vecs[0][0]*vecs[1][0] + vecs[0][1]*vecs[1][1] + vecs[0][2]*vecs[1][2]);
}

//Length of 2 vectors
function magnitude(points){
	if(points[0][0] == points[1][0] && points[0][1] == points[1][1] && points[0][2] == points[1][2])	return 0;
	return(Math.sqrt(Math.pow(points[0][0] - points[1][0], 2) + Math.pow(points[0][1] - points[1][1], 2) + Math.pow(points[0][2] - points[1][2], 2)));
}

//Function used for converting the model in one .obj (NO DOWNLOADING)
function convertToOneObj(inputNode){
	var nodesArr = inputNode.nodes;
	var v = 0, vn = 0, f = 1;
	var vCount = new Array();

	//Look for each array size
	for(i = 0;i<nodesArr.length;i++){
		var curNode = traverse(nodesArr[i], "geometry");
		vCount.push(curNode.getPositions().length);
		v += curNode.getPositions().length;
		vn += curNode.getNormals().length;
	}

	var matList, vList, vnList, fList;
	matList = new Array();
	vList = new Float32Array(v);
	//vtList = new Float32Array();
	vnList = new Float32Array(vn);
	fList = new Array();
	
	v = 0;	vn = 0;	//Reset v and vn, and use them for propagating the index

	for(nodeI = 0;nodeI<nodesArr.length;nodeI++){
		var tmpMat = traverse(nodesArr[nodeI], "matrix").getModelMatrix();
		matList.push(tmpMat);

		var curNode = traverse(nodesArr[nodeI], "geometry");
		var tmpPos = curNode.getPositions();
		var tmpNorm = curNode.getNormals();
		var tmpFaces = curNode.getIndices();
		for (i = 0;i<tmpPos.length;i++){
			vList[v++] = tmpPos[i];
		}
		for (i = 0;i<tmpNorm.length;i++){
			vnList[vn++] = tmpNorm[i];
		}
		for(i = 0;i<tmpFaces.length;i++){
			fList.push(tmpFaces[i] + f);
		}
		f = Math.max.apply(Math, fList) + 1;
	}
	//Export .obj
	
	var vStr = "", vnStr = "", fStr = "";
	for(i = 0;i<vList.length;i += 3){
		var vec = [vList[i], vList[i+1], vList[i+2], 1.0];
		var outVec = new Array();
		for(j = 0;j<16;j+=4){
			outVec.push(matList[lookAtNode(vCount, i)][rowToColMajor(j)]*vec[0] + matList[lookAtNode(vCount, i)][rowToColMajor(j+1)]*vec[1] + matList[lookAtNode(vCount, i)][rowToColMajor(j+2)]*vec[2] + matList[lookAtNode(vCount, i)][rowToColMajor(j+3)]*vec[3]);
		}
		vStr += "v " + outVec[0]/outVec[3] + " " + outVec[1]/outVec[3] + " " + outVec[2]/outVec[3] + "\n";
	}
	vStr += "\n";
	for(i = 0;i<vnList.length;i += 3){
		var vec = [vnList[i], vnList[i+1], vnList[i+2], 1.0];
		var outVec = new Array();
		for(j = 0;j<16;j+=4){
			outVec.push(matList[lookAtNode(vCount, i)][rowToColMajor(j)]*vec[0] + matList[lookAtNode(vCount, i)][rowToColMajor(j+1)]*vec[1] + matList[lookAtNode(vCount, i)][rowToColMajor(j+2)]*vec[2] + matList[lookAtNode(vCount, i)][rowToColMajor(j+3)]*vec[3]);
		}
		// outVec = vec;
		vnStr += "vn " + outVec[0]/outVec[3] + " " + outVec[1]/outVec[3] + " " + outVec[2]/outVec[3] + "\n";
	}
	vnStr += "\n";
	for(i = 0;i<fList.length;i += 3){
		fStr += "f " + fList[i] + "//" + fList[i] + " " + fList[i+1] + "//" + fList[i+1] + " " + fList[i+2] + "//" + fList[i+2] + "\n";
	}
	fStr += "\n";
	download(vStr + vnStr + fStr, "model.obj", 'text/plain');
}

function rowToColMajor(param){
	return (parseInt(param/4) + 4*(param%4));
}

function lookAtNode(vCount, i){
	var j = i;
	for(k = 0;k<vCount.length;k++){
		if(j - vCount[k] < 0)	return k;
		else j -= vCount[k];
	}
	return vCount.length - 1;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     :o(
function convertToMultiStl(inputNode){
	var nodesArr = inputNode.nodes;
	var outNodeIndex = 0;
	var matList = new Array();	//Stores the transformation matrices

	//Looping all matrices of nodes
	for(nodeI = 0;nodeI<nodesArr.length;nodeI++){

		var tmpMat = nodesArr[nodeI].nodes[0].nodes[0].nodes[0].getModelMatrix();
		matList.push(tmpMat);

		var curNode = nodesArr[nodeI].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0];
		var tmpPos = curNode.getPositions();
		var tmpNorm = curNode.getNormals();
		var tmpFaces = curNode.getIndices();		


		if(nodesArr[nodeI].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].type == "roof/gable"){
			//vArr storing string, including \n; vnArr storing vectors	

			var vArr = new Array(), vnArr = new Array();
			for(i = 0;i<tmpPos.length;i += 3){
				var vec = [tmpPos[i], tmpPos[i+1], tmpPos[i+2], 1.0];
				var outVec = new Array();
				for(j = 0;j<16;j+=4){
					outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
				}
				vArr.push("vertex " + outVec[0]/outVec[3] + " " + outVec[1]/outVec[3] + " " + outVec[2]/outVec[3] + "\n");
			}
			for(i = 0;i<tmpNorm.length;i += 3){
				var vec = [tmpNorm[i], tmpNorm[i+1], tmpNorm[i+2], 1.0];
				var outVec = new Array();
				for(j = 0;j<16;j+=4){
					outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
				}
				vnArr.push(outVec);
			}
			var outStr1 = "", outStr2 = "";
			outStr1 += "solid model" + (outNodeIndex) + "\n";
			outStr2 += "solid model" + (outNodeIndex+1) + "\n";

			var m1VIndex = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 36, 37, 38, 39];
			for(i = 0;i<tmpFaces.length;i += 3){
				var vIndex = new Array();
				if(m1VIndex.indexOf(tmpFaces[i]) > -1 && m1VIndex.indexOf(tmpFaces[i+1]) > -1 && m1VIndex.indexOf(tmpFaces[i+2]) > -1){
					outStr1 += "facet normal ";
					for(k = 0;k<3;k++){
						outStr1 += (vnArr[tmpFaces[i]][k] + vnArr[tmpFaces[i+1]][k] + vnArr[tmpFaces[i+2]][k]);
						outStr1 += " ";
					}
					outStr1 += "\n    outer loop\n";
					for(k = 0;k<3;k++){
						outStr1 += "        " + vArr[tmpFaces[i+k]];
					}
					outStr1 += "    endloop\nendfacet\n";
				}else{
					outStr2 += "facet normal ";
					for(k = 0;k<3;k++){
						outStr2 += (vnArr[tmpFaces[i]][k] + vnArr[tmpFaces[i+1]][k] + vnArr[tmpFaces[i+2]][k]);
						outStr2 += " ";
					}
					outStr2 += "\n    outer loop\n";
					for(k = 0;k<3;k++){
						outStr2 += "        " + vArr[tmpFaces[i+k]];
					}
					outStr2 += "    endloop\nendfacet\n";
				}
			}
			//Dealing with inter faces
			outStr1 += "facet normal ";
			for(k = 0;k<3;k++){
				outStr1 += (vnArr[0][k] + vnArr[3][k] + vnArr[33][k]);
				outStr1 += " ";
			}
			outStr1 += "\n    outer loop\n";
			
			outStr1 += "        " + vArr[3];
			outStr1 += "        " + vArr[0];
			outStr1 += "        " + vArr[33];
			
			outStr1 += "    endloop\nendfacet\n";

			outStr1 += "facet normal ";
			for(k = 0;k<3;k++){
				outStr1 += (vnArr[0][k] + vnArr[33][k] + vnArr[32][k]);
				outStr1 += " ";
			}
			outStr1 += "\n    outer loop\n";
			
			outStr1 += "        " + vArr[0];
			outStr1 += "        " + vArr[33];
			outStr1 += "        " + vArr[32];
			
			outStr1 += "    endloop\nendfacet\n";

			outStr2 += "facet normal ";
			for(k = 0;k<3;k++){
				outStr2 += (vnArr[0][k] + vnArr[3][k] + vnArr[33][k]);
				outStr2 += " ";
			}
			outStr2 += "\n    outer loop\n";
			
			outStr2 += "        " + vArr[3];
			outStr2 += "        " + vArr[0];
			outStr2 += "        " + vArr[33];
			
			outStr2 += "    endloop\nendfacet\n";

			outStr2 += "facet normal ";
			for(k = 0;k<3;k++){
				outStr2 += (vnArr[0][k] + vnArr[33][k] + vnArr[32][k]);
				outStr2 += " ";
			}
			outStr2 += "\n    outer loop\n";
			
			outStr2 += "        " + vArr[0];
			outStr2 += "        " + vArr[33];
			outStr2 += "        " + vArr[32];
			
			outStr2 += "    endloop\nendfacet\n";


			outStr1 += "endsolid model" + (outNodeIndex);
			outStr2 += "endsolid model" + (outNodeIndex+1);

			
			download(outStr1, "model_part" + (outNodeIndex++) + ".stl", 'text/plain');
			download(outStr2, "model_part" + (outNodeIndex++) + ".stl", 'text/plain');
		}else{
			//vStr stores the output string of vertices positions
			//vnStr stores the output string of vertices normals
			//fStr stores the output string of face definition indices		
			var vStr = new Array(), vnSet = new Array(), outStr = "";

			for(i = 0;i<tmpPos.length;i += 3){
				var vec = [tmpPos[i], tmpPos[i+1], tmpPos[i+2], 1.0];
				var outVec = new Array();
				for(j = 0;j<16;j+=4){
					outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
				}
				vStr.push("vertex " + outVec[0]/outVec[3] + " " + outVec[1]/outVec[3] + " " + outVec[2]/outVec[3] + "\n");
			}

			for(i = 0;i<tmpNorm.length;i += 3){
				var vec = [tmpNorm[i], tmpNorm[i+1], tmpNorm[i+2], 1.0];
				var outVec = new Array();
				for(j = 0;j<16;j+=4){
					outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
				}
				vnSet.push(outVec);
			}
			outStr += "solid model" + outNodeIndex + "\n";
			for(i = 0;i<tmpFaces.length;i += 3){
				outStr += "facet normal ";
				var norm = new Array();
				for(k = 0;k<3;k++){
					norm.push(vnSet[tmpFaces[i]][k]/vnSet[tmpFaces[i]][3] + vnSet[tmpFaces[i+1]][k]/vnSet[tmpFaces[i+1]][3] + vnSet[tmpFaces[i+2]][k]/vnSet[tmpFaces[i+2]][3]);
				}
				normalize(norm);
				for(k = 0;k<3;k++){
					outStr += norm[k] + " ";
				}
				outStr += "\n    outer loop\n";
				for(k = 0;k<3;k++){
					outStr += "        " + vStr[tmpFaces[i+k]];
				}
				outStr += "    endloop\nendfacet\n\n";
			}
			outStr += "endsolid model" + outNodeIndex;
			download(outStr, "model_part" + (outNodeIndex++) + ".stl", 'text/plain');

		}
	}
}

function convertToOneStl(inputNode){
	var nodesArr = inputNode.nodes;
	var outNodeIndex = 0;
	var matList = new Array();	//Stores the transformation matrices
	var mainOutStr = "solid model\n";

	//Looping all matrices of nodes
	for(nodeI = 0;nodeI<nodesArr.length;nodeI++){

		var tmpMat = nodesArr[nodeI].nodes[0].nodes[0].nodes[0].getModelMatrix();
		matList.push(tmpMat);

		var curNode = nodesArr[nodeI].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0].nodes[0];
		var tmpPos = curNode.getPositions();
		var tmpNorm = curNode.getNormals();
		var tmpFaces = curNode.getIndices();		

		//vStr stores the output string of vertices positions
		//vnStr stores the output string of vertices normals
		//fStr stores the output string of face definition indices		
		var vStr = new Array(), vnSet = new Array(), outStr = "";

		for(i = 0;i<tmpPos.length;i += 3){
			var vec = [tmpPos[i], tmpPos[i+1], tmpPos[i+2], 1.0];
			var outVec = new Array();
			for(j = 0;j<16;j+=4){
				outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
			}
			vStr.push("vertex " + outVec[0]/outVec[3] + " " + outVec[1]/outVec[3] + " " + outVec[2]/outVec[3] + "\n");
		}

		for(i = 0;i<tmpNorm.length;i += 3){
			var vec = [tmpNorm[i], tmpNorm[i+1], tmpNorm[i+2], 1.0];
			var outVec = new Array();
			for(j = 0;j<16;j+=4){
				outVec.push(matList[nodeI][rowToColMajor(j)]*vec[0] + matList[nodeI][rowToColMajor(j+1)]*vec[1] + matList[nodeI][rowToColMajor(j+2)]*vec[2] + matList[nodeI][rowToColMajor(j+3)]*vec[3]);
			}
			vnSet.push(outVec);
		}
		for(i = 0;i<tmpFaces.length;i += 3){
			outStr += "facet normal ";
			var norm = new Array();
			for(k = 0;k<3;k++){
				norm.push(vnSet[tmpFaces[i]][k]/vnSet[tmpFaces[i]][3] + vnSet[tmpFaces[i+1]][k]/vnSet[tmpFaces[i+1]][3] + vnSet[tmpFaces[i+2]][k]/vnSet[tmpFaces[i+2]][3]);
			}
			normalize(norm);
			for(k = 0;k<3;k++){
				outStr += norm[k] + " ";
			}
			outStr += "\n    outer loop\n";
			for(k = 0;k<3;k++){
				outStr += "        " + vStr[tmpFaces[i+k]];
			}
			outStr += "    endloop\nendfacet\n\n";
		}
		mainOutStr += outStr;
	}
	mainOutStr += "endsolid model\n";

	download(mainOutStr, "model.stl", 'text/plain');
}

function normalize(vec){
	var mag = Math.abs(vec[0]) + Math.abs(vec[1]) + Math.abs(vec[2]);
	vec[0] /= mag;
	vec[1] /= mag;
	vec[2] /= mag;
}

//Just parsing the text storing .obj and return {<vertices>, <normals>, <faces>}
function parseObj(text){
	var objText = text.split("\n");
	var obj = {};	//The elements inside are string
	var vertexMatches = new Array, normalMatches = new Array, faceMatches = new Array;
	for(var i = 0;i<objText.length;i++){
		if(objText[i][0] == "v" && objText[i][1] == " "){
			vertexMatches.push(objText[i]);
		}
		else if(objText[i][0] == "v" && objText[i][1] == "n"){
			normalMatches.push(objText[i]);
		}
		else if(objText[i][0] == "f" && objText[i][1] == " "){
			faceMatches.push(objText[i]);
		}
	}
	if (vertexMatches)
	{
	    obj.vertices = vertexMatches.map(function(vertex)
	    {
	        var vertices = vertex.split(" ");
	        vertices.shift();
	        return vertices;
	    });
	}
	if (normalMatches)
	{
		obj.normals = normalMatches.map(function(normal)
	    {
	        var normals = normal.split(" ");
	        normals.shift();
	        return normals;
	    });
	}
	if (faceMatches)
	{
	    obj.faces = faceMatches.map(function(face)
	    {
	        var faces = face.split(" ");
	        faces.shift();
	        return faces;
	    });
	    var outFaces = new Array;
	    for(var i = 0;i<obj.faces.length;i++){
	    	outFaces.push(obj.faces[i].map(function(face){
	    		var outputFace  = face.split("//");
	    		return outputFace[0];
	    	}));
	    }
	    obj.faces = outFaces;
	}
	return obj;
}

//Used for dealing with latch faces and vertices' data storing in connector[]
function parseObj_withStoring(text, isConnector){
	var objText = text.split("\n");
	var obj = parseObj(text);	//The elements inside are string
	var f = new Array();
	for(var a = 0;a<obj.faces.length;a++){
		var vertices = new Array();
		for(var b = 0;b<3;b++){
			vertices.push([parseFloat(obj.vertices[parseInt(obj.faces[a][b]) - 1][0]), parseFloat(obj.vertices[parseInt(obj.faces[a][b]) - 1][1]), parseFloat(obj.vertices[parseInt(obj.faces[a][b]) - 1][2])]);
		}
		var tmpVec = new Array();
		tmpVec.push([vertices[0][0], vertices[0][1], vertices[0][2]]);
		tmpVec.push([vertices[1][0], vertices[1][1], vertices[1][2]]);
		tmpVec.push([vertices[2][0], vertices[2][1], vertices[2][2]]);
		
		f.push([[vertices[0][0], vertices[0][1], vertices[0][2]], [vertices[1][0], vertices[1][1], vertices[1][2]], [vertices[2][0], vertices[2][1], vertices[2][2]]]);
	}
	if(isConnector){
		connector.push(f);
		connector_No.push(outNodeIndex);
	}else{
		nonConnector.push(f);
		nonConnector_No.push(outNodeIndex);
	}
}

//The function converting obj to text(.obj)
function obj2Text(obj){
	var str = "", vnStr = "", fStr = "";
	obj.vertices.forEach(function(element){
		str += "v ";
		for(var i = 0;i<3;i++){
			str += String(element[i]) + " ";
		}
		str += "\n";
	});
	str += "\n";
	obj.normals.forEach(function(element){
		str += "vn ";
		for(var i = 0;i<3;i++){
			str += String(element[i]) + " ";
		}
		str += "\n";
	});
	str += "\n";
	var noZero = 0;
	obj.faces.forEach(function(element){
		if(element == 0)	noZero = 1;
	});
	obj.faces.forEach(function(element){
		str += "f ";
		for(var i = 0;i<3;i++){
			str += String(parseInt(element[i]) + noZero) + "//" + String(parseInt(element[i]) + noZero) + " ";
		}
		str += "\n";
	});
	str += "\n";

	return str;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//.obj export as local download files
function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);


    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */



    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; /* end if('download' in a) */



    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}

//Garbage
function latchFaces(nodeNum){
	switch(posArray[nodeNum]){
		case 'base':
			infoStr += "model" + outNodeIndex + " 9, 10, 11" + "\n";
			infoStr += "model" + outNodeIndex + " 9, 11, 12" + "\n";
			break;
		case 'rightWall':
			infoStr += "model" + outNodeIndex + " 1, 2, 3" + "\n";
			infoStr += "model" + outNodeIndex + " 1, 3, 4" + "\n";
			infoStr += "model" + outNodeIndex + " 13, 14, 15" + "\n";
			infoStr += "model" + outNodeIndex + " 13, 15, 16" + "\n";
			infoStr += "model" + outNodeIndex + " 21, 22, 23" + "\n";
			infoStr += "model" + outNodeIndex + " 21, 23, 24" + "\n";
			break;
		case 'leftWall':
			infoStr += "model" + outNodeIndex + " 1, 2, 3" + "\n";
			infoStr += "model" + outNodeIndex + " 1, 3, 4" + "\n";
			infoStr += "model" + outNodeIndex + " 13, 14, 15" + "\n";
			infoStr += "model" + outNodeIndex + " 13, 15, 16" + "\n";
			infoStr += "model" + outNodeIndex + " 21, 22, 23" + "\n";
			infoStr += "model" + outNodeIndex + " 21, 23, 24" + "\n";
			break;
		case 'backWall':
			infoStr += "model" + outNodeIndex + " 17, 18, 19" + "\n";
			infoStr += "model" + outNodeIndex + " 17, 19, 20" + "\n";
			infoStr += "model" + outNodeIndex + " 21, 22, 23" + "\n";
			infoStr += "model" + outNodeIndex + " 21, 23, 24" + "\n";
			break;
		case 'rightTriangle':
			infoStr += "model" + outNodeIndex + " 4, 5, 6" + "\n";
			infoStr += "model" + outNodeIndex + " 4, 6, 7" + "\n";
			infoStr += "model" + outNodeIndex + " 8, 9, 10" + "\n";
			infoStr += "model" + outNodeIndex + " 8, 10, 11" + "\n";
			infoStr += "model" + outNodeIndex + " 12, 13, 14" + "\n";
			infoStr += "model" + outNodeIndex + " 12, 14, 15" + "\n";
			break;
		case 'leftTriangle':
			infoStr += "model" + outNodeIndex + " 4, 5, 6" + "\n";
			infoStr += "model" + outNodeIndex + " 4, 6, 7" + "\n";
			infoStr += "model" + outNodeIndex + " 8, 9, 10" + "\n";
			infoStr += "model" + outNodeIndex + " 8, 10, 11" + "\n";
			infoStr += "model" + outNodeIndex + " 12, 13, 14" + "\n";
			infoStr += "model" + outNodeIndex + " 12, 14, 15" + "\n";
			break;
		case 'roof':
			infoStr += "model" + outNodeIndex + " 17, 18, 19" + "\n";
			infoStr += "model" + outNodeIndex + " 17, 19, 20" + "\n";
			infoStr += "model" + (outNodeIndex + 1) + " 17, 18, 19" + "\n";
			infoStr += "model" + (outNodeIndex + 1) + " 17, 19, 20" + "\n";
			break;

	}
}

// function loadXML(xmlText){
// 	var domParser = new DOMParser();
// 	xmlDoc = domParser.parseFromString(xmlText, 'text/xml');
// 	posArray = new Array();
// 	typeArray = new Array();
// 	var layers = xmlDoc.getElementsByTagName('layer');
// 	for(var layerLen = 0; layerLen < layers.length; layerLen++)
// 	{
// 		// For each element in the layer
// 		var elements = layers[layerLen].getElementsByTagName('element');
// 		for(var elementLen = 0; elementLen < elements.length; elementLen++)
// 		{
// 			var posNode = elements[elementLen].getElementsByTagName('pos');
// 			var typeNode = elements[elementLen].getElementsByTagName('type');
// 			posArray.push(posNode[0].textContent);
// 			typeArray.push(typeNode[0].textContent);
// 		}
// 	}
// 	// for(var i = 0;i<posArray.length;i++){
// 	// 	console.log(posArray[i]);
// 	// }
// }