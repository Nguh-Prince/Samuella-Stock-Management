var equipmentSelectedForEditing = null
var dischargeSelectedForEditing = null

const getStockType = function(quantity, stockSecurite, stockAlerte) {
    if (quantity > stockSecurite) {
        return {
            label: 'Bon',
            class: "good-stock"
        }
    } else if (quantity <= stockSecurite && quantity > stockAlerte) {
        return {
            label: 'Normal',
            class: "normal-stock"
        }
    } else {
        return {
            label: 'Critique',
            class: "critical-stock"
        }
    }
}

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
                            return `<input type='checkbox' class='select-row' value=${row['equipmentId']}> <input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class} first-cell'>`   
                        else
                        return `---`   
                    } catch (error) {
                        return '---'
                    }
                }
            }
        },
        {
            "data": "equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display')
                    return `${data} <input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class}'>`
                
                    return data
            }
        },
        {
            "data": "quantity",
            render: function(data, type, row, meta) {
                if (type === 'display')
                    return `${data} <input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class}'>`
                
                return data
            }
        },
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    let stockType = getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte'])

                    return `${stockType.label} <input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class}'>`
                } 
                return ''
            }
        },
        {
            "data": "stockSecurite",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `${data} <input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class}'>`
                }

                return data
            }
        },
        {
            "data": "stockAlerte",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `${data} <input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class}'>`
                }

                return data
            }
        },
        {
            // delete and edit buttons
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    if (row['equipmentId'] !== null) {
                        let viewButtonClick = `equipmentEditButtonClick(${row['equipmentId']})`
                        let deleteButtonClick = `equipmentDeleteButtonClick(${row['equipmentId']})`

                        return `<div class="d-flex">${renderActionButtonsInDataTable(row, IS_STRUCTURE_HEAD || IS_STOCK_MANAGER, IS_STOCK_MANAGER, IS_STOCK_MANAGER, viewButtonClick, deleteButtonClick)}</div><input type='hidden' class='${getStockType(row['quantity'], row['stockSecurite'], row['stockAlerte']).class} last-cell'>`
                    }
                    else 
                        return '---'
                }
            }
        }
    ]
})

function highlightRows() {
    let colors = {
        good: "#198754",
        normal: "#ffb822",
        critical: "#dc3545"
    }

    function highlightRowsOfType(className, color, backgroundColor, textColor="white") {
        $(`.${className}`).each(function() {
            let cell = $(this).parent()

            $(cell).attr('style', `border-bottom: 1px solid ${color}`)
        })

        $(`.${className}.first-cell`).each(function() {
            let cell = $(this).parent()

            $(cell).attr('style', `border-bottom: 1px solid ${color}; border-left: 1px solid ${color} !important;`)
        })

        $(`.${className}.last-cell`).each(function() {
            let cell = $(this).parent()

            $(cell).attr('style', `border-bottom: 1px solid ${color}; border-right: 1px solid ${color} !important;`)
        })
    }

    highlightRowsOfType('good-stock', colors.good, colors.good)
    highlightRowsOfType('normal-stock', colors.normal, colors.normal)
    highlightRowsOfType('critical-stock', colors.critical, colors.critical)
}

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

                    return `<div class='d-flex'>${renderActionButtonsInDataTable(row, IS_STRUCTURE_HEAD || IS_STOCK_MANAGER, IS_STOCK_MANAGER, IS_STOCK_MANAGER, viewButtonClick, deleteButtonClick)}</div>`
                }
            }
        }
    ],
    order: [[2, "desc"]]
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
                    return returnDeleteButton()
                }
            }
        },
        {
            "data": "equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    let options = []

                    state.equipments.map( (item, index) => {
                        options.push(`<option ${item.equipmentName == data ? 'selected': ''} value='${item.equipmentName}'>${item.equipmentName}</option>`)
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
    ],
    searching: false,
    ordering: false,
    paging: false
})

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
        
        drawDataTable(data, true, equipmentsTable)
        // equipmentsTable.clear()
        // equipmentsTable.rows.add(data)
        // equipmentsTable.draw()

        highlightRows()
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
        
        drawDataTable(data, true, dischargesTable)
        // dischargesTable.clear()
        // dischargesTable.rows.add(data)
        // dischargesTable.draw()
    },
    error: function(data) {
        console.log("Error getting the equipments from the API")
        console.log(data.responseText)
    }
})

function drawDataTable(data, clear=true, table) {
    if (clear) {
        table.clear()
    }

    table.rows.add(data)
    table.draw()
}

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

            drawDataTable(data, false, equipmentsTable)
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
            quantity: $("#equipment-detail-quantity").val(),
            stockAlerte: $("#equipment-detail-stock-alerte").val(),
            stockSecurite: $("#equipment-detail-stock-securite").val(),
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
                console.log("Equipment modified successfully. Data returned: ")
                console.log(data)

                for (let equipment of state.equipments) {
                    if (equipment.equipmentId == equipmentSelectedForEditing.equipmentId) {
                        equipment.equipmentName = data.equipmentName
                        equipment.quantity = data.quantity
                        equipment.stockAlerte = data.stockAlerte
                        equipment.stockSecurite = data.stockSecurite

                        break
                    }
                }

                equipmentsTable.clear()
                equipmentsTable.rows.add(state.equipments)
                equipmentsTable.draw()

                highlightRows()
                
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

$("#add-rows-to-new-discharge-table").click(function() {
    console.log("Clicked the add rows to new discharge table button")

    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-new-discharge-table").val())
        
        if (numberOfRows > 0) {
            let listOfRows = getEmptyEquipments(numberOfRows, {equipmentId: {equipmentName: ""}, quantity: 1})
            
            console.log(`Adding ${numberOfRows} rows to discharge table`)
            addRowsToDataTable(newDischargeEquipmentsTable, listOfRows)
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

    if (formData) {
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

                // updating the quantity left of the equipments in the state
                data.equipments.map( (item) => {
                    for (let i=0; i<state.equipments.length; i++) {
                        equipment = state.equipments[i]

                        if (equipment.equipmentId == item.equipmentId.equipmentId) {
                            state.equipments[i].quantity = item.equipmentId.quantity
                            break
                        }
                    }
                } )
                drawDataTable(state.equipments, true, equipmentsTable)
    
                displayMessage("Décharge enregistrée avec succès", ["alert-success", "alert-dismissible"])
            },
            error: function(data) {
                console.error("Error adding the new entry")
                console.log(formData)
                console.log(JSON.stringify(formData))
                console.log(data.responseText)
            }
        })
    }
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

    let errors = false

    function getEquipmentWithName(equipmentName) {
        for (let equipment of state.equipments) {
            if (equipment.equipmentName.toLowerCase() === equipmentName.toLowerCase()) {
                return equipment
            }
        }

        return null
    }

    $("#new-discharge-table tbody tr").each(function() {
        let equipmentNameSelector = $(this).find("input[name='equipmentName']").first()
        let quantitySelector = $(this).find("input[name='quantity']").first()

        let equipmentName = $(this).find("select[name='equipmentName']").first().val()
        let quantity = $(this).find("input[name='quantity']").first().val()

        let equipment = null

        _appendErrorMessage = function(message, jqueryNode) {
            appendErrorMessage(message, jqueryNode)
            errors = true
        }

        // validate the equipmentName and quantity
        if (!equipmentName) {
            _appendErrorMessage(`Ce champ est obligatoire`, equipmentNameSelector.parent())
        } else {
            equipment = getEquipmentWithName(equipmentName)

            if (!equipment) {
                _appendErrorMessage(`Aucun équipement n'existe avec le nom ${equipmentName}`, equipmentNameSelector.parent())
            } else {
                removeErrorMessages(equipmentNameSelector)
            }
        }

        if (!quantity) {
            _appendErrorMessage(`Ce champ est obligatoire`, quantitySelector.parent())
        } else if (isNaN(parseFloat(quantity))) {
            _appendErrorMessage('Ce champ doit être un entier', quantitySelector.parent())
        } else if (equipment && equipment.quantity < parseFloat(quantity)) {
            _appendErrorMessage(`Il ne reste que ${equipment.quantity} unités en stock`, quantitySelector.parent())
        }
        else {
            removeErrorMessages(quantitySelector)
        }

        let dischargedEquipment = {
            equipmentId: {
                equipmentName: equipmentName
            },
            quantity: quantity
        }

        discharge.equipments.push(dischargedEquipment)
    })

    return errors ? null : discharge
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
    $("#equipment-detail-stock-securite").val(equipment.stockSecurite)
    $("#equipment-detail-stock-alerte").val(equipment.stockAlerte)

    $("#equipment-detail-modal-toggle").click()
}

function displayDischargeDetailModal(discharge=dischargeSelectedForEditing) {
    $("#discharge-detail-modal-title").text(`${discharge.structureId.structureName}: ${getLocaleTime(discharge.dateCreated, true)}`)

    $("#discharge-detail-structure").val(discharge.structureId.structureId)
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