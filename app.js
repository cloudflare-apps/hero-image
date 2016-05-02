(function () {
  if (!window.addEventListener) return // Check for IE9+

  const BACKGROUND_IMAGE = "https://eager-app-images.imgix.net/lturyv6bQ0KLnXdnNLCi_life.jpg"
  const caret = document.createElement("div")

  caret.className = "eager-caret"
  caret.innerHTML = `<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z"/>
  </svg>`

  let container
  let message
  let options = INSTALL_OPTIONS

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

    let currentTime = 0

    function animateScroll() {
      const elapsed = Date.now() - start

      // This limit serves to prevent an infinite loop if scrolling is interrupted by a user or event handler.
      if (elapsed > duration * 2) {
        element.scrollTop = finalY
      }
      else {
        currentTime += increment
        element.scrollTop = easeInOutQuad(currentTime, initialY, delta, duration)
      }

      if (element.scrollTop < finalY) window.setTimeout(animateScroll, increment)
    }

    animateScroll()
  }

  function centerMessage() {
    if (!container || !message) return // Elements not ready

    const centerAdjustment = (container.clientHeight - message.clientHeight) / 2

    if (centerAdjustment > 0) message.style.transform = `translateY(${centerAdjustment}px)`
  }

  function updateElement() {
    container = Eager.createElement(options.location, container)
    container.className = "eager-hero-image"
    container.setAttribute("data-alignment", options.alignment)

    container.style.backgroundImage = `url(${options.backgroundImage || BACKGROUND_IMAGE})`
    container.style.color = options.textColor
    container.style.textShadow = options.textShadowColor ? `1px 1px 3px ${options.textShadowColor}` : ""

    caret.firstChild.style.fill = options.textColor

    const parent = document.querySelector(options.location.selector)
    const initialPaddingTop = parent.style.paddingTop || "0px"

    parent.style.paddingTop = `calc(100vh + ${initialPaddingTop})`

    message = document.createElement("eager-message")

    container.addEventListener("click", () => scrollToTop({
      element: parent,
      finalY: container.clientHeight
    }))

    message.innerHTML = options.message.html

    container.appendChild(message)
    container.appendChild(caret)

    centerMessage()
  }

  function onReady() {
    updateElement()
    window.addEventListener("resize", centerMessage)
  }

  window.INSTALL_SCOPE = {
    setOptions(nextOptions) {
      options = nextOptions

      updateElement()
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady)
  }
  else {
    onReady()
  }
}())
