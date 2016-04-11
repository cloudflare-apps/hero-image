"use strict";

(function () {
  var BACKGROUND_IMAGE = "https://eager-app-images.imgix.net/lturyv6bQ0KLnXdnNLCi_life.jpg";
  var CONTAINER_CLASS = "eager-hero-image";
  var caret = document.createElement("div");

  caret.classList.add("eager-caret");
  caret.innerHTML = "<svg width=\"1792\" height=\"1792\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z\"/>\n  </svg>";

  var container = void 0;
  var message = void 0;
  var options = INSTALL_OPTIONS;

  function easeInOutQuad(time, value, delta, duration) {
    time /= duration / 2;

    if (time < 1) return delta / 2 * time * time + value;

    time--;
    return -delta / 2 * (time * (time - 2) - 1) + value;
  }

  function scrollToTop(options) {
    var element = options.element;
    var _options$duration = options.duration;
    var duration = _options$duration === undefined ? 600 : _options$duration;
    var _options$finalY = options.finalY;
    var finalY = _options$finalY === undefined ? 0 : _options$finalY;

    var initialY = element.scrollTop;
    var delta = finalY - initialY;
    var increment = 20;
    var start = Date.now();

    var currentTime = 0;

    function animateScroll() {
      var elapsed = Date.now() - start;

      // This limit serves to prevent an infinite loop if scrolling is interrupted by a user or event handler.
      if (elapsed > duration * 2) {
        element.scrollTop = finalY;
      } else {
        currentTime += increment;
        element.scrollTop = easeInOutQuad(currentTime, initialY, delta, duration);
      }

      if (element.scrollTop < finalY) setTimeout(animateScroll, increment);
    }

    animateScroll();
  }

  function centerMessage() {
    if (!container || !message) return; // Elements not ready

    var centerAdjustment = (container.clientHeight - message.clientHeight) / 2;

    if (centerAdjustment > 0) message.style.transform = "translateY(" + centerAdjustment + "px)";
  }

  function updateElement() {
    container = Eager.createElement(options.location, container);
    container.classList.add(CONTAINER_CLASS);
    container.setAttribute("data-alignment", options.alignment);

    Object.assign(container.style, {
      backgroundImage: "url(" + (options.backgroundImage || BACKGROUND_IMAGE) + ")",
      color: options.textColor,
      textShadow: options.textShadowColor ? "1px 1px 3px " + options.textShadowColor : ""
    });

    caret.firstChild.style.fill = options.textColor;

    var parent = document.querySelector(options.location.selector);
    var initialPaddingTop = parent.style.paddingTop || "0px";

    parent.style.paddingTop = "calc(100vh + " + initialPaddingTop + ")";

    message = document.createElement("eager-message");

    container.addEventListener("click", function () {
      return scrollToTop({
        element: parent,
        finalY: container.clientHeight
      });
    });

    message.innerHTML = options.message.html;

    container.appendChild(message);
    container.appendChild(caret);

    centerMessage();
  }

  function onReady() {
    updateElement();
    window.addEventListener("resize", centerMessage);
  }

  INSTALL_SCOPE = {
    setOptions: function setOptions(nextOptions) {
      options = nextOptions;

      updateElement();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();