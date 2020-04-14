//TODO: Make ONLY data handling

mapSize = {
	xCenter: 430,
	yCenter: 390,
	xMaxDist: 410,
	yMaxDist: 360	
}

function calcMapSizes() {
	mapSize.xMax = mapSize.xCenter + mapSize.xMaxDist
	mapSize.yMax = mapSize.yCenter + mapSize.yMaxDist
	
	mapSize.xMin = mapSize.xCenter - mapSize.xMaxDist
	mapSize.yMin = mapSize.yCenter - mapSize.yMaxDist
}

allData = {lords: {}, mobileparties: {}, settlements: {}}

allData.settlements.loaded = function() {
	var thisData = allData.settlements.data
	for (var key in thisData) {
		if (thisData.hasOwnProperty(key)) {           
			thisData[key].troopRoster = []
		}
	}	
}

allData.mobileparties.loaded = function() {
	var thisData = allData.mobileparties.data
	for (var key in thisData) {
		if (thisData.hasOwnProperty(key)) {           
			if (thisData[key].settlementId) {
				allData.settlements.data[thisData[key].settlementId].troopRoster.push(thisData[key].stringId)
			}
			if (thisData[key].armyLeaderId) {
				var armyLeader = thisData[thisData[key].armyLeaderId]
				if (!armyLeader.army) {
					armyLeader.army = []
				}
				armyLeader.army.push(thisData[key].stringId)
			}
		}
	}			
}

allData.lords.loaded = function() {
	var thisData = allData.lords.data
	for (var key in thisData) {
		var lord = thisData[key]
		if (!lord.currentSettlementId) {
			if (lord.partyStringId) {
				allData.mobileparties.data[lord.partyStringId].leaderId = lord.stringId
			}
		} else {
		}
	}
}

function placeXYEntity(entity, appendDiv) {
	$("<a></a>")
	.addClass("map_text")
	.css("top", offsetPixels + entity.x * scaleFactor)
	.css("left", offsetPixels + entity.y * scaleFactor)
	.text(entity.name)
	.attr("id", entity.stringId)
	.appendTo($(appendDiv))
	var idRef = $("#"+entity.stringId) //tag creation doesn't return new tag. wtf?
}


function populateallDataArrays(allLoadedCallback, keyCount, thisFunc) {
	var curKey = keyCount || 0
	var keys = Object.keys(allData)
	if (curKey < keys.length) {
		var table = keys[curKey]
		$.getJSON(table, function(response) {
			allData[table].data = response
			console.log("pulled", table)
		}).done(function() {
			curKey++
			populateallDataArrays(allLoadedCallback, curKey)
		})
	} else {
		allLoadedCallback()
	}
}

function allDataLoaded() {
	console.log("Initial allData population finished")
	allData.settlements.loaded()
	allData.mobileparties.loaded() //parties can exist in settlements
	allData.lords.loaded() //Lords are loaded last
	
	startDraw()
}

function init() {
	calcMapSizes()
	if (!DEBUGMODE) {
		populateallDataArrays(function() {
			
			
			allDataLoaded()
		})
	} else {
		allData.settlements.data = settlementsJson
		allData.mobileparties.data = mobilepartiesJson
		allData.lords.data = lordsJson
		
		allDataLoaded()
	}
}




				