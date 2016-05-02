(function () {
  if (!window.addEventListener) return // Check for IE9+

  const message = document.createElement("eager-message")
  const caret = document.createElement("eager-caret")
  const TEXT_SHADOWS = {
    dark: "#333333",
    light: "#efefef",
    none: "transparent"
  }

  caret.innerHTML = `<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z"/>
  </svg>`

  let container
  let options = INSTALL_OPTIONS
  let animationFrame

  function easeInOutQuad(time, value, delta, duration) {
    time /= duration / 2

    if (time < 1) return delta / 2 * time * time + value

    time--
    return -delta / 2 * (time * (time - 2) - 1) + value
  }

  function scrollToTop({element, duration = 600, finalY = 0}) {
    const initialY = element.scrollTop
    const delta = finalY - initialY
    const increment = 20
    const start = Date.now()
    const animate = window.requestAnimationFrame || window.setTimeout
    const cancelAnimate = window.cancelAnimationFrame || window.clearTimeout

    let currentTime = 0

    function animateScroll() {
      const elapsed = Date.now() - start

      // This limit serves to prevent an infinite loop if scrolling is interrupted by a user or event handler.
      if (elapsed > duration * 2) {
        element.scrollTop = finalY
        return
      }

      currentTime += increment
      element.scrollTop = easeInOutQuad(currentTime, initialY, delta, duration)

      if (element.scrollTop < finalY) animationFrame = animate(animateScroll, increment)
    }

    cancelAnimate(animationFrame)
    animateScroll()
  }

  function centerMessage() {
    if (!container) return // Elements not ready

    const centerAdjustment = (container.clientHeight - message.clientHeight) / 2

    if (centerAdjustment > 0) message.style.transform = `translateY(${centerAdjustment}px)`
  }

  function updateInnerContent() {
    if (!container) return

    container.setAttribute("data-alignment", options.alignment)

    container.style.color = options.textColor
    container.style.textShadow = `1px 1px 3px ${TEXT_SHADOWS[options.textShadowColor]}`
    message.innerHTML = options.message.html

    caret.firstChild.style.fill = options.textColor
  }

  function updateElement() {
    const {backgroundImage} = options
    const parent = document.querySelector(options.location.selector)

    container = Eager.createElement(options.location, container)
    container.className = "eager-hero-image"

    container.addEventListener("click", () => scrollToTop({
      element: parent,
      finalY: container.clientHeight
    }))

    updateInnerContent()

    container.appendChild(message)
    container.appendChild(caret)

    const initialPaddingTop = parent.style.paddingTop || "0px"
    const initialPaddingBottom = parent.style.paddingBottom || "0px"
    let viewportCompensation = 0

    if (document.body.clientHeight < document.documentElement.clientHeight) {
      viewportCompensation = document.documentElement.clientHeight - document.body.clientHeight
    }

    parent.style.paddingBottom = `calc(${initialPaddingBottom} + ${viewportCompensation}px)`
    parent.style.paddingTop = `calc(100vh + ${initialPaddingTop})`

    centerMessage()

    const prefetchImage = document.createElement("img")

    function onComplete() {
      container.setAttribute("data-state", "loaded")
    }

    if (!backgroundImage) return onComplete()

    prefetchImage.onload = () => {
      container.style.backgroundImage = `url("${backgroundImage}")`
      onComplete()
    }

    prefetchImage.onerror = onComplete
    prefetchImage.src = backgroundImage
  }

  function onReady() {
    updateElement()
    window.addEventListener("resize", centerMessage)
  }

  window.INSTALL_SCOPE = {
    updateElement(nextOptions) {
      options = nextOptions

      updateElement()
    },
    updateInnerContent(nextOptions) {
      options = nextOptions

      updateInnerContent()
      centerMessage()
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady)
  }
  else {
    onReady()
  }
}())
