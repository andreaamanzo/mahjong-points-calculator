toastr.options = {
    "positionClass": "toast-bottom-right",
    "closeButton": true,
    "progressBar": true,
    "timeOut": "4000",
    "extendedTimeOut": "1000",
    "showDuration": "300",
    "hideDuration": "300",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "preventDuplicates": true, 
    "newestOnTop": true 
}

function editName(button) {
    const nameSpan = button.closest(".player-name-container").querySelector(".player-name")
    nameSpan.contentEditable = true
    nameSpan.focus()
    const charsLimit = 15
    nameSpan.addEventListener("input", () => {
        if (nameSpan.textContent.trim().length > charsLimit) {
            nameSpan.textContent = nameSpan.textContent.trim().slice(0, charsLimit)
            toastr.warning(`Name cannot exceed ${charsLimit} characters`)
        }
    })

    nameSpan.addEventListener('blur', () => {
        nameSpan.contentEditable = false
    })

    nameSpan.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            nameSpan.blur()
        }
    })
}

document.getElementById("exit-button")?.addEventListener("click", async () => {
  try {
    if (isHost) {
      const response = await fetch("/api/delete-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomCode }),
      })
      if (!response.ok) {
        throw new Error("Failed to delete room")
      }
      window.location.href = '/'
    } else {
      const response = await fetch("/api/delete-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      })
      if (!response.ok) {
        throw new Error("Failed to delete player")
      }
      window.location.href = '/'
    }
  } catch (error) {
    toastr.error("Failed to exit. Please try again.")
    console.error(error)
  }
})
