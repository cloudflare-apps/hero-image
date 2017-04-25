(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var smoothscroll = createCommonjsModule(function (module, exports) {
	(function (root, smoothScroll) {
	  'use strict';

	  // Support RequireJS and CommonJS/NodeJS module formats.
	  // Attach smoothScroll to the `window` when executed as a <script>.

	  // RequireJS
	  if (typeof define === 'function' && define.amd) {
	    define(smoothScroll);

	  // CommonJS
	  } else if (typeof exports === 'object' && typeof module === 'object') {
	    module.exports = smoothScroll();

	  } else {
	    root.smoothScroll = smoothScroll();
	  }

	})(commonjsGlobal, function(){
	'use strict';

	// Do not initialize smoothScroll when running server side, handle it in client:
	if (typeof window !== 'object') return;

	// We do not want this script to be applied in browsers that do not support those
	// That means no smoothscroll on IE9 and below.
	if(document.querySelectorAll === void 0 || window.pageYOffset === void 0 || history.pushState === void 0) { return; }

	// Get the top position of an element in the document
	var getTop = function(element) {
	    // return value of html.getBoundingClientRect().top ... IE : 0, other browsers : -pageYOffset
	    if(element.nodeName === 'HTML') return -window.pageYOffset
	    return element.getBoundingClientRect().top + window.pageYOffset;
	}
	// ease in out function thanks to:
	// http://blog.greweb.fr/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
	var easeInOutCubic = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

	// calculate the scroll position we should be in
	// given the start and end point of the scroll
	// the time elapsed from the beginning of the scroll
	// and the total duration of the scroll (default 500ms)
	var position = function(start, end, elapsed, duration) {
	    if (elapsed > duration) return end;
	    return start + (end - start) * easeInOutCubic(elapsed / duration); // <-- you can change the easing funtion there
	    // return start + (end - start) * (elapsed / duration); // <-- this would give a linear scroll
	}

	// we use requestAnimationFrame to be called by the browser before every repaint
	// if the first argument is an element then scroll to the top of this element
	// if the first argument is numeric then scroll to this location
	// if the callback exist, it is called when the scrolling is finished
	// if context is set then scroll that element, else scroll window 
	var smoothScroll = function(el, duration, callback, context){
	    duration = duration || 500;
	    context = context || window;
	    var start = window.pageYOffset;

	    if (typeof el === 'number') {
	      var end = parseInt(el);
	    } else {
	      var end = getTop(el);
	    }

	    var clock = Date.now();
	    var requestAnimationFrame = window.requestAnimationFrame ||
	        window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
	        function(fn){window.setTimeout(fn, 15);};

	    var step = function(){
	        var elapsed = Date.now() - clock;
	        if (context !== window) {
	        	context.scrollTop = position(start, end, elapsed, duration);
	        }
	        else {
	        	window.scroll(0, position(start, end, elapsed, duration));
	        }

	        if (elapsed > duration) {
	            if (typeof callback === 'function') {
	                callback(el);
	            }
	        } else {
	            requestAnimationFrame(step);
	        }
	    }
	    step();
	}

	var linkHandler = function(ev) {
	    ev.preventDefault();

	    if (location.hash !== this.hash) window.history.pushState(null, null, this.hash)
	    // using the history api to solve issue #1 - back doesn't work
	    // most browser don't update :target when the history api is used:
	    // THIS IS A BUG FROM THE BROWSERS.
	    // change the scrolling duration in this call
	    smoothScroll(document.getElementById(this.hash.substring(1)), 500, function(el) {
	        location.replace('#' + el.id)
	        // this will cause the :target to be activated.
	    });
	}

	// We look for all the internal links in the documents and attach the smoothscroll function
	document.addEventListener("DOMContentLoaded", function () {
	    var internal = document.querySelectorAll('a[href^="#"]:not([href="#"])'), a;
	    for(var i=internal.length; a=internal[--i];){
	        a.addEventListener("click", linkHandler, false);
	    }
	});

	// return smoothscroll API
	return smoothScroll;

	});
	});

	var smoothScroll = (smoothscroll && typeof smoothscroll === 'object' && 'default' in smoothscroll ? smoothscroll['default'] : smoothscroll);

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
	  var scrollAnchor = document.createElement("eager-scroll-anchor");

	  var ICONS = {
	    scroll: "<svg width=\"1792\" height=\"1792\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M1683 808l-742 741q-19 19-45 19t-45-19l-742-741q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z\"/>\n    </svg>",
	    redirect: "<svg width=\"1792\" height=\"1792\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path d=\"M1600 960q0 54-37 91l-651 651q-39 37-91 37-51 0-90-37l-75-75q-38-38-38-91t38-91l293-293h-704q-52 0-84.5-37.5t-32.5-90.5v-128q0-53 32.5-90.5t84.5-37.5h704l-293-294q-38-36-38-90t38-90l75-75q38-38 90-38 53 0 91 38l651 651q37 35 37 90z\"/>\n    </svg>"
	  };

	  var deferredBootstrap = void 0;
	  var parentElement = void 0;
	  var container = void 0;
	  var options = INSTALL_OPTIONS;
	  var scrollTimeout = void 0;

	  function resetScrollPosition() {
	    parentElement.scrollTop = 0;
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
	      smoothScroll(scrollAnchor, 600);
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
	    var _document$defaultView = document.defaultView.getComputedStyle(parentElement),
	        paddingBottom = _document$defaultView.paddingBottom,
	        paddingTop = _document$defaultView.paddingTop;

	    var viewportCompensation = 0;

	    if (parentElement.clientHeight < document.documentElement.clientHeight) {
	      viewportCompensation = document.documentElement.clientHeight - parentElement.clientHeight;
	    }

	    parentElement.style.paddingBottom = "calc(" + paddingBottom + " + " + viewportCompensation + "px)";
	    parentElement.style.paddingTop = "calc(100vh + " + paddingTop + ")";
	  }

	  function _updateBackground() {
	    var onComplete = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
	    var _options = options,
	        backgroundImage = _options.backgroundImage;

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
	    container.appendChild(scrollAnchor);

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

}());