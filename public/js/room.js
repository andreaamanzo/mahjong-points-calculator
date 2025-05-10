const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get("roomCode");
console.log(roomCode);

if (roomCode) {
  console.log(document.getElementById("roomCode"));
  document.getElementById("roomCode").textContent = `${roomCode}`;
}

document.getElementById("copy-code-button").addEventListener("click", () => {
  const code = document.getElementById("roomCode").textContent;
  navigator.clipboard
    .writeText(code)
    .then(() => {
      toastr.success("Room code copied to clipboard!")
    })
    .catch((err) => {
      toastr.error("Failed to copy!")
    });
});
