// CONTENTS
// function globalBubbleSort(alignment)
// function areNonOverlapping(columnA, columnB)
// function shouldBeFlipped(leftColumn, rightColumn)

// GLOBALBUBBLESORT

function globalBubbleSort(alignment) {
	
	var columns = transposeSequence(getContent(alignment));
	var repeat;
	var temp;
	do{
		repeat = false;
		
		for (var i = 0; i < (alignment[0].content.length - 1); i++){
			
			if( areNonOverlapping( columns[i], columns[i+1]) ){
				
				if( shouldBeFlipped( columns[i], columns[i+1]) ){
					//switcheroo
					temp = columns[i];
					columns[i] = columns[i+1];
					columns[i+1] = temp;
					//there was at least one flipped column; repeat the loop
					repeat = true;
				}
			}
		}
	
	}while(repeat);
	
	putContent(alignment,transposeSequence(columns));
}

// ARENONOVERLAPPING
// Tests if two columns are non-overlapping. We assume they are until
// we find a pair of non-gap characters.
function areNonOverlapping(columnA, columnB){
	
	var nonOverlapping = true;
	
	for (var i =0; i<G.sequenceNumber;i++){
		
		//The moment we find a pair where neither character is gap, the columns are non-overlapping
		if( columnA[i] != "-" && columnB[i] != "-"){
			nonOverlapping = false;
			break;
		}
		
	}
	
	return nonOverlapping;
	
}

// SHOULDBEFLIPPED
// Tests if two *confirmed non-overlapping* columns should be flipped. Will do weird things
// if passed overlapping columns.
function shouldBeFlipped(leftColumn, rightColumn){
	
	var flipThem = false;
	
	for(var i=0; i<G.sequenceNumber;i++){
		
		// Are both characters gaps? Let's continue
		if(leftColumn[i] == "-" && rightColumn[i]=="-"){
			continue;
		}
		// No? Then only one of them must be a gap (or something has gone horribly wrong).
		// If it's the one on the right, we must flip the columns. Whatever the case, we break the loop.
		else{
			flipThem = (rightColumn[i]=="-")
			break;
		}		
	}
	return flipThem;
}


