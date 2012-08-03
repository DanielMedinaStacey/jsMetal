// CONTENTS
// function getCharacterDistance(homSetsA, homSetsB)
// function getSequenceDistance(homSetsA,homSetsB)
// function getAlignmentDistance(homSetsA,homSetsB)
// function getSSPDistance(homSetsA,homSetsB)
// function getIntersection(setA, setB)
// function getUnion(setA, setB)
// function tempListMaker(setA,setB)


function getDistances(homSetsA,homSetsB){
	var distances = new Object();
	
	distances.character = getCharacterDistance(homSetsA, homSetsB);
	distances.sequence = getSequenceDistance(distances.character,homSetsA[SSP],homSetsB[SSP]);
	distances.alignment = getAlignmentDistance(distances.sequence,homSetsA[SSP],homSetsB[SSP]);
	
	return distances;
}


// GETCHARACTERDISTANCE
function getCharacterDistance(homSetsA, homSetsB){
	var setSize= G.sequenceNumber - 1;
	
	var charDist = [];
	charDist[SSP] = [];
	charDist[SIM] = [];
	charDist[POS] = [];
	
	for(var i=0;i<G.sequenceNumber;i++){
		charDist[SSP][i] = [];
		charDist[SIM][i] = [];
		charDist[POS][i] = [];
		
		for(var j=0;j<homSetsA[SIM][i].length;j++){
			charDist[SSP][i][j] = 0;
			charDist[SIM][i][j] =0;
			charDist[POS][i][j] =0;
			// charDist[EVO][i][j] = 0;
			
			var union = getUnion(homSetsA[SSP][i][j],homSetsB[SSP][i][j]);
			var intersection = getIntersection(homSetsA[SSP][i][j],homSetsB[SSP][i][j]);
			
			
				
			for(var k=0;k<setSize;k++){
				if(homSetsA[SIM][i][j][k]!=homSetsB[SIM][i][j][k]){
					charDist[SIM][i][j]++;
				}
				if(homSetsA[POS][i][j][k]!=homSetsB[POS][i][j][k]){
					charDist[POS][i][j]++;
				}
				/*if(homSetsA[EVO][i][j][k]!=homSetsB[EVO][i][j][k]){
					charDist[EVO][i][j]++;
				}*/
			}
			
			if (union==0){
                                //special case: 0/0=0 distance rather than NaN
                                charDist[SSP][i][j] = 0.0;
                        }else
                        {
                                charDist[SSP][i][j] = 1-(intersection/union);
                        }
			charDist[SIM][i][j]/=setSize;
			charDist[POS][i][j]/=setSize;
			// charDist[EVO][i][j]/=setSize;
			
		}
	}
	return charDist;
}

function getSequenceDistance(charDist,sspSetsA,sspSetsB){
	var seqDist = [];
	seqDist[SSP] = [];
	seqDist[SIM] = [];
	seqDist[POS] = [];
	
	var union = 0;
	var intersection = 0;
	
	for(var i=0;i<G.sequenceNumber;i++){
			seqDist[SIM][i]=0;
			seqDist[POS][i]=0;
			//seqDist[EVO][i]=0;
			for(var j=0;j<G.origLengths[i];j++){
			
				seqDist[SIM][i]+=charDist[SIM][i][j];
				seqDist[POS][i]+=charDist[POS][i][j];
				//seqDist[EVO][i]+=charDist[EVO][i][j];
				
				union += getUnion(sspSetsA[i][j],sspSetsB[i][j]);
				intersection += getIntersection(sspSetsA[i][j],sspSetsB[i][j]);
			}
			
			seqDist[SSP].push(1-(intersection/union));
			union=0;
			intersection=0;
			
			seqDist[SIM][i] /= G.origLengths[i];
			seqDist[POS][i] /= G.origLengths[i];
			//seqDist[EVO][i] /= homSetsA[EVO][i].length;
	}
	return seqDist;
}

function getAlignmentDistance(seqDist,sspSetsA,sspSetsB){
	var alnDist = [];
	
	var allChars = 0;
	
	for(var i=0;i<G.origLengths.length;i++){
		allChars += G.origLengths[i];
	}
	
	var union=0;
	var intersection=0;
	for(var i=0;i<G.sequenceNumber;i++){
		for(var j=0;j<sspSetsA[i].length;j++){
			union += getUnion(sspSetsA[i][j],sspSetsB[i][j]);
			intersection += getIntersection(sspSetsA[i][j],sspSetsB[i][j]);
		}
	}
		
	alnDist[SIM]=0;
	alnDist[POS] = 0;
	for(var i=0;i<G.sequenceNumber;i++){
		alnDist[SIM]+=seqDist[SIM][i]*G.origLengths[i];
		alnDist[POS]+=seqDist[POS][i]*G.origLengths[i];
		//alnDist[EVO]+=seqDist[EVO][i]*G.origLengths[i];
	}
	
	alnDist[SSP] = 1-(intersection/union);
	alnDist[SIM]/=allChars;
	alnDist[POS]/=allChars;
	//alnDist[EVO]/=allChars;
	
	return alnDist;
}	


//GETINTERSECTION
function getIntersection(setA, setB){
	var tempList=tempListMaker(setA,setB);
	var lastSeen;
	var intersection = 0;
	for(var i=0;i<tempList.length;i++){
		if(tempList[i]==lastSeen){
			intersection++;
		}
		lastSeen = tempList[i];
	}
	return intersection;
}

//GETUNION
function getUnion(setA, setB){
	var tempList=tempListMaker(setA,setB);
	var lastSeen;
	var union = 0;
	for(var i=0;i<tempList.length;i++){
		if(tempList[i]==lastSeen){
		}
		else{union++;}
		lastSeen = tempList[i];
	}
	
	return union;
}

//TEMPLISTMAKER
function tempListMaker(setA,setB){
	var tempList=(setA.concat(setB)).sort();
	while(tempList[0]=="-")
	{
		tempList.shift();
	}
	return tempList;
}
