No leftMargin, small rightMargin - go in first group
No leftMargin, large rightMargin - independent point
small leftMargin, small rightMargin - go in current group
small leftMargin, large rightMargin - go in current group
large leftMargin, small rightMargin - go in next group
large both margins - independent point
large leftMargin, no rightMargin - independent point

var leftMargin=0;
var rightMargin=0;

var marginTolerance=5
var group;

if (leftMargin==0){
	if (rightMargin<marginTolerance){
		group='first';
	}
	if (rightMargin>marginTolerance){
		group='none';
	}
}

if (leftMargin<marginTolerance){
	if (rightMargin<marginTolerance){
		group='current';
	}
	if (rightMargin>marginTolerance){
		group='current';
	}
}

if (leftMargin>marginTolerance){
	if (rightMargin<marginTolerance){
		group='next';
	}
	if (rightMargin>marginTolerance){
		group='none';
	}
	if (rightMargin==0){
		group='none';
	}
}

switch (group){
	case 'first':
		//code for first group
	break;
	
	case 'next':
		//code for next group
	break;
	
	case 'current':
		//code for current group
	break;
	
	case 'none':
		//code for no group, independent point
	break;
	
	default:
		//code for no group, independent point
	break;
}