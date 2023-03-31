var purchaseOrderSelectedForEditing = null

var purchaseOrdersTable = $("#purchase-orders-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        return IS_STRUCTURE_HEAD ? `<input type='checkbox' class='select-row' value=${row['purchaseorderId']}>` : ''
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
            render: function(data, type, row, meta) {
                return getLocaleTime(data, true)
            }
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
                                <button class="btn text-primary" onclick=purchaseOrderEditButtonClick(${row['purchaseorderId']}) data-purchase-order-id=${row['equipmentId']}>
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="btn mx-1 text-danger" onclick=purchaseOrderDeleteButtonClick(${row['purchaseorderId']}) data-purchase-order-id=${row['purchaseorderId']}>
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>`
                }
            }
        }
    ]
})

function deleteRow(e) {
    console.log("Deleting the row containing: ")
    console.log(e.target)
}

var newPurchaseOrderTable = $("#new-purchase-order-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        let rowId = generateRandomId()
                        
                        return `<i class="delete-row fas fa-trash text-danger" onclick=deleteTableRow('${rowId}')></i><input type='hidden' id='${rowId}'>`
                    } catch (error) {
                        
                    }
                }
            }
        },
        {
            "data": "equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="text" placeholder="Nom de l'equipement" list="equipments-list" name="equipmentName" value=${data}>`
                }
                else 
                    return data
            }
        },
        {
            "data": "quantity",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="number" placeholder="Quantite" name="quantity" min=1 value=${data}>`
                }
                else
                    return data
            }
        }
    ]
})

var purchaseOrderDetailsTable = $("#purchase-order-detail-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        let rowId = generateRandomId()

                        return `<i class="delete-row fas fa-trash text-danger" onclick=deleteTableRow('${rowId}')></i><input type='hidden' id='${rowId}'>`
                    } catch (error) {
                        
                    }
                }
            }
        },
        {
            "data": "equipmentId.equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="text" placeholder="Nom de l'equipement" list="equipments-list" name="equipmentName" value=${data}>`
                }
                else 
                    return data
            }
        },
        {
            "data": "quantity",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="number" placeholder="Quantite" name="quantity" min=1 value=${data}>`
                }
                else
                    return data
            }
        }
    ]
})

$.ajax({
    type: 'GET',
    url: '/managepurchaseorder/purchaseorders/',
    success: function(data) {
        console.log("Successfully gotten the purchase orders from the API")
        console.log(data)

        state.purchaseOrders = data

        purchaseOrdersTable.clear()
        purchaseOrdersTable.rows.add(data)
        purchaseOrdersTable.draw()
    },
    error: function(data) {
        console.log("Error getting the purchaseOrders from the API")
        console.log(data.responseText)
    }
})

$("#new-purchase-order-modal-toggle").click( function() {
    console.log("Clicked the add new purchase order button")
    // add 3 rows to the new purchase order modal if the table is empty
    let numberOfRows = $("#new-purchase-order-modal table tbody tr .fa-trash").length

    console.log(`The number of rows in the table is: ${numberOfRows}`)

    if ( numberOfRows == 0 ) {
        addRowsToNewPurchaseOrderTable()
    }
} )

/* ------------------------ EVENT LISTENERS SECTION ------------------------ */

$("#add-rows-to-new-purchase-order-table").click( function() {
    console.log("Clicked the 'Ajouter des lignes' button")

    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-new-purchase-order-table").val())

        addRowsToNewPurchaseOrderTable(numberOfRows)
    } catch (error) {
        throw error
    }
} )

$("#add-rows-to-purchase-order-detail-table").click( function() {
    console.log("Clicked the 'Ajouter des lignes' button")

    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-purchase-order-detail-table").val())

        addRowsToNewPurchaseOrderTable(numberOfRows, false)
    } catch (error) {
        throw error
    }
} )

$("#new-purchase-order-save").click(function() {
    console.log("Saving the new purchase order")

    let formData = getNewPurchaseOrderFromForm()

    $.ajax({
        type: "POST",
        url: "/managepurchaseorder/purchaseorders/",
        contentType: "application/json",
        data: JSON.stringify(formData),
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            state.purchaseOrders.push(data)

            purchaseOrdersTable.rows.add([data])
            purchaseOrdersTable.draw()

            displayMessage("Purchase order saved successfully", ["alert-success", "alert-dismissible"])

            $("#new-purchase-order-modal-close").click()
        },
        error: function(data) {
            displayMessage("Error saving the new purchase order")
            console.log(formData)
            console.log(data.responseText)
        }
    })
})

$("#confirm-purchase-order-deletion-no").click( function() {
    $("#confirm-purchase-order-deletion-modal-close").click()
} )

$("#confirm-purchase-order-deletion-no").click( function() {
    try {
        let purchaseOrderId = parseInt($("#confirm-purchase-order-deletion-purchase-order-id").val())
        purchaseOrderDeleteButtonClick(purchaseOrderId, false)

        $("#confirm-purchase-order-deletion-modal-close").click()
    } catch (error) {
        throw error
    }
} )

$("#purchase-order-detail-save").click(function() {
    let formData = getPurchaseOrderDetailsFromForm()

    $.ajax({
        type: 'PATCH',
        url: `/managepurchaseorder/purchaseorders/${purchaseOrderSelectedForEditing.purchaseorderId}/`,
        contentType: "application/json",
        data: JSON.stringify(formData),
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            state.purchaseOrders.map( (item, index) => {
                if (item.purchaseorderId == purchaseOrderSelectedForEditing.purchaseorderId) {
                    state.purchaseOrder[index] = data
                }
            } )
        },
        error: function(data) {
            console.log("There was an error updating the purchase order")
            console.log(formData)
            console.log(data.responseText)
        }
    })
})

/* ------------------------ END EVENT LISTENERS SECTION ------------------------ */

function addRowsToNewPurchaseOrderTable(numberOfRows=2, useNewPurchaseOrderTable=true) {
    console.log(`Adding ${numberOfRows} to the new purchaseOrder table`)

    let emptyEquipmentObject;

    if (useNewPurchaseOrderTable) {
        emptyEquipmentObject = {
            equipmentName: '',
            quantity: 1
        }
    } else {
        emptyEquipmentObject = {
            equipmentId: {
                equipmentName: ''
            },
            quantity: 1
        }
    }

    let listOfRows = []

    for ( let i=0; i<numberOfRows; i++ ) {
        listOfRows.push(emptyEquipmentObject)
    }

    if (useNewPurchaseOrderTable) {
        newPurchaseOrderTable.rows.add(listOfRows)
        newPurchaseOrderTable.draw()
    } else {
        purchaseOrderDetailsTable.rows.add(listOfRows)
        purchaseOrderDetailsTable.draw()
    }
}

function removeRowFromTable(e) {
    console.log("Clicked the trash icon on the row")
    e.target.parentNode.parentNode.remove()
}

function getNewPurchaseOrderFromForm() {
    let purchaseOrder = {
        structureId: $("#new-purchase-order-structure").val(),
        dateCreated: $("#new-purchase-order-date").val(),
        equipments: []
    }

    // validate the structureId and dateCreated fields

    $("#new-purchase-order-table tbody tr").each(function() {
        let equipmentName = $(this).find("input[name='equipmentName']").first().val()
        let quantity = $(this).find("input[name='quantity']").first().val()

        // validate the equipmentName and quantity

        let purchaseOrderEquipment = {
            equipmentId: {
                equipmentName: equipmentName
            },
            quantity: quantity
        }

        purchaseOrder.equipments.push(purchaseOrderEquipment)
    })

    return purchaseOrder
}

function getPurchaseOrderDetailsFromForm() {
    let purchaseOrder = {
        purchaseorderId: $("#purchase-order-detail-purchaseorder-id"),
        structureId: $("#purchase-order-detail-structure").val(),
        dateCreated: $("#purchase-order-detail-date").val(),
        equipments: []
    }

    // validate the structureId and dateCreated fields

    $("#purchase-order-detail-table tbody tr").each(function() {
        let equipmentName = $(this).find("input[name='equipmentName']").first().val()
        let quantity = $(this).find("input[name='quantity']").first().val()

        // validate the equipmentName and quantity
        let purchaseOrderEquipment = {
            equipmentId: {
                equipmentName: equipmentName
            },
            quantity: quantity
        }

        purchaseOrder.equipments.push(purchaseOrderEquipment)
    })
}

function displayPurchaseOrderDetailModal(purchaseOrder=purchaseOrderSelectedForEditing) {
    $("#purchase-order-detail-modal-title").text(`${purchaseOrder.structureId}: ${purchaseOrder.dateCreated}`)

    $("#purchase-order-detail-purchaseorder-id").val(purchaseOrderSelectedForEditing)
    $("#purchase-order-detail-structure").val(purchaseOrder.structureId)
    $("#purchase-order-detail-date").val(purchaseOrder.dateCreated)

    purchaseOrderDetailsTable.clear()
    purchaseOrderDetailsTable.rows.add(purchaseOrder.equipments)
    purchaseOrderDetailsTable.draw()

    $("#purchase-order-detail-modal-toggle").click()
}

function purchaseOrderEditButtonClick(purchaseOrderId) {
    for (let purchaseOrder of state.purchaseOrders) {
        if ( purchaseOrder.purchaseorderId == purchaseOrderId ) {
            purchaseOrderSelectedForEditing = purchaseOrder

            displayPurchaseOrderDetailModal(purchaseOrderSelectedForEditing)
        }
    }
}

function purchaseOrderDeleteButtonClick(purchaseOrderId, displayModal=true) {
    if (displayModal) {
        // display modal to confirm deletion
        $("#confirm-purchase-order-deletion-modal-open").click()
        $("#confirm-purchase-order-deletion-purchase-order-id").val(purchaseOrderId)
    }
    else {
        // perform deletion
        $.ajax({
            type: "DELETE",
            url: `/managepurchaseorder/purchaseorders/${purchaseOrderId}`,
            headers: {
                "X-CSRFTOKEN": getCookie("csrftoken")
            },
            success: function(data) {
                displayMessage("Le commande a ete supprime avec succes", ["alert-success", "alert-dismissible"])
    
                state.purchaseOrders = state.purchaseOrders.filter( (item) => {
                    return item.purchaseorderId != purchaseOrderId
                } )
    
                purchaseOrdersTable.clear()
                purchaseOrdersTable.rows.add(state.purchaseOrders)
                purchaseOrdersTable.draw()
            },
            error: function(data) {
                displayMessage("Le commande n'a pas ete supprime avec succes")
            }
        })
    }
}