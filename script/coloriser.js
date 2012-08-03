function colourMaker(){
	var colours = new Array();
	charDistance=getCharacterDistance(getHomologySets(alnA),getHomologySets(alnB));
	for(i=0;i<charDistance.length;i++){
		colours[i] = new Array();
		for(j=0;j<charDistance[i].length;j++){
		colours[i].push("#ff" + leadingZeros(Math.round(255-charDistance[i][j]*255).toString(16))+ leadingZeros(Math.round(255-charDistance[i][j]*255).toString(16)))
		}
	}
	return colours;
}

function leadingZeros(num){
	var s = "00" + num;
	return s.substr(s.length-2);
}

function visualiser(sequenceSet){
	
	colourArray = colourMaker();
	
	
	$alignmentDisplay = $("<table/>");
	
	for(i=0; i<sequenceNumber;i++){
		var $alignmentRow = $("<tr/>");
		var $alignmentName = $("<td/>");
		$alignmentName.text(alnB[i].name);
		$alignmentRow.append($alignmentName);
		
		var k = 0;
		for (j=0;j<sequenceSet[i].content.length;j++){
			
			var $alignmentContent = $("<span/>");
			$alignmentContent.text(sequenceSet[i].content[j]);
			if (sequenceSet[i].content[j] != "-") {
				$alignmentContent.attr("style", "background-color:"+colourArray[i][k++]);
			}
			$alignmentRow.append($alignmentContent);
		}
		$alignmentDisplay.append($alignmentRow);
	}
	$('#alignmentDisplay').append($alignmentDisplay);
	$alignmentDiv = $("<div>").attr("style","overflow:scroll; overflow-y:hidden; white-space:nowrap; font-family:monospace; :padding:10px;").addClass("vis").append($alignmentDisplay);
	return $alignmentDiv;
	
}