function init() {
	console.log("Initialising data")
	dataLoad(function() {
		startDraw()
		attachAutoComplete()
		console.log("Initialisation complete")
	})
	attachSearchClickEvents()
	attachControlBindings()
	
}

function refresh() {
	console.log("Refreshing map...")
	refreshData(function() {
		refreshDraw()
		console.log("Refreshed map")
	})
	
}