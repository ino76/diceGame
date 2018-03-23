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
        this.number = id
        this.activateToggle()
    }

    throw() {
        let newNumber = Math.floor((Math.random() * 6) + 1)
        this.number = newNumber
        this.HTML.src = `images/${newNumber}.png`
        return newNumber
    }

    selectToggle() {
        this._selected = !this._selected
        this.select(this._selected)
    }

    activateToggle() {
        this._activated = !this._activated
        this.activate(this._activated)
    }

    prepare() {
        this._activated = true
        this._selected = false
        this.HTML.src = `images/${this.number}.png`
        if (this.HTML.classList.contains('selected')) {
            this.HTML.classList.remove('selected')
        }
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
    
    activate(value) {
        this._activated = value

        if (this._activated) {
            this.HTML.src = `images/${this.number}.png`
        } else {
            this.HTML.src = `images/${this.number}ghost.png`
            this.select(false) 
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
        this.dice.forEach(d => {if(d._selected) {d.selectToggle()}})
    }

    deactivateAll() {
        this.dice.forEach(d => {if(d._activated) {d.activateToggle()}})
    }


    // nastavi vsechny kostky na unselect & activated
    prepadeDice() {
        this.dice.forEach(d => {
            d.prepare()
        })
    }


    getActivated() {
        return this.getDice('activated', true)
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

        // deltaTime
        this.deltaTime      = 2000

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
                        if (d._selected) {
                            toDeactivate.push(d)
                        }
                break;
                case 2: two++
                break;
                case 3: three++
                break;
                case 4: four++
                break;
                case 5: five++
                        if (d._selected) {
                            toDeactivate.push(d)
                        }
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
    throw(dice) {
        this.soundRoll.currentTime = 0
        this.soundRoll.play()
        dice.forEach(d => d.throw())
    }


    pot() {
        console.log('pot!')
    }


    safe() {
        console.log('dice!')
    }


    badLuck() {
        this.round++
        this.soundBad.currentTime = 0
        this.soundBad.play()
        this.cup.deactivateAll()
        setTimeout(function() {
            this.start()
        }, 2500)
    }



    start() {
        while (this.player.lives > 0) {
            // privitani
            if (this.round === 1) {
                this.showLog("<span class='green'>Welcome stranger :)</span>")
            }
            // oznam kolo
            this.showLog("Round <span class='gold'>" + this.round + ".</span>")
            // priprav kostky
            this.cup.prepadeDice()
            // throw
            this.throw(this.cup.getActivated())
            // evaluate them
            if (this.evaluate(this.cup.getActivated()) === 0) {
                this.badLuck()
                continue
            }
        }
    }
}


const game = new Game()