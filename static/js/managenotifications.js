var purchaseOrderDetailsViewTable = $("#purchase-order-detail-view-table").DataTable({
    columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
    }],
    "columns": [
        {
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    try {
                        return ``
                    } catch (error) {
                        
                    }
                }
            }
        },
        {
            "data": "equipmentId.equipmentName",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="text" placeholder="Nom de l'equipement" list="equipments-list" readonly name="equipmentName" value=${data}>`
                }
                else 
                    return data
            }
        },
        {
            "data": "quantity",
            render: function(data, type, row, meta) {
                if (type === 'display') {
                    return `<input class="form-control" type="number" readonly placeholder="Quantite" name="quantity" min=1 value=${data}>`
                }
                else
                    return data
            }
        }
    ]
})

$.ajax({
    type: 'GET',
    url: `/managenotifications/notifications/?unread=True`,
    success: function(data) {
        state.notifications = data
        populateNotificationsMenu(state.notifications)
    }
})

function populateNotificationsMenu(notifications, limit=10) {
    // populates the notification card that appears after 
    // clicking the notification icon in the top menu
    numberOfUnseenNotifications = 0

    notifications.map( (item, i) => {
        if (i < limit || !limit) {
            let notificationDiv = createElementsRecursively({
                tag: 'div',
                classes: 'single_notify d-flex align-items-center'.split(' '),
                elements: [
                    {
                        tag: 'div',
                        classes: ['notify_thumb'],
                        elements: [
                            {
                                tag: 'div',
                                classes: ['unread_bell']
                            }
                        ]
                    },
                    {
                        tag: 'div',
                        classes: ['notify_content'],
                        elements: [
                            {
                                tag: 'a',
                                classes: [],
                                attributes: {href: `#`},
                                elements: [
                                    {
                                        tag: 'h5',
                                        classes: [],
                                        attributes: { textContent: `${item.model}` }
                                    }
                                ]
                            },
                            {
                                tag: 'p',
                                classes: [],
                                attributes: { textContent: `${item.notificationMessage}` }
                            }
                        ]
                    }
                ]
            })
    
            $(notificationDiv).click( function() {
                displayPurchaseOrderDetailViewModal(item.instance)
            } )
    
            $('.Menu_NOtification_Wrap .Notification_body').append(notificationDiv)
        }

        numberOfUnseenNotifications += item.notificationSeen ? 0 : 1
    } )

    if (numberOfUnseenNotifications >= 1) {
        let span = createElement('span', [], {textContent: numberOfUnseenNotifications})

        $(".bell_notification_clicker").append(span)
    } else {
        $('.bell_notification_clicker>span').remove()
    }
}

function displayPurchaseOrderDetailViewModal(purchaseOrder) {
    $("#purchase-order-detail-view-modal-title").text(`${purchaseOrder.structureId.structureName}: ${purchaseOrder.dateCreated}`)

    $("#purchase-order-detail-view-purchaseorder-id").val(purchaseOrder.purchaseorderId)
    $("#purchase-order-detail-view-structure").val(purchaseOrder.structureId.structureId)
    $("#purchase-order-detail-view-date").val(purchaseOrder.dateCreated)

    purchaseOrderDetailsViewTable.clear()
    purchaseOrderDetailsViewTable.rows.add(purchaseOrder.equipments)
    purchaseOrderDetailsViewTable.draw()

    $("#purchase-order-detail-view-modal-toggle").click()
}