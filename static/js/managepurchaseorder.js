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
                        return `<input type='checkbox' class='select-row' value=${row['purchaseorderId']}>`
                    } catch (error) {
                        
                    }
                }
            }
        },
        {
            "data": "structureId"
        },
        {
            "data": "dateCreated"
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
        }
    ]
})

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
                        return `<i class="delete-row fas fa-trash text-danger"></i>`
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

/* ------------------------ END EVENT LISTENERS SECTION ------------------------ */

function addRowsToNewPurchaseOrderTable(numberOfRows=2) {
    console.log(`Adding ${numberOfRows} to the new purchaseOrder table`)
    let emptyEquipmentObject = {
        equipmentName: '',
        quantity: 1
    }

    let listOfRows = []

    for ( let i=0; i<numberOfRows; i++ ) {
        listOfRows.push(emptyEquipmentObject)
    }

    newPurchaseOrderTable.rows.add(listOfRows)
    newPurchaseOrderTable.draw()
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