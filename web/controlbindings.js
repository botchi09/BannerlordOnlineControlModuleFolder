
allActions = {

}

var changes = new ActionRequest()

//TODO: reset all HTML to defaults, no changes.
function resetChangeDisplay() {
	
}

function resetStagedChanges() {
	changes = new ActionRequest()
}

function addAction(actionEnum) {
	allActions[actionEnum] = Object.keys(allActions).length //ensure the enum is always properly incremented
}


function bindActionButtons() {
	//These are not sent to client
	addActionButtonBind(null, "#refreshButton", refresh)
	addActionButtonBind(null, "#targetButton", setTarget) //only 1 possible target for any action
	addActionButtonBind(null, "#subjectButton", addSubject) //actors acting upon target
	addActionButtonBind(null, "#clearButton", ()=>{
		resetChangeDisplay()
		resetStagedChanges()
	})
	addActionButtonBind(null, "#runButton", ()=>{postChanges(changes)})
	
	//These actions are sent to client
	addActionButtonBind("Engage", "#engageButton", addEngage)
	addActionButtonBind("Escort", "#escortButton", addEscort)
	addActionButtonBind("AiOff", "#AiOffButton", addAiOff)
	addActionButtonBind("AiOn", "#AiOnButton", addAiOn)
	//addActionButtonBind("SetRelation")
	addActionButtonBind("Kill", "#KillButton", addKill)
	
}


function addActionButtonBind(actionId, actionButton, func) {
	addAction(actionId)
	$(actionButton).click(func)
}

function attachControlBindings() {
	bindActionButtons()
}

function setTarget() {
	if (isSearchBarStringIdValid()) {
		changes.target = getSearchBarStringId()
	}
}

function addSubject() {
	if (isSearchBarStringIdValid()) {
		changes.subjects.push(getSearchBarStringId)
	}
}







