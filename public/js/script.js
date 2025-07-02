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

document.getElementById("exit-button").addEventListener("click", () => {
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
