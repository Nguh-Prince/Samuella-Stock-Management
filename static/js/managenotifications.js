$.ajax({
    type: 'GET',
    url: `/managenotifications/notifications/`,
    success: function(data) {
        state.notifications = data
        console.log("Notifications gotten from the API")
        console.log(data)

        populateNotificationsMenu(state.notifications)
    }
})

function populateNotificationsMenu(notifications, limit=10) {
    // populates the notification card that appears after 
    // clicking the notification icon in the top menu
    numberOfUnseenNotifications = 0

    notifications.map( (item, i) => {
        if (i < limit) {
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
    
            $(notificationDiv)
    
            console.log("Created notification div")
            console.log(notificationDiv)
    
            $('.Menu_NOtification_Wrap .Notification_body').append(notificationDiv)
        }

        numberOfUnseenNotifications += item.notificationSeen ? 0 : 1
    } )

    console.log(`The number of unseen notifications are: ${numberOfUnseenNotifications}`)

    if (numberOfUnseenNotifications >= 1) {
        let span = createElement('span', [], {textContent: numberOfUnseenNotifications})

        $(".bell_notification_clicker").append(span)
    } else {
        $('.bell_notification_clicker>span').remove()
    }
}