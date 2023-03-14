const Store = require("../models/store");
exports.createStore = async (req, res) => {
  try {
    const temp = req.body.coordinates.split(",");
    const coordinates = {
      latitude: temp[1],
      longitude: temp[0],
    };
    req.body.coordinates = coordinates;
    req.body.counterpartID = req.counterpartID;
    const store = new Store(req.body);
    await store.save();
    res
      .status(201)
      .send({ success: true, message: "Store created successfully" });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({ counterpartID: req.counterpartID });
    res.status(200).send({
      success: true,
      message: "Get all stores successfully",
      stores,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { _id, ...body } = req.body;
    const isUpdateCoordinates = req.body.coordinates;
    if (isUpdateCoordinates.includes(",")) {
      const temp = req.body.coordinates.split(",");
      console.log(temp);
      const coordinates = {
        longitude: temp[0],
        latitude: temp[1],
      };
      body.coordinates = coordinates;
    }
    await Store.find({
      $and: [{ ownerID: req.user._id }, { _id: req.body._id }],
    }).updateOne(body);
    res.status(200).send({
      success: true,
      message: "Update a store successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      $and: [{ _id: req.params.id }, { ownerID: req.user._id }],
    });
    res.status(200).send({
      success: true,
      message: "Get a store successfully",
      store,
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

exports.deteleStore = async (req, res) => {
  try {
    await Store.find({
      $and: [{ counterpartID: req.counterpartID }, { _id: req.params.id }],
    }).deleteOne();
    res.status(200).send({
      success: true,
      message: "Delete a store successfully",
    });
  } catch (e) {
    res.status(400).send({ success: false, message: e.message });
  }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

exports.getStoreNearBy = async (req, res) => {
  try {
    console.log(req.body);
    const { longitude, latitude } = req.body;
    console.log(latitude, longitude);
    const stores = await Store.find();
    const result = stores.filter((store) => {
      const { latitude: lat, longitude: long } = store.coordinates;
      const distance = getDistanceFromLatLonInKm(
        lat,
        long,
        latitude,
        longitude
      );
      return distance <= 1000;
    });
    res.status(200).send({
      success: true,
      message: "Get stores near by successfully",
      result,
    });
  } catch (e) {
    console.log(e)
    res.status(400).send({ success: false, message: e.message });
  }
};
