const urlParams = new URLSearchParams(window.location.search)
const playerId = urlParams.get("playerId")
const isHost = urlParams.get("isHost") == "true" ? true : false
const roomCode = urlParams.get("roomCode")

const socket = io()

socket.emit("register", {
  id: parseInt(playerId),
  roomCode
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

document.querySelector(".edit-button").addEventListener("click", () => {
  
})

function editNameLobby(button) {
  editName(button)
  const nameSpan = button.closest(".player-name-container").querySelector(".player-name")

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
}

async function startGameLobby(button) {
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
      throw new Error("Failed to start game")
    }

    window.location.href = `/room?isHost=${isHost}&roomCode=${roomCode}&playerId=${playerId}`
  } catch (error) {
    toastr.error("Failed to exit. Please try again.")
    console.error(error)
  }
}

async function updateLobbyPlayers(roomUsers) {
  const container = document.getElementById("updating-lobby-content")
  const players = roomUsers.map(player => ({
    ...player,
    isClientPlayer: player.id === parseInt(playerId),
    isEditable: player.id === parseInt(playerId),
  }))

  try {
    const response = await fetch(`/lobby-room/partial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ players, isHost }),
    })
    const html = await response.text()
    container.innerHTML = html

    document.querySelector(".edit-button").addEventListener("click", function (event) {
      console.log(event.currentTarget)
      editNameLobby(event.currentTarget)
    })

    document.getElementById("start-game-button")?.addEventListener("click", (event) => {
      console.log(event.currentTarget)
      startGameLobby(event.currentTarget)
    })

  } catch (err) {
    console.error("Errore durante l'aggiornamento della lobby:", err)
  }
}

socket.on("userListUpdate", (roomUsers) => {
  updateLobbyPlayers(roomUsers)
})

socket.on("reloadPage", () => {
  window.location.reload()
})