
function getPositions(){
	var position = new Object();
	position.one=new Array();
	position.two=new Array();
	for (i=0;i<truSeq.length-1;i++){
		position.one[i]=$("#one"+i).position().left;
		position.two[i]=$("#two"+i).position().left;

	}
	return position;
}


function scanCentralChar(offset){
	startingPoint = parseInt((divWidth/2)) + offset;
	//divCentre = startingPoint; //GLOBALISE
	// IMPORTANT TODO: reshuffle variables to make it easy to get proper seqIndex!!!
	while(seqOneIndex[1][startingPoint] == undefined){
		startingPoint--;
		}
	return  seqOneIndex[1][startingPoint]; 
}

function initialScrollSync(){
	charPositions = getPositions();
	prev="";
	startScroll=$("#one").scrollLeft();
	offset=startScroll-$("#one").scrollLeft();
	scanCentralChar(offset);
	
	scrollSync();
}

function scrollSync(){ 
		offset=$("#one").scrollLeft()-startScroll;
		$("#one"+prev).css("background-color","white");
		$("#two"+prev).css("background-color","white");
		central=scanCentralChar(offset);
		prev=central;
		$("#one"+central).css("background-color","red");
		$("#two").scrollLeft(charPositions.two[central]+charWidth);
		$("#two"+central).css("background-color","red");
	}