var newPurchaseOrderTable = $("#new-purchase-order-table").DataTable({
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
                    return `<input class="form-control" type="number" placeholder="Quantite" name="quantity" value=${data}>`
                }
                else
                    return data
            }
        }
    ]
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

$("#add-rows-to-new-purchase-order-table").click( function() {
    console.log("Clicked the 'Ajouter des lignes' button")

    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-new-purchase-order-table").val())

        addRowsToNewPurchaseOrderTable(numberOfRows)
    } catch (error) {
        throw error
    }
} )

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