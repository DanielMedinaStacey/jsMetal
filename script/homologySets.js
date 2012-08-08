// GETHOMOLOGYSETS
function getHomologySets(seqs,root){
	
	globalBubbleSort(seqs);
	labeller(seqs,root);
	
	var homologySets = [];
	homologySets[SSP] = [];
	homologySets[SIM] = [];
	homologySets[POS] = [];
	//homologySets[EVO] = [];
	var i;
	var j;
	var jNoGap;
	for (i=0;i<seqs.length;i++){
		homologySets[SSP][i]= [];
		homologySets[SIM][i]= [];
		homologySets[POS][i]= [];
		//homologySets[EVO][i]= [];
		
		
		
		jNoGap=0;
		for (j=0;j<seqs[i].content.length;j++){
			
			if(seqs[i].content[j]  != "-"){
				
				homologySets[SSP][i][jNoGap]= [];
				homologySets[SIM][i][jNoGap]= [];
				homologySets[POS][i][jNoGap]= [];
				//homologySets[EVO][i][jNoGap]= [];
				
				for(k=0;k<seqs.length;k++){
					
					if(k!=i && seqs[k].content[j]){
						
						homologySets[SSP][i][jNoGap].push(seqs[k].labeledContent[SSP][j]);
						homologySets[SIM][i][jNoGap].push(seqs[k].labeledContent[SIM][j]);
						homologySets[POS][i][jNoGap].push(seqs[k].labeledContent[POS][j]);
						//homologySets[EVO][jNoGap].push(seqs[k].labeledContent[EVO][j]);
						
					}
				}
				
				jNoGap++;
			}
		}
	}
	return homologySets;
}

