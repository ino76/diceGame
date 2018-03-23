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
        this._activated = true // znaci zda je kostka jeste ve hre
        this._selected = false // znaci zda je kostka oznacena hracem
        this.HTML = document.getElementById(id)
        this.number = this.throw()
    }

    throw() {
        let newNumber = Math.floor((Math.random() * 6) + 1)
        this.number = newNumber
        this.HTML.src = `images/${newNumber}.png`
        return newNumber
    }

    selectToggle() {

        this._selected = !this._selected

        if (this._selected) {
            this.HTML.classList.add('selected')
        } else {
            this.HTML.classList.remove('selected')
        }
    }

    activateToggle() {

        this._activated = !this._activated

        if (this._activated) {
            this.HTML.src = `images/${this.number}ghost.png`
        } else {
            this.HTML.src = `images/${this.number}.png`
        }
    }

    prepare() {
        this._activated = true
        this._selected = false
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
        this.dice.forEach(d => {if(d._selected) {d.selectToggle()}})
    }


    // nastavi vsechny kostky na unselect & activated
    prepadeDice() {
        this.dice.forEach(d => {
            d.prepare()
        })
    }



    // priradi event listener kazde kostce v prohlizeci a po kliknuti
    // na jeji obrazek zjisti id obrazku a najde dotycny objekt
    // v poli 'dice': dice[e.target.id - 1]
    addDiceListeners() {

        let dicelist = this.dice
        let select = this.selectDice

        this.dice.forEach(d => d.HTML.addEventListener('click', function(e){
            console.log('zavolano')
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
        this.rounds = 10
        this.HTMLrounds = document.getElementById('rounds')
        this.live1Img = document.getElementById('live1')
        this.live2Img = document.getElementById('live2')
        this.live3Img = document.getElementById('live3')
        this.livesImg = [this.live1Img, this.live2Img, this.live3Img]
    }

    showLives() {
        for (let heart of this.livesImg) {
            if(heart.dataset.alive === "true") {
                heart.src = "images/heart.png"
                console.log(heart.id + " je nazivu")
            } else if(heart.dataset.alive === "false"){
                heart.src = "images/heartDead.png"
                console.log(heart.id + " je mrtve")
            }
        }
    }

    showRounds() {
        this.HTMLrounds.innerText = ""

        for (let r = 0; r < this.rounds; r++) {
            this.HTMLrounds.innerText += "|"
        }
    }

    removeLive() {
        if (this.lives > 0) {
            let deadHeart = document.getElementById('live' + this.lives)
            deadHeart.dataset.alive = "false"
            this.lives--
            this.showLives()
        } else {
            console.log('uz nemas zivoty')
        }
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

        // delay
        this.delay      = 2000

        // round counter
        this.round      = 1

        // html bindings
        this.log        = document.getElementById('log')
        this.soundCoins = document.getElementById('coins')
        this.soundRoll  = document.getElementById('roll')
        this.soundTemp  = document.getElementById('temp')
        this.soundBad   = document.getElementById('bad')

        // add listener for 'click' on each dice,
        // and listeners for controls
        this.cup.addDiceListeners()
        this.addKeyboadListeners()

        // zahaj hru
        this.start()
    }
    


    // listener ovladani klavesnici
    addKeyboadListeners() {
        document.addEventListener('keydown', function(e) {

            let selectedPoints = this.evaluate(this.cup.dice)

            switch(e.keyCode) {
                // mezernik: znovu hodit neoznacenymi
                case 32: this.tryToThrowAgain(selectedPoints)
                    break;

                // enter: ulozit a hodit znovu
                case 13: this.savePointsAndThrowAgain(selectedPoints)
                    break;
            }
        })
    }

    // listener pro ovladani tlacitky
    buttonControl(signal) {

        let selectedPoints = this.evaluate(this.cup.dice)

        switch(signal) {
            // mezernik: znovu hodit neoznacenymi
            case "space": this.tryToThrowAgain(selectedPoints)
                break;

            // enter: ulozit a hodit znovu
            case "enter": this.savePointsAndThrowAgain(selectedPoints)
                break;
        
        }
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
                    if(d.number === counter && d._selected === true && d._activated === true) {
                        toDeactivate.push(d)
                    }
                })

                // pokud jsme na zacatku .. tzn. jde o jednicku tak nastavime nasobitel na tisic
                if (counter === 1) {
                    multiplier = 1000
                } else {
                    multiplier = 100
                }

                points += multiplier * counter * (n - 2)
            }
            counter++
        }

        toDeactivate.forEach(d => {
            d.activateToggle()
            this.cup.unselectAll()
        })


        return points
    }

    // metoda hodi nova cisla na vsech aktivnich neoznacenych kostkach
    throw() {
        this.soundRoll.currentTime = 0
        this.soundRoll.play()
    }


    // metoda zaktivuje a odznaci vsechny kostky a hodi nova cisla
    newThrow() {
        this.cup.activateAll()
        this.throw()
    }


    tryToThrowAgain(selectedPoints) {
        if (selectedPoints > 0) {
            this.potPoints += selectedPoints
            document.getElementById('roundPoints').innerText = this.potPoints
            setTimeout(function(){
                game.throw()
            }, this.delay)
            this.soundTemp.currentTime = 0
            this.soundTemp.play()
            this.showLog(`You added <span class="white">${selectedPoints}</span> points in your pot.`)
        } else {
            this.potPoints = 0
            this.showLog(`Bad luck.`)
            this.soundBad.currentTime = 0
            this.soundBad.play()
        }
    }


    savePointsAndThrowAgain(selectedPoints) {
        if (selectedPoints > 0) {
            this.safePoints += this.potPoints + selectedPoints
            document.getElementById('points').innerText = this.safePoints
            setTimeout(function(){
                game.newThrow()
            }, this.delay)
            this.showLog(`You saved <span class="gold">${this.potPoints + selectedPoints}</span> points into your safe.`)
            this.soundCoins.currentTime = 0
            this.soundCoins.play()
            this.potPoints = 0
            document.getElementById('roundPoints').innerText = this.potPoints
            this.cup.deactivateAll()
        } else {
            this.showLog(`Bad luck.`)
            this.soundBad.currentTime = 0
            this.soundBad.play()
        }
    }



    start() {
        // oznam kolo
        this.showLog("Round <span class='gold'>" + this.round + ".</span>")
        // priprav kostky
        this.cup.prepadeDice()

    }
}


const game = new Game()