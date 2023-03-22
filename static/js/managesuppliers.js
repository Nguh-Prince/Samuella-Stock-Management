var supplierSelectedForEditing = null

var suppliersTable = $("#suppliers-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input type='checkbox' class='select-row' value=${row['supplierId']}>`
                }
            }
        },
        {
            "data": "supplierName"
        },
        {
            "data": "supplierLocation"
        },
        {
            // delete and edit buttons
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    if (row['supplierId'] !== null) 
                        return `<button class="btn text-primary" onclick=supplierEditButtonClick(${row['supplierId']}) data-supplier-id=${row['supplierId']}>
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="btn mx-1 text-danger" data-supplier-id=${row['supplierId']}>
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
    url: '/managestock/suppliers/',
    success: function(data) {
        state.suppliers = data

        suppliersTable.clear()
        suppliersTable.rows.add(data)
        suppliersTable.draw()
    },
    error: function(data) {
        console.log("Error getting the suppliers from the API")
        console.log(data.responseText)
    }
})

$("#new-supplier-save").click( function() {
    console.log("Saving the new equipment")
    // get the data from the form
    data = {
        'data': getNewSuppliersFromForm()
    }

    $.ajax({
        type: "POST",
        url: '/managestock/suppliers/',
        data: JSON.stringify(data),
        contentType: "application/json",
        headers: {
            "X-CSRFTOKEN": getCookie("csrftoken")
        },
        success: function(data) {
            state.suppliers = state.suppliers.concat(data)

            suppliersTable.rows.add(data)
            suppliersTable.draw()

            $("#new-supplier-modal-close").click()
        },
        error: function(data) {
            console.log("Error adding new equipments")
            console.log(data.responseText)
        }
    })
} )

$("#supplier-detail-modify").click(function() {
    let formData = {
        supplierName: $("#supplier-detail-name").val(),
        supplierLocation: $("#supplier-detail-location").val(),
        supplierDescription: $("#supplier-detail-description").val()
    }

    $.ajax({
        type: "PATCH",
        url: `/managestock/suppliers/${supplierSelectedForEditing}/`,
        data: JSON.stringify(formData),
        contentType: "application/json",
        headers: getCsrfTokenHeader(),
        success: function(data) {
            console.log("Supplier modified successfully")

            for (let supplier of state.suppliers) {
                if (supplier.supplierId == supplierSelectedForEditing.supplierId) {
                    supplier.supplierName = data.supplierName
                    supplier.supplierLocation = data.supplierLocation
                    supplier.supplierDescription = data.supplierDescription

                    break
                }
            }

            suppliersTable.clear()
            suppliersTable.rows.add(state.suppliers)
            suppliersTable.draw()

            displayMessage("Les details de prestataires a ete modifie avec succes", ['alert-success', 'alert-dismissible'])

            $("#supplier-detail-modal-close").click()
        },
        error: function(data) {
            console.log("Error updating the supplier")
                console.log(data.responseText)
                console.log(formData)
            displayMessage("Error modifying the supplier")
        }
    })
})

/* ------------------------- END EVENT LISTENERS -------------------------  */

function getNewSuppliersFromForm() {
    let supplier = {
        supplierName: $("#new-supplier-name").val(),
        supplierLocation: $("#new-supplier-location").val(),
        supplierDescription: $("#new-supplier-description").val()
    }   

    return [supplier]
}