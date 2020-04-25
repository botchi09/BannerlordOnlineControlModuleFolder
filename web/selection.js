function ActionRequest() {
	this.target = "" //stringid of target
	this.subjects = [] //array of stringid of subjects
	this.actions = [] //string of actions
}

function postChanges(stagedChanges) {
	
	//TODO: List of EntityActionRequest to multi-process queries. For now, single index only.
	stagedChanges = [stagedChanges]
	
	showMessage("Sending changes...")
	showLoadGif()
	
	$.post( "stagechanges", JSON.stringify(stagedChanges), function(data) {
		console.log("Data recieved!")
		console.log(data)
	})
	.done(function() {
		//refresh()
		resetStagedChanges()
		showMessage("Loaded!")
		hideLoadGif()
		setTimeout(1000, ()=>{showMessage("")})
	})
	.fail(function() {
		console.log("Failed to stage changes?!")
	})
}

function showMessage(string) {
	$("#message").text(string)
}

function showLoadGif() {
	$("#loadingGif").css("display", "block")
}

function hideLoadGif() {
	$("#loadingGif").css("display", "none")
}