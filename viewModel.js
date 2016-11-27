function ViewModel() {

    var that = this, timerHandle;

    // ------ properties
    this.model = new Model();
    this.isPlaying = ko.observable(false);
    this.isLoaded = ko.observable();
    this.locations = ko.observableArray();
    this.currentLocation = ko.observable();
    this.dataFile = ko.observable();
    this.coordinateData = [];

    // expose the model as a JSON property
    this.serializedModel = ko.computed(function () {
        return ko.toJSON(this.model);
    }, this);

    // ------  functions
    this.stop = function () {
        clearInterval(timerHandle);
        that.isPlaying(false);
    };


    this.removeAll = function () {
        that.locations.removeAll();
        that.coordinateData.removeAll();
    };

    this.playData = function (coordinates) {

    };

    this.plotData = function () {
        addDataPins(this.coordinateData);
        plotPath(this.coordinateData);
    };


    this.play = function() {
        var time = 0;
        this.isPlaying(true);
        timerHandle = setInterval(function() {
            var locationCount = that.locations().length - 1;
            var index = Math.floor(locationCount * time);
            var leftLocation = that.locations()[index];
            var rightLocation = that.locations()[index + 1];
            var fraction = (time * locationCount - index);

            that.currentLocation(google.maps.geometry.spherical.interpolate(leftLocation, rightLocation, fraction));

            time += 0.01;
            if (time>=1.0) {
                clearInterval(timerHandle);
                that.isPlaying(false);
            }
        }, 100);
    };

    this.parseJson = function(json) {
        if(/TripStops/.test(json)) {
            this.parseTripResponse(json);
        }
    };

    this.parseTripResponse = function(json) {
        try {
            var tripResponseObj = JSON.parse(json);
        }
        catch(e) {
            if (e instanceof SyntaxError) {
                alert(`Bad JSON ${SyntaxError}`);
            }else {
                alert("Error (undefined)");
            }
        }
        if(tripResponseObj) {
            var tripStops = tripResponseObj.TripStops;
            var polyLine = tripResponseObj.Polyline;

            tripStops.forEach(function(ts) {
                var ts = new TransitStop();
            });
        }
    };

    this.parseTxt = function(text) {
        alert("NOT JSON");
    };

    this.loadFileData = function () {
        if (document.querySelector('input').files[0]) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                if (e.target.error || !e.target.result) {
                    alert(`Houston, we have a problem: ${e.target.error}`);
                }else {
                    var raw = e.target.result;
                    if (/".*: "/.test(raw)) {
                        that.parseJson(raw);
                    }else {
                        that.parseTxt(raw);
                    }
                }
            };

            reader.onload = function (e) {
                var contents = e.target.result;
                contents = contents.replace(/\s/g, '');
                var coordinates = contents.split(';');

                coordinates.forEach(function (item) {
                    var str = item.split(',');
                    var glatlng = new google.maps.LatLng(parseFloat(str[0]), parseFloat(str[1]));
                    that.coordinateData.push(glatlng);
                });
                that.isLoaded(true);
            };
            reader.readAsText(document.querySelector('input').files[0]);
        } else {
            alert("Failed to load file");
        }

    };

    // update the model when the currentLocation property changes
    this.currentLocation.subscribe(function (currentLocation) {
        this.model.location.latitude(currentLocation.lat());
        this.model.location.longitude(currentLocation.lng());
    }, this);

    // when the model changes, send thew new data, throttled at 200ms
    this.serializedModel.throttle(200, true).subscribe(function (newValue) {
        console.log(newValue);
        var request = new XMLHttpRequest();
        request.open('POST', '/update', true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(newValue);
    })
}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);