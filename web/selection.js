var lastSelectedShape = null

function addToSearchBox(id) {
	$("#searchInput").val(id)
}

function attachSelectionEvent(shape) {
	shape.on("mousedown", function() {
		var id = shape.name()
		lastSelectedShape = this
		addToSearchBox(id)
	})
}