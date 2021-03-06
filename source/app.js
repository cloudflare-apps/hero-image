import smoothScroll from "smoothscroll"

(function () {
  if (!window.addEventListener) return // Check for IE9+

  const STATE_ATTRIBUTE = "data-hero-state"
  const TEXT_SHADOWS = {
    dark: "#333333",
    light: "#efefef",
    none: "transparent"
  }
  const IS_PREVIEW = INSTALL_ID === "preview"
  const mask = document.createElement("eager-hero-mask")
  const message = document.createElement("eager-message")
  const accentIcon = document.createElement("eager-accent-icon")
  const scrollAnchor = document.createElement("eager-scroll-anchor")

  const ICONS = {
    scroll: `<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
      <path d="M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z"/>
    </svg>`,
    redirect: `<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
      <path d="M1600 960q0 54-37 91l-651 651q-39 37-91 37-51 0-90-37l-75-75q-38-38-38-91t38-91l293-293h-704q-52 0-84.5-37.5t-32.5-90.5v-128q0-53 32.5-90.5t84.5-37.5h704l-293-294q-38-36-38-90t38-90l75-75q38-38 90-38 53 0 91 38l651 651q37 35 37 90z"/>
    </svg>`
  }

  let deferredBootstrap
  let parentElement
  let container
  let options = INSTALL_OPTIONS
  let scrollTimeout

  function resetScrollPosition() {
    parentElement.scrollTop = 0
  }

  function centerMessage() {
    if (!container) return // Elements not ready

    const centerAdjustment = (container.clientHeight - message.clientHeight) / 2

    if (centerAdjustment > 0) message.style.transform = `translateY(${centerAdjustment}px)`
  }

  function handleContentClick() {
    if (options.navigatorBehavior === "redirect") {
      if (IS_PREVIEW) return window.location.reload()

      window.location = options.redirectURL
    }
    else {
      smoothScroll(scrollAnchor, 600)
    }
  }

  function updateInnerContent() {
    if (!container) return

    container.setAttribute("data-alignment", options.alignment)

    container.style.backgroundPosition = options.backgroundPosition

    container.style.color = options.textColor
    container.style.textShadow = `1px 1px 3px ${TEXT_SHADOWS[options.textShadowColor]}`
    message.innerHTML = options.message.html
  }

  function updateViewport() {
    const {paddingBottom, paddingTop} = document.defaultView.getComputedStyle(parentElement)
    let viewportCompensation = 0

    if (parentElement.clientHeight < document.documentElement.clientHeight) {
      viewportCompensation = document.documentElement.clientHeight - parentElement.clientHeight
    }

    parentElement.style.paddingBottom = `calc(${paddingBottom} + ${viewportCompensation}px)`
    parentElement.style.paddingTop = `calc(100vh + ${paddingTop})`
  }

  function updateBackground(onComplete = () => {}) {
    const {backgroundImage} = options
    const prefetchImage = document.createElement("img")

    if (!backgroundImage) {
      container.style.backgroundImage = ""
      onComplete()
      return
    }

    prefetchImage.onload = () => {
      container.style.backgroundImage = `url("${backgroundImage}")`
      onComplete()
    }

    prefetchImage.onerror = onComplete
    prefetchImage.src = backgroundImage
  }

  function updateIcon() {
    accentIcon.innerHTML = ICONS[options.navigatorBehavior]

    accentIcon.firstChild.style.fill = options.textColor
  }

  function updateElement() {
    container = Eager.createElement({selector: "body", method: "prepend"}, container)
    container.className = "eager-hero-image"

    container.addEventListener("click", handleContentClick)

    updateInnerContent()

    container.appendChild(message)
    container.appendChild(accentIcon)
    container.appendChild(scrollAnchor)

    updateIcon()

    centerMessage()

    updateBackground(() => {
      updateViewport()

      parentElement.setAttribute(STATE_ATTRIBUTE, "loaded")
    })
  }

  function onResourcesLoaded() {
    // IE10 can load all resources before the DOM is loaded
    if (!parentElement) {
      deferredBootstrap = onResourcesLoaded
      return
    }

    updateElement()

    window.addEventListener("resize", centerMessage)
  }

  function onDOMLoaded() {
    parentElement = document.body
    parentElement.setAttribute(STATE_ATTRIBUTE, "loading")

    mask.addEventListener("transitionend", () => {
      mask.parentNode && mask.parentNode.removeChild(mask)
    })

    parentElement.appendChild(mask)

    if (deferredBootstrap) {
      deferredBootstrap()
      deferredBootstrap = null
    }
  }

  window.INSTALL_SCOPE = {
    updateNavigatorBehavior(nextOptions) {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(resetScrollPosition, 1000)

      options = nextOptions

      updateIcon()
    },
    updateBackground(nextOptions) {
      options = nextOptions

      parentElement.setAttribute(STATE_ATTRIBUTE, "loading")
      parentElement.appendChild(mask)

      updateBackground(() => parentElement.setAttribute(STATE_ATTRIBUTE, "loaded"))
    },
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

  function checkBodyReadiness() {
    if (!document.body) {
      requestAnimationFrame(checkBodyReadiness)
      return
    }

    deferredBootstrap = onResourcesLoaded
    onDOMLoaded()
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMLoaded)
    window.addEventListener("load", onResourcesLoaded)
  }
  else {
    checkBodyReadiness()
  }
}())
