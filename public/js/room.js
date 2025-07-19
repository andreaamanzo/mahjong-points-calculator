const urlParams = new URLSearchParams(window.location.search)
const playerId = urlParams.get("playerId")
const isHost = urlParams.get("isHost") == "true" ? true : false
const roomCode = urlParams.get("roomCode")

const socket = io()

socket.emit("register", {
	id: parseInt(playerId),
	roomCode
})

function updateWindRose(estWindPlayer = null) {
  const names = Array.from(document.querySelectorAll('.player-name'))
    .map(el => el.textContent.trim())

	if (estWindPlayer && names.length === 4) {
		let count = 0
    while (names[0] !== estWindPlayer && names.length > 0 && count < 4) {
      names.push(names.shift())
			count++
    }
		document.getElementById('wind-east').textContent = names[0]
		document.getElementById('wind-south').textContent = names[1]
		document.getElementById('wind-west').textContent = names[2]
		document.getElementById('wind-north').textContent = names[3]
  } else {
		document.getElementById('wind-east').textContent = "–"
		document.getElementById('wind-south').textContent = "–"
		document.getElementById('wind-west').textContent = "–"
		document.getElementById('wind-north').textContent = "–"
	}
}

async function calculatePoints() {
	try {
		const response = await fetch('/api/calculate-points', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomCode
			})
		})

		if (!response.ok) {
			throw new Error("Failed to calculate points")
		} 

		const roundResults = (await response.json()).roundResults


		const container = document.querySelector('.results-container')
		
		const responsePartial = await fetch(`/room/partial/resultsTable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roundResults }),
    })

    const html = await responsePartial.text()
    container.innerHTML = html

	} catch(error) {
		toastr.error("Can't calculate points")
		console.error(error)
	}
}

document.querySelectorAll('input[type="radio"]').forEach(radio => {
	radio.addEventListener('click', function () {
		if (radio.value === "true") {
			radio.value = "false"
		} else {
			radio.value = "true"
		}
	})
})

// Points
document.querySelectorAll('[id^="player"][id$="-points"]:not([disabled])').forEach(function (element) {
	element.addEventListener('blur', async function (event) {
		if (isNaN(event.target.value)){
			event.target.value = 0
		}
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
document.querySelectorAll('[id^="player"][id$="-doubles"]:not([disabled])').forEach(function (element) {
	element.addEventListener('blur', async function (event) {

		if (isNaN(event.target.value) || !event.target.value){
			event.target.value = 0
		}
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
document.querySelectorAll('[id^="player"][id$="-mahjong"]:not([disabled])').forEach(function (element) {
	element.addEventListener('click', async function (event) {
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
			})

			if (!response.ok) {
				throw new Error("Failed to update mahjong")
			}
		} catch (error) {
			toastr.error("Failed to set mahjong. Please try again.")
			console.error(error)
		}
	})
})

// Est Wind
document.querySelectorAll('[id^="player"][id$="-estWind"]:not([disabled])').forEach(function (element) {
	element.addEventListener('click', async function (event) {
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

document.getElementById("limit-select").addEventListener('change', async function (event) {
  const newLimit = parseInt(event.target.value)
  
  try {
    const response = await fetch('/api/update-round-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newLimit: newLimit,
        roomCode: roomCode
      })
    })

    if (!response.ok) {
      throw new Error("Failed to update round limit")
    }
  } catch (error) {
    toastr.error("Failed to update round limit. Please try again.")
    console.error(error)
  }
})

document.getElementById("copy-code-button").addEventListener("click", () => {
  const code = document.getElementById("roomCode").textContent
  navigator.clipboard
	.writeText(code)
	.then(() => {
		toastr.success("Room code copied to clipboard!")
	})
	.catch((err) => {
		toastr.error("Failed to copy!")
	})
})

socket.on("roundLimitUpdated", ({ roundId, newLimit }) => {
	const newLimitString = newLimit.toString() + "/" + (newLimit*2).toString()
	document.getElementById("limit-select").value = newLimitString
	toastr.success("Round limit updated!")
})

socket.on("playerPointsUpdated", ({ playerId, points }) => {
	const input = document.querySelector(`[id="player${playerId}-points"]`)
	if (input) input.value = points
})

socket.on("playerDoublesUpdated", ({ playerId, doubles }) => {
	const input = document.querySelector(`[id="player${playerId}-doubles"]`)
	if (input) input.value = doubles
})

socket.on("playerMahjongUpdated", ({ playerId, mahjong }) => {
	const input = document.querySelector(`[id="player${playerId}-mahjong"]`)
	if (input) {
		document.querySelectorAll('[id^="player"][id$="-mahjong"]').forEach(element => {
			element.value = "false"
		})
		input.checked = mahjong
		input.value = mahjong ? "true" : "false"
	}
})

socket.on("playerEstWindUpdated", ({ playerId, estWind }) => {
	const input = document.querySelector(`[id="player${playerId}-estWind"]`)
	if (input) {
		document.querySelectorAll('[id^="player"][id$="-estWind"]').forEach(element => {
			element.value = "false"
		})
		input.checked = estWind
		input.value = estWind ? "true" : "false"
		if (estWind) updateWindRose(document.getElementById(`player${playerId}-name`).textContent.trim())
		else updateWindRose(null)
	}
})

socket.on("reloadPage", () => {
	window.location.reload()
})