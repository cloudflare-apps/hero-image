"use strict";

(function () {
  if (!window.addEventListener) return; // Check for IE9+

  var STATE_ATTRIBUTE = "data-hero-state";
  var TEXT_SHADOWS = {
    dark: "#333333",
    light: "#efefef",
    none: "transparent"
  };
  var IS_PREVIEW = INSTALL_ID === "preview";
  var mask = document.createElement("eager-hero-mask");
  var message = document.createElement("eager-message");
  var accentIcon = document.createElement("eager-accent-icon");

  var ICONS = {
    scroll: "<svg width=\"1792\" height=\"1792\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z\"/>\n    </svg>",
    redirect: "<svg width=\"1792\" height=\"1792\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M1600 960q0 54-37 91l-651 651q-39 37-91 37-51 0-90-37l-75-75q-38-38-38-91t38-91l293-293h-704q-52 0-84.5-37.5t-32.5-90.5v-128q0-53 32.5-90.5t84.5-37.5h704l-293-294q-38-36-38-90t38-90l75-75q38-38 90-38 53 0 91 38l651 651q37 35 37 90z\"/>\n    </svg>"
  };

  var deferredBootstrap = void 0;
  var parentElement = void 0;
  var container = void 0;
  var options = INSTALL_OPTIONS;
  var animationFrame = void 0;
  var scrollTimeout = void 0;

  function resetScrollPosition() {
    parentElement.scrollTop = 0;
  }

  function easeInOutQuad(time, value, delta, duration) {
    time /= duration / 2;

    if (time < 1) return delta / 2 * time * time + value;

    time--;
    return -delta / 2 * (time * (time - 2) - 1) + value;
  }

  function scrollToTop(_ref) {
    var element = _ref.element;
    var _ref$duration = _ref.duration;
    var duration = _ref$duration === undefined ? 600 : _ref$duration;
    var _ref$finalY = _ref.finalY;
    var finalY = _ref$finalY === undefined ? 0 : _ref$finalY;

    var initialY = element.scrollTop;
    var delta = finalY - initialY;
    var increment = 20;
    var start = Date.now();
    var animate = window.requestAnimationFrame || window.setTimeout;
    var cancelAnimate = window.cancelAnimationFrame || window.clearTimeout;

    var currentTime = 0;

    function animateScroll() {
      var elapsed = Date.now() - start;

      // This limit serves to prevent an infinite loop if scrolling is interrupted by a user or event handler.
      if (elapsed > duration * 2) {
        element.scrollTop = finalY;
        return;
      }

      currentTime += increment;
      element.scrollTop = easeInOutQuad(currentTime, initialY, delta, duration);

      if (element.scrollTop < finalY) animationFrame = animate(animateScroll, increment);
    }

    cancelAnimate(animationFrame);
    animateScroll();
  }

  function centerMessage() {
    if (!container) return; // Elements not ready

    var centerAdjustment = (container.clientHeight - message.clientHeight) / 2;

    if (centerAdjustment > 0) message.style.transform = "translateY(" + centerAdjustment + "px)";
  }

  function handleContentClick() {
    if (options.navigatorBehavior === "redirect") {
      if (IS_PREVIEW) return window.location.reload();

      window.location = options.redirectURL;
    } else {
      scrollToTop({
        element: parentElement,
        finalY: container.clientHeight
      });
    }
  }

  function _updateInnerContent() {
    if (!container) return;

    container.setAttribute("data-alignment", options.alignment);

    container.style.color = options.textColor;
    container.style.textShadow = "1px 1px 3px " + TEXT_SHADOWS[options.textShadowColor];
    message.innerHTML = options.message.html;
  }

  function updateViewport() {
    var _document$defaultView = document.defaultView.getComputedStyle(parentElement);

    var paddingBottom = _document$defaultView.paddingBottom;
    var paddingTop = _document$defaultView.paddingTop;

    var viewportCompensation = 0;

    if (parentElement.clientHeight < document.documentElement.clientHeight) {
      viewportCompensation = document.documentElement.clientHeight - parentElement.clientHeight;
    }

    parentElement.style.paddingBottom = "calc(" + paddingBottom + " + " + viewportCompensation + "px)";
    parentElement.style.paddingTop = "calc(100vh + " + paddingTop + ")";
  }

  function _updateBackground() {
    var onComplete = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    var _options = options;
    var backgroundImage = _options.backgroundImage;

    var prefetchImage = document.createElement("img");

    if (!backgroundImage) {
      container.style.backgroundImage = "";
      onComplete();
      return;
    }

    prefetchImage.onload = function () {
      container.style.backgroundImage = "url(\"" + backgroundImage + "\")";
      onComplete();
    };

    prefetchImage.onerror = onComplete;
    prefetchImage.src = backgroundImage;
  }

  function updateIcon() {
    accentIcon.innerHTML = ICONS[options.navigatorBehavior];

    accentIcon.firstChild.style.fill = options.textColor;
  }

  function _updateElement() {
    container = Eager.createElement({ selector: "body", method: "prepend" }, container);
    container.className = "eager-hero-image";

    container.addEventListener("click", handleContentClick);

    _updateInnerContent();

    container.appendChild(message);
    container.appendChild(accentIcon);

    updateIcon();

    centerMessage();

    _updateBackground(function () {
      updateViewport();

      parentElement.setAttribute(STATE_ATTRIBUTE, "loaded");
    });
  }

  function onResourcesLoaded() {
    // IE10 can load all resources before the DOM is loaded
    if (!parentElement) {
      deferredBootstrap = onResourcesLoaded;
      return;
    }

    _updateElement();

    window.addEventListener("resize", centerMessage);
  }

  function onDOMLoaded() {
    parentElement = document.body;
    parentElement.setAttribute(STATE_ATTRIBUTE, "loading");

    mask.addEventListener("transitionend", function () {
      mask.parentNode && mask.parentNode.removeChild(mask);
    });

    parentElement.appendChild(mask);

    if (deferredBootstrap) {
      deferredBootstrap();
      deferredBootstrap = null;
    }
  }

  window.INSTALL_SCOPE = {
    updateNavigatorBehavior: function updateNavigatorBehavior(nextOptions) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(resetScrollPosition, 1000);

      options = nextOptions;

      updateIcon();
    },
    updateBackground: function updateBackground(nextOptions) {
      options = nextOptions;

      parentElement.setAttribute(STATE_ATTRIBUTE, "loading");
      parentElement.appendChild(mask);

      _updateBackground(function () {
        return parentElement.setAttribute(STATE_ATTRIBUTE, "loaded");
      });
    },
    updateElement: function updateElement(nextOptions) {
      options = nextOptions;

      _updateElement();
    },
    updateInnerContent: function updateInnerContent(nextOptions) {
      options = nextOptions;

      _updateInnerContent();
      centerMessage();
    }
  };

  function checkBodyReadiness() {
    if (!document.body) {
      requestAnimationFrame(checkBodyReadiness);
      return;
    }

    deferredBootstrap = onResourcesLoaded;
    onDOMLoaded();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMLoaded);
    window.addEventListener("load", onResourcesLoaded);
  } else {
    checkBodyReadiness();
  }
})();