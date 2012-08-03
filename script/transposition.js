// TRANSPOSESEQUENCE
// Turns an array of rows into columns and viceversa

function transposeSequence(sequence){
	
	var transposed = new Array();
		
	for (var i = 0; i<sequence[0].length;i++){
		transposed[i]="";
		for (j=0;j<sequence.length;j++){
			transposed[i] = transposed[i].concat(sequence[j][i]);
		}
	}
	
	return transposed;
}

// GETCONTENT
// Extracts the rows (sequences) from an alignment array so
// they can be transposed.

function getContent(alignment){
	
	var contentArray = new Array(); 
	for(i=0;i<alignment.length;i++){
		contentArray.push(alignment[i].content);
	}
		return contentArray;
}

// PUTCONTENT
// Returns the rows (sequences) into an alignment array
// No return value because JavaScript passes objects and
// arrays by reference, so the alignment will be modified
// as a side-effect.
function putContent(alignment,newContent){
	
	for(i=0;i<alignment.length;i++){
		alignment[i].content = newContent[i];
	}
}