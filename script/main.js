//CONSTANTS - to use arrays instead of objects

var SSP = 0;
var SIM = 1;
var POS = 2;
var EVO = 3;


//Global object (container for a few general features and options that should be easily available)
var G = {};

	
function process() {
	START = new Date();
	//hide error box if it was present
	$("#errorBox").css("display","none");
	
	G.doEvo = 0;
	var tree = null;
	
	
	
	try{
		//parse and check syntax of alignments
		alnA = parser( $("#alignment1").val(),"alignment 1" );
		alnB = parser( $("#alignment2").val(),"alignment 2" );
		//switch character colouring to appropriate scheme
		$("#seqColour").attr('href','./'+G.sequenceType+'.css');
		
		alnA.sort(nameSorter);
		alnB.sort(nameSorter);
		
		//Check the mutual consistency of both alignments and gather a few global characteristics
		var seqDetails = checkConsistency(alnA,alnB);
		
		G.sequenceNumber = seqDetails[0];
		G.origLengths = seqDetails[1];
		//G.origSeqs = seqDetails[2];
		G.names=nameLookup(alnA);
		
		
		//remove whitespace from newick string input
		newick_string=$("#newick").val().replace(/\s/g, "");
		
		//if there's anything left, it had better be newick tree or we will be very upset.
		if(newick_string){
			root=parseNewickString(newick_string);
			//check if names match those of the sequences
			treeNames = [];
			for(var i=0;i<root.length;i++){
				treeNames.push(root[i].name);
			}
			
			treeNames.sort();
			for(var i=0;i<alnA.length;i++){
				if(treeNames[i] != alnA[i].name) { 
					throw "Names differ in Newick tree and alignments";
				}
			}
			if(treeNames[alnA.length] != undefined){
				throw "There are more sequences in the Newick tree than in the alignments";
			}
			
			G.doEvo=1;
			$("#evol").removeAttr("disabled");
			$("#evol").html("Homology distance with tree-labelled gaps");
			tree=makeTree(root);
		
			}
	
	
		var homSetsA=[];
		var homSetsB=[];
			
		var alnAresults=getHomologySets(alnA,tree,G.doEvo);
		var alnBresults=getHomologySets(alnB,tree,G.doEvo);
		
		var homSetsA = alnAresults[0];
		var gapsA = alnAresults[1];
		var homSetsB = alnBresults[0];
		var gapsB = alnBresults[1];	
		
		var gapsHere=[];
		
		var sharedLength= gapsA.length > gapsB.length ? gapsA.length : gapsB.length
		for(var j=0; j < sharedLength;j++){
			gapsHere[j]=(gapsA[j] && gapsB[j]);
		}
		
		distances=getDistances(homSetsA,homSetsB,G.doEvo,gapsHere);
		END=new Date();
		console.log(END-START);
			}

	catch(e)
	{
		$("#errorBox").html("<b>ERROR: "+e+"</b>");
		$("#errorBox").fadeIn();
		return;
	}
	
	G.visualize=$("#visualize:checked").val();
	
		
	$("#controlPanel").css("display","");
	$("#sameOpacity").html("Fade distant "+G.sequenceType+"s");
	$("#diffOpacity").html("Fade close "+G.sequenceType+"s");
	
	$("#input").remove();
	$("#instructions").remove();
	var homType=parseInt($('#homologyType option:selected').val());
	if(G.visualize){
		$("#distanceVisualizationPanel").css("display","");
		var cssCache=[[],[],[],[]];
		
		//create coloured sequences for all homology types
		var $alnASeqDiv = colouredSequenceMaker(distances.character,alnA,"alnA");
		var $alnBSeqDiv = colouredSequenceMaker(distances.character,alnB,"alnB");
		
		
		var visType=parseInt($('#distanceVisualizationType option:selected').val());
		
		//create and append visualiser with initial default homology type
		var $visualiser = makeVisualiser($alnASeqDiv[homType],$alnBSeqDiv[homType],alnA,alnB);
		
		$("body").append($visualiser);
		G.focusSeq=0;
		rebind(homType);
		
		$("#distanceVisualizationType").change(function () {
			$("#distanceVisualizationType option:selected").each(function () {
				
				visType=parseInt($(this).val());
				switch (visType){
				case 0:
					$("#seqColour").attr('href','./'+G.sequenceType+'.css');
					$("#fading").attr('href',"./none.css");
					break;
				case 1:
					$("#seqColour").attr('href','./redfade.css');
					$("#fading").attr('href',"./none.css");
					
					break;
				case 2:
					$("#seqColour").attr('href','./'+G.sequenceType+'.css');
					$("#fading").attr('href',"./fadeDist.css");
					
					break;
				case 3:
					$("#seqColour").attr('href','./'+G.sequenceType+'.css');
					$("#fading").attr('href',"./fadeNear.css");
				}
				
				});
			})
	}
	
	$("#homologyType").change(function () {
			
			homType=parseInt($(this).val());
			
			for(var i=0;i<G.sequenceNumber;i++){
				var roundedSeqDistance=Math.round((distances.sequence[homType][i]*1000000))/1000000;
				
				$("#"+alnA[i].name+"_dist").text(roundedSeqDistance);
				
			}
			var roundedAlnDistance=Math.round((distances.alignment[homType]*1000000))/1000000;
			$("#alnDist").text(roundedAlnDistance);
			
			if(G.visualize){
				$("#alnA_seqs").unbind();
				$("#alnB_seqs").unbind();
				keepScroll=$("#alnA_seqs").scrollLeft();
				$(".centralChar").removeClass("centralChar");
				$("#alnA_seqs").replaceWith($alnASeqDiv[homType]);
				$("#alnB_seqs").replaceWith($alnBSeqDiv[homType]);
			
				rebind(homType);
				$(".centralChar").removeClass("centralChar");
				$("#alnA_seqs").scrollLeft(keepScroll);
				//$("#alnA_seqs").scrollLeft(keepScroll);
				
			}
			
			if(G.charDists){
				var newCharDists=makeCharDist(distances,homType,alnA);
				$("#chardists").replaceWith(newCharDists);
			}
			
			
		});
	
	
	$("#showCharDists").change(function() {
		G.charDists=$("#showCharDists:checked").val();
		if(G.charDists){
			$("body").append(makeCharDist(distances,homType,alnA));
		}
		else{
			$("#chardists").remove();
			}
		}
		);
	var $output = makeOutput(distances,homType,alnA);
	$("body").append($output);
	
	
	


	
	
}

function rebind(homType){
		
	//get width of sequence display and characters	
		G.divWidth = $("#alnA_seqs").outerWidth();
		G.charWidth =  getCharWidth();
		
		//add padding to each end of sequences such that both first and last characters can be displayed in centre of  visualiser
		
		if( $(".seq_"+0).html().match("&nbsp") ){
		}else{
			var padChars=parseInt(0.5*G.divWidth/G.charWidth);
			G.padChars=padChars;
			var padding = charPadding(padChars);
			for(var i=0;i<G.sequenceNumber;i++){
				$(".seq_"+i).prepend(padding);
				$(".seq_"+i).append(padding);
			}
		}
		
		//make initial scroll position feel natural by showing start of alignment on the left of the display
		var startScroll=(parseInt(0.5*G.divWidth/G.charWidth))*G.charWidth;
		console.log(startScroll)
		
		$("#alnA_seqs").scrollLeft(startScroll);
		$("#alnB_seqs").scrollLeft(startScroll);
		
		// alnXPositionOf array indicates the position j of character number i in the true sequence in alignment X
		// alnXCharacterAt array indicates what character i of the true sequence is at position number j in alignment X
		// yes, each pair of arrays is complementary
		//var alnAPositionOf, alnACharacterAt, alnBPositionOf, alnBCharacterAt;
		var alnACharPos = getPositions(alnA);
		var alnBCharPos = getPositions(alnB);
		
		var alnAPositionOf = alnACharPos[0];
		var alnACharacterAt = alnACharPos[1];
		G.alnACharacterAt = alnACharPos[1];
		G.alnAPositionOf = alnACharPos[0];
		
		var alnBPositionOf = alnBCharPos[0];
		var alnBCharacterAt = alnBCharPos[1];
		
		//"Central" is the character
		var oldCentral="";
		
		var oldFocusSeq=G.focusSeq;
		
		$("#alnA_seqs").bind('click', function(event) {
		
			G.focusSeq = $(event.target).closest("div").index();
			
			central = alnACharacterAt[G.focusSeq][$(event.target).closest("span").index() - G.padChars];
	
			
			$("#alnA"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
			$("#alnB"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
			
			oldFocusSeq=G.focusSeq;
			
			$("#alnA_seqs").scrollLeft(alnAPositionOf[G.focusSeq][central]*G.charWidth);
			$("#alnB_seqs").scrollLeft(alnBPositionOf[G.focusSeq][central]*G.charWidth);
	
			oldCentral=central;
			
			$("#charDist").text(distances.character[homType][G.focusSeq][central]);
			$("#alnA"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			$("#alnB"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			G.central=central;
		});
	
		$("#alnB_seqs").bind('click', function(event) {
			
			G.focusSeq = $(event.target).closest("div").index();
			central = alnBCharacterAt[G.focusSeq][$(event.target).closest("span").index() - G.padChars];
			$("#alnA"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
			$("#alnB"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
			
			oldFocusSeq=G.focusSeq;
			
			$("#alnA_seqs").scrollLeft(alnAPositionOf[G.focusSeq][central]*G.charWidth);
			$("#alnB_seqs").scrollLeft(alnBPositionOf[G.focusSeq][central]*G.charWidth);
	
			oldCentral=central;
			
			$("#charDist").text(distances.character[homType][G.focusSeq][central]);
			$("#alnA"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			$("#alnB"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			G.central=central;
		});
	
		$("#alnA_seqs").scroll(function() { 
			$("#alnA_names").scrollTop($("#alnA_seqs").scrollTop());
			$("#alnB_seqs").scrollTop($("#alnA_seqs").scrollTop());
		
			$("#alnA"+"_"+G.focusSeq+"_"+oldCentral).removeClass("centralChar");
			$("#alnB"+"_"+G.focusSeq+"_"+oldCentral).removeClass("centralChar");
			
			central=alnACharacterAt[G.focusSeq][Math.round($("#alnA_seqs").scrollLeft()/G.charWidth)];
			
			oldCentral=central;
			
			$("#charDist").text(distances.character[homType][G.focusSeq][central]);
			$("#alnA"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			$("#alnB_seqs").scrollLeft(alnBPositionOf[G.focusSeq][central]*G.charWidth);
			$("#alnB"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			G.central=central;
		});
		
		$("#alnB_seqs").scroll(function() { 
			$("#alnB_names").scrollTop($("#alnB_seqs").scrollTop());
			$("#alnA_seqs").scrollTop($("#alnB_seqs").scrollTop());
			
			
			$("#alnA"+"_"+G.focusSeq+"_"+oldCentral).removeClass("centralChar");
			$("#alnB"+"_"+G.focusSeq+"_"+oldCentral).removeClass("centralChar");
			
			central=alnBCharacterAt[G.focusSeq][Math.round($("#alnB_seqs").scrollLeft()/G.charWidth)];
			
			oldCentral=central;
			
			$("#charDist").text(distances.character[homType][G.focusSeq][central]);
			$("#alnB"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			$("#alnA_seqs").scrollLeft(alnAPositionOf[G.focusSeq][central]*G.charWidth);
			$("#alnA"+"_"+G.focusSeq+"_"+central).addClass("centralChar");
			G.central=central;
		});
	}

