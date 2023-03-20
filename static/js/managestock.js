var equipmentSelectedForEditing = null

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

var newEntryEquipmentsTable = $("#new-entry-table").DataTable({
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
                    return `<input class="form-control" type="text" list="equipments-list" name="equipmentName" value="${data}" />`
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

var stocksTable = $("#entries-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        return `<input type='checkbox' class='select-row' value=${row['stockId']}>`
                    } catch (error) {
                        
                    }
                }
            }
        },
        {
            "data": "supplierId"
        },
        {
            "data": "stockDate"
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
                    return `<div class="row">
                                <button class="btn text-primary" onclick=stockEditButtonClick(${row['stockId']}) data-stock-id=${row['equipmentId']}>
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="btn mx-1 text-danger" onclick=stockDeleteButtonClick(${row['stockId']}) data-stock-id=${row['purchaseorderId']}>
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>`
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
    url: `/managestock/stocks/`,
    success: function(data) {
        state.stocks = data
        
        stocksTable.clear()
        stocksTable.rows.add(data)
        stocksTable.draw()
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

const getEmptyEquipments = function(number, object={equipmentName: "", quantity: 1}) {
    let list = []

    for (let i=0; i<number; i++) {
        list.push(object)
    }

    return list
}

$("#add-rows-to-new-entry-table").click(function() {
    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-new-entry-table").val())

        if (numberOfRows > 0) {
            let listOfRows = getEmptyEquipments(numberOfRows)

            addRowsToDataTable(newEntryEquipmentsTable, listOfRows)
        }
    } catch (error) {
        throw error   
    }
})

$("#new-entry-modal-toggle").click(function() {
    let numberOfRows = parseInt($("#new-entry-table tbody tr i.fas.fa-trash").length)

    if (numberOfRows < 1) {
        let listOfRows = getEmptyEquipments(2)
        addRowsToDataTable(newEntryEquipmentsTable, listOfRows)
    }
})

$("#new-entry-save").click(function() {
    let formData = getNewEntryFromForm()

    $.ajax({
        type: 'POST',
        url: '/managestock/stocks/',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            state.stocks.push(data)

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

function getNewEquipmentsFromForm() {
    // returns a list of equipments to be added based on the user's     input
    equipment = {
        equipmentName: $("#new-equipment-name").val(),
        quantity: $("#new-equipment-quantity").val()
    }

    return [equipment]
}

function getNewEntryFromForm() {
    let entry = {
        supplierId: $("#new-entry-supplier").val(),
        stockDate: $("#new-entry-date").val(),
        equipments: []
    }

    $("#new-entry-table tbody tr").each(function() {
        let equipmentName = $(this).find("input[name='equipmentName']").first().val()
        let quantity = $(this).find("input[name='quantity']").first().val()

        // validate the equipmentName and quantity

        let entryEquipment = {
            equipmentId: {
                equipmentName: equipmentName
            },
            quantity: quantity
        }

        entry.equipments.push(entryEquipment)
    })

    return entry
}

function displayEquipmentDetailModal(equipment=equipmentSelectedForEditing) {
    $("#equipment-detail-modal-title").text(equipment.equipmentName)

    $("#equipment-detail-name").val(equipment.equipmentName)
    $("#equipment-detail-quantity").val(equipment.quantity)

    $("#equipment-detail-modal-toggle").click()
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