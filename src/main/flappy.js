class Obstacle {
    constructor(reverse = false) {
        this.element = newElement('div', 'obstacle')

        const border = newElement('div', 'border')
        const body = newElement('div', 'body')

        this.element.appendChild(reverse ? body : border)
        this.element.appendChild(reverse ? border : body)

        this.setHeight = (height) => (body.style.height = `${height}px`)
    }
}

class PairOfObstacle {
    constructor(height, opening, x) {
        this.element = newElement('div', 'pair-of-obstacles')

        this.top = new Obstacle(true)
        this.bottom = new Obstacle(false)

        this.element.appendChild(this.top.element)
        this.element.appendChild(this.bottom.element)

        this.heightRaffle = () => {
            const topHeight = Math.random() * (height - opening)
            const bottomHeight = height - opening - topHeight

            this.top.setHeight(topHeight)
            this.bottom.setHeight(bottomHeight)
        }

        this.getX = () => parseInt(this.element.style.left.split('px')[0])
        this.setX = (x) => (this.element.style.left = `${x}px`)

        this.getWidth = () => this.element.clientWidth

        this.heightRaffle()
        this.setX(x)
    }
}

class Obstacles {
    constructor(height, width, opening, space, pointNotify) {
        this.pairs = [
            new PairOfObstacle(height, opening, width),
            new PairOfObstacle(height, opening, width + space),
            new PairOfObstacle(height, opening, width + space * 2),
            new PairOfObstacle(height, opening, width + space * 3),
        ]

        const displacement = 4
        this.animate = () => {
            this.pairs.forEach((pair) => {
                pair.setX(pair.getX() - displacement)

                if (pair.getX() < -pair.getWidth()) {
                    pair.setX(pair.getX() + space * this.pairs.length)
                    pair.heightRaffle()
                }

                const middle = width / 2
                const crossedMiddle = pair.getX() + displacement >= middle && pair.getX() < middle

                crossedMiddle && pointNotify()
            })
        }
    }
}

class Bird {
    constructor(heightGame) {
        let flying = false

        this.element = newElement('img', 'bird')
        this.element.src = 'src/images/bird.png'

        this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
        this.setY = (y) => (this.element.style.bottom = `${y}px`)

        window.onkeydown = (e) => (flying = true)
        window.onkeyup = (e) => (flying = false)

        this.animate = () => {
            const novoY = this.getY() + (flying ? 5 : -5)
            const maximumHeight = heightGame - this.element.clientWidth

            if (novoY <= 0) {
                this.setY(0)
            } else if (novoY >= maximumHeight) {
                this.setY(maximumHeight)
            } else {
                this.setY(novoY)
            }
        }

        this.setY(heightGame / 2)
    }
}

class Progress {
    constructor() {
        this.element = newElement('span', 'progress')
        this.updatePoints = (points) => {
            this.element.innerHTML = points
        }
        this.updatePoints(0)
    }
}

class Finish {
    constructor() {
        this.element = newElement('div', 'finish')
        this.element.innerHTML = 'Try Again =)'

        this.button = newElement('button', 'finish-button')
        this.button.innerHTML = 'Restart'
    }
}

function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function overlap(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const flat = a.right >= b.left && b.right >= a.left
    const upright = a.bottom >= b.top && b.bottom >= a.top

    return flat && upright
}

function crashed(bird, obstacles) {
    let crashed = false
    obstacles.pairs.forEach((pairOfObstacles) => {
        if (!crashed) {
            const topObstacle = pairOfObstacles.top.element
            const bottomObstacle = pairOfObstacles.bottom.element

            crashed = overlap(bird.element, topObstacle) || overlap(bird.element, bottomObstacle)
        }
    })
    return crashed
}

class FlappyBird {
    constructor() {
        let points = 0
        const gameArea = document.querySelector('[wm-flappy]')
        const height = gameArea.clientHeight
        const width = gameArea.clientWidth

        const progress = new Progress()
        const obstacles = new Obstacles(height, width, 200, 400, () => progress.updatePoints(++points))
        const bird = new Bird(height)
        const finish = new Finish()

        gameArea.appendChild(progress.element)
        gameArea.appendChild(bird.element)
        obstacles.pairs.forEach((pair) => gameArea.appendChild(pair.element))

        this.start = () => {
            const time = setInterval(() => {
                obstacles.animate()
                bird.animate()

                if (crashed(bird, obstacles)) {
                    gameArea.appendChild(finish.element)
                    finish.element.appendChild(finish.button)
                    clearInterval(time)

                    finish.button.onclick = () => window.location.reload()
                }
            }, 20)
        }
    }
}

new FlappyBird().start()
