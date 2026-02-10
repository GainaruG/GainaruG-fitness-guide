document.addEventListener("DOMContentLoaded", function () {
  var dropdowns = document.querySelectorAll(".has-dropdown");

  document.addEventListener("click", function (event) {
    var isClickInsideDropdown = false;

    dropdowns.forEach(function (dropdown) {
      if (dropdown.contains(event.target) || event.target.closest('.has-dropdown') === dropdown) {
        isClickInsideDropdown = true;
        toggleSubMenu(dropdown);
      }
    });

    if (!isClickInsideDropdown && !event.target.classList.contains('has-dropdown')) {
      dropdowns.forEach(function (dropdown) {
        hideSubMenu(dropdown);
      });
    }
  });

  function toggleSubMenu(dropdown) {
    var submenu = dropdown.querySelector(".submenu");
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";

    dropdowns.forEach(function (otherDropdown) {
      if (otherDropdown !== dropdown) {
        hideSubMenu(otherDropdown);
      }
    });
  }

  function hideSubMenu(dropdown) {
    var submenu = dropdown.querySelector(".submenu");
    if (submenu) {
      submenu.style.display = "none";
    }
  }
});


  document.addEventListener("DOMContentLoaded", function() {
    // Obține înălțimea navbar-ului
    var navbarHeight = document.querySelector('.top-nav').offsetHeight;

    // Obține elementul imaginii de fundal
    var backgroundElement = document.querySelector('.pagina1');

    // Setează margin-top pentru a muta imaginea sub navbar
    backgroundElement.style.marginTop = navbarHeight + 'px';
  });

  const cardsContainer = document.querySelector(".card-carousel");
  const cardsController = document.querySelector(".card-carousel + .card-controller")
  
  class DraggingEvent {
    constructor(target = undefined) {
      this.target = target;
    }
    
    event(callback) {
      let handler;
      
      this.target.addEventListener("mousedown", e => {
        e.preventDefault()
        
        handler = callback(e)
        
        window.addEventListener("mousemove", handler)
        
        document.addEventListener("mouseleave", clearDraggingEvent)
        
        window.addEventListener("mouseup", clearDraggingEvent)
        
        function clearDraggingEvent() {
          window.removeEventListener("mousemove", handler)
          window.removeEventListener("mouseup", clearDraggingEvent)
        
          document.removeEventListener("mouseleave", clearDraggingEvent)
          
          handler(null)
        }
      })
      
      this.target.addEventListener("touchstart", e => {
        handler = callback(e)
        
        window.addEventListener("touchmove", handler)
        
        window.addEventListener("touchend", clearDraggingEvent)
        
        document.body.addEventListener("mouseleave", clearDraggingEvent)
        
        function clearDraggingEvent() {
          window.removeEventListener("touchmove", handler)
          window.removeEventListener("touchend", clearDraggingEvent)
          
          handler(null)
        }
      })
    }
    
    // Get the distance that the user has dragged
    getDistance(callback) {
      function distanceInit(e1) {
        let startingX, startingY;
        
        if ("touches" in e1) {
          startingX = e1.touches[0].clientX
          startingY = e1.touches[0].clientY
        } else {
          startingX = e1.clientX
          startingY = e1.clientY
        }
        
  
        return function(e2) {
          if (e2 === null) {
            return callback(null)
          } else {
            
            if ("touches" in e2) {
              return callback({
                x: e2.touches[0].clientX - startingX,
                y: e2.touches[0].clientY - startingY
              })
            } else {
              return callback({
                x: e2.clientX - startingX,
                y: e2.clientY - startingY
              })
            }
          }
        }
      }
      
      this.event(distanceInit)
    }
  }
  
  
  class CardCarousel extends DraggingEvent {
    constructor(container, controller = undefined) {
      super(container)
      
      // DOM elements
      this.container = container
      this.controllerElement = controller
      this.cards = container.querySelectorAll(".card")
      
      // Carousel data
      this.centerIndex = (this.cards.length - 1) / 2;
      this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100
      this.xScale = {};
      
      // Resizing
      window.addEventListener("resize", this.updateCardWidth.bind(this))
      
      if (this.controllerElement) {
        this.controllerElement.addEventListener("keydown", this.controller.bind(this))      
      }
  
      
      // Initializers
      this.build()
      
      // Bind dragging event
      super.getDistance(this.moveCards.bind(this))
    }
    
    updateCardWidth() {
      this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100
      
      this.build()
    }
    
    build(fix = 0) {
      for (let i = 0; i < this.cards.length; i++) {
        const x = i - this.centerIndex;
        const scale = this.calcScale(x)
        const scale2 = this.calcScale2(x)
        const zIndex = -(Math.abs(i - this.centerIndex))
        
        const leftPos = this.calcPos(x, scale2)
       
        
        this.xScale[x] = this.cards[i]
        
        this.updateCards(this.cards[i], {
          x: x,
          scale: scale,
          leftPos: leftPos,
          zIndex: zIndex
        })
      }
    }
    
    
    controller(e) {
      const temp = {...this.xScale};
        
        if (e.keyCode === 39) {
          // Left arrow
          for (let x in this.xScale) {
            const newX = (parseInt(x) - 1 < -this.centerIndex) ? this.centerIndex : parseInt(x) - 1;
  
            temp[newX] = this.xScale[x]
          }
        }
        
        if (e.keyCode == 37) {
          // Right arrow
          for (let x in this.xScale) {
            const newX = (parseInt(x) + 1 > this.centerIndex) ? -this.centerIndex : parseInt(x) + 1;
  
            temp[newX] = this.xScale[x]
          }
        }
        
        this.xScale = temp;
        
        for (let x in temp) {
          const scale = this.calcScale(x),
                scale2 = this.calcScale2(x),
                leftPos = this.calcPos(x, scale2),
                zIndex = -Math.abs(x)
  
          this.updateCards(this.xScale[x], {
            x: x,
            scale: scale,
            leftPos: leftPos,
            zIndex: zIndex
          })
        }
    }
    
    calcPos(x, scale) {
      let formula;
      
      if (x < 0) {
        formula = (scale * 100 - this.cardWidth) / 2
        
        return formula
  
      } else if (x > 0) {
        formula = 100 - (scale * 100 + this.cardWidth) / 2
        
        return formula
      } else {
        formula = 100 - (scale * 100 + this.cardWidth) / 2
        
        return formula
      }
    }
    
    updateCards(card, data) {
      if (data.x || data.x == 0) {
        card.setAttribute("data-x", data.x)
      }
      
      if (data.scale || data.scale == 0) {
        card.style.transform = `scale(${data.scale})`
  
        if (data.scale == 0) {
          card.style.opacity = data.scale
        } else {
          card.style.opacity = 1;
        }
      }
     
      if (data.leftPos) {
        card.style.left = `${data.leftPos}%`        
      }
      
      if (data.zIndex || data.zIndex == 0) {
        if (data.zIndex == 0) {
          card.classList.add("highlight")
        } else {
          card.classList.remove("highlight")
        }
        
        card.style.zIndex = data.zIndex  
      }
    }
    
    calcScale2(x) {
      let formula;
     
      if (x <= 0) {
        formula = 1 - -1 / 5 * x
        
        return formula
      } else if (x > 0) {
        formula = 1 - 1 / 5 * x
        
        return formula
      }
    }
    
    calcScale(x) {
      const formula = 1 - 1 / 5 * Math.pow(x, 2)
      
      if (formula <= 0) {
        return 0 
      } else {
        return formula      
      }
    }
    
    checkOrdering(card, x, xDist) {    
      const original = parseInt(card.dataset.x)
      const rounded = Math.round(xDist)
      let newX = x
      
      if (x !== x + rounded) {
        if (x + rounded > original) {
          if (x + rounded > this.centerIndex) {
            
            newX = ((x + rounded - 1) - this.centerIndex) - rounded + -this.centerIndex
          }
        } else if (x + rounded < original) {
          if (x + rounded < -this.centerIndex) {
            
            newX = ((x + rounded + 1) + this.centerIndex) - rounded + this.centerIndex
          }
        }
        
        this.xScale[newX + rounded] = card;
      }
      
      const temp = -Math.abs(newX + rounded)
      
      this.updateCards(card, {zIndex: temp})
  
      return newX;
    }
    
    moveCards(data) {
      let xDist;
      
      if (data != null) {
        this.container.classList.remove("smooth-return")
        xDist = data.x / 250;
      } else {
  
        
        this.container.classList.add("smooth-return")
        xDist = 0;
  
        for (let x in this.xScale) {
          this.updateCards(this.xScale[x], {
            x: x,
            zIndex: Math.abs(Math.abs(x) - this.centerIndex)
          })
        }
      }
  
      for (let i = 0; i < this.cards.length; i++) {
        const x = this.checkOrdering(this.cards[i], parseInt(this.cards[i].dataset.x), xDist),
              scale = this.calcScale(x + xDist),
              scale2 = this.calcScale2(x + xDist),
              leftPos = this.calcPos(x + xDist, scale2)
        
        
        this.updateCards(this.cards[i], {
          scale: scale,
          leftPos: leftPos
        })
      }
    }
  }
  
  const carousel = new CardCarousel(cardsContainer)
        
     
  
  
  document.addEventListener('DOMContentLoaded', function () {
    var startY;
    var touchElement;
  
    document.addEventListener('touchstart', function (e) {
      var touchobj = e.changedTouches[0];
      startY = touchobj.clientY;
      touchElement = e.target; // Retineți elementul care a fost atins
    }, false);
  
    document.addEventListener('touchend', function (e) {
      var touchobj = e.changedTouches[0];
      var distY = touchobj.clientY - startY;
  
      if (distY < -50 && !isExcludedElement(touchElement)) {

        window.scrollBy(0, -window.innerHeight); 
      }
    }, false);
})

function renderIndexPage() {
    const root = document.getElementById('root');
    if (!root) return; 
    const content = {
        header: {
            title: "Welcome to MuscleForge",
            p1: "În sala de sport, efortul devine forță, iar durerea se transformă în putere.",
            p2: "Site-ul oferă informații și resurse pentru pasionații de fitness."
        },
        servicii: [
            { clasa: "servicii-col", titlu: "Alimentație", text: "Descoperă sfaturi nutriționale și planuri de masă echilibrate pentru performanță maximă." },
            { clasa: "servicii-col", titlu: "Câștigă masă musculară", text: "Consumă calorii sănătoase, proteine și carbohidrați, menține echilibrul între antrenament și odihnă." },
            { clasa: "servicii-col", titlu: "Arderea caloriilor", text: "Rutine de exerciții concepute pentru a maximiza arderea caloriilor." },
            { clasa: "servicii-col1", titlu: "Exerciții", text: "Concentrează-te pe exerciții de rezistență precum ridicările și genuflexiunile." }
        ]
    };

    root.innerHTML = `
        <section class="top-nav">
            <div>
                <a href="index.html" class="logo"><img src="img/Inima.png" alt="Logo"></a>
            </div>
            <input id="menu-toggle" type="checkbox" />
            <label class='menu-button-container' for="menu-toggle"><div class='menu-button'></div></label>
            <ul class="menu">
                <li><a href="Exercitii.html"><i class="fas fa-dumbbell"></i> Exercitii</a></li>
                <li><a href="Alimentatie1.html"><i class="fas fa-utensils"></i> Alimentație</a></li>
                <li class="has-dropdown">
                    <a href="#"><i class="fas fa-folder-open"></i> Programă</a>
                    <ul class="submenu">
                        <li><a href="incepator.html">Începător</a></li>
                        <li><a href="Amator.html">Amator</a></li>
                    </ul>
                </li>
                <li><a href="desprenoi.html"><i class="fas fa-info-circle"></i> Despre noi</a></li>
                <li><a href="contact.html"><i class="fas fa-address-book"></i> Contacte</a></li>
                <li><button id="theme-toggle" class="theme-btn"><i class="fas fa-moon"></i></button></li>
            </ul>
        </section>

        <header class="header">
            <h1>${content.header.title}</h1>
            <p>${content.header.p1}</p>
            <p>${content.header.p2}</p>
        </header>

        <div class="row">
            ${content.servicii.map(s => `
                <div class="${s.clasa}">
                    <h3>${s.titlu}</h3>
                    <p>${s.text}</p>
                </div>
            `).join('')}
        </div>
    `;
}


renderIndexPage();
