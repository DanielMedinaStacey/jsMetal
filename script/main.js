//CONSTANTS - to use arrays instead of objects

var SSP = 0;
var SIM = 1;
var POS = 2;
var EVO = 3;

//Global object (container)
var G = {};



function process() {
	
	$("#errorBox").css("display","none");
	$("#input").hide();
	G.ignoreNamesFlag = false; //TODO
	G.sequenceType = "Nucleotide"; //Assume sequence is a nucleotide until parser() says otherwise
	
	try{
		alnA = parser( $("#alignment1").val() );
		alnB = parser( $("#alignment2").val() );
			
		if( !G.ignoreNamesFlag){
			alnA.sort(nameSorter);
			alnB.sort(nameSorter);
		}
		
		var seqDetails = checkConsistency(alnA,alnB);
		
		G.sequenceNumber = seqDetails[0];
		G.origLengths = seqDetails[1];
		G.origSeqs = seqDetails[2];
		
	}

	catch(e)
	{
		$("#errorBox").html("<b>ERROR: "+e+"</b>");
		$("#errorBox").fadeIn();
		return;
	}
				
	homSetsA = getHomologySets(alnA);
	homSetsB = getHomologySets(alnB);

	distances= getDistances(homSetsA,homSetsB);
	$("#controlPanel").css("display","");
	$("#input").remove();
	var cssCache=[[],[],[],[]];
	
	//create coloured sequences for all homology types
	var $alnASeqDiv = colouredSequenceMaker(distances.character,alnA,"alnA");
	var $alnBSeqDiv = colouredSequenceMaker(distances.character,alnB,"alnB");
	
	var homType=parseInt($('#homologyType option:selected').val());
	var visType=parseInt($('#distanceVisualizationType option:selected').val());
	
	//create and append visualiser with initial default homology type
	var $visualiser = makeVisualiser($alnASeqDiv[homType],$alnBSeqDiv[homType],alnA,alnB);
	var $output = makeOutput(distances,homType,alnA);
	$("body").append($visualiser);
	$("body").append($output);
	
	
	//get width of sequence display and characters
	var divWidth = $("#alnA_seqs").outerWidth();
	var charWidth =  getCharWidth();
	
	//add padding to each end of sequences such that both first and last characters can be displayed in centre of  visualiser
	var padChars=parseInt(0.5*divWidth/charWidth)
	var padding = charPadding(padChars);
	for(var i=0;i<G.sequenceNumber;i++){
		$(".seq_"+i).prepend(padding);
		$(".seq_"+i).append(padding);
	}
	
	//make initial scroll position feel natural by showing start of alignment on the left of the display
	var startScroll=(parseInt(0.5*divWidth/charWidth))*charWidth;
	$("#alnA_seqs").scrollLeft(startScroll);
	$("#alnB_seqs").scrollLeft(startScroll);
	
	// alnXPositionOf array indicates the position j of character number i in the true sequence in alignment X
	// alnXCharacterAt array indicates what character i of the true sequence is at position number j in alignment X
	// yes, each pair of arrays is complementary
	var alnAPositionOf, alnACharacterAt, alnBPositionOf, alnBCharacterAt;
	var alnACharPos = getPositions(alnA);
	var alnBCharPos = getPositions(alnB);
	
	var alnAPositionOf = alnACharPos[0];
	var alnACharacterAt = alnACharPos[1];
	
	var alnBPositionOf = alnBCharPos[0];
	var alnBCharacterAt = alnBCharPos[1];
	
	//"Central" is the character
	var oldCentral="";
	var focusSeq=0;
	var oldFocusSeq=focusSeq;
	
	
	
	$("#alnA_seqs").bind('click', function(event) {
		
		focusSeq = $(event.target).closest("div").index();
		central = alnACharacterAt[focusSeq][$(event.target).closest("span").index() - padChars];
		$("#alnA"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
		$("#alnB"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
		
		oldFocusSeq=focusSeq;
		
		$("#alnA_seqs").scrollLeft(alnAPositionOf[focusSeq][central]*charWidth);
		$("#alnB_seqs").scrollLeft(alnBPositionOf[focusSeq][central]*charWidth);

		oldCentral=central;
		
		$("#charDist").text(distances.character[homType][focusSeq][central]);
		$("#alnA"+"_"+focusSeq+"_"+central).addClass("centralChar");
		$("#alnB"+"_"+focusSeq+"_"+central).addClass("centralChar");
	});
	
	$("#alnB_seqs").bind('click', function(event) {
		
		focusSeq = $(event.target).closest("div").index();
		central = alnBCharacterAt[focusSeq][$(event.target).closest("span").index() - padChars];
		$("#alnA"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
		$("#alnB"+"_"+oldFocusSeq+"_"+oldCentral).removeClass("centralChar");
		
		oldFocusSeq=focusSeq;
		
		$("#alnA_seqs").scrollLeft(alnAPositionOf[focusSeq][central]*charWidth);
		$("#alnB_seqs").scrollLeft(alnBPositionOf[focusSeq][central]*charWidth);

		oldCentral=central;
		
		$("#charDist").text(distances.character[homType][focusSeq][central]);
		$("#alnA"+"_"+focusSeq+"_"+central).addClass("centralChar");
		$("#alnB"+"_"+focusSeq+"_"+central).addClass("centralChar");
	});
	
	$("#alnA_seqs").scroll(function() { 
		$("#alnA_names").scrollTop($("#alnA_seqs").scrollTop());
		$("#alnB_seqs").scrollTop($("#alnA_seqs").scrollTop());
	
		$("#alnA"+"_"+focusSeq+"_"+oldCentral).removeClass("centralChar");
		$("#alnB"+"_"+focusSeq+"_"+oldCentral).removeClass("centralChar");
		
		central=alnACharacterAt[focusSeq][Math.round($("#alnA_seqs").scrollLeft()/charWidth)];
		
		oldCentral=central;
		
		$("#charDist").text(distances.character[homType][focusSeq][central]);
		$("#alnA"+"_"+focusSeq+"_"+central).addClass("centralChar");
		$("#alnB_seqs").scrollLeft(alnBPositionOf[focusSeq][central]*charWidth);
		$("#alnB"+"_"+focusSeq+"_"+central).addClass("centralChar");
	});
	
	$("#alnB_seqs").scroll(function() { 
		$("#alnB_names").scrollTop($("#alnB_seqs").scrollTop());
		$("#alnA_seqs").scrollTop($("#alnB_seqs").scrollTop());
		
		
		$("#alnA"+"_"+focusSeq+"_"+oldCentral).removeClass("centralChar");
		$("#alnB"+"_"+focusSeq+"_"+oldCentral).removeClass("centralChar");
		
		central=alnBCharacterAt[focusSeq][Math.round($("#alnB_seqs").scrollLeft()/charWidth)];
		
		oldCentral=central;
		
		$("#charDist").text(distances.character[homType][focusSeq][central]);
		$("#alnB"+"_"+focusSeq+"_"+central).addClass("centralChar");
		$("#alnA_seqs").scrollLeft(alnAPositionOf[focusSeq][central]*charWidth);
		$("#alnA"+"_"+focusSeq+"_"+central).addClass("centralChar");
	});
	
	$("#homologyType").change(function () {
		
		homType=parseInt($(this).val());
		
		if(cssCache[homType][visType] == undefined){
			cssCache[homType][visType] = [];
			cssCache[homType][visType]=transparentAminoCSS(distances.character[homType],visType);
		}
		changeDistanceVisualization(cssCache[homType][visType]);
		
		for(var i=0;i<G.sequenceNumber;i++){
			var roundedSeqDistance=Math.round((distances.sequence[homType][i]*1000000))/1000000;
			$("#"+alnA[i].name+"_dist").text(roundedSeqDistance);
		}
		
		
		});
	$("#distanceVisualizationType").change(function () {
		$("#distanceVisualizationType option:selected").each(function () {
			
			visType=parseInt($(this).val());
			switch (visType){
			case 2:
				$("#aminoColour").attr('href','./defaultamino.css');
				changeDistanceVisualization();
				break;
			case 3:
				$("#aminoColour").attr('href','./redfade.css');
				changeDistanceVisualization();
				//$("#visual").attr('href','./redfade.css');
				
				break;
			default:
				$("#aminoColour").attr('href','./defaultamino.css');
				if(cssCache[homType][visType] == undefined){
					cssCache[homType][visType] = [];
					cssCache[homType][visType]=transparentAminoCSS(distances.character[homType],visType);
				}
				changeDistanceVisualization(cssCache[homType][visType]);
				
				break;
			}
			
			});
		})
	
	
}


















