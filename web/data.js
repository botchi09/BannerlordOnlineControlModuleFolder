//Bannerlord walkable map dimensions
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

allData = {}

function resetAllData() {
	allData = {lords: {}, mobileparties: {}, settlements: {}, kingdoms: {}, clans: {}}
}
resetAllData()

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
				var garrison = allData.settlements.data[thisData[key].settlementId].troopRoster
				if (garrison[thisData[key].stringId] == null) {
					garrison.push(thisData[key].stringId)
				}
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

//uint color to hex
function convertColor(colorInt) {
	return "#" + colorInt.toString(16).substr(2)
}

//converts all colours of entity it can
function convertAllColors(entity) {
	entity.color = convertColor(entity.color)
	entity.color2 = convertColor(entity.color2)
	entity.labelColor = convertColor(entity.labelColor)
	try {
		entity.alternativeColor = convertColor(entity.alternativeColor)
		entity.alternativeColor2 = convertColor(entity.alternativeColor)
	} catch {}
	
	try {
		entity.primaryBannerColor = convertColor(entity.primaryBannerColor)
		entity.secondaryBannerColor = convertColor(entity.secondaryBannerColor)
	} catch {}
}

allData.kingdoms.loaded = function() {
	thisData = allData.kingdoms.data
	for (var key in thisData) {
		var kingdom = thisData[key]
		convertAllColors(kingdom)
	}	
}

allData.clans.loaded = function() {
	thisData = allData.clans.data
	for (var key in thisData) {
		var clan = thisData[key]
		convertAllColors(clan)
	}	
}

//Not all clans belong to kingdoms. Some clans only have identity as kingdom members.
function getOwnerFaction(stringId) {
	if (allData.clans.data[stringId]) {
		return allData.clans.data[stringId]
	} else {
		return allData.kingdoms.data[stringId]
	}
}

function populateallDataArrays(allLoadedCallback, keyCount, thisFunc) {
	var curKey = keyCount || 0
	var keys = Object.keys(allData) //generated json file names are the same as the table names!
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
	allData.lords.loaded() //lords can belong to parties
	allData.clans.loaded() //clans may contain lords and parties
	allData.kingdoms.loaded() //all can belong to a kingdom
}

function dataLoad(callback) {
	calcMapSizes()
	if (!DEBUGMODE) {
		populateallDataArrays(function() {
			allDataLoaded()
			callback()
		})
	} else {
		allData.settlements.data = settlementsJson
		allData.mobileparties.data = mobilepartiesJson
		allData.lords.data = lordsJson
		allData.clans.data = clansJson
		allData.kingdoms.data = kingdomsJson
		
		allDataLoaded()
		callback()
	}
}

function refreshData(callback) {
	resetAllData() 
	dataLoad(callback)
}


				