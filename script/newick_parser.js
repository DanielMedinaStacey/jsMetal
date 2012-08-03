var string_to_parse="((2ak3_A,2ak2_),(1zak_A,((1qf9_A,1uky_),3adk_)),1zip);"



// PARSENEWICKSTRING
// Actually a wrapper for the true parser, to set up the environment and clear up afterwards

function parseNewickString(newick_string){
	
	//the 'temp' object holds the parser's working memory so we don't have to pass it around while doing recursion and calling other functions
	temp = new Object();		
	temp.index = 0;			//the index of each node
	temp.cursor = 0;			//the position of the cursor
	temp.parents = new Array();	//a FILO stack to remeber the parent nodes
	
	//calling the function that decides what to do for each character.
	var nodesArray = theDecider(null,newick_string);
	delete temp;
	return nodesArray;
}
		
// THEDECIDER
// The true parser. It's called recursively and takes the array of nodes (except the first time it's called) and the string to parse.

function theDecider(nodes,newick_string){
	//check if this is the first call, if so declare 'nodes'
	if(nodes == null) {
		var nodes = new Array();	
	}
	
	//look at the current character, decide what to do
	switch(newick_string[temp.cursor])
	{
		
		case "(":
			temp.cursor++;
			newNode(null,nodes,newick_string); //create a new internal node (null name)
			break;		
		case ",":
			temp.cursor++; 
			theDecider(nodes,newick_string); //recursion	
			break;		
		case ")":
			temp.parents.pop(); //forget latest parent
			
			temp.cursor++;
			theDecider(nodes,newick_string); //recursion	
			break;
		case ";":
			//we're done here
			break;
		
		default:
			//get the name.
			var name = newick_string.substring(temp.cursor).match("^[0-9A-Za-z_|]+");
			// some browsers return an array of 1 string instead of a string; this line fixes it.
			name = name instanceof Array ? name[0] : name;
			
			temp.cursor += name.length; 
			newNode(name,nodes,newick_string); //create a new leaf node
			break;
	}
	return nodes;
}

// NEWNODE
// Creates a new node, which will be a leaf node if we pass a name or an internal node if name is null.
function newNode(name,nodes,newick_string){
	
	nodes[temp.index] = new Object(); //create a new node
	
	//we do things differently if this is a leaf (i.e. named) node or a parent node.
	if(name == null) {
		nodes[temp.index].children = new Array(); //this node will have children
		nodeLinker(nodes,newick_string); //link this node to its parent
		temp.parents.push(temp.index); //add this node to the parent stack
		
	}else{
		nodes[temp.index].name = name;
		nodeLinker(nodes,newick_string); //link
	}

	temp.index++;
	theDecider(nodes,newick_string); //recursion
	
}

// NODELINKER
// Links the current node (temp.index) to its parent.
function nodeLinker(nodes,newick_string){
	if(temp.parents.length){
		nodes[temp.index].parent = temp.parents[temp.parents.length-1]; //tell this node about its parents
		nodes[nodes[temp.index].parent].children.push(temp.index); //tell its parent about its new child.
	}
}

