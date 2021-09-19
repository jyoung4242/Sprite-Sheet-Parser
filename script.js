var file
var imageParsingFile
var spriteSheetCanvas
var spritesheet
var imgDropText
var elemNumRows, elemNumCols, elemPxW, elemPxH
var isLooping = false
var animationObjects = []
var selectedSequences = []
var animationIndex = 0
var startTime = null
var sequenceString
var wrapper
var jsondata

//canvas vars
var ctx
var numRows, numCols, pxWidth, pxHeight, pxHeight

//preview canvas
var prevCnv, pCtx

//image vars
var imageSizeW, imageSizeH, scaledHeight, scaledWidth

//grab handles to ui elements

const bodyBlackout = document.querySelector(".body-blackout")
const modal = document.querySelector(".jsonModal")
parseDiv = document.getElementById("dragndrop")
spriteSheet = document.getElementById("spritesheet")
spriteSheetCanvas = document.getElementById("cnv")
ctx = spriteSheetCanvas.getContext("2d")
imageParsingFile = document.getElementById("dropfile")
imgDropText = document.getElementById("dndtext")
elemNumRows = document.getElementById("rows")
elemNumCols = document.getElementById("cols")
elemPxW = document.getElementById("pxW")
elemPxH = document.getElementById("pxH")
prevCnv = document.getElementById("previewCnv")
pCtx = prevCnv.getContext("2d")
delay = document.getElementById("animDelay")
sequenceString = document.getElementById("seq").value

sprtIndex = document.getElementById("index")
sprtX = document.getElementById("frameX")
sprtY = document.getElementById("frameY")
sprtW = document.getElementById("frameW")
sprtH = document.getElementById("frameH")

function reset() {
  window.location.reload()
}

function startLoop() {
  isLooping = true
  requestAnimationFrame(gameLoop)
}

function loadSeq() {
  buildAnimationSequenceObject()
  animationIndex = 0
  updateUIframeData()
  drawToCanvas()
}

function stopLoop() {
  isLooping = false
}

function changeIndex(e) {
  let nextFrame = e.value
  if (nextFrame < 0) {
    nextFrame = selectedSequences.length - 1
    e.value = nextFrame
  } else if (nextFrame > selectedSequences.length - 1) {
    nextFrame = 0
    e.value = nextFrame
  }
  animationIndex = nextFrame
  updateUIframeData()
  drawToCanvas()
}

function updateframe(e) {
  let currFrame = index.value
  animationObjects[currFrame].x = sprtX.value
  animationObjects[currFrame].y = sprtY.value
  animationObjects[currFrame].width = sprtW.value
  animationObjects[currFrame].height = sprtH.value
}

function copyToClipboard() {
  document.getElementById("jsontextarea").select()
  document.execCommand("copy")
  document.getElementById("jsontextarea").value = "Contents copied to clipboard... have a nice day"
}

function json() {
  //show blackout
  bodyBlackout.classList.add("show-blackout")
  //show modal

  modal.classList.add("show-modal")
}

function close_modal() {
  //show blackout
  bodyBlackout.classList.remove("show-blackout")
  //show modal
  modal.classList.remove("show-modal")
}

function spitShort() {
  document.getElementById("jsontextarea").value = ""
  var pretty = JSON.stringify(jsondatat, undefined, 4)
  document.getElementById("jsontextarea").value = pretty
}

function spitLong() {
  document.getElementById("jsontextarea").value = ""
  var pretty = JSON.stringify(animationObjects, undefined, 4)
  document.getElementById("jsontextarea").value = pretty
}

function buildAnimationSequenceObject() {
  //load up array
  for (let i = 0; i < numRows; i++) {
    for (let ind = 0; ind < numCols; ind++) {
      animationObjects.push({
        width: pxWidth,
        height: pxHeight,
        x: ind * pxWidth,
        y: i * pxHeight,
      })
    }
  }
  //create array of sequences per UI
  selectedSequences = document.getElementById("seq").value.split(",")
  //getfirst pointer
  animationIndex = 0
}

function drawToCanvas() {
  //clear canvas
  pCtx.clearRect(0, 0, prevCnv.width, prevCnv.height)
  pCtx.drawImage(spriteSheet, animationObjects[animationIndex].x, animationObjects[animationIndex].y, animationObjects[animationIndex].width, animationObjects[animationIndex].height, 0, 0, animationObjects[animationIndex].width, animationObjects[animationIndex].height)
  animationIndex += 1
  if (animationIndex >= selectedSequences.length) animationIndex = 0
}

function updateUIframeData() {
  sprtIndex.value = animationIndex
  sprtX.value = animationObjects[animationIndex].x
  sprtY.value = animationObjects[animationIndex].y
  sprtW.value = animationObjects[animationIndex].width
  sprtH.value = animationObjects[animationIndex].height
}

function updateGrid() {
  //redraw grid based on new data
  numRows = parseInt(elemNumRows.value)
  numCols = parseInt(elemNumCols.value)
  pxWidth = parseInt(elemPxW.value)
  pxHeight = parseInt(elemPxH.value)
  //clear canvas
  ctx.clearRect(0, 0, spriteSheetCanvas.width, spriteSheetCanvas.height)
  //draw vertical lines
  ctx.beginPath()
  for (let i = 1; i < numCols; i++) {
    ctx.moveTo(pxWidth * i * scaledWidth, 0)
    ctx.lineTo(pxWidth * i * scaledWidth, pxHeight * numRows * scaledHeight)
    ctx.stroke()
  }

  //draw horizontal lines
  for (let i = 1; i < numRows; i++) {
    ctx.moveTo(0, pxHeight * i * scaledHeight)
    ctx.lineTo(pxWidth * numCols * scaledWidth, pxHeight * i * scaledHeight)
    ctx.stroke()
  }
}

parseDiv.addEventListener("dragover", (e) => {
  e.preventDefault()
})

parseDiv.addEventListener("drop", (e) => {
  e.preventDefault()
  if (e.dataTransfer.files.length) {
    imageParsingFile.files = e.dataTransfer.files
    file = imageParsingFile.files[0]
    var reader = new FileReader()
    reader.onload = () => {
      spriteSheet.onload = () => {
        //think about this a bit
        imgDropText.classList.add("hidden")
        spriteSheet.style.display = "inline"
        numRows = parseInt(elemNumRows.value)
        numCols = parseInt(elemNumCols.value)
        pxWidth = parseInt(elemPxW.value)
        pxHeight = parseInt(elemPxH.value)

        //establish image scaling
        imageSizeW = spriteSheet.naturalWidth
        imageSizeH = spriteSheet.naturalHeight

        //scaling ratio
        scaledWidth = spriteSheetCanvas.width / imageSizeW
        scaledHeight = spriteSheetCanvas.height / imageSizeH
        ctx.strokeStyle = "white"
        updateGrid()
      }
      spriteSheet.src = reader.result
    }
    reader.readAsDataURL(file)
  }
})

function gameLoop(dateTime) {
  let elapsedTime
  if (startTime == null) {
    startTime = dateTime
  } else {
    elapsedTime = dateTime - startTime
  }

  let setDelay = parseInt(delay.value)

  if (elapsedTime > setDelay) {
    startTime = dateTime
    updateUIframeData()
    drawToCanvas()
  }

  if (isLooping) {
    requestAnimationFrame(gameLoop)
  }
}

function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest()
  rawFile.overrideMimeType("application/json")
  rawFile.open("GET", file, true)
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText)
    }
  }
  rawFile.send(null)
}

function initJSON() {
  var mydata
  readTextFile("./init.json", function (text) {
    mydata = JSON.parse(text)
    jsondatat = mydata
    //set default values
    elemNumRows.value = mydata.numrows
    elemNumCols.value = mydata.numcols
    elemPxW.value = mydata.pxWidth
    elemPxH.value = mydata.pxHeight
    delay.value = mydata.animDelay
    document.getElementById("seq").value = mydata.sequence
  })
}
