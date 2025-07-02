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

    const players = [0, 1, 2, 3].map(i => {
        const name = document.getElementById(`player${i}-name`).innerText
        const doubles = parseInt(document.getElementById(`player${i}-doubles`).value)
        if (isNaN(doubles)) {
            alert(`Please enter a valid number for Player ${i} doubles.`)
            return
        }
        const points = parseInt(document.getElementById(`player${i}-points`).value) * Math.pow(2, doubles)
        if (isNaN(points)) {
            alert(`Please enter a valid number for Player ${i} points.`)
            return
        }
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

    setTimeout(updatetable, 500)

}