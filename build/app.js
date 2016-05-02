"use strict";

(function () {
  if (!window.addEventListener) return; // Check for IE9+

  var message = document.createElement("eager-message");
  var caret = document.createElement("eager-caret");
  var TEXT_SHADOWS = {
    dark: "#333333",
    light: "#efefef",
    none: "transparent"
  };

  caret.innerHTML = "<svg width=\"1792\" height=\"1792\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z\"/>\n  </svg>";

  var container = void 0;
  var options = INSTALL_OPTIONS;
  var animationFrame = void 0;

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

  function _updateInnerContent() {
    if (!container) return;

    container.setAttribute("data-alignment", options.alignment);

    container.style.color = options.textColor;
    container.style.textShadow = "1px 1px 3px " + TEXT_SHADOWS[options.textShadowColor];
    message.innerHTML = options.message.html;

    caret.firstChild.style.fill = options.textColor;
  }

  function _updateElement() {
    var _options = options;
    var backgroundImage = _options.backgroundImage;

    var parent = document.querySelector(options.location.selector);

    container = Eager.createElement(options.location, container);
    container.className = "eager-hero-image";

    container.addEventListener("click", function () {
      return scrollToTop({
        element: parent,
        finalY: container.clientHeight
      });
    });

    _updateInnerContent();

    container.appendChild(message);
    container.appendChild(caret);

    var initialPaddingTop = parent.style.paddingTop || "0px";
    var initialPaddingBottom = parent.style.paddingBottom || "0px";
    var viewportCompensation = 0;

    if (document.body.clientHeight < document.documentElement.clientHeight) {
      viewportCompensation = document.documentElement.clientHeight - document.body.clientHeight;
    }

    parent.style.paddingBottom = "calc(" + initialPaddingBottom + " + " + viewportCompensation + "px)";
    parent.style.paddingTop = "calc(100vh + " + initialPaddingTop + ")";

    centerMessage();

    var prefetchImage = document.createElement("img");

    function onComplete() {
      container.setAttribute("data-state", "loaded");
    }

    if (!backgroundImage) return onComplete();

    prefetchImage.onload = function () {
      container.style.backgroundImage = "url(\"" + backgroundImage + "\")";
      onComplete();
    };

    prefetchImage.onerror = onComplete;
    prefetchImage.src = backgroundImage;
  }

  function onReady() {
    _updateElement();
    window.addEventListener("resize", centerMessage);
  }

  window.INSTALL_SCOPE = {
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();