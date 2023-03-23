function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function createElement(htmlTag, classes = null, attributes = null) {
    node = document.createElement(htmlTag)
    if (classes && typeof classes === 'object')
        for (let cssClass of classes) {
            try {
                node.classList.add(cssClass)
            } catch (error) {

            }
        }

    if (attributes && typeof attributes === 'object') {
        for (let key in attributes) {
            node.setAttribute(key, attributes[key])
        }
    }

    return node
}

function createElementFromObject(object) {
    // object must contain a tag attribute (which has a string value)
    // classes attribute (a list consisting of the different css class strings to be applied to the class)
    // and an attributes object (which has the different attributes alongside their values e.g {'id': 'new-div'})
    let element = createElement(object.tag, object.classes, object.attributes)
    return element
}

function createElementsRecursively(object) {
    // object must contain a tag attribute (which has a string value)
    // classes attribute (a list consisting of the different css class strings to be applied to the class)
    // an attributes object (which has the different attributes alongside their values e.g {'id': 'new-div'})
    // and an optional elements attribute, which is a list consisting of other objects which have the same structure as it does
    let element = createElementFromObject(object)

    if (!object.elements) {
        console.log("Creating element with object ")
        console.log(object)
        return element
    } else {
        console.log("Element has children ")
        console.log(object)
        for (let i = 0; i < object.elements.length; i++) {
            childObject = object.elements[i]
            console.log("Creating a child out of object: ")
            console.log(childObject)

            childElement = createElementsRecursively(childObject)

            console.log("The recursion cycle has ended")
            element.appendChild(childElement)
        }

        return element;
    }
}

function generateRandomId(length = 6) {
    while (true) {
        let id = (Math.random() + 1).toString(36).substring(12 - length)

        if (!document.getElementById(id)) {
            return id
        }
    }
}

function displayMessage(message, classes = ['alert-danger', 'alert-dismissible'], timeout = 10000) {
    let alert = createElement('div', ['alert'].concat(classes), { role: "alert" })
    $(alert).append(message)

    button = createElement('button', ['btn-close'], { "data-bs-dismiss": "alert", "aria-label": "Close" })
    $(alert).append(button)

    $("#messages").append(alert)

    if (timeout) {
        // closing the message after timeout milliseconds
        setTimeout(function () {
            $(button).click()
        }, timeout)
    }
}

function padStart(number, length=2, padString='0') {
    return String(number).padStart(length, padString)
}

function isoDateString(dateObject) {
    return `${dateObject.getFullYear()}-${padStart(dateObject.getMonth())}-${padStart(dateObject.getDate())}`
}

function updateCurrentDateAndTimeInputs() {
    console.log("Updating the values of current date and time inputs")
    let currentTime = new Date()

    $('input.current[type="date"]').val(isoDateString(currentTime))
}

function addRowsToDataTable(dataTable, listOfRows) {
    dataTable.rows.add(listOfRows)
    dataTable.draw()
}

function validateObject(object) {
    // object must have the following attributes
    // selector: a valid css selector for the input
    // type: string representing the accepted data type for this attribute
    // required: boolean 
    // in: css selector for a datalist or select where this input's value must come from
    // notIn: css selector for a datalist or select where this input'value should not be found
    // errorContainer: a css selector for where to append the error message, if not provided parent is used

    let value = $(object.selector).val()
    let flag = true
    let messages = []

    if ( $(object.selector).length < 1 ) {
        displayMessage(`Element with selector: '${object.selector}' does not exist`)
    }

    if (object.in && object.notIn && $(`${object.in}`)[0] == $(`${object.notIn}`)[0]) {
        alert(gettext("The in and notIn selectors of this object are the same"))
    }

    if (!value && object.required) {
        messages.push(gettext("This field is required"))

        flag = false
    } else {
        object.type == "number" ? value = parseFloat(value) : 1

        if (object.type == "number" && value) {
            if (isNaN(parseFloat(value))) {
                let message = gettext("Expected a number")

                messages.push(message)
                flag = false
            }
            else if ("min" in object && value < object.min) {
                let message = gettext("The value of this field must be greater than %s")
                message = interpolate(message, [object.min])

                messages.push(message)
                flag = false
            }
        }

        if (object.type == "date" && value) {
            if (!isDate(value)) {
                let message = gettext("This is not a valid date ")

                messages.push(message)
                flag = false
            }
        }
        else if (value && object.type == "name") {
            names = splitName(value)

            if (!names[0] || !names[2]) {
                let message = gettext("At least two names are required")

                messages.push(message)

                flag = false
            }
        }
        else if (value && typeof value !== object.type) {
            let message = gettext("Expected %s, got a value of %s")
            message = interpolate(message, [object.type, typeof value])

            messages.push(message)

            flag = false
        }

        if (object.in) {
            if (value && !$(`${object.in} option[value='${value}']`).val()) {
                message = gettext("This value does not exist on the list %s")
                message = interpolate(message, [object.in])

                messages.push(message)
                flag = false
            }
        }
        if (object.notIn) {
            if (value && $(`${object.notIn} option[value='${value}']`).val()) {
                message = gettext("This value already exists in the list %s")
                message = interpolate(message, [object.notIn])

                messages.push(message)
                flag = false
            }
        }
    }

    // removing other error messages from the container
    "errorContainer" in object ? $(object.errorContainer).children('.help-block').remove() : $(object.selector).parent().children('.help-block').remove()

    if (!flag) {
        for (let message of messages) {
            let helpBlock = createElement("span", ['help-block'])
            helpBlock.textContent = message

            if ("errorContainer" in object) {
                $(object.errorContainer).append(helpBlock)
                $(object.errorContainer).addClass('has-error')
            } else {
                $(object.selector).parent().append(helpBlock)
                $(object.selector).parent().addClass('has-error')
            }
        }
    }

    return flag
}

function validateObjects(objectList) {
    // a list of objects to be validated
    // each object must have the following attributes
    // selector: a valid css selector for the input
    // type: string representing the accepted data type for this attribute
    // required: boolean 
    // in: css selector for a datalist or select where this input's value must come from
    // errorContainer: a css selector for where to append the error message, if not provided parent is used

    let flag = true

    for (let object of objectList) {
        (validateObject(object)) == false ? flag = false : 1
    }

    return flag
}

function selectAllRows(tableSelector, select=true) {
    $(`${tableSelector} tbody tr input.select-row`).prop('checked', select)
}

const getEmptyEquipments = function(number, object={equipmentName: "", quantity: 1}) {
    let list = []

    for (let i=0; i<number; i++) {
        list.push(object)
    }

    return list
}

function getCsrfTokenHeader() {
    return {
        "X-CSRFTOKEN": getCookie("csrftoken")
    }
}