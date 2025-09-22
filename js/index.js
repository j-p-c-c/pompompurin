const canvas = document.querySelector('#canvas')
const context = canvas.getContext('2d')

const dialogContainer = document.querySelector('#dialog')
const dialog = document.querySelector('#dialogText')

const mainContainer = document.querySelector('#main_container')
const instructions = document.querySelector('#instructions')
// setWriteProps({ text: `Pompompuri en nombre de alguna persona dice:`, v: 20, variable: 100 })
// setWriteProps({ 
//    text: `Estoy muy agradecido contigo...             
//    En mi vida no hay montones de personas a mi alrededor. quiero demostrarte un poco de la 
//    mucha alegría que me das. A mi manera...`, 
//    v: 20, 
//    variable: 100 
// })

// ANIMACIONES ---------------------------------   

class AnimationFrame {
   constructor(x = 0, y = 0, duration = 1) {
      this.x = x
      this.y = y
      this.duration = duration
   }
}

class IndividualAnimation {
   constructor(
      numberFrames = 0,
      frame = { w: 0, h: 0, y: 0 },
      durationPerFrame = .016,
      specials = [{ ind: 0, duration: 1 }],
      loop = { ini: 0, fin: 0, repeat: 1, cut: false } // o inicializar en false para no tener un loop.
   ) {
      this.frames = [] // FrameAnimation[]
      this.frame = frame

      for (let i = 0; i < numberFrames; i++) {
         const x = i * frame.w
         const { y } = frame

         const findEspecial = specials.find(e => e.ind === i)

         if (findEspecial) {
            this.frames.push(new AnimationFrame(x, y, findEspecial.duration))
            continue
         }

         this.frames.push(new AnimationFrame(x, y, durationPerFrame))
      }

      // animation properties
      this.stoped = false
      this.animation = {
         focusedFrame: 0, // index from animation frame
         ut: 0
      }
      this.loop = typeof loop === 'boolean' ? loop : {
         ...loop,
         repeated: 0
      }

      this.initial = true
      this.finished = false
   }
   reset() {
      this.finished = false
      this.initial = true
      this.animation.focusedFrame = 0
   }
   reproduce(ms = 0) {
      const params = this.frames[this.animation.focusedFrame]

      if (!params) {
         console.log('frameParams indefinido.')
         return
      }

      if (this.initial) {
         this.animation.ut = ms
         this.initial = false
      }

      if (ms - this.animation.ut > params.duration) {
         this.animation.ut = ms

         if (this.stoped) {
            return
         }

         const anim = this.animation
         const l = this.loop

         anim.focusedFrame += 1 // up counter


         const updateLoop = () => {
            l.repeated += 1
            this.finished = true
            if (typeof repeat === 'number' && l.repeated > l.repeat) {
               return 'nomove'
            }
            anim.focusedFrame = l.ini
         }

         // loop
         if (typeof l === 'object' && anim.focusedFrame > l.fin) {
            const result = updateLoop()
            this.finished = true
            switch (result) {
               case 'nomove':
                  anim.focusedFrame = l.fin
                  break
               default: break
            }
            if (l.cut) {
               return
            }
         }

         // final of carousel
         if (this.animation.focusedFrame >= this.frames.length) {
            this.finished = true
            if (typeof l === 'boolean' && l) { // loop = true
               anim.focusedFrame = 0
               return
            } else if (typeof l === 'object') {
               const result = updateLoop()

               switch (result) {
                  case 'nomove':
                     anim.focusedFrame = this.frames.length - 1
                     break

                  default: break
               }
               anim.focusedFrame = l.ini
            }

            anim.focusedFrame = this.frames.length - 1
         }
      }
   }
   start() {
      this.stoped = false
   }
   stop() {
      this.stoped = true
   }
   draw(image, x, y, w, h) {
      // console.log(this.frames)
      const focused = this.frames[this.animation.focusedFrame]
      context.drawImage(image, focused.x, focused.y, this.frame.w, this.frame.h, x, y, w, h)
   }
}

class Animations {
   constructor(
      imagePath = '',
   ) {
      this.selectedAnimation = undefined
      this.selectedAnimationName = undefined

      this.animations = []

      this.image = new Image() // base image with animations
      this.chargedImage = false

      this.image.src = imagePath
      this.image.onload = () => { this.chargedImage = true }

      this.nextAnimations = []

      this.finish = false
   }
   add(
      animationName = '',
      nF = 0,
      frame = { w: 0, h: 0, y: 0 },
      durationPerFrame = 0,
      specials = [{ ind: 0, duration: 1 }],
      loop = { ini: 0, fin: 0, repeat: 1, cut: false } /* inicializar en false para no tener un loop. 
      true para un loop de inicio a fin con un numero de repeticiones indefinido */
   ) {
      this.animations.push({
         name: animationName,
         animation: new IndividualAnimation(nF, frame, durationPerFrame, specials, loop)
      })
   }
   select(name = '', reset = false) {
      this.selectedAnimationName = name
      this.selectedAnimation = this.animations.find(anim => anim.name == name)
      if (reset) {
         this.selectedAnimation?.reset()
      }
   }
   next(name = '', delay = 0) {
      this.nextAnimations.push({ name, delay, ut: undefined })
   }
   draw(x, y, w, h) {
      if (!this.chargedImage || !this.selectedAnimation) return
      const selected = this.selectedAnimation

      selected.animation.draw(this.image, x, y, w, h)
   }
   stop() {
      const selected = this.selectedAnimation
      if (!selected) return

      selected.animation.stop()
   }
   start() {
      const selected = this.selectedAnimation
      if (!selected) return

      selected.animation.start()
   }
   reproduce(ms = 0) {
      const selected = this.selectedAnimation
      if (!selected) return

      selected.animation.reproduce(ms)

      if (selected.animation.finished) {
         if (this.nextAnimations.length) {
            const nA = this.nextAnimations[0]
            if (nA.ut === undefined) nA.ut = ms

            if (ms - nA.ut > nA.delay) {
               this.finish = true
               this.select(this.nextAnimations[0].name)
               this.nextAnimations = this.nextAnimations.slice(1) ?? []
            }
         }
         this.finish = true
      } else {
         this.finish = false
      }
   }
}

// const animations = new Animations('./images/animations_3.png')
const animations = new Animations('./images/animations_3.png')
// saludo
animations.add('saludo', 2, { w: 32, h: 32, y: 0 }, 70, [], true)
// animations.select('saludo')
// regalo
animations.add('espulcar', 3, { w: 32, h: 32, y: 32 }, 125, [{ ind: 0, duration: 1 * 1000 }], { ini: 1, fin: 2, cut: true, repeat: true })
// animations.select('espulcar')

animations.add('nervioso', 5, { w: 32, h: 32, y: 64 }, 150, [{ ind: 2, duration: 1 * 1000 }, { ind: 3, duration: 50 }, { ind: 4, duration: 50 }], { ini: 2, fin: 4, repeat: true, cut: false })
// animations.select('nervioso')

animations.add('dar_flor', 7, { w: 32, h: 32, y: 96 }, 200, [
   { ind: 0, duration: 2 * 1000 },
   { ind: 1, duration: 125 },
   // { ind: 2, duration: 125 },
   { ind: 3, duration: 1 * 1000 }
], false)


animations.add('aparecer', 4, { w: 32, h: 32, y: 128 }, 150, [{ ind: 0, duration: 1 * 1000 }], false)
animations.add('estatico', 2, { w: 32, h: 32, y: 160 }, 300, [], { ini: 0, fin: 1, cut: false, repeat: true })
animations.add('final', 2, { w: 32, h: 32, y: 192 }, 2000, [{ ind: 1, duration: 50 }], true)
// animations.select('spawn_pompompurin')


// SEÑALAMIENTOS -------------------------------------

class TextPointer {
   constructor(text = '', v = 'default') {
      this.text = text
      this.v = v
   }
}
class Pointer {
   constructor(text = [new TextPointer()], x, y, w, h, reasons = true, random = false) {
      this.text = text
      this.counter = 0

      this.previusInd = -1
      this.random = random

      const cw = canvas.width
      const ch = canvas.height

      if (reasons) {
         this.x1 = x * cw
         this.x2 = this.x1 + w * cw
         this.y1 = y * ch
         this.y2 = this.y1 + h * ch
      } else {
         this.x1 = x
         this.x2 = x + w
         this.y1 = y
         this.y2 = y + h
      }
   }
   useText() {
      if (Array.isArray(this.text)) {
         if (this.random) {
            const selectInd = () => {
               const ind = Math.round(Math.random() * (this.text.length - 1))

               if (ind === this.previusInd) {
                  return selectInd()
               }

               this.previusInd = ind
               return ind
            }

            return this.text[selectInd()]
         }

         if (this.counter >= this.text.length) {
            this.counter = 0
         }
         return this.text[this.counter++]
      }

      return this.text
   }
}

const pointers = []
// const pointers = [
//    new Pointer([
//       new TextPointer('Tocaste la barriguita de pompompurin.', 25),
//       new TextPointer('Le gustan las caricias en la barriguita...'),
//       new TextPointer('El esta feliz...'),
//       new TextPointer(':3', 100),
//       new TextPointer('Ok...', 100),
//       new TextPointer('Pompompurin empieza sentirse un poco acosado...', 25),
//       new TextPointer('Pompompurin se ha empezado a enojar...', 25),
//       new TextPointer('Pompompurin te ha demandado por acoso...                       Nos vemos en la corte...', 50),
//       new TextPointer('Era una broma, en realidad le encantaron las caricias :3', 10)
//    ], .38, .5, .25, .18, true)
// ]

const signpost = (x, y) => {
   const pointer = pointers.find(point => {
      if (point.x1 <= x && point.x2 >= x && point.y1 <= y && point.y2 >= y) {
         return point
      }
   })

   if (!pointer) return

   const text = pointer.useText()
   dialogWriter.set({ text: text.text, ...(text.v === 'default' ? {} : { v: text.v }) })
}

canvas.addEventListener('touchstart', evt => {
   const touch = evt.touches[0]
   const
      clientX = touch.clientX,
      clientY = touch.clientY

   const rect = canvas.getBoundingClientRect()

   const
      rX = (clientX - rect.left) / rect.width * canvas.width,
      rY = (clientY - rect.top) / rect.height * canvas.height

   // console.log('x:', rX, 'y:', rY)

   // console.log(dialogWriter.writerBusy)
   if (!dialogWriter.writerBusy) {
      signpost(rX, rY)
   }
})


class Writer {
   constructor(text = '', element = undefined, container = undefined) {
      this.new = true
      this.progressiveText = ''
      this.text = text
      this.vDefault = 30
      this.v = this.vDefault
      this.ut = 0
      this.variable = undefined
      this.writerBusy = false
      this.callback = undefined

      this.element = element
      this.container = container

      this.timeout = undefined

      this.delay = false // delay to disappear
   }
   set({ text = this.text, v = this.v, variable = this.variable }, callback = undefined, delay = false) {
      // set new text
      if (text) {
         this.text = text
         this.new = true
      }
      // set velociy
      if (v !== undefined && v) {
         this.v = v
      }

      if (v === 'default') {
         this.v = this.vDefault
      }

      if (variable) {
         this.variable = variable
      }

      if (callback) this.callback = callback
      this.delay = delay
   }
   write(ms = 0) {
      // console.log(element)
      if (!this.element) return

      const previusNew = this.new
      if (this.new) {
         if (this.container) {
            clearTimeout(this.timeout)
            this.container.style.opacity = 1
         }

         this.progressiveText = ''
         this.new = false
         this.writerBusy = true
      }

      const limitTime = this.v

      if (ms - this.ut > limitTime || previusNew) {
         this.ut = ms
         const ind = this.progressiveText.length

         if (ind >= this.text.length) {

            if (this.writerBusy === true && this.delay !== false && typeof this.delay === 'number') {
               this.timeout = setTimeout(() => {
                  if (!this.container) return

                  this.container.style.opacity = 0
               }, this.delay)
            }

            this.writerBusy = false


            if (this.callback) {
               this.callback()
               this.callback = undefined
            }
            return
         }

         this.progressiveText += this.text[ind]
         // console.log(this.progressiveText)
         this.element.textContent = this.progressiveText
      }
   }
}

const dialogWriter = new Writer('', dialog, dialogContainer)
const instructionsWriter = new Writer('', instructions, undefined)

const loopProps = {
   ut: 0,
   fps: 0,
   aps: 0,
   animationFrame: undefined
}

const loop = (ms = 0) => {
   loopProps.varRW = window.requestAnimationFrame(loop)
   if (ms - loopProps.ut > 999) {
      loopProps.ut = ms

      console.log(`fps: ${loopProps.fps}, aps: ${loopProps.aps}`)

      loopProps.fps = 0
      loopProps.aps = 0
   }

   loopProps.fps++
   loopProps.aps++

   reset()
   draw(ms)
   update(ms)
}

const draw = (ms = 0) => {
   context.imageSmoothingEnabled = false
   const scale = 1.5

   const w = canvas.width / scale
   const h = canvas.height / scale
   const x = (canvas.width - w) / 2
   const y = (canvas.height - h) / 2

   animations.draw(x, y, w, h)

   dialogWriter.write(ms)

   pointers.forEach(point => {
      context.beginPath()
      context.rect(point.x1, point.y1, point.x2 - point.x1, point.y2 - point.y1)
      context.fillStyle = '#f003'
      context.fill()
      context.closePath()
   })
}

const update = (ms = 0) => {
   animations.reproduce(ms)
   instructionsWriter.write(ms)
   updateTerm(ms)
}

const reset = () => {
   context.reset()
}

// FRASES ---------------------------------
let cph = 0
const phrases = [
   'Holaaa, antes que nada quiero que veas a alguien.',
   '... O  M  G 😱',
   'Es pompompurin en persona.',
   'Todo panson, todo bonito.',
   'Bueno, ya que se conocieron.',
   'PomPom me ayudo trayendo una cosa.',
   'Por favor, entregasela PomPom.',
   'Pasa algo, PomPom ?',
   "Ohh no!,             a PomPom le da un poco de verguenza dartelo          .       .      . Tenemos que ayudarlo 😡",
   'Adeltante Pompom...',
   'Lauren, aunque no es un ramo de flores...',
   'Esto te lo hice con cariño y,                        ojalá que no sientas que es muy simple,                            y pues sí,             la verdad sí me costo un huevo hacerlo 😭😭😭.'
]

let cfn = 0
let disp = true

const fns = [
   () => {

      // console.log(dialogWriter.writerBusy)
      if (dialogWriter.writerBusy || !disp) {
         return
      }

      const cb = () => {
         // console.log(cph, cfn)
         if (cph === 1) {

            setTimeout(() => {
               instructionsWriter.set({ text: 'Toca para seguir...' })
            }, 1 * 1000)


            disp = false
            setTimeout(() => {
               disp = true
            }, 1500)
         }
         if (cph === 3) {
            instructionsWriter.set({ text: 'Toca para saludarlo...' })
         }
      }

      dialogWriter.set({ text: phrases[cph], v: cph === 1 ? 250 : 'default' }, cb, cph == 0 ? 1 * 1000 : false)

      if (cph === 1) {
         animations.select('aparecer')
         animations.next('estatico', 1 * 1000)
      }

      if (cph >= 2) {
         cfn++
      }

      cph++
   },
   () => {
      if (dialogWriter.writerBusy || !disp) {
         return
      }

      const cb = () => {
         if (cph === 5) {
            instructionsWriter.set({ text: 'toca para seguir...' })
         }

         if (cph === 7) {
            animations.select('espulcar')
            disp = false

            setTimeout(() => {
               disp = true
               fns[cfn]()
            }, 4 * 1000)
         }
      }

      if (cph === 3) {
         disp = false
         animations.select('saludo')

         setTimeout(() => {
            animations.select('estatico')
            disp = true
         }, 1.5 * 1000)
      }

      dialogWriter.set({ text: phrases[cph] }, cb, cph === 6 ? 1 * 1000 : false)

      // limit
      if (cph >= 6) {
         cfn++
      }

      cph++
   },
   () => {
      if (dialogWriter.writerBusy || !disp) {
         return
      }

      const cb = () => {
         if (cph === 8) {
            disp = false
            setTimeout(() => {
               animations.select('nervioso')
            }, 1.5 * 1000)

            setTimeout(() => {
               disp = true
               fns[cfn]()
            }, 3.5 * 1000)
         }
         if (cph === 9) {
            disp = false
            setTimeout(() => {
               displayTerm()
            }, 2 * 1000)
         }
      }

      dialogWriter.set({ text: phrases[cph] }, cb, cph === 8 ? 1.5 * 1000 : false)

      if (cph >= 8) {
         cfn++
      }
      cph++
   },
   () => {
      if (dialogWriter.writerBusy || !disp) {
         return
      }

      const cb = () => {
         console.log('chi', cph)
         if (cph === 10) {
            console.log('nia')
            disp = false
            animations.select('dar_flor')


            setTimeout(() => {
               disp = true
               fns[cfn]()
            }, 7 * 1000)
         }
         if (cph === 11) {
            animations.select('final')
         }
      }

      dialogWriter.set({ text: phrases[cph], v: 60}, cb, false)

      cph++
   }
]

addEventListener('DOMContentLoaded', () => {
   instructionsWriter.set({text: 'Presiona para empezar...'})
   loop()
})

mainContainer.onclick = () => {
   if (disp) fns[cfn]()
}

const termGameContainter = document.querySelector('#term_game_container')
const term = document.querySelector('#term')
const termFilled = document.querySelector('#term_filled')
const subTermInfo = document.querySelector('#sub_term_info')
const termWriter = new Writer('', subTermInfo, undefined)

const termProps = {
   desc: .01,
   asc: .15,
   filled: 0,
   limitTime: 25,
   ut: 0,
   isFilled: false,
   callWriter: false
}

const updateTerm = (ms = 0) => {
   if (ms - termProps.ut > termProps.limitTime && !termProps.isFilled) {
      termProps.ut = 0
      termProps.filled -= termProps.desc
   }

   if (termProps.filled < 0) {
      termProps.filled = 0
   } else if (termProps.filled > 1) {
      termProps.isFilled = true
      termProps.filled = 1
   }

   if (termProps.isFilled && !termProps.callWriter) {
      termProps.callWriter = true
      termWriter.set({ text: 'Parace que se siente mejor!! :D', v: 30 })

      setTimeout(() => {
         termGameContainter.style.opacity = 0
         setTimeout(() => {
            termGameContainter.style.display = 'none'

            disp = true
            fns[cfn]()
         }, .5 * 1000)
      }, 3 * 1000)
   }

   if (termProps.callWriter) termWriter.write(ms)
   termFilled.style.height = `${termProps.isFilled ? 100 : termProps.filled * 100}%`
}

const displayTerm = () => {
   termGameContainter.style.display = 'block'
   setTimeout(() => {
      termGameContainter.style.transition = '.5s ease'
      termGameContainter.style.opacity = 1
   }, .5 * 1000)
}

term.onclick = () => {
   termProps.filled += termProps.asc
}