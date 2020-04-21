mapScale = 0.005 //Standard map scalar
var startPos = {x: 400, y: 400}
map = null //global map object

function startDraw() {
	
	//cache data
	var lordsData = allData.lords.data
	var mobilepartiesData = allData.mobileparties.data
	var settlementsData = allData.settlements.data
	
	map = L.map("mapcontainer").setView([startPos.x*mapScale, startPos.y*mapScale], 13)
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
		if (party.leaderId && lordsData[party.leaderId]) {
			newName = lordsData[party.leaderId].name
			newStringId = party.leaderId
		}
		if (party.army && party.army.count > 0) {
			newName += "'s army"
		}
		return newName + " | " + (party.troops || 1) + "+" + (party.prisoners || 0) + "p | " + newStringId
	}

	function createClickableLine(name, stringId) {
		var containerDiv = $("<div></div>")
		var line = $("<a href='#'>" + name + "</a>")
			.attr("id", stringId)
			.attr("onclick", "stringIdClick(this.id)")
			.appendTo(containerDiv)
		return containerDiv
	}
	
	//Settlements and garrison assignment
	for (var key in settlementsData) {
		
		var garrison = settlementsData[key].troopRoster
		var faction = getOwnerFaction(settlementsData[key].factionId)
		var circle = L.circle([settlementsData[key].x*mapScale, settlementsData[key].y*mapScale], {
			color: faction.color,
			fillColor: faction.color2,
			fillOpacity: 0.9,
			radius: 500 + (garrison.length*20)
		}).addTo(map)
		circle.stringId = settlementsData[key].stringId
		
		var myIcon = L.divIcon({className: "maplabel", html: "<div class='maplabelcontainer'><a class='maplabel' style='color:" + faction.labelColor + ";'>" + settlementsData[key].name + "</a></div>"});

		var textMarker = L.marker([settlementsData[key].x*mapScale + 0.007, (settlementsData[key].y*mapScale) - 0.007], {icon: myIcon}).addTo(map);
		
		
		var popupHtml = $("<div></div>")
		createClickableLine("<h3>" + settlementsData[key].name + "</h3>", settlementsData[key].stringId).appendTo(popupHtml)
		
		//popupHtml.append(header)
		if (garrison.length > 0) {
			for (var i=0;i<garrison.length;i++) {
				popupHtml.append(createClickableLine(getPartyName(mobilepartiesData[garrison[i]]), garrison[i]))
			}
		}
		circle.bindPopup(popupHtml.html())
		textMarker.bindPopup(popupHtml.html())
	}
	
	for (var key in mobilepartiesData) {
		var party = mobilepartiesData[key]
		var faction = getOwnerFaction(mobilepartiesData[key].factionId)
		if (party.settlementId == null) {
			var popupHtml = $("<div></div>")
			var circle = L.circle([party.x*mapScale, party.y*mapScale], {
				color: faction.color,
				fillColor: faction.color2,
				fillOpacity: 0.9,
				radius: 100 + (party.troops * 1.5)
			})
			circle.stringId = party.stringId
			
			circle.bindTooltip(party.name)
			if (party.armyLeaderId == null) {
				
				if (party.army) {
					createClickableLine("<h3>" + getPartyName(mobilepartiesData[party.army[i]]) + "</h3>", party.army[i]).appendTo(popupHtml)
					for (var i=0; i<party.army.length;i++) {
						createClickableLine(getPartyName(mobilepartiesData[party.army[i]]), party.army[i]).appendTo(popupHtml)
					}
				} else {
					createClickableLine(getPartyName(party), party.stringId).appendTo(popupHtml)
				}
				circle.addTo(map)
				circle.bindPopup(popupHtml.html())
			} else {
				//Don't add parties of armies individually
			}
			
		}
	}
}

function refreshDraw() {
	//TODO: clear map, re-place icons
}