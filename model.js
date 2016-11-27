function Model() {
    this.accelerometer = {
        x: ko.observable(0.0),
        y: ko.observable(0.0),
        z: ko.observable(0.0)
    };

    this.location = {
        latitude: ko.observable(51.521732),
        longitude: ko.observable(-0.134491)
    };
}

var TransitStop = class {
    constructor(code, description, position) {
        this.code = code;
        this.description = description;
        this.position = position;
    }
};

var PLine = class {
    constructor(trip, coords) {
        this.trip = trip;
        this.coords = coords;
    }
};