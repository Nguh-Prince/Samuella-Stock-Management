var stockSelectedForEditing = null

var newEntryEquipmentsTable = $("#new-entry-table").DataTable({
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
            "data": "supplierId.supplierName"
        },
        {
            "data": "stockDate",
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
                    let viewButtonClick = `stockEditButtonClick(${row['stockId']})`
                    let deleteButtonClick = `stockDeleteButtonClick(${row['stockId']})`

                    return `<div class='d-flex'>${renderActionButtonsInDataTable(row, IS_STOCK_MANAGER, IS_STOCK_MANAGER, IS_STOCK_MANAGER, viewButtonClick, deleteButtonClick)}</div>`
                }
            }
        }
    ]
})

var entryDetailEquipmentsTable = $("#stock-detail-table").DataTable({
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
            "data": "equipmentId.equipmentName",
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

/*-------------------------  EVENT LISTENERS -------------------------- */

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

$("#add-rows-to-stock-detail-table").click(function() {
    try {
        let numberOfRows = parseInt($("#number-of-rows-to-add-to-stock-detail-table").val())

        if (numberOfRows > 0) {
            let listOfRows = getEmptyEquipments(numberOfRows, {equipmentId: {equipmentName: "", quantity: 1}})

            addRowsToDataTable(entryDetailEquipmentsTable, listOfRows)
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
            
            stocksTable.rows.add([data])
            stocksTable.draw()

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

$("#stock-detail-save").click(function() {
    let formData = getEntryDetailFromForm()

    $.ajax({
        type: 'PATCH',
        url: `/managestock/stocks/${stockSelectedForEditing.stockId}/`,
        contentType: 'application/json',
        data: JSON.stringify(formData),
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            
            state.stocks.map((item, index) => {
                if (item.stockId == stockSelectedForEditing.stockId) {
                    state.stocks[index] = data
                }
            })

            stocksTable.clear()
            stocksTable.rows.add(state.stocks)
            stocksTable.draw()

            displayMessage("Entry added successfully", ["alert-success", "alert-dismissible"])

            $("#stock-detail-modal-close").click()
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

$("#confirm-stock-deletion-yes").click(function() {
    try {
        let stockId = parseInt($("#confirm-stock-deletion-stock-id").val())
        stockDeleteButtonClick(stockId, false)

        $("#confirm-stock-deletion-modal-close").click()
    } catch (error) {
        throw error
    }
})
/*-------------------------  EVENT LISTENERS -------------------------- */

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

function getEntryDetailFromForm() {
    let entry = {
        supplierId: $("#stock-detail-supplier").val(),
        stockDate: $("#stock-detail-date").val(),
        equipments: []
    }

    $("#stock-detail-table tbody tr").each(function() {
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

function displayStockDetailModal(stock=stockSelectedForEditing) {
    $("#stock-detail-modal-title").text(`${stock.supplierId}: ${stock.stockDate}`)

    $("#stock-detail-supplier").val(stock.supplierId)
    $("#stock-detail-date").val(stock.stockDate)

    entryDetailEquipmentsTable.clear()
    entryDetailEquipmentsTable.rows.add(stock.equipments)
    entryDetailEquipmentsTable.draw()

    $("#stock-detail-modal-toggle").click()
}

function stockEditButtonClick(stockId) {
    for (let stock of state.stocks) {
        if (stock.stockId == stockId && stock.stockId !== null) {
            stockSelectedForEditing = stock
            displayStockDetailModal(stockSelectedForEditing)
            break;
        }
    }
}

function stockDeleteButtonClick(stockId, displayModal=true) {
    if (displayModal) {
        // display modal to confirm deletion
        $("#confirm-stock-deletion-modal-open").click()
        $("#confirm-stock-deletion-stock-id").val(stockId)
    }
    else {
        // perform deletion
        $.ajax({
            type: "DELETE",
            url: `/managestock/stocks/${stockId}`,
            headers: {
                "X-CSRFTOKEN": getCookie("csrftoken")
            },
            success: function(data) {
                displayMessage("Le commande a ete supprime avec succes", ["alert-success", "alert-dismissible"])
    
                state.stocks = state.stocks.filter( (item) => {
                    return item.stockId != stockId
                } )
    
                stocksTable.clear()
                stocksTable.rows.add(state.stocks)
                stocksTable.draw()
            },
            error: function(data) {
                displayMessage("Le commande n'a pas ete supprime avec succes")
            }
        })
    }
}