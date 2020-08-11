window.addEventListener('resize', function () {
  resizeCanvas();
});

window.addEventListener('earthjsload', function () {
  Earth.addMesh(heartMesh);

  resizeCanvas();

  canvasEarth = new Earth(document.getElementById('CanvasContainer'), {
    location: { lat: 20, lng: 10 },
    light: 'none',
    mapLandColor: '#ffffff',
    mapSeaColor: '#e9e9e9',
    mapBorderColor: '#e9e9e9',
    mapBorderWidth: 1,
    zoom: 1.15,
    zoomMin: 1,
    zoomMax: 2.5,
    zoomable: true,
  });

  canvasEarth.addEventListener('ready', function () {
    // this.startAutoRotate();

    loadJSON(data => {
      var json = JSON.parse(data);
      var nodes = json.nodes;
      links = json.links;

      // add pins
      for (var i = 0; i < nodes.length; i++) {
        var marker = this.addOverlay({
          location: { lat: nodes[i]['lat'], lng: nodes[i]['lng'] },
          offset: 0,
          content: addMarkerContent(nodes[i]),
          depthScale: 0.4,
          visible: true,
          className: nodes[i].type,
        });

        markers.push(marker);
      }

      addConnections();
    });
  });
});

function addMarkerContent(node) {
  var html = '<span style="background-image: url(' + node.img + ')">';

  switch (node.type) {
    case 'campaign':
      html += '<span class="caption">' + node.name + '</span>';
      break;
    case 'cause':
      html +=
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="13px" height="13px" viewBox="0 0 13 13" version="1.1" class="tick"><defs><linearGradient x1="1.61706877" y1="1.57244647" x2="0.183432117" y2="0.296804816" id="gradient_1"><stop offset="0" stop-color="#07F7FF"/><stop offset="1" stop-color="#0F69DC"/></linearGradient></defs><path d="M5.26303 12.5947L6.16521 12.1915C6.28319 12.1387 6.41812 12.1387 6.5361 12.1915L7.43829 12.5947C7.83064 12.77 8.29247 12.6466 8.5444 12.2989L9.12367 11.4996C9.19942 11.3951 9.31627 11.3278 9.44486 11.3146L10.4282 11.2137C10.8559 11.1698 11.194 10.8324 11.238 10.4057L11.3391 9.42444C11.3523 9.29612 11.4198 9.17953 11.5245 9.10394L12.3256 8.52592C12.674 8.27454 12.7977 7.81371 12.622 7.4222L12.2179 6.52197C12.165 6.40424 12.165 6.26961 12.2179 6.15188L12.622 5.25165C12.7977 4.86014 12.674 4.39931 12.3256 4.14793L11.5245 3.56991C11.4198 3.49432 11.3523 3.37773 11.3391 3.24941L11.238 2.26817C11.194 1.84144 10.8559 1.50408 10.4282 1.46019L9.44486 1.35927C9.31627 1.34607 9.19942 1.27876 9.12367 1.17423L8.5444 0.374915C8.29247 0.0272955 7.83064 -0.0961842 7.43829 0.0791739L6.5361 0.482392C6.41812 0.535122 6.28319 0.535122 6.16521 0.482392L5.26303 0.0791739C4.87067 -0.0961842 4.40884 0.0272955 4.15692 0.374915L3.57765 1.17423C3.50189 1.27876 3.38505 1.34607 3.25645 1.35927L2.27309 1.46019C1.84543 1.50408 1.50734 1.84144 1.46336 2.26817L1.36222 3.24941C1.34899 3.37773 1.28153 3.49432 1.17677 3.56991L0.375727 4.14793C0.0273547 4.39931 -0.0963926 4.86014 0.0793454 5.25165L0.483437 6.15188C0.536282 6.26961 0.536282 6.40424 0.483437 6.52197L0.0793454 7.4222C-0.0963926 7.81371 0.0273547 8.27454 0.375727 8.52592L1.17677 9.10394C1.28153 9.17953 1.34899 9.29612 1.36222 9.42444L1.46336 10.4057C1.50734 10.8324 1.84543 11.1698 2.27309 11.2137L3.25645 11.3146C3.38505 11.3278 3.50189 11.3951 3.57765 11.4996L4.15692 12.2989C4.40884 12.6466 4.87067 12.77 5.26303 12.5947ZM3.1297 6.24882L3.89959 5.4806L5.71422 7.29131L8.91174 4.10071L9.68163 4.86893L5.71422 8.82775L3.1297 6.24882Z" id="Shape" fill-rule="evenodd" stroke="none" fill="url(#gradient_1)"/></svg>';
      break;
    case 'audit':
    default:
  }

  if ('evidence' in node) {
    for (var i = 0; i < node.evidence.length; i++) {
      html +=
        '<span class="evidence" style="background-image: url(' +
        node.evidence[i] +
        ');"></span>';
    }
  }

  html += '</span>';

  return html;
}

var markers = [];
var links = [];

function addConnections() {
  for (var i = 0; i < links.length; i++) {
    var distance = Earth.getDistance(
      markers[links[i]['source']].location,
      markers[links[i]['target']].location,
    );

    var flightScale = 1;

    if (distance < 3000) {
      flightScale = 0.6 + (flightScale / 3000) * 0.4;
    }

    var midPoint = middlePoint(
      markers[links[i]['source']].location,
      markers[links[i]['target']].location,
    );

    var offsetAmt = 0;
    var meshes = {
      love: ['heart', '#FE4949'],
      xcv: ['heart', '#0E73DE'],
    };
    var lineOpts = {
      love: {
        dashed: true,
        dashSize: 0.05,
        dashRatio: 0.3,
        color: '#0F69DC',
      },
      xcv: { color: '#0C97E7' },
      dona: { color: '#2BA745' },
      evid: { color: '#2BA745' },
    };

    for (var key in links[i]) {
      if (key == 'source' || key == 'target') {
        continue;
      }

      if (key in meshes) {
        canvasEarth.addMarker({
          mesh: meshes[key][0],
          color: meshes[key][1],
          location: midPoint,
          scale: 0.1,
          offset: flightScale * 0.75 + 0.1 + offsetAmt,
          lookAt: Earth.lerp(
            markers[links[i]['source']].location,
            markers[links[i]['target']].location,
            1.0001,
          ),
          hotspot: false,
          transparent: true,
        });
      }

      var options = {
        locations: [
          markers[links[i]['source']].location,
          markers[links[i]['target']].location,
        ],
        width: 0.3,
        offsetFlow: flightScale + offsetAmt,
        alwaysBehind: true,
      };

      if (key in lineOpts) {
        for (var lKey in lineOpts[key]) {
          options[lKey] = lineOpts[key][lKey];
        }
      }

      canvasEarth.addLine(options);

      if (
        key !== 'evid' &&
        key in links[i] &&
        (typeof links[i][key] === 'string' || typeof links[i][key] === 'number')
      ) {
        canvasEarth.addOverlay({
          location: midPoint,
          offset: flightScale * 0.75 + 0.1 + offsetAmt,
          content:
            '<span class="' + key + '-label">' + links[i][key] + '</span>',
          depthScale: 0.4,
          visible: true,
        });
      }

      offsetAmt += 0.7;
    }
  }
}

function resizeCanvas() {
  var width = document.body.getBoundingClientRect().width;
  var height = window.innerHeight;
  document.getElementById('CanvasContainer').style.width =
    Math.min(width, height) + 'px';
}

function middlePoint(location1, location2) {
  var lat1 = location1.lat;
  var lng1 = location1.lng;
  var lat2 = location2.lat;
  var lng2 = location2.lng;
  var dLng = THREE.Math.degToRad(lng2 - lng1);

  lat1 = THREE.Math.degToRad(lat1);
  lat2 = THREE.Math.degToRad(lat2);
  lng1 = THREE.Math.degToRad(lng1);

  var bX = Math.cos(lat2) * Math.cos(dLng);
  var bY = Math.cos(lat2) * Math.sin(dLng);
  var lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY),
  );
  var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

  return { lat: THREE.Math.radToDeg(lat3), lng: THREE.Math.radToDeg(lng3) };
}

function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', './assets/data/dummyReach.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}
