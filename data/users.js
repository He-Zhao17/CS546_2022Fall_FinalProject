const mongoCollections = require("../config/mongoCollections");
const user = mongoCollections.user;
const bcrypt = require("bcryptjs");
const saltRounds = 16;
const helpers = require("../helper/helpers");

const createUser = async (email, password, isApplicant,firstname,lastname,gander,city,state,country,age,phone,address,website) => {
  if(!email||!password||!isApplicant||!firstname||!lastname){
    throw `Some of the input is empty`;
  }
  email = helpers.checkUserEmail(email);
  helpers.checkPassword(password);
  isApplicant = helpers.checkUserType(isApplicant);

  const userCollection = await user();
  const getUser = await userCollection.findOne({ email: email });
  if (getUser != null) {
    throw `Error: User already existed`;
  }
  const hash = await bcrypt.hash(password, saltRounds);

  let newUser = {
    email: email,
    hashedPassword: hash,
    type: isApplicant,
    firstname:firstname,
    lastname:lastname,
    gander:gander,
    city:city,
    state:state,
    country:country,
    age:age,
    phone:phone,
    address:address,
    website:website
  };

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Error: Creating User failed";
  const newId = insertInfo.insertedId.toString();
  return {
    userId: newId,
    userType: isApplicant,
  };
};

const checkUser = async (email, password) => {
  email = helpers.checkUserEmail(email);
  helpers.checkPassword(password);

  const userCollection = await user();
  const getUser = await userCollection.findOne({ email: email });
  if (getUser === null) {
    throw "Error: Either email or password is invalid";
  }

  comparePassword = await bcrypt.compare(password, getUser.hashedPassword);
  if (comparePassword) {
    return {
      userId: getUser._id.toString(),
      userType: getUser.type,
    };
  } else {
    throw "Error: Either email or password is invalid";
  }
};

module.exports = { createUser, checkUser };
