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

document.getElementById('limit-input').addEventListener('blur', function () {
    const val = parseInt(this.value)
    if (!isNaN(val)) {
        this.value = `${val}/${val * 2}`
    } else {
        this.value = "1000/2000"
    }
})


let estWind = null
let mahjong = null

document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('click', function () {
        const groupName = this.getAttribute('name')

        if (groupName === 'estWindPlayer') {
            if (this === estWind) {
                this.checked = false
                estWind = null
            } else {
                estWind = this
            }
        }

        if (groupName === 'mahjongPlayer') {
            if (this === mahjong) {
                this.checked = false
                mahjong = null
            } else {
                mahjong = this
            }
        }
    })
})

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

document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', () => editName(button))
})

class Player {
    constructor(name, points) {
        this.name = name
        this.points = points
        this.isEstWind = false
        this.isMahjong = false
        this.finalPoints = 0
    }
}

function calculatePoints()
{
    if (estWind === null || mahjong === null) {
        alert("Please select the Est Wind and the Mahjong player.")
        return
    }
    const limitInput = document.getElementById('limit-input').value
    const limit = parseInt(limitInput.split('/')[0])
    const players = [0, 1, 2, 3].map(i => {
        const name = document.getElementById(`player${i}-name`).innerText
        const doubles = parseInt(document.getElementById(`player${i}-doubles`).value)
        if (isNaN(doubles)) {
            alert(`Please enter a valid number for Player ${i} doubles.`)
            return
        }
        let points = parseInt(document.getElementById(`player${i}-points`).value) * Math.pow(2, doubles)
        if (isNaN(points)) {
            alert(`Please enter a valid number for Player ${i} points.`)
            return
        }
        if (points > limit) points = limit
        
        const player = new Player(name, points)
    
        if (`player${i}` === estWind.id.split('-')[0]) player.isEstWind = true
        if (`player${i}` === mahjong.id.split('-')[0]) player.isMahjong = true

        if (player.isEstWind) {
            player.points *= 2
        }
    
        return player
    })


    players.forEach(player => {
        if (!player.isMahjong) {
            players.forEach(otherPlayer => {
                if (!(otherPlayer === player)) {
                    const pointsToPay = player.isEstWind ? (otherPlayer.points * 2) : (otherPlayer.points)
                    otherPlayer.finalPoints += pointsToPay
                    player.finalPoints -= pointsToPay
                }
            })
        }
    })


    const tbody = document.getElementById('results-body')
    tbody.innerHTML = ""

    const updatetable = () =>  {
        players.forEach(p => {
            const tr = document.createElement('tr')
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.points}</td>
                <td>${p.isEstWind ? 'Yes' : 'No'}</td>
                <td>${p.isMahjong ? 'Yes' : 'No'}</td>
                <td>${p.finalPoints >= 0 ? "+" : ""}${p.finalPoints}</td>
            `
            tbody.appendChild(tr)
        })
    }

    updatetable()

    const scoreboardBody = document.getElementById('scoreboard-body')
    if (scoreboardBody) {
        // Get current round number (number of score columns minus 2: player + total)
        const headerCells = document.querySelectorAll('#scoreboard thead tr th')
        const roundCount = headerCells.length - 2

        // Add a new column for this round
        const newRoundIndex = roundCount
        const th = document.createElement('th')
        th.textContent = `Game ${newRoundIndex}`
        headerCells[headerCells.length - 1].before(th)

        // Update each player's row
        players.forEach((player, idx) => {
            let row = scoreboardBody.querySelector(`tr[data-player-index="${idx}"]`)
            if (!row) {
                row = document.createElement('tr')
                row.setAttribute('data-player-index', idx)
                row.innerHTML = `<td>${player.name}</td>` +
                    Array(newRoundIndex).fill('<td></td>').join('') +
                    `<td>0</td>`
                scoreboardBody.appendChild(row)
            }
            // Always update the player name cell
            let cells = row.querySelectorAll('td')
            if (cells.length > 0) {
                cells[0].textContent = player.name
            }
            // Insert this game's score before the total
            const scoreCell = document.createElement('td')
            scoreCell.textContent = player.finalPoints >= 0 ? `+${player.finalPoints}` : `${player.finalPoints}`
            cells[cells.length - 1].before(scoreCell)
            
            cells[cells.length - 1].textContent = parseInt(cells[cells.length - 1].textContent) + player.finalPoints
        })
    }

    if (scoreboardBody) {
        // Ordina le righe in base al punteggio totale (ultima cella)
        const rows = Array.from(scoreboardBody.querySelectorAll('tr'))
        rows.sort((a, b) => {
            const aTotal = parseInt(a.querySelectorAll('td:last-child')[0].textContent) || 0
            const bTotal = parseInt(b.querySelectorAll('td:last-child')[0].textContent) || 0
            return bTotal - aTotal
        })
        rows.forEach(row => scoreboardBody.appendChild(row))
    }


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
