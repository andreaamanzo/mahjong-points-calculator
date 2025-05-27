const urlParams = new URLSearchParams(window.location.search)

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
      const playerId = urlParams.get("playerId")
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


document.getElementById("exit-button").addEventListener("click", () => {
  const playerId = urlParams.get("playerId")
  const isHost = urlParams.get("isHost") == "true" ? true : false
  const roomCode = urlParams.get("roomCode")

  if (isHost) {
    fetch("/api/delete-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomCode }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete room")
      }
      console.log("deleted")
      
      window.location.href = '/'
    })
    .catch((error) => {
      toastr.error("Failed to exit. Please try again.")
      console.error(error)
    })
  } else {
    fetch("/api/delete-player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerId }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete player")
      }
      window.location.href = '/'
    })
    .catch((error) => {
      toastr.error("Failed to exit. Please try again.")
      console.error(error)
    })
  }
})
