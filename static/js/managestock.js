var equipmentSelectedForEditing = null

var equipmentsTable = $("#equipments-table").DataTable({
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
                    if (row['equipmentId'] !== null) 
                        return `<button class="btn text-primary" onclick=equipmentEditButtonClick(${row['equipmentId']}) data-equipment-id=${row['equipmentId']}>
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="btn mx-1 text-danger" data-equipment-id=${row['equipmentId']}>
                                    <i class="fas fa-trash"></i>
                                </button>`
                    else 
                        return '---'
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
                        equipment.equipmentName = data.name
                        equipment.quantity = data.quantity

                        break
                    }
                }

                console.log("Data to be submitted")
                console.log(formData)

                console.log("Data gotten from API")
                console.log(data)

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

console.log("In managestock.js")

function getNewEquipmentsFromForm() {
    // returns a list of equipments to be added based on the user's     input
    equipment = {
        equipmentName: $("#new-equipment-name").val(),
        quantity: $("#new-equipment-quantity").val()
    }

    return [equipment]
}

function displayEquipmentDetailModal(equipment=equipmentSelectedForEditing) {
    $("#equipment-detail-modal-title").text(equipment.equipmentName)

    $("#equipment-detail-name").val(equipment.equipmentName)
    $("#equipment-detail-quantity").val(equipment.quantity)

    $("#equipment-detail-modal-toggle").click()
}

function equipmentEditButtonClick(equipmentId) {
    console.log("Clicked the edit equipment button")

    for (let equipment of state.equipments) {
        if (equipment.equipmentId == equipmentId && equipment.equipmentId !== null) {
            equipmentSelectedForEditing = equipment
            displayEquipmentDetailModal(equipmentSelectedForEditing)
            break;
        }
    }
}