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