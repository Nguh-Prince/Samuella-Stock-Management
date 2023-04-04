var equipmentSelectedForEditing = null
var dischargeSelectedForEditing = null

var equipmentsTable = $("#equipments-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            // checkbox
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        if (row['equipmentId'] !== null) 
                            return `<input type='checkbox' class='select-row' value=${row['equipmentId']}>`   
                        else
                        return `---`   
                    } catch (error) {
                        return '---'
                    }
                }
            }
        },
        {
            "data": "equipmentName"
        },
        {
            "data": "quantity"
        },
        {
            // delete and edit buttons
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    if (row['equipmentId'] !== null) {
                        let viewButtonClick = `equipmentEditButtonClick(${row['equipmentId']})`
                        let deleteButtonClick = `equipmentDeleteButtonClick(${row['equipmentId']})`

                        return renderActionButtonsInDataTable(row, IS_STRUCTURE_HEAD || IS_STOCK_MANAGER, IS_STOCK_MANAGER, IS_STOCK_MANAGER, viewButtonClick, deleteButtonClick)
                    }
                    else 
                        return '---'
                }
            }
        }
    ]
})

var dischargesTable = $("#discharges-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        return IS_STOCK_MANAGER ? `<input type='checkbox' class='select-row' value=${row['dischargeId']}>` : ''
                    } catch (error) {
                        
                    }
                }
            }
        },
        {
            "data": "structureId.structureName"
        },
        {
            "data": "dateCreated",
            render: renderDatesInDataTable
        },
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    let equipmentsNameAndQuantities = []

                    for ( let equipment of row['equipments'] ) {
                        equipmentsNameAndQuantities.push(`${equipment.quantity} ${equipment.equipmentId.equipmentName}`)
                    }

                    return equipmentsNameAndQuantities.join(', ')
                }
            }
        },
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    let viewButtonClick = `dischargeEditButtonClick(${row['dischargeId']})`
                    let deleteButtonClick = `dischargeDeleteButtonClick(${row['dischargeId']})`

                    return renderActionButtonsInDataTable(row, IS_STRUCTURE_HEAD || IS_STOCK_MANAGER, IS_STOCK_MANAGER, IS_STOCK_MANAGER, viewButtonClick, deleteButtonClick)
                }
            }
        }
    ]
})

var newDischargeEquipmentsTable = $("#new-discharge-table").DataTable({
    columnDefs: [{
        "defaultContent": '-',
        "targets": "_all"
    }], 
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<i class="fas fa-trash text-danger"></i>`
                }
            }
        },
        {
            "data": "equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    let options = []

                    state.equipments.map( (item, index) => {
                        options.push(`<option ${item.equipmentName == data ? 'selected': ''} value=${item.equipmentName}>${item.equipmentName}</option>`)
                    } )
                    return `<select name='equipmentName' class="form-select" value="${data}">${options.join('')}</select>`
                } else {
                    return data
                }
            }
        },
        {
            "data": "quantity",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="number" name="quantity" value="${data}" min=1 />`
                } else {
                    return data
                }
            }
        }
    ]
})

function deleteRow(e) {
    console.log("Clicked a delete-row button")
    console.log(e.target)
}

var dischargeDetailEquipmentsTable = $("#discharge-detail-table").DataTable({
    columnDefs: [{
        "defaultContent": '-',
        "targets": "_all"
    }], 
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return IS_STOCK_MANAGER ? `<i class="fas fa-trash text-danger" onclick=deleteRow></i>` : "---"
                }
            }
        },
        {
            "data": "equipmentId.equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    if (IS_STOCK_MANAGER) {
                        let options = []

                        state.equipments.map( (item, index) => {
                            options.push(`<option ${item.equipmentName == data ? 'selected': ''} value=${item.equipmentName}>${item.equipmentName}</option>`)
                        } )
                        return `<select name='equipmentName' class="form-select" value="${data}">${options.join('')}</select>`
                    }
                    else {
                        return `<input type='text' name='equipmentName' class='form-control' value='${data}' readonly>`
                    }
                } else {
                    return data
                }
            }
        },
        {
            "data": "quantity",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="number" name="quantity" value="${data}" min=1 max=${row['equipmentId']['quantity']} ${!IS_STOCK_MANAGER ? 'readonly' : ''} />`
                } else {
                    return data
                }
            }
        }
    ]
})

$.ajax({
    type: 'GET', 
    url: `/managestock/equipments/`,
    success: function(data) {
        state.equipments = data
        
        equipmentsTable.clear()
        equipmentsTable.rows.add(data)
        equipmentsTable.draw()
    },
    error: function(data) {
        console.log("Error getting the equipments from the API")
        console.log(data.responseText)
    }
})

$.ajax({
    type: 'GET', 
    url: `/managestock/discharges/`,
    success: function(data) {
        state.discharges = data
        
        dischargesTable.clear()
        dischargesTable.rows.add(data)
        dischargesTable.draw()
    },
    error: function(data) {
        console.log("Error getting the equipments from the API")
        console.log(data.responseText)
    }
})

$("#new-equipment-save").click( function() {
    console.log("Saving the new equipment")
    // get the data from the form
    data = {
        'data': getNewEquipmentsFromForm()
    }

    $.ajax({
        type: "POST",
        url: '/managestock/equipments/',
        data: JSON.stringify(data),
        contentType: "application/json",
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            state.equipments = state.equipments.concat(data)

            equipmentsTable.rows.add(data)
            equipmentsTable.draw()
        },
        error: function(data) {
            console.log("Error adding new equipments")
            console.log(data.responseText)
        }
    })
} )

$("#equipment-detail-modify").click(function() {
    console.log("Clicked the button to modify an equipment")

    if (equipmentSelectedForEditing.equipmentId !== null) {
        let formData = {
            equipmentName: $("#equipment-detail-name").val(),
            quantity: $("#equipment-detail-quantity").val()
        }

        $.ajax({
            type: "PATCH",
            url: `/managestock/equipments/${equipmentSelectedForEditing.equipmentId}/`,
            data: JSON.stringify(formData),
            contentType: "application/json",
            headers: {
                "X-CSRFTOKEN": getCookie("csrftoken")
            },
            success: function(data) {
                console.log("Equipment modified successfully")

                for (let equipment of state.equipments) {
                    if (equipment.equipmentId == equipmentSelectedForEditing.equipmentId) {
                        equipment.equipmentName = data.equipmentName
                        equipment.quantity = data.quantity

                        break
                    }
                }

                equipmentsTable.clear()
                equipmentsTable.rows.add(state.equipments)
                equipmentsTable.draw()
                
                displayMessage("L'equipement a ete modifie avec succes", ['alert-success', 'alert-dismissible'])

                $("#equipment-detail-modal-close").click()

            },
            error: function(data) {
                console.log("Error updating the equipment")
                console.log(data.responseText)
                console.log(formData)
                displayMessage("Une erreur a ete produite.")
            }
        })
    } else {
        alert("The currently selected equipment does not have an appropriate id")
    }
})

$("#add-rows-to-discharge-detail-table").click(function() {
    console.log("Clicked the add rows to discharge table button")

    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-discharge-detail-table").val())

        if (numberOfRows > 0) {
            let listOfRows = getEmptyEquipments(numberOfRows, {equipmentId: {equipmentName: ""}, quantity: 1})
            
            console.log(`Adding ${numberOfRows} rows to discharge table`)
            addRowsToDataTable(dischargeDetailEquipmentsTable, listOfRows)
        }
    } catch (error) {
        throw error   
    }
})

$("#new-discharge-modal-toggle").click(function() {
    console.log("Clicked the new-discharge-modal-toggle button")
    let numberOfRows = parseInt($("#new-discharge-table tbody tr i.fas.fa-trash").length)

    if (numberOfRows < 1) {
        let listOfRows = getEmptyEquipments(2)
        addRowsToDataTable(newDischargeEquipmentsTable, listOfRows)
    }
})

$("#new-discharge-save").click(function() {
    console.log("Clicked the new-discharge-save button")
    let formData = getNewDischargeFromForm()

    $.ajax({
        type: 'POST',
        url: '/managestock/discharges/',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            state.discharges.push(data)
            
            dischargesTable.rows.add([data])
            dischargesTable.draw()

            displayMessage("Entry added successfully", ["alert-success", "alert-dismissible"])
        },
        error: function(data) {
            console.error("Error adding the new entry")
            console.log(formData)
            console.log(JSON.stringify(formData))
            console.log(data.responseText)
        }
    })
})

$("#discharge-detail-save").click(function() {
    let formData = getDischargeDetailFromForm()

    $.ajax({
        type: 'PATCH',
        url: `/managestock/discharges/${dischargeSelectedForEditing.dischargeId}/`,
        contentType: 'application/json',
        data: JSON.stringify(formData),
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            
            state.discharges.map((item, index) => {
                if (item.dischargeId == dischargeSelectedForEditing.dischargeId) {
                    state.discharges[index] = data
                }
            })

            dischargesTable.clear()
            dischargesTable.rows.add(state.discharges)
            dischargesTable.draw()

            displayMessage("Discharge modified successfully", ["alert-success", "alert-dismissible"])

            $("#discharge-detail-modal-close").click()
        },
        error: function(data) {
            displayMessage("Error updating the entry")
            console.error("Error updating the entry")
            console.log(formData)
            console.log(JSON.stringify(formData))
            console.log(data.responseText)
        }
    })
})

$("#confirm-discharge-deletion-yes").click(function() {
    try {
        let dischargeId = parseInt($("#confirm-discharge-deletion-discharge-id").val())
        dischargeDeleteButtonClick(dischargeId, false)

        $("#confirm-discharge-deletion-modal-close").click()
    } catch (error) {
        throw error
    }
})

$("#confirm-equipment-deletion-yes").click(function() {
    try {
        let equipmentId = parseInt($("#confirm-equipment-deletion-equipment-id").val())
        equipmentDeleteButtonClick(equipmentId, false)

        $("#confirm-equipment-deletion-modal-close").click()
    } catch (error) {
        throw error
    }
})

function getNewEquipmentsFromForm() {
    // returns a list of equipments to be added based on the user's     input
    equipment = {
        equipmentName: $("#new-equipment-name").val(),
        quantity: $("#new-equipment-quantity").val()
    }

    return [equipment]
}

function getNewDischargeFromForm() {
    let discharge = {
        structureId: $("#new-discharge-structure").val(),
        dateCreated: $("#new-discharge-date").val(),
        equipments: []
    }

    $("#new-discharge-table tbody tr").each(function() {
        let equipmentName = $(this).find("select[name='equipmentName']").first().val()
        let quantity = $(this).find("input[name='quantity']").first().val()

        let dischargedEquipment = {
            equipmentId: {
                equipmentName: equipmentName
            },
            quantity: quantity
        }

        discharge.equipments.push(dischargedEquipment)
    })

    return discharge
}

function getDischargeDetailFromForm() {
    let discharge = {
        structureId: $("#discharge-detail-structure").val(),
        dateCreated: $("#discharge-detail-date").val(),
        equipments: []
    }

    $("#discharge-detail-table tbody tr").each(function() {
        let equipmentName = $(this).find("select[name='equipmentName']").first().val()
        let quantity = $(this).find("input[name='quantity']").first().val()

        let dischargedEquipment = {
            equipmentId: {
                equipmentName: equipmentName
            },
            quantity: quantity
        }

        discharge.equipments.push(dischargedEquipment)
    })

    return discharge
}

function displayEquipmentDetailModal(equipment=equipmentSelectedForEditing) {
    $("#equipment-detail-modal-title").text(equipment.equipmentName)

    $("#equipment-detail-name").val(equipment.equipmentName)
    $("#equipment-detail-quantity").val(equipment.quantity)

    $("#equipment-detail-modal-toggle").click()
}

function displayDischargeDetailModal(discharge=dischargeSelectedForEditing) {
    $("#discharge-detail-modal-title").text(`${discharge.structureId.structureName}: ${getLocaleTime(discharge.dateCreated, true)}`)

    $("#discharge-detail-structure").val(discharge.structureId)
    $("#discharge-detail-date").val(discharge.dateCreated)

    dischargeDetailEquipmentsTable.clear()
    dischargeDetailEquipmentsTable.rows.add(discharge.equipments)
    dischargeDetailEquipmentsTable.draw()

    $("#discharge-detail-modal-toggle").click()
}

function equipmentEditButtonClick(equipmentId) {
    for (let equipment of state.equipments) {
        if (equipment.equipmentId == equipmentId && equipment.equipmentId !== null) {
            equipmentSelectedForEditing = equipment
            displayEquipmentDetailModal(equipmentSelectedForEditing)
            break;
        }
    }
}

function dischargeEditButtonClick(dischargeId) {
    for (let discharge of state.discharges) {
        if (discharge.dischargeId == dischargeId && discharge.dischargeId !== null) {
            dischargeSelectedForEditing = discharge
            displayDischargeDetailModal(dischargeSelectedForEditing)
            break;
        }
    }
}

function dischargeDeleteButtonClick(dischargeId, displayModal=true) {
    if (displayModal) {
        // display modal to confirm deletion
        $("#confirm-discharge-deletion-modal-open").click()
        $("#confirm-discharge-deletion-discharge-id").val(dischargeId)
    }
    else {
        // perform deletion
        $.ajax({
            type: "DELETE",
            url: `/managestock/discharges/${dischargeId}/`,
            headers: {
                "X-CSRFTOKEN": getCookie("csrftoken")
            },
            success: function(data) {
                displayMessage("Le decharge a ete supprime avec succes", ["alert-success", "alert-dismissible"])
    
                state.discharges = state.discharges.filter( (item) => {
                    return item.dischargeId != dischargeId
                } )
    
                dischargesTable.clear()
                dischargesTable.rows.add(state.discharges)
                dischargesTable.draw()
            },
            error: function(data) {
                displayMessage("Le decharge n'a pas ete supprime avec succes")
                console.log(data.responseText)
            }
        })
    }
}

function equipmentDeleteButtonClick(equipmentId, displayModal=true) {
    if (displayModal) {
        // display modal to confirm deletion
        $("#confirm-equipment-deletion-modal-open").click()
        $("#confirm-equipment-deletion-equipment-id").val(equipmentId)

        for (let equipment of state.equipments) {
            if (equipment.equipmentId == equipmentId) {
                $("#confirm-equipment-deletion-modal .modal-body").find('h2.text-danger').text(`Êtes-vous sûr de bien vouloir supprimer l'equipement '${equipment.equipmentName}'`)
                break
            }
        }
    }
    else {
        // perform deletion
        $.ajax({
            type: "DELETE",
            url: `/managestock/equipments/${equipmentId}/`,
            headers: {
                "X-CSRFTOKEN": getCookie("csrftoken")
            },
            success: function(data) {
                displayMessage("L'equipement a ete supprime avec succes", ["alert-success", "alert-dismissible"])
    
                state.equipments = state.equipments.filter( (item) => {
                    return item.equipmentId != equipmentId
                } )
    
                equipmentsTable.clear()
                equipmentsTable.rows.add(state.equipments)
                equipmentsTable.draw()
            },
            error: function(data) {
                displayMessage("Le decharge n'a pas ete supprime avec succes")
                console.log(data.responseText)
            }
        })
    }
}