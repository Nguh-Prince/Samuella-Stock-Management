var statistics = null

$.ajax({
    type: "GET",
    url: '/statistics/',
    success: function(data) {
        console.log("Stats gotten from API")
        console.log(data)

        statistics = data

        // TODO: store in localStorage

        populateStatistics()
    },
    error: function(data) {
        displayMessage("Error getting statistics from the API")
    }
})

function getEquipmentsAndQuantities(list) {
    equipmentsAndQuantities = []

    for (let item of list) {
        equipmentsAndQuantities.push( `${item.quantity} ${item.equipmentId.equipmentName}` )
    }

    return equipmentsAndQuantities
}

function populateStatistics() {
    $("#overview-1-text").text(statistics['number_of_equipments'])
    $("#overview-2-text").text(statistics['number_of_departments'])
    $("#overview-3-text").text(statistics['number_of_purchase_orders'])
    $("#overview-2-text").text(statistics['number_of_discharges'])

    for ( let discharge of statistics['recent_discharges'] ) {
        let timeHeader = createElement('h6')
        $(timeHeader).text( `${discharge.structureId} ${discharge.dateCreated}` )

        let equipsmentDischarged = createElement('p')

        // let equipsmentDischargedText = []
        // for (let equipment of discharge.equipments) {
        //     equipsmentDischargedText.push(`${equipment.quantity} ${equipment.equipmentName}`)
        // }
        equipsmentDischargedText = getEquipmentsAndQuantities(discharge.equipments).join(', ')
        $(equipsmentDischarged).text(equipsmentDischargedText)

        let activityWrap = createElement('div', 'activity_wrap'.split(' '))
        activityWrap.appendChild(timeHeader)
        activityWrap.appendChild(equipsmentDischarged)

        let timeLine = createElement('div', "timeLine_inner d-flex align-items-center".split(' '))
        timeLine.appendChild(activityWrap)

        let activityBell = createElement('div', 'activity_bell'.split(' '))

        let listItem = createElement('li')
        listItem.appendChild(activityBell)
        listItem.appendChild(timeLine)

        $("#recent-discharges-list").append(listItem)
    }

    for (let purchaseOrder of statistics['recent_purchase_orders']) {
        let lodoLeft = createElementsRecursively({
            tag: 'div',
            classes: 'lodo_left d-flex align-items-center'.split(' '),
            attributes: null,
            elements: [
                {
                    tag: 'div',
                    classes: 'bar_line mr_10'.split(' '),
                    attributes: null
                },
                {
                    tag: 'div',
                    classes: ['todo_box'],
                    attributes: null,
                    elements: [
                        {
                            tag: 'label',
                            classes: "form-label primary_checkbox d-flex mr_10".split(' '),
                            attributes: null,
                            elements: [
                                {
                                    tag: 'input',
                                    classes: [],
                                    attributes: {type: 'checkbox'}
                                },
                                {
                                    tag: 'span',
                                    classes: ['check-mark'],
                                    attributes: null
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: 'div',
                    classes: ['todo_head'],
                    attributes: null,
                    elements: [
                        {
                            tag: 'h5',
                            classes: 'f_s_18 f_w_900 mb-0'.split(' '),
                            attributes: null
                        },
                        {
                            tag: 'p',
                            classes: "f_s_12 f_w_400 mb-0 text_color_8".split(' '),
                            attributes: null
                        }
                    ]
                }
            ]
        })

        $(lodoLeft).find('.f_s_18').first().text(`${getEquipmentsAndQuantities(purchaseOrder.equipments).join(', ')}`)
        $(lodoLeft).find('.f_s_12').first().text(`${purchaseOrder.structureId}, ${purchaseOrder.dateCreated}`)

        let singleTodo = createElement('div', "single_todo d-flex justify-content-between align-items-center".split(' '))
        singleTodo.appendChild(lodoLeft)

        $("#recent-purchase-orders").append(singleTodo)
    }
}