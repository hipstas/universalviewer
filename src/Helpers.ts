import { Viewer } from "./Viewer";
import { Urls } from "@edsilv/utils";

export const init = (selector, data) => {
  let uv;
  let isFullScreen = false;
  const container = document.getElementById(selector);

  if (!container) {
    throw new Error("UV target element not found");
  }

  container.innerHTML = "";
  const parent = document.createElement("div");
  container.appendChild(parent);
  uv = document.createElement("div");
  parent.appendChild(uv);

  const resize = () => {
    if (uv) {
      if (isFullScreen) {
        parent.style.width = window.innerWidth + "px";
        parent.style.height = window.innerHeight + "px";
      } else {
        parent.style.width = container.offsetWidth + "px";
        parent.style.height = container.offsetHeight + "px";
      }
      uv.resize();
    }
  }

  window.addEventListener("resize", function() {
    resize();
  });

  window.addEventListener("orientationchange", function() {
    setTimeout(function() {
      resize();
    }, 100);
  });

  uv = new Viewer({
    target: uv,
    data: data
  });

  uv.on(
    "created",
    function(_obj) {
      resize();
    },
    false
  );

  uv.on(
    "openedMedia",
    function() {
      setTimeout(function() {
        resize();
      }, 100);
    },
    false
  );

  uv.on(
    "collectionIndexChanged",
    function(collectionIndex) {
      uv.dataProvider.set("c", collectionIndex);
    },
    false
  );

  uv.on(
    "manifestIndexChanged",
    function(manifestIndex) {
      uv.dataProvider.set("m", manifestIndex);
    },
    false
  );

  uv.on(
    "canvasIndexChanged",
    function(canvasIndex) {
      uv.dataProvider.set("cv", canvasIndex);
    },
    false
  );

  uv.on(
    "rangeChanged",
    function(rangeId) {
      uv.dataProvider.set("rid", rangeId);
    },
    false
  );

  // uv.on(
  //   "openseadragonExtension.rotationChanged",
  //   function(rotation) {
  //     uv.dataProvider.set("r", rotation);
  //   },
  //   false
  // );

  // uv.on(
  //   "openseadragonExtension.xywhChanged",
  //   function(xywh) {
  //     uv.dataProvider.set("xywh", xywh);
  //   },
  //   false
  // );

  // uv.on(
  //   "openseadragonExtension.currentViewUri",
  //   function(_data) {
  //     //console.log('openseadragonExtension.currentViewUri', obj);
  //   },
  //   false
  // );

  uv.on(
    "reload",
    function(data) {
      data.isReload = true;
      uv.set(data);
    },
    false
  );

  uv.on(
    "toggleFullScreen",
    function(data) {
      isFullScreen = data.isFullScreen;

      if (data.overrideFullScreen) {
        return;
      }

      if (isFullScreen) {
        const requestFullScreen = getRequestFullScreen(parent);
        if (requestFullScreen) {
          requestFullScreen.call(parent);
          resize();
        }
      } else {
        const exitFullScreen = getExitFullScreen();
        if (exitFullScreen) {
          exitFullScreen.call(document);
          setTimeout(function() {
            resize();
          }, 100);
          // firefox needs extra time when exiting a full screen embed
          setTimeout(function() {
            resize();
          }, 1000);
        }
      }
    },
    false
  );

  uv.on(
    "error",
    function(message) {
      console.error(message);
    },
    false
  );

  uv.on(
    "bookmark",
    function(data) {
      const absUri = parent!.ownerDocument!.URL;
      const parts = Urls.getUrlParts(absUri);
      let relUri =
        parts.pathname + parts.search + parent!.ownerDocument!.location.hash;

      if (!relUri.startsWith("/")) {
        relUri = "/" + relUri;
      }

      data.path = relUri;

      console.log("bookmark", data);
    },
    false
  );

  $(document).on(
    "fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange",
    function(e) {
      if (
        (e.type === "webkitfullscreenchange" && !document.webkitIsFullScreen) ||
        (e.type === "fullscreenchange" && !document.fullscreenElement) ||
        (e.type === "mozfullscreenchange" && !document.mozFullScreen) ||
        (e.type === "MSFullscreenChange" &&
          document.msFullscreenElement === null)
      ) {
        uv.exitFullScreen();
      }
    }
  );

  return uv;
}

function getRequestFullScreen(elem) {
  if (elem.webkitRequestFullscreen) {
    return elem.webkitRequestFullscreen;
  }

  if (elem.mozRequestFullScreen) {
    return elem.mozRequestFullScreen;
  }

  if (elem.msRequestFullscreen) {
    return elem.msRequestFullscreen;
  }

  if (elem.requestFullscreen) {
    return elem.requestFullscreen;
  }

  return false;
}

function getExitFullScreen() {
  if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen;
  }

  if (document.msExitFullscreen) {
    return document.msExitFullscreen;
  }

  if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen;
  }

  if (document.exitFullscreen) {
    return document.exitFullscreen;
  }

  return false;
}