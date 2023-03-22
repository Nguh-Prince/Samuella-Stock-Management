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