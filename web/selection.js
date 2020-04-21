
//TODO: create display UI
var stagedChanges = null

//Reset UI, reset staging data
function resetStagedChanges() {
	stagedChanges = {}
	stagedChanges.target = "" //stringid of target
	stagedChanged.subjects = {} //array of stringid of subjects
	stagedChanges.action = null //enum of action
}

function postChanges() {
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