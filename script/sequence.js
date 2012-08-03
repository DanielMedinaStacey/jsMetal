// CONTENTS:
// function sequence(name,content)
// function parser(alignment) 
// function labeller(alignment,methodFlag)
// function nameSorter(a,b)


// SEQUENCE
//Constructor for sequence objects.

function sequence(name,content){
	this.name=name;
	this.content=content;
}



// PARSER
// Takes a FASTA formatted alignment and returns an array of "sequence" objects. 
// Each alignment arrives as a single string, which is 'regexed' into identifier lines  (^>.+)
// and sequences (^[^>]+) separated by a non-captured newline (?:\n).
// TODO: replace \w-\n with a proper selectable alphabet for each kind of sequence.

function parser(alignment) {
	//return array, name of each sequence (identifier) and content (actual sequence)
	var parsedSequences = new Array(); 
	var name;
	var content;
	
	var seqparser = new RegExp("(^>.+)(?:\n)(^[^>]+)","mg");
	
	var invalidCharacters = new RegExp("[^ABCDEFGHIKLMNOPQRSTUVWYZXabcdefghiklmnopqrstuvwyzx*-]");
	var peptideOnlyCharacters = new RegExp("[EFILOPQZefilopqz*-]");
										
	
	//to check all sequences are the same length 
	var sequenceLength;  
	
	var i=0;
	//fills the names and content arrays removing unnecesary symbols (> and \n)
	while((parsing = seqparser.exec(alignment))){

		name = parsing[1].trim().replace(/^>/,"");
		content = parsing[2].trim().replace(/\n/g,"");
				
		var badChar = content.search(invalidCharacters);
		if(badChar != -1){
			throw "Invalid character in sequence \""+name+"\": "+content[badChar];
		}
		
		var isPeptide= content.search(peptideOnlyCharacters);
		if(isPeptide != -1){
			G.sequenceType="Peptide";
		}
		
		parsedSequences[i] = new sequence(name,content);
		
		if(sequenceLength && sequenceLength != parsedSequences[i].length){
			throw "Sequences of differing lengths in alignment";
		}
		
		sequenceLength = parsedSequences[i].length;
		i++;
	}
	return parsedSequences;
}

// LABELLER
// Label characters and gaps depending on flag value. Characters are indexed consecutively,
// while gaps are indexed according to the last indexed character. The first non-gap character 
// in a sequence is indexed as "1" if the first character is a gap it's indexed as "0".
// Labelling format is "iXindex", where i is the sequence number and X is the character or gap.

function labeller(alignment){	
	var index;
	var nextLabel;
	
	
	
	
	for(var i =0; i<G.sequenceNumber;i++){
		alignment[i].labeledContent = [];
		alignment[i].labeledContent[SSP] = [];
		alignment[i].labeledContent[SIM] = [];
		alignment[i].labeledContent[POS] = [];
		//alignment[i].labeledContent[EVO] = [];
		
		index=0;
		for(var j=0;j<alignment[i].content.length;j++){
			
			if(alignment[i].content[j] != "-"){
				// Label character and increase index. Using pre-increment on index to start at 1.
				nextLabel = i + "X" + ++index;
				
				alignment[i].labeledContent[SSP].push(nextLabel);
				alignment[i].labeledContent[SIM].push(nextLabel);
				alignment[i].labeledContent[POS].push(nextLabel);
				//alignment[i].labeledContent[EVO].push(nextLabel);
			
			}
		
			else{
				// Do not label gaps
				alignment[i].labeledContent[SSP].push("-");
				// Label gaps by sequence
				alignment[i].labeledContent[SIM].push( i + "-");
				// Label gaps by position
				alignment[i].labeledContent[POS].push( i + "-" + index);
				//Label gaps by voodoo
				//alignment[i].labeledContent[EVO].push( i + "-" + index);
			}
		}
	}
}

function nameSorter(a,b){
	if (a.name < b.name) {return -1;}
	if (a.name > b.name) {return 1;}
	return 0;
}
