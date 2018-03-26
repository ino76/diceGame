// **********************************************************************
// 
//      DICE
// 
//      Trida dice - kostka, uchovava informace o dane
//      kostce, jako aktualni hodnotu, zda je aktivovana
//      apod.
// 
// **********************************************************************

class Dice {

    constructor(id) {
        this.id = id
        this._activated = true  // znaci zda je kostka jeste ve hre
        this._selected  = false // znaci zda je kostka oznacena hracem
        this.HTML       = document.getElementById(id)
        this.number     = id
    }

    throw() {
        this.select(false)
        let newNumber = Math.floor((Math.random() * 6) + 1)
        this.number = newNumber
        this.HTML.src = `images/${newNumber}.png`
        return newNumber
    }


    prepare() {
        this._activated = true
        this._selected = false
        this.HTML.src = `images/${this.number}.png`
        if (this.HTML.classList.contains('selected')) {
            this.HTML.classList.remove('selected')
        }
    }


    turnOff() {
        this.select(false)
        this.activate(false)
    }


    select(value) {

        if (this._activated) {
            this._selected = value

            if (this._selected) {
                this.HTML.classList.add('selected')
            } else {
                this.HTML.classList.remove('selected')
            }
        } else {
            this.HTML.classList.remove('selected')
        }
        
    }
    
    selectToggle() {
        this.select(!this._selected)
    }

    activate(value) {
        this._activated = value

        if (this._activated) {
            this.HTML.src = `images/${this.number}.png`
        } else {
            this.HTML.src = `images/${this.number}ghost.png`
            this._selected = false
        }
    } 
}



// **********************************************************************
// 
//      CUP
// 
//      Trida cup - kelimek, se v podstate hromadne stara o stavy
//      kostek, oznacuje, hazi, deaktivuje
// 
// **********************************************************************

class Cup {

    constructor() {
        this.first      = new Dice(1)
        this.seccond    = new Dice(2)
        this.third      = new Dice(3)
        this.fourth     = new Dice(4)
        this.fifth      = new Dice(5)
        this.sixth      = new Dice(6)
        this.selected = []

        this.dice = [this.first, this.seccond, this.third, this.fourth, this.fifth, this.sixth]
    }


    // tak tohle je me prvni pouziti veci ktere se rika 'clojure' ;D
    // jo a zaroven je to tzv. 'pure function', uzasne :)
    iterate(listOfSomething) {
        return function(activeOrSelected, trueOrFalse) {
            let list = []
            for (let something of listOfSomething) {

                switch(activeOrSelected) {
                    case "activated": if(something._activated === trueOrFalse) {
                                        list.push(something)
                    }
                    break

                    case "selected": if(something._selected === trueOrFalse) {
                                        list.push(something)
                    }
                    break
                }
            }
            return list
        }
    }


    // metoda vyuziva 'clojure' kod iterate(something) lze ji nastavit tak ze vrati seznam 
    // kostek ktere chceme napr. getDice('activated', true) vrati seznam kostek
    // ktere jsou aktivovane
    getDice(activeOrSelected, trueOrFalse) {
        return this.iterate(this.dice)(activeOrSelected, trueOrFalse)
    }


    selectDice(dice) {
        dice.selectToggle()
    }


    unselectAll() {
        this.dice.forEach(d => {
            if (d._selected) {
                d.select(false)
            }
        })
    }

    deactivateAll() {
        this.dice.forEach(d => {if(d._activated) {d.activate(false)}})
    }

    activateAll() {
        this.dice.forEach(d => {if(!d._activated) {d.activate(true)}})
    }


    // nastavi vsechny kostky na unselect & activated
    prepareDice() {
        this.dice.forEach(d => {
            d.prepare()
        })
    }


    getActivated() {
        return this.getDice('activated', true)
    }

    getSelected() {
        return this.getDice('selected', true)
    }



    // priradi event listener kazde kostce v prohlizeci a po kliknuti
    // na jeji obrazek zjisti id obrazku a najde dotycny objekt
    // v poli 'dice': dice[e.target.id - 1]
    addDiceListeners() {

        let dicelist = this.dice
        let select = this.selectDice

        this.dice.forEach(d => d.HTML.addEventListener('click', function(e){
            let dice = dicelist[e.target.id - 1]
            select(dice)
        }))
    }
}

// **********************************************************************
// 
//      PLAYER
// 
//      Trida player - hrac, si pamatuje kolik mu jeste zbyva 
//      zivotu a tahu a ma metody aby je ukazal na obrazovce
// 
// **********************************************************************

class Player {
    constructor() {
        this.lives = 3
        this.rounds = 2
        this.HTMLrounds = document.getElementById('rounds')
        this.live1Img = document.getElementById('live1')
        this.live2Img = document.getElementById('live2')
        this.live3Img = document.getElementById('live3')
        this.livesImg = [this.live1Img, this.live2Img, this.live3Img]

        this.showRounds()
    }

    showLives() {
        for (let heart of this.livesImg) {
            if(heart.dataset.alive === "true") {
                heart.src = "images/heart.png"
            } else if(heart.dataset.alive === "false"){
                heart.src = "images/heartDead.png"
            }
        }
    }

    showRounds() {
        this.HTMLrounds.innerText = ""

        for (let r = 0; r < this.rounds; r++) {
            // znak ktery bude reprezentovat jedno kolo v html
            this.HTMLrounds.innerText += "•"
        }
    }

    removeLive() {
        if (this.lives > 0) {
            let deadHeart = document.getElementById('live' + this.lives)
            deadHeart.dataset.alive = "false"
            this.lives--
            this.showLives()
            if (this.lives === 0) {
                return false
            }
        }
        return true
    }

    removeRound() {
        if (this.rounds > 0) {
            this.rounds--
            this.showRounds()
            if (this.rounds === 0) {
                return false
            }
        }
        return true
    }

    addLive() {
        if (this.lives > 0 && this.lives < 3) {
            let deadHeart = document.getElementById('live' + (this.lives + 1))
            deadHeart.dataset.alive = "true"
            this.lives++
            this.showLives()
        } else {
            console.log('jsi mrtvy nebo uz mas plne zivoty')
        }
    }
}





// **********************************************************************
// 
//      GAME
// 
//      trida game - hra, je hlavni trida hry. Ma metody pro vypis
//      na konzoli, metodu throw a hlavne metodu evaluate ktera prijme
//      kostky a vrati vysledny pocet bodu. Take ma metodu throw ktera
//      obsluhuje podrizene metody tridy cup. 
// 
// **********************************************************************

class Game {

    constructor() {
        // objects
        this.cup        = new Cup()
        this.player     = new Player()

        // points
        this.safePoints = 0
        this.potPoints  = 0

        // deltaTime
        this.deltaTime  = 2000

        // round counter
        this.newThrow   = false
        this.betweenRounds = true
        

        // html bindings
        this.HTMLpot    = document.getElementById('pot')
        this.HTMLsafe   = document.getElementById('safe')
        this.log        = document.getElementById('log')
        this.soundCoins = document.getElementById('coins')
        this.soundRoll  = document.getElementById('roll')
        this.soundPot   = document.getElementById('potSound')
        this.soundBad   = document.getElementById('bad')

        // add listener for 'click' on each dice,
        // and listeners for controls
        this.cup.addDiceListeners()
        this.addKeyboadListeners()

        // priprav kostky
        this.cup.prepareDice()

        // nastav pocet bodu
        this.setPotPoints(0)
        this.setSafePoints(0)

        // privitej hrace
        this.showLog("<span class='green'>Welcome stranger :)</span>")

        // zahaj hru
        this.start()
    }


    // metoda vypise zpravu na terminalu hry
    showLog(message) {
        let temp = this.log.innerHTML
        this.log.innerHTML = `<p>${message}</p>`
        this.log.innerHTML += temp
    }


    // hlavni metoda hry - jako parametr dostane pole kostek
    // a z toho vypocita a vrati pocet bodu
    evaluate(givenDice) {
        if (this.betweenRounds) {
            givenDice.forEach(d => d.prepare())
        }

        let one = 0
        let two = 0
        let three = 0
        let four = 0
        let five = 0
        let six = 0
        let points = 0
        let numbers = [one, two, three, four, five, six]
        let toDeactivate = []
        let onesToDeactivate = []
        let fivesToDeactivate = []


        for(let d of givenDice) {
            // vlozi do pole pocet vybranych cisel
            numbers[d.number - 1]++
            if (d.number === 1 && d._activated && d._selected) {
                onesToDeactivate.push(d)
            }
            if (d.number === 5 && d._activated && d._selected) {
                fivesToDeactivate.push(d)
            }
        }

        one = numbers[0]
        five = numbers[4]
        

        if (one > 0 && one < 3) {
            points += 100 * one
            toDeactivate = toDeactivate.concat(onesToDeactivate)
        }

        if (five > 0 && five < 3) {
            points += 10 * five * 5
            toDeactivate = toDeactivate.concat(fivesToDeactivate)
        }


        let multiplier
        numbers.forEach((numberTimes, index) => {
            if (numberTimes === 0) {
                return
            } else if (numberTimes >= 3) {
                givenDice.forEach(dice => {
                    if(dice.number === (index + 1) && dice._selected === true && dice._activated === true) {
                        toDeactivate.push(dice)
                    }
                })

                if (index === 0) {
                    multiplier = 1000
                } else {
                    multiplier = 100
                }

                points += multiplier * (index + 1) * (numberTimes - 2)
            }
        })
        
        toDeactivate.forEach(d => {d.turnOff()})

        this.cup.unselectAll()


        return points
    }



    
    // listener ovladani klavesnici
    addKeyboadListeners() {

        document.addEventListener('keydown', function(e) {
            switch(e.keyCode) {
                // mezernik: znovu hodit neoznacenymi
                case 32: game.pot()
                    break;

                // enter: ulozit a hodit znovu
                case 13: game.safe()
                    break;
            }
        })
    }



    // listener pro ovladani tlacitky
    buttonControl(signal) {

        switch(signal) {
            // mezernik: znovu hodit neoznacenymi
            case "space": this.pot()
                break;

            // enter: ulozit a hodit znovu
            case "enter": this.safe()
                break;
        }
    }



    // metoda hodi nova cisla na vsech aktivnich neoznacenych kostkach
    throw(dice) {
        this.soundRoll.currentTime = 0
        this.soundRoll.play()
        dice.forEach(d => {
            d.throw()
        })

        this.betweenRounds = false
    }


    pot() {
        let points = this.evaluate(this.cup.getSelected())

        if (points) {
            this.soundPot.currentTime = 0
            this.soundPot.play()
            this.addPotPoints(points)
            this.showLog(`You added <span class='white'>${points}</span> points to your pot.`)

            if (this.cup.getActivated().length === 0) {
                this.newThrow = true
            }

            setTimeout(() => {this.start()}, 2500)
        } else {
            this.cup.unselectAll()
        }

        this.betweenRounds = true
    }


    safe() {
        let points = this.evaluate(this.cup.getSelected())

        if (points) {
            points += this.potPoints
            this.soundCoins.currentTime = 0
            this.soundCoins.play()
            this.addSafePoints(points)
            this.setPotPoints(0)
            this.showLog(`You saved <span class='gold'>${points}</span> points to your safe.`)
            this.newThrow = true
            if(!this.player.removeRound()) {
                this.endGame('Posledni vyber, dosly ti kola.')
            } else {
                setTimeout(() => {this.start()}, 2500)
            }
        } else {
            this.cup.unselectAll()
        }

        
    }


    badLuck() {
        let listOfBad = []
        for (let d of this.cup.getActivated()) {
            listOfBad.push(d.number)
        }
        this.showLog(`Bad throw: ${listOfBad.join()}`)
        this.soundBad.play()
        this.cup.deactivateAll()
        if (this.potPoints > 0) {
            this.showLog(`Bad luck. You have lost <span class='red'>${this.potPoints}</span> points from your pot.`)
        }
        this.setPotPoints(0)

        if(!this.player.removeRound()) {
            this.endGame('Skoda, dosly ti kola.')
        }

        if (this.player.removeLive()) {
            setTimeout(() => {
                this.cup.prepareDice()
                this.start()
            }, 2500)
        } else {
            this.endGame('Skoda, dosly ti zivoty.')
        }
        
    }

    setSafePoints(numberOfPoints) {
        this.safePoints = numberOfPoints
        this.HTMLsafe.innerText = this.safePoints
    }

    addSafePoints(numberOfPoints) {
        this.safePoints += numberOfPoints
        this.HTMLsafe.innerText = this.safePoints
    }

    setPotPoints(numberOfPoints) {
        this.potPoints = numberOfPoints
        this.HTMLpot.innerText = this.potPoints
    }

    addPotPoints(numberOfPoints) {
        this.potPoints += numberOfPoints
        this.HTMLpot.innerText = this.potPoints
    }


    start() {
        if (this.newThrow) {
            this.newThrow = false
            this.cup.prepareDice()
        }

        // oznam kolo
        if (this.roundUp) {
            this.roundUp = false
            this.showLog(`--------`)
            this.showLog(`Round <span class='green'>${this.round}</span>`)
            this.showLog(`--------`)
        }
        

        // hod kostkami
        this.throw(this.cup.getActivated())

        // zjisti zda je nenulovy soucet
        if (this.evaluate(this.cup.getActivated()) === 0 ) {
            this.badLuck()
        }
    }

    endGame(message) {
        this.showLog(`<span class="red">${message}</span>`)
        alert(message)
    }
}


const game = new Game()