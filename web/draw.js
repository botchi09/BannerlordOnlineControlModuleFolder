
//TODO: maybe not needed?

function getScaledPointerPos() {
	const pointerPos = stage.getPointerPosition()
	const mousePointTo = {
		x: (pointerPos.x / stagePosition.scale) - (stagePosition.x / stagePosition.scale),
		y: (pointerPos.y / stagePosition.scale) - (stagePosition.y / stagePosition.scale),
	}
	return mousePointTo
}

//Moves all stuff with this base id to top

function startDraw() {

	var lordsData = allData.lords.data
	var mobilepartiesData = allData.mobileparties.data
	var settlementsData = allData.settlements.data

	console.log("Starting draw")
	var stageWidth = mapSize.xMax
	var stageHeight = mapSize.yMax

	var stage = new Konva.Stage({
		container: "container",
		width: stageWidth,
		height: stageHeight,
		draggable: true
	})

	var layer = new Konva.Layer()
	stage.add(layer)

	function moveToTop(id) {
		var point = drawShapes[id].point
		var txt = drawShapes[id].displayText
		
		if (point) {
			point.moveToTop()
			point.draw()
		}
		
		if (txt) {
			txt.moveToTop()
			txt.draw()
		}
	}
	
	
	function placeText(name, string, colour, x, y) {
		var displayText = new Konva.Text({
			x: x,
			y: y,
			text: string,
			fontSize: 2,
			fontFamily: "Calibri",
			fill: colour,
			stroke: "black",
			strokeWidth: 0.05,
			name: name
		})
		displayText.offsetX(displayText.width() / 2)
		displayText.offsetY(displayText.height()*1.5)

		layer.add(displayText)
		attachSelectionEvent(displayText)
		
		return displayText
	}

	var drawShapes = []
	
	function hasIntersection(r1, r2) {
		return !(
			r2.x > r1.x + r1.width ||
			r2.x + r2.width < r1.x ||
			r2.y > r1.y + r1.height ||
			r2.y + r2.height < r1.y
		)
	}
	
	function doesShapeOverlap(shape, isPoint) {
		for (var key in drawShapes) {
			if (drawShapes.hasOwnProperty(key)) {
				var compareShape = drawShapes[key].displayText
				if (isPoint) {
					compareShape = drawShapes[key].point
				}
				if (hasIntersection(shape.getClientRect(), compareShape.getClientRect())) {
					return compareShape
				}
			}
		}
	}
	
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
		return newName + " | " + (party.troops || 1) + "\n" + newStringId
	}
	
	/*function applyShadow(shape, opacity) {
		shape.shadowColor =  "black",
		shape.shadowBlur =  5,
		shape.shadowOffset = { x: 0, y: 0 },
		shape.shadowOpacity = opacity
	}*/
	
	function applyHighlight(shape) {
		if (shape.oldFill == null) {
			/*var rect = new Konva.Rect({
				width: shape.width,
				height: shape.height,
				fill: "red",
				stroke: "black",
				strokeWidth: 0,
				x: shape.x(),
				y: shape.y()
			})
			shape.highlightShape = rect
			layer.add(rect)
			console.log("highlighted RECT", shape, rect)*/
			shape.oldFill = shape.fill()
			shape.oldStrokeWidth = shape.strokeWidth()
			shape.strokeWidth(0.08)
			shape.fill("white")
			shape.draw()
			
		}
		shape.scaleX(1.05)
		//shape.scaleY(1.5)
	}
	
	function removeHighlight(shape) {
		/*if (shape.highlightShape != null) {
			shape.highlightShape.remove()
		}*/
		if (shape.oldFill) {
			shape.fill(shape.oldFill)
			shape.oldFill = null
			shape.strokeWidth(shape.oldStrokeWidth)
			shape.draw()
		}
		shape.scaleX(1)
		//shape.scaleY(1)
	}
	
	function highlight(shapeId, isHighlighted) {
		var point = drawShapes[shapeId].point
		var txt = drawShapes[shapeId].displayText
		
		if (isHighlighted) {
			if (point) {
				applyHighlight(point)
			}	
			if (txt) {
				applyHighlight(txt)
			}
		} else {
			if (point) {
				removeHighlight(point)
			}
			if (txt) {
				removeHighlight(txt)
			}
		}

	}
	
	
	//Hides shape except on tether mouseover, or shape mouseover
	function setHideable(shape, tether) {

		tether.on("mouseover", function() {
			shape.visible(true)
			stage.batchDraw()
		})
		tether.on("mouseout", function() {
			shape.visible(false)
			stage.batchDraw()
		})		
	}
	
	function addMouseFunctions(shape) {
		shape.on("mouseover", function() {
			moveToTop(this.name())
			highlight(this.name(), true)
			stage.batchDraw()
		})
		shape.on("mouseout", function() {
			moveToTop(this.name())	
			highlight(this.name(), false)
			stage.batchDraw()

		})
	}
	
	function placeDataPoints(thisData) {
		
		for (var key in thisData) {
			if (thisData.hasOwnProperty(key)) {
				var drawShapesInsert = {}
				
				var id = thisData[key].stringId
				var fillType = ["red", "blue", "green", "grey"]
				
				var colour = "grey"
				var radius = 0.75
				
				if (thisData[key].settlementType != null) {
					colour = fillType[thisData[key].settlementType]
					radius = 2 + (0.25*thisData[key].troopRoster.length);
				}
				
				if (thisData[key].army) {
					colour = "black"
				}
				
				var point =	new Konva.Circle({
					radius: radius,
					fill: colour,
					x: thisData[key].x,
					y: thisData[key].y,
					name: thisData[key].stringId,
					stroke: "black",
					strokeWidth: 0.1
				})
				drawShapesInsert.point = point
				layer.add(point)
				attachSelectionEvent(point)
				
				var displayText = placeText(thisData[key].stringId, getPartyName(thisData[key]) || thisData[key].stringId, colour, thisData[key].x, thisData[key].y - radius/2)
				
				drawShapesInsert.displayText = displayText
							
				addMouseFunctions(point)
				addMouseFunctions(displayText)
				
				
				drawShapes[thisData[key].stringId] = drawShapesInsert
			}
		}
	}
	
	//Place provisional data points
	placeDataPoints(allData.settlements.data)
	placeDataPoints(allData.mobileparties.data)
	
	
	/*
	//Add lords to mobileparties
	for (var key in lordsData) {
			if (lordsData.hasOwnProperty(key)) {
				if (lordsData[key].partyStringId != null) {
					var shapes = drawShapes[lordsData[key].partyStringId]
					var lordParty = allData.mobileparties.data[lordsData[key].partyStringId]
					//shapes.displayText.remove()
					//shapes.displayText = placeText(lordsData[key].name, "orange", lordParty.x, lordParty.y)
				}
			}
	}*/
	
	
	
	
	function createHideableIdList(tetherKey, tetherObj, idList) {
		drawShapes[mobilepartiesData[tetherKey].stringId].displayText.remove()
		drawShapes[mobilepartiesData[tetherKey].stringId].point.remove()
		
		var oldText = drawShapes[tetherObj.stringId].displayText
		
		for (var i=0;i<idList.length;i++) {
			//by creating each as a separate item, we can ensure clicks are also handled separately
			
			var displayText = placeText(idList[i], getPartyName(mobilepartiesData[idList[i]]), oldText.fill(), oldText.x(), oldText.y()-(oldText.height()*(i+1)))
			//addMouseFunctions(displayText) //todo: this breaks for some reason
			setHideable(displayText, drawShapes[tetherObj.stringId].point)
			setHideable(displayText, oldText)
			displayText.visible(false)
		
		}
	}
	
	//Clean up garrisons
	for (var key in mobilepartiesData) {
		if (mobilepartiesData.hasOwnProperty(key)) {
			if (mobilepartiesData[key].settlementId != null) {
				var settlement = settlementsData[mobilepartiesData[key].settlementId]
				createHideableIdList(key, settlement, settlement.troopRoster)

			}
			//TODO: clean up armies
			if (mobilepartiesData[key].armyLeaderId) {
				var party = mobilepartiesData[mobilepartiesData[key].armyLeaderId]

				createHideableIdList(key, party, party.army)
			}
		}
	}
	
	

	//Add battle markers
	
	//Add action indicators
	
	
	var canZoom = true

	stage.on('dragstart', function() {
		viewportCull()
		canZoom = false
	})
	stage.on('dragend', function() {
		viewportCull()
		canZoom = true
	})

	var scaleBy = 1.2
	stage.on("wheel", e => {
		e.evt.preventDefault()
		if (canZoom) {
			var oldScale = stage.scaleX()

			var mousePointTo = {
				x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
				y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
			}

			var newScale =
				(-e.evt.deltaY) > 0 ? oldScale * scaleBy : oldScale / scaleBy
			stage.scale({ x: newScale, y: newScale })

			var newPos = {
				x:
					-(mousePointTo.x - stage.getPointerPosition().x / newScale) *
					newScale,
				y:
					-(mousePointTo.y - stage.getPointerPosition().y / newScale) *
					newScale
			}
			stage.position(newPos)
			viewportCull()
			stage.batchDraw()
		}
	})
	
	function isOnScreen(shape) {
		//https://stackoverflow.com/a/46136682/2883842
		var zoomLevel = stage.scale().x 
		var degreePixels = stage.rotation()
		var boundingX = ((-1 * (stage.x() * (1/zoomLevel)))-(stageWidth/2))-degreePixels
		var boundingY = ((-1 * (stage.y() * (1/zoomLevel)))-(stageHeight/2))-degreePixels
		var boundingWidth = (2 * stageWidth * (1/zoomLevel)) + (2*degreePixels)
		var boundingHeight = (2 * stageHeight * (1/zoomLevel)) + (2*degreePixels)
		
		var stageData = {x: boundingX, y: boundingY, width: boundingWidth, height: boundingHeight}
		
		//todo: culling is impossible and I can't do it someone help
		
		return hasIntersection(stageData, shape.getClientRect())
	}
	
	function viewportCull() {
		/*
		layer.getChildren(function(node){
			console.log((isOnScreen(node)))
		   if (isOnScreen(node)) {
			   node.visible(true)
		   } else {
			   node.visible(false)
		   }
		})*/
	}

	function fitStageIntoParentContainer() {
		var container = document.querySelector("#container")

		// now we need to fit stage into parent
		var containerWidth = container.offsetWidth
		// to do this we need to scale the stage
		var scale = containerWidth / stageWidth

		stage.width(stageWidth * scale)
		stage.height(stageHeight * scale)
		stage.scale({ x: scale, y: scale })
		stage.draw()
	}

	fitStageIntoParentContainer()
	// adapt the stage on any window resize
	window.addEventListener("resize", fitStageIntoParentContainer)
}

