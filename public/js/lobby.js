const urlParams = new URLSearchParams(window.location.search)
const playerId = urlParams.get("playerId")
const isHost = urlParams.get("isHost") == "true" ? true : false
const roomCode = urlParams.get("roomCode")

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

document.querySelectorAll(".edit-button").forEach((button) => {
  button.addEventListener("click", () => {
    editName(button)

    nameSpan.addEventListener("blur", () => {
      const newName = nameSpan.textContent.trim()
      fetch("/api/rename-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newName, playerId }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to rename player")
        }
      })
      .catch((error) => {
        toastr.error("Error renaming player")
        console.error(error)
      })
    })
  })
})

document.getElementById("start-game-button").addEventListener("click", async (event) => {
  const button = event.currentTarget
  if (button.disabled) return

  try {
    const response = await fetch("/api/start-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomCode }),
    })

    if (!response.ok) {
      throw new Error("Failed to start room")
    }

    window.location.href = `/room?isHost=${isHost}&roomCode=${roomCode}&playerId=${playerId}`
  } catch (error) {
    toastr.error("Failed to exit. Please try again.")
    console.error(error)
  }


})
