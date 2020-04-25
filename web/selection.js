function ActionRequest() {
	this.target = "" //stringid of target
	this.subjects = [] //array of stringid of subjects
	this.actions = [] //string of actions
}

function postChanges(stagedChanges) {
	
	//TODO: List of EntityActionRequest to multi-process queries. For now, single index only.
	stagedChanges = [stagedChanges]
	
	$.post( "localhost/stagechanges", stagedChanges, function(data) {
		console.log("Data recieved!")
	})
	.done(function() {
		refresh()
		resetStagedChanges()
	})
	.fail(function() {
		console.log("Failed to stage changes?!")
	})
}

