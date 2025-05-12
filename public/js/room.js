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
    const nameSpan = button.closest(".player-name-container").querySelector(".player-name")
    nameSpan.contentEditable = true
    nameSpan.focus()
    const charsLimit = 15
    nameSpan.addEventListener("input", () => {
      if (nameSpan.textContent.length > charsLimit) {
        nameSpan.textContent = nameSpan.textContent.slice(0, charsLimit)
        toastr.warning(`Name cannot exceed ${charsLimit} characters`)
      }
    })
    console.log(nameSpan)

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

    nameSpan.addEventListener("blur", () => {
      nameSpan.contentEditable = false
    })

    nameSpan.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        nameSpan.blur()
      }
    })
  })
})
