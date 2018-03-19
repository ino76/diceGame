// Script

class Dice {

    constructor(id) {
        this.id = id
        this._activated = true
        this._selected = false
        this.HTML = document.getElementById(id)
        this.number = this.throw()
    }

    throw() {
        let newNumber = Math.floor((Math.random() * 6) + 1)
        this.number = newNumber
        this.HTML.src = `images/${newNumber}.png`
        return newNumber
    }

    selected(value) {
        this._selected = value
        if (value === true) {
            this.HTML.classList.add('selected')
        } else {
            this.HTML.classList.remove('selected')
        }
    }

    activated(value) {
        this._activated = value
        if (value === false) {
            this.HTML.src = `images/${this.number}ghost.png`
        } else {
            this.HTML.src = `images/${this.number}.png`
        }
    }

    switchSelect() {
        this.selected(!this._selected)
    }
}


class Cup {

    constructor(dice) {
        this.dice = dice
        this.selected = []
    }


    toggleDice(d) {
        if(this.dice[d]._selected == false) {
            this.selectDice(d)
            this.selected
        } else {
            this.unselectDice(d)
            this.selected
        }
    }

    selectDice(d) {
        dice[d].selected(true)
        this.selected.push(dice[d])
    }

    unselectDice(d) {
        dice[d].selected(false)
        this.selected = []
        let selectedDices = this.getSelected()
        for (let s of selectedDices) {
            if (s._selected == true) {
                this.selected.push(s)
            }
        }
    }


    getDiceNumber(x) {
        return this.dice[x].number
    }

    getAllNumbers() {
        let numbers = []
        for(let d of this.dice) {
            numbers.push(d.number)
        }

        return numbers
    }

    getSelected() {
        let selected = []
        for(let d of this.dice) {
            if(d._selected == true) {
                selected.push(d)
            }
        }

        return selected
    }


    getUnselected() {
        let unselected = []
        for(let d of this.dice) {
            if(d._selected == false) {
                unselected.push(d)
            }
        }

        return unselected
    }

    unselectAll() {
        for(let d of this.dice) {
            if(d._selected == true) {
                d.selected(false)
            }
        }

        this.selected = []
    }

    // metoda nejen aktivuje ale take odznaci vsechny kostky
    activateAll() {
        this.unselectAll()
        for(let d of this.dice) {
            if(d._activated == false) {
                d.activated(true)
            }
        }
    }

    deactivateSelected() {
        let selected = this.getSelected()
        for (let s of selected) {
            s.activated(false)
            s.selected(false)
        }
    }

    isAllDeactivated() {
        let count = 0
        this.dice.forEach(d => {if(d._activated == false) {count++}} )
        if(count == 6) {
            return true
        }
        return false
    }

    throwAll() {
        for(let d of this.dice) {
            d.throw()
        }
    }

    throwUnselected() {
        for(let d of this.dice) {
            if (d._selected == false && d._activated == true) {
                d.throw()
            }
        }
        this.unselectAll()
    }
    
}


class Game {

    constructor(cup) {
        this.cup = cup
        this.points = 0
        this.tempPoints = 0
        this.log = document.getElementById('log')
    }

    showLog(message) {
        this.log.innerHTML += `<p>${message}</p>`
    }

    evaluate(givenDice) {
        let one = 0
        let two = 0
        let three = 0
        let four = 0
        let five = 0
        let six = 0
        let points = 0

        let toDeactivate = []
        let maybeDeactivate = []


        for(let d of givenDice) {
            switch(d.number) {
                case 1: one++
                        toDeactivate.push(d)
                break;
                case 2: two++
                break;
                case 3: three++
                break;
                case 4: four++
                break;
                case 5: five++
                        toDeactivate.push(d)
                break;
                case 6: six++
                break;
            }            
        }

        let numbers = [one, two, three, four, five, six]

        if (one > 0 && one < 3) {
            points += 100 * one
        }

        if (five > 0 && five < 3) {
            points += 10 * five * 5
        }

        let counter = 1 // rovna se hodnote kterou zkoumame .. trojky, jednicky apod.
        let multiplier
        for (let n of numbers) {
            if (n >= 3) {
                givenDice.forEach(d => {
                    if(d.number == counter && d._selected == true && d._activated == true) {
                        toDeactivate.push(d)
                    }
                })

                // pokud jsme na zacatku .. tzn. jde o jednicku tak nastavime nasobitel na tisic
                if (counter == 1) {
                    multiplier = 1000
                } else {
                    multiplier = 100
                }

                points += multiplier * counter * (n - 2)
            }
            counter++
        }

        toDeactivate.forEach(d => {
            d.activated(false)
            this.cup.unselectAll()
        })

        // zkouska zda jsou jiz deaktivovany vsechny kostky
        // pokud ano, znovu je aktivuj
        if (this.cup.isAllDeactivated()) {
            this.cup.activateAll()
        }

        return points
    }

    // metoda hodi nova cisla na vsech aktivnich neoznacenych kostkach
    throw() {
        this.cup.throwUnselected()
    }


    // metoda zaktivuje a odznaci vsechny kostky a hodi nova cisla
    newThrow() {
        this.cup.activateAll()
        this.throw()
    }

    
    tryToThrowAgain(selectedPoints) {
        if (selectedPoints > 0) {
            this.tempPoints += selectedPoints
            game.throw()
            this.showLog(`You throwed <span class="white">${selectedPoints}</span> points. You have <span class="gold">${this.tempPoints}</span> points in your temporary storage.`)
        } else {
            this.tempPoints = 0
            this.showLog(`Bad luck.`)
        }
    }


    savePointsAndThrowAgain(selectedPoints) {
        if (selectedPoints > 0) {
            this.points += this.tempPoints + selectedPoints
            document.getElementById('points').innerText = this.points
            game.newThrow()
            this.showLog(`You saved <span class="gold">${this.tempPoints + selectedPoints}</span> new points.`)
            this.tempPoints = 0
        } else {
            this.showLog(`Bad luck.`)
        }  
    }
}


// END OF CLASSES

const first     = new Dice(1)
const seccond   = new Dice(2)
const third     = new Dice(3)
const fourth    = new Dice(4)
const fifth     = new Dice(5)
const sixth     = new Dice(6)
const dice      = [first, seccond, third, fourth, fifth, sixth]
const cup       = new Cup(dice)
const game      = new Game(cup)



dice.forEach(d => d.HTML.addEventListener('click', function(e){
    // priradi event listener kazde kostce v prohlizeci a po kliknuti
    // na jeji obrazek zjisti id obrazku a najde dotycny objekt
    // v poli 'dice': dice[e.target.id - 1]
    cup.toggleDice(e.target.id - 1)
}))


// listener ovladani klavesnici
document.addEventListener('keydown', function(e) {

    let selectedPoints = game.evaluate(game.cup.selected)

    switch(e.keyCode) {
        // mezernik: znovu hodit neoznacenymi
        case 32: game.tryToThrowAgain(selectedPoints)
        break;

        // enter: ulozit a hodit znovu TODO dodelat fazi 'ulozit'
        case 13: game.savePointsAndThrowAgain(selectedPoints)
        break;
    }
})


// game.evaluate(cup.dice)