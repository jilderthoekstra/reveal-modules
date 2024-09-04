class NumberRepresentation {
    constructor(display, text) {
        this.display = display;
        this.text = text;
    }

    // Example method
    print() {
        console.log(`${this.display}: ${this.text}`);
    }
}
let isAnimating = false;

// Initialize Reveal.js
Reveal.initialize({
    width: 1600,
    height: 900,
    margin:0,
    controls: true,
    progress: false,
    history: true,
    transition: 'slide',
    slideNumber: false,
    autoAnimate: false,
    touch:false,
    keyboard: {
            27: null, // disable ESC
            32: this.getNextBingoNumber.bind(), // disable space
            35: null,
            36: null,
            33: this.prev.bind(),
            37: this.prev.bind(),
            34: this.getNextBingoNumber.bind(),
            39: this.getNextBingoNumber.bind()
        },        
    fragment: {
        transition: 'none'
    },
});

function prev() {
    if (activeApplet == null || activeApplet.prev()) {
        Reveal.prev();
    }
}

function next() {
    console.log("test");
    if (activeApplet == null || activeApplet.next()) {
        Reveal.next();
    }
}

function updateActiveApplet(slideIndex) {
    switch (slideIndex) {
        default: activeApplet = null; break;
    }
}

var isPageUpPressed = false;
var isPageDownPressed = false;
document.addEventListener('keydown', function(event) {
    if (event.key === 'PageUp' || event.key === 'PageDown') {
        event.stopPropagation();
        event.preventDefault();

        if (event.key === 'PageUp' && !isPageUpPressed) {
            prev();
        } else if (event.key === 'PageDown' && !isPageDownPressed) {
            next();
        }
    }
}, true);

document.addEventListener('keyup', function(event) {
    if (event.key === 'PageUp' || event.key === 'PageDown') {
        event.stopPropagation();
        event.preventDefault();
        
        if (event.key === 'PageUp') {
            isPageUpPressed = false;
        } else if (event.key === 'PageDown') {
            isPageDownPressed = false;
        }
    }
}, true);

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.navigate-left').addEventListener('click', function(event) {
        event.preventDefault();
        prev();
    });      
    document.querySelector('.navigate-right').addEventListener('click', function(event) {
        event.preventDefault();
        next();
    });             
});

let applets = {};
let activeApplet = null;
let numbers = {};

window.addEventListener('load', () => {
    updateActiveApplet(Reveal.getIndices().h);
    initBingo();

    Reveal.on('slidechanged', event => {
        updateActiveApplet(event.indexh);
    });

    document.getElementById('bingo-next').addEventListener('click', getNextBingoNumber);
    showCrossesInFirstRow();
});

function initBingo() {
    fetch('./assets/bingo-list.json')
    .then(response => response.json())
    .then(data => {
        numbers = data.numbers.map(num => new NumberRepresentation(num.display, num.text));
    })
    .catch(error => console.error('Error loading JSON:', error));

}

function pickRandomBingoIndex() {
    return Math.floor(Math.random() * numbers.length);
}

async function getNextBingoNumber(event) {
    event.preventDefault();
    if (isAnimating === true) {
        return false;
    }
    if (numbers.length === 0) {
        document.getElementById('bingo-display').innerHTML = "Geen getallen meer."
        return false;
    }
    console.log("get next number");
    isAnimating = true;


    gsap.set("#bingo-next", { pointerEvents: "none"});
    gsap.to("#bingo-next", {
        opacity: 0.2,
        duration: 0.5,
        ease: "power1.out"
    });

    // fadeout bingo ball and reset position.
    await gsap.to("#bingo-ball", {
        opacity: 0,
        duration: 0.5,
        ease: "power1.out",
        onComplete: function() {
            gsap.set("#bingo-ball", { y: 0 });
        }
    });

    const displayElement = document.getElementById('bingo-display');
    let interval = 50;  // Initial speed
    const steps = 30;    // Number of random selections before stopping
    
    for (let i = 0; i < steps; i++) {
        const randomIndex = pickRandomBingoIndex();
        displayElement.innerHTML = numbers[randomIndex].text;
        
        await new Promise(resolve => setTimeout(resolve, interval));
        //interval += 15;  // Gradually slow down
    }

    // Pick the final random element (optional)
    const randomIndex = pickRandomBingoIndex();
    displayElement.innerHTML = numbers[randomIndex].text;
    const bingoBallTextElement = document.getElementById('bingo-ball-text');
    bingoBallTextElement.innerText = numbers[randomIndex].display;
    
    numbers.splice(randomIndex, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const randomX = Math.random() * 1600 - 800;
    gsap.set("#bingo-ball", { x: randomX });

    gsap.to("#bingo-ball", {
        y: "700px",
        duration: 1,
        ease: "bounce.out"
    });

    gsap.to("#bingo-ball", {
        x: "0px",
        opacity: 1,
        duration: 1,
        ease: "power1.out",
        onComplete: function () {
            gsap.to("#bingo-next", {
                opacity: 1,
                duration: 0.5,
                ease: "power1.out",
                onComplete: function() {
                    gsap.set("#bingo-next", { pointerEvents: ""});
                    isAnimating = false;
                }
            });
        }
    })
}

async function showCrossesInFirstRow() {
    const rowCells = document.querySelectorAll('.bingo-card .bingo-cell:nth-child(-n+5) div');
    console.log(rowCells);
    gsap.to(rowCells, {
        opacity: 1, // Fade them in
        duration: 0.5, // Duration of the fade-in
        stagger: 1.0,
        ease: "power1.out", // Easing function
        force3D: true
    });
}

