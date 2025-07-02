const urlParams = new URLSearchParams(window.location.search)
const playerId = urlParams.get("playerId")
const isHost = urlParams.get("isHost") == "true" ? true : false
const roomCode = urlParams.get("roomCode")

document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('click', function () {
        console.log(radio)
        if(radio.value === "true") {
            radio.value = "false"
            radio.checked = false
        } else {
            radio.value = "true"
            radio.checked = true
        }
    })
})

// Points
document.querySelectorAll('[id^="player"][id$="-points"]:not([disabled])').forEach(function(element) {
    element.addEventListener('blur', async function(event) {
        try {
            const response = await fetch('/api/update-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerId,
                    points: event.target.value,
                    roomCode
                })
            })

            if (!response.ok) {
                throw new Error("Failed to update points")
            }
        } catch (error) {
            toastr.error("Failed to set points. Please try again.")
            console.error(error)
        }
    })
})

// Doubles
document.querySelectorAll('[id^="player"][id$="-doubles"]:not([disabled])').forEach(function(element) {
    element.addEventListener('blur', async function(event) {
        try {
            const response = await fetch('/api/update-doubles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerId,
                    doubles: event.target.value,
                    roomCode
                })
            })

            if (!response.ok) {
                throw new Error("Failed to update doubles")
            }
        } catch (error) {
            toastr.error("Failed to set doubles. Please try again.")
            console.error(error)
        }
    })
})

// Mahjong
document.querySelectorAll('[id^="player"][id$="-mahjong"]:not([disabled])').forEach(function(element) {
    element.addEventListener('click', async function(event) {
        console.log("fatto")
        try {
            const mahjongValue = event.target.value === "true"
            const response = await fetch('/api/update-mahjong', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerId,
                    mahjong: mahjongValue,
                    roomCode
                })
            });

            if (!response.ok) {
                throw new Error("Failed to update mahjong");
            }
        } catch (error) {
            toastr.error("Failed to set mahjong. Please try again.");
            console.error(error);
        }
    });
})

// Est Wind
document.querySelectorAll('[id^="player"][id$="-estWind"]:not([disabled])').forEach(function(element) {
    element.addEventListener('click', async function(event) {
        try {
            const estWindValue = event.target.value === "true"
            const response = await fetch('/api/update-estWind', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playerId,
                    estWind: estWindValue,
                    roomCode
                })
            })

            if (!response.ok) {
                throw new Error("Failed to update estWind")
            }
        } catch (error) {
            toastr.error("Failed to set estWind. Please try again.")
            console.error(error)
        }
    })
})