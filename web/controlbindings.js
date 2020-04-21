
actions = {

}

function addAction(actionEnum) {
	actions[actionEnum] = Object.keys(actions).length //ensure the enum is always properly incremented
}

addAction("engage")
addAction("escort")
addAction("aiOff")
addAction("aiOn")
addAction("setRelation")
addAction("kill")

function attachControlBindings() {
	
}