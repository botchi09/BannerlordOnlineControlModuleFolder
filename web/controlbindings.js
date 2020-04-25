
var changeDisplayTemplate = null


var changes = null

//TODO: reset all HTML to defaults, no changes.
function resetChangeDisplay() {
	$("#changeDisplay").remove()
	changeDisplayTemplate.clone().appendTo($("#changeDisplayContainer"))

}

function resetStagedChanges() {
	changes = new ActionRequest()
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
	addActionButtonBind("Engage", "#engageButton", (id)=>{addAction(id)})
	addActionButtonBind("Escort", "#escortButton", (id)=>{addAction(id)})
	addActionButtonBind("AiOff", "#AiOffButton", (id)=>{addAction(id)})
	addActionButtonBind("AiOn", "#AiOnButton", (id)=>{addAction(id)})
	//addActionButtonBind("SetRelation")
	//addActionButtonBind("Kill", "#KillButton", addKill)
	
}

function cloneChangeDisplay() {
	changeDisplayTemplate = $("#changeDisplayTemplate")
		.clone()
		.css("display", "initial")
		.attr("id", "changeDisplay")
	
	$("#changeDisplayTemplate").remove()
}

function addActionButtonBind(actionId, actionButton, func) {
	$(actionButton).click(() => {func(actionId)})
}

function attachControlBindings() {
	cloneChangeDisplay()
	resetStagedChanges()
	resetChangeDisplay()
	
	bindActionButtons()
	
}

function setTarget() {
	if (isSearchBarStringIdValid() && canAddSubject(getSearchBarStringId())) {
		changes.target = getSearchBarStringId()
		$("#changeDisplay > #target").text(getEntityFromStringId(getSearchBarStringId()).name)
	}
}

function addSubject() {
	if (isSearchBarStringIdValid() && canAddSubject(getSearchBarStringId())) {
		changes.subjects.push(getSearchBarStringId())
		var subjectLine = $("<span></span>")
			.attr("id", getSearchBarStringId())
			.text(getEntityFromStringId(getSearchBarStringId()).name)
		$("<input type='submit' value='-' />").appendTo(subjectLine)
			.click((e) => {removeSubject(e.target.parentElement.id)})
			
		$("#changeDisplay > #subjects").append(subjectLine)
	}
}

function canAddSubject(stringId) {
	return !changes.subjects.includes(stringId) && changes.target !== stringId
}

function removeSubject(stringId) {
	for (var i=0;i<changes.subjects.length; i++) {
		if (changes.subjects[i] === stringId) {
			changes.subjects.splice(i, 1)
			$("#changeDisplay").find("#subjects").find("#"+stringId).remove()
		}
	}
}

function clearSubjects() {
	$("#changeDisplay").find("#subjects").empty()
	changes.subjects = []
}

function clearTarget() {
	$("#changeDisplay").find("#target").text("")
	changes.target = ""
}

function clearActions() {
	$("#changeDisplay").find("#actions").empty()
	changes.actions = []
}

function addAction(actionId) {
	changes.actions.push(actionId)
	$("#changeDisplay").find("#actions").append($("<a></a>").text(actionId + ", "))
}








