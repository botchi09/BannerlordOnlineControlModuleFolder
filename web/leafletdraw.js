mapScale = 0.005 //Standard map scalar
var startPos = {x: 613.84753, y: 435.935}
map = null //global map object
var layerIds = {} //key indexed list of layers

function startDraw() {
	
	//cache data
	var lordsData = allData.lords.data
	var mobilepartiesData = allData.mobileparties.data
	var settlementsData = allData.settlements.data
	
	if (map == null) {
		var playerParty = mobilepartiesData["player_party"]
		startPos.x = playerParty.x
		startPos.y = playerParty.y
		map = L.map("mapcontainer").setView([startPos.x*mapScale, startPos.y*mapScale], 13)
	}
	/*var map = L.map('mapcontainer', {
		crs: L.CRS.Simple
	});
	var bounds = [[0,0], [1000,1000]];
	var image = L.imageOverlay('map_low.png', bounds).addTo(map);
	map.fitBounds(bounds);
	map.setView([startPos.x*mapScale, startPos.y*mapScale], 13)*/
	
	
	function getPartyName(party) {
		var newName = party.name
		var newStringId = party.stringId
		var behavior = party.behavior
		if (party.leaderId && lordsData[party.leaderId]) {
			newName = lordsData[party.leaderId].name
			newStringId = party.leaderId
		}
		
		return newName + " | " + (party.troops || 1) + "+" + (party.prisoners || 0) + "p | " + behavior + " | " + newStringId
	}

	function createClickableLine(name, stringId) {
		var containerDiv = $("<div></div>")
		var line = $("<a href='#'>" + name + "</a>")
			.attr("id", stringId)
			.attr("onclick", "stringIdClick(this.id)")
			.appendTo(containerDiv)
		return containerDiv
	}
	
	
	
	//Remove circle plus accessories if exists
	function cleanShape(shape) {
		if (shape) {
			shape.remove()
			if (shape.arrow != null) {
				shape.arrow.remove()
			}
		}
	}
	
	//Places arrows/icon to indicate party behaviour
	function createIntentionIndicator(party, tether) {
		
		if (party.isHolding && tether.arrow != null) {
			tether.arrow.remove()
		}
		if (party.settlementId == null && tether != null) {
			if ((party.x !== party.xTarget && party.y !== party.yTarget) && !party.isHolding) {
				var arrow = tether.arrow || L.polyline([]).arrowheads({size: "10px", fill: true})
				var targetCoords = [party.xTarget*mapScale, party.yTarget*mapScale]
				if (party.stringIdTargetSettlement != null) {
					var targetSettlement = settlementsData[party.stringIdTargetSettlement]
					targetCoords = [targetSettlement.x*mapScale, targetSettlement.y*mapScale]
				}
				if (party.stringIdTargetParty != null) {
					var targetParty = mobilepartiesData[party.stringIdTargetParty]
					targetCoords = [targetParty.x*mapScale, targetParty.y*mapScale]
				}
				
				arrow.setLatLngs([[party.x*mapScale, party.y*mapScale], targetCoords])
				var faction = getOwnerFaction(party.factionId)

				var style = {
					weight: 0.4,
					color: faction.color,
					fillColor: faction.color2
				}
				arrow.setStyle(style)
				if (tether.arrow == null) {
					tether.arrow = arrow
					arrow.addTo(map)
				}	
			} else {
				if (tether.arrow != null) { //Destination reached but no holding status set- Happens with player
					tether.arrow.remove()
				}
			}
		}
	}
	
	var troopRadiusMultiplier = 1.5
	for (var key in mobilepartiesData) {
		var doNotCreate = false
		var doRemove = false
		var party = mobilepartiesData[key]
		var faction = getOwnerFaction(mobilepartiesData[key].factionId)
		var bringToBack = false
		
		if (party.settlementId == null) {
			var chosenParty = null //This will be used to assign stringId, etc

			var popupHtml = $("<div></div>")
			var circle = null
			
			var style = {
				color: faction.color,
				fillColor: faction.color2,
				fillOpacity: 0.4,
				radius: 100,
				zIndexOffset: 0
			}
			
			var armyExists = (party.armyLeaderId && layerIds[party.armyLeaderId] != null)
			
			if (layerIds[party.stringId] != null) {
				doNotCreate = true
				circle = layerIds[party.stringId]
				
			} else {
				circle = L.circle(null, null)
			} 
					
			if (party.armyLeaderId != null) { //Includes leaders of armies, who are their own leaders
				if (party.army != null) {
					
					createClickableLine("<h3>" + getPartyName(party) + "</h3>", party.stringId).appendTo(popupHtml)
					for (var i=0; i<party.army.length;i++) {
						var armyParty = mobilepartiesData[party.army[i]]
						createClickableLine(getPartyName(armyParty), party.army[i]).appendTo(popupHtml)
						style.radius += armyParty.troops
						
						cleanShape(layerIds[party.army[i]])
					}
					
					style.radius = ((party.troops + style.radius) * troopRadiusMultiplier) + 200//extra buff cuz army
					chosenParty = party
					bringToBack = true
				} else {
					doNotCreate = true
					
					
				}
			} else {
				//No army!
				createClickableLine(getPartyName(party), party.stringId).appendTo(popupHtml)
				chosenParty = party
				style.radius += party.troops * troopRadiusMultiplier
				
			}
			
			if (chosenParty != null) {
				circle.setLatLng([party.x*mapScale, party.y*mapScale]) //army parties occupy same space as their leaders, so no problem
				
				circle.stringId = chosenParty.stringId
				circle.bindTooltip(chosenParty.name + " (" + chosenParty.troops + ") | " + chosenParty.behavior)
				circle.bindPopup(popupHtml.html())
				circle.setStyle(style)
				circle.setRadius(style.radius)
				createIntentionIndicator(chosenParty, circle)
				if (!doNotCreate) {
					circle.addTo(map)
					layerIds[circle.stringId] = circle
					

				} else {
					//garrisoned troops/army troops
				}
				if (bringToBack) {
					circle.bringToBack()
				}
			}
		}
	}
	
	//Settlements and garrison assignment
	for (var key in settlementsData) {
		var settlementId = settlementsData[key].stringId
		var doNotCreate = false
		var garrison = settlementsData[key].troopRoster
		var faction = getOwnerFaction(settlementsData[key].factionId)
		var style = {
			color: faction.color,
			fillColor: faction.color2,
			fillOpacity: 0.4,
			radius: 500
		}
		
		switch (settlementsData[key].settlementType) {
			case 0:
			style.radius = 600
			break;
			case 1:
			style.radius = 450
			break;
			case 2:
			style.radius = 300
			break;
			case 3:
			style.radius = 150
			break;
		}
		
		
		var circle = null
		
		if (layerIds[settlementId] != null) {
			doNotCreate = true
			circle = layerIds[settlementId]
		} else {
			circle = L.circle(null, null)
		} 
		
		circle.setLatLng([settlementsData[key].x*mapScale, settlementsData[key].y*mapScale])
		
		circle.stringId = settlementId
		layerIds[settlementId] = circle
		
		var myIcon = L.divIcon({className: "maplabel", html: "<div class='maplabelcontainer'><a class='maplabel' style='color:" + faction.labelColor + ";'>" + settlementsData[key].name + "</a></div>"});

		var textMarker = L.marker([settlementsData[key].x*mapScale + 0.007, (settlementsData[key].y*mapScale) - 0.007], {icon: myIcon})
		textMarker.stringId = circle.stringId + "_text"
		if (layerIds[textMarker.stringId]) {
			layerIds[textMarker.stringId].remove()//We can't change style of existing markers easily, for some reason.
		}
		layerIds[textMarker.stringId] = textMarker
		
		var popupHtml = $("<div></div>")
		createClickableLine("<h3>" + settlementsData[key].name + "</h3>", settlementsData[key].stringId).appendTo(popupHtml)
		
		//popupHtml.append(header)
		if (garrison.length > 0) {
			for (var i=0;i<garrison.length;i++) {
				popupHtml.append(createClickableLine(getPartyName(mobilepartiesData[garrison[i]]), garrison[i]))
				cleanShape(layerIds[garrison[i]])
			}
		}
		
		
		
		textMarker.bindPopup(popupHtml.html())
		textMarker.addTo(map)
		circle.bindPopup(popupHtml.html())
		circle.setRadius(style.radius) //SetStyle with radius was never fixed...
		circle.setStyle(style)
		if (!doNotCreate) {
			circle.addTo(map)
		}
	}
}


function clearMap() {
	map.eachLayer(function(layer){	
		//layer.remove()	
	})
}

function refreshDraw() {
	//TODO: clear map, re-place icons
	clearMap()
	startDraw()
}