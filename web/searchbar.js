var lastSelectedId = null

function addToSearchBox(id) {
	$("#searchInput").val(id)
}

function stringIdClick(stringId) {
	lastSelectedId = stringId
	addToSearchBox(stringId)
}

function attachSearchClickEvents() {
	$("#gotoButton").click(function() {goToStringId($("#searchInput").val())})
}

function goToStringId(stringId) {
	var entity = allData.mobileparties.data[stringId] //todo: settlements as well
	map.panTo([entity.x*mapScale,entity.y*mapScale], 13)
}

var cache = []

function fillCacheWithArray(array) {
	for (var key in array) {
		var entity = array[key]
		cache.push({id: entity.stringId, value: entity.name + " | " + entity.stringId})
	}
}

function fillAutoCompleteCache() {
	fillCacheWithArray(allData.mobileparties.data)
	fillCacheWithArray(allData.settlements.data)
	console.log("Autocomplete caching done")
}


function attachAutoComplete() {
	fillAutoCompleteCache()
            
    $( "#searchInput" ).autocomplete({
        minLength: 0,
        source: cache,
        focus: function( event, ui ) {
            $( "#searchInput" ).val(ui.item.value)
            return false
        },
        select: function( event, ui ) {
            $( "#searchInput" ).val(ui.item.id)

            return false
        },
        search: function(event, ui) { console.log(event); console.log(ui) }
    })
        
}