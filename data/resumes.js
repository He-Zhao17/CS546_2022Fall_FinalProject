const mongoCollections = require("../config/mongoCollections");
const resume = mongoCollections.resume;
const helpers = require("../helper/helpers");
const { ObjectId } = require("mongodb");

const createResume = async (      
    creatorId,
    resumeName,
    firstname,
    lastname,
    email,
    gender,
    city,
    state,
    country,
    age,
    phone,
    address,
    website,
    skills,
    edu,
    emp,
    pro) => {
  creatorId = helpers.checkId(creatorId);
  helpers.checkEmpty(resumeName, "resumeName");
  helpers.checkName(firstname);
  helpers.checkName(lastname);
  helpers.checkUserEmail(email);
  gender = helpers.checkGender(gender);
  helpers.checkPlace(city);
  helpers.checkPlace(state);
  helpers.checkPlace(country);
  age = helpers.checkAge(age);
  phone = helpers.checkPhone(phone);
  address = helpers.checkPlace(address);

  edu.forEach(element => {
    helpers.checkEmpty(element.schoolInput, "schoolInput");
    helpers.checkEmpty(element.startDateInput, "startDateInput");
    helpers.checkEmpty(element.gpaInput, "gpaInput");
    helpers.checkEmpty(element.degreeInput, "degreeInput");
    helpers.checkEmpty(element.majorInput, "majorInput");
    helpers.checkEmpty(element.countryInput, "countryInput");
    helpers.checkEmpty(element.stateInput, "stateInput");
    helpers.checkEmpty(element.cityInput, "cityInput");
    helpers.checkEmpty(element.descriptionInput, "descriptionInput");
  });

  emp.forEach(element => {
    helpers.checkEmpty(element.employerInput, "employerInput");
    helpers.checkEmpty(element.jobTitleInput, "jobTitleInput");
    helpers.checkEmpty(element.startDateInput, "startDateInput");
    helpers.checkEmpty(element.countryInput, "countryInput");
    helpers.checkEmpty(element.stateInput, "stateInput");
    helpers.checkEmpty(element.cityInput, "cityInput");
    helpers.checkEmpty(element.descriptionInput, "descriptionInput");
  });

  pro.forEach(element => {
    helpers.checkEmpty(element.titleInput, "titleInput");
    helpers.checkEmpty(element.roleInput, "roleInput");
    helpers.checkEmpty(element.descriptionInput, "descriptionInput");
  });

  if(gender==0){
    gender="Male";
  }
  else if(gender==1){
    gender="Female";
  }
  else{
    gender="Not to tell";
  }
  let newResume = {
    creatorId: creatorId,
    resumeName: resumeName,
    firstName: firstname,
    lastName: lastname,
    email: email,
    gender: gender,
    city: city,
    state: state,
    country: country,
    age: age,
    phone: phone,
    address: address,
    website: website,
    skills: skills,
    edu: edu,
    emp: emp,
    pro: pro
  };

  const resumeCollection = await resume();
  const insertInfo = await resumeCollection.insertOne(newResume);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Error: Creating Resume failed";
  return true;
};

const getAllresumes = async (applicantId) => {
    helpers.checkId(applicantId);
    const resumeCollection = await resume();
    const resumeList = await resumeCollection.find({}).toArray();
    if (!resumeList) throw "Error: Getting all resumes failed";

    let output = [];
    for (const resume of resumeList) {
        resume._id = resume._id.toString();
        resume.creatorId = resume.creatorId.toString();
        if (resume.creatorId === applicantId) {
            let resumeObj = {
                _id: resume._id,
                resumeName: resume.resumeName,
            };
            output.push(resumeObj);
        }
    }
    return output;
}
// this does not get all the resume by user, only one !!
const getResumeByUserId = async (UserId) => {
    const resumeCollection = await resume();
    const resumes = await resumeCollection.find({}).toArray();
    for(let i=0;i<resumes.length;i++){
        if(UserId==resumes[i].creatorId){
            return resumes[i];
        }
    }
    throw"this applicant has no resume";
}

const getResumesByApplicantId = async (applicantId) => {
    const resumeCollection = await resume();
    const resumes = await resumeCollection.find({creatorId : applicantId}).toArray();
    if (!resumes) {
        throw "Cannot get the resumes by applicant Id";
    }
    for (var i = 0; i < resumes.length; i++) {
        resumes[i]._id = resumes[i]._id.toString();
    }
    return resumes;
}



const getResumeById = async (resumeId) => {
    resumeId = helpers.checkId(resumeId);
    const resumeCollection = await resume();
    const getResume = await resumeCollection.findOne({ _id: ObjectId(resumeId) });
    if (getResume === null) {
      throw `Error: Resume ${resumeId} Not Found`;
    }
    getResume._id = getResume._id.toString();
    return getResume;
}

const updateResume = async (
    resumeId,
    resumeName,
    firstname,
    lastname,
    email,
    gender,
    city,
    state,
    country,
    age,
    phone,
    address,
    website,
    skills,
    edu,
    emp,
    pro
    ) => {
    creatorId = helpers.checkId(creatorId);
    helpers.checkName(firstname);
    helpers.checkName(lastname);
    helpers.checkUserEmail(email);
    gender = helpers.checkGender(gender);
    helpers.checkPlace(city);
    helpers.checkPlace(state);
    helpers.checkPlace(country);
    age = helpers.checkAge(age);
    phone = helpers.checkPhone(phone);
    address = helpers.checkPlace(address);

    let updatedResume = await getResumeById(resumeId);
    updatedResume._id = ObjectId(updatedResume._id);
    updatedResume.creatorId = updatedResume.creatorId;
    updatedResume.resumeName = resumeName;
    updatedResume.firstName = firstname;
    updatedResume.lastName = lastname;
    updatedResume.email = email;
    updatedResume.gender = gender;
    updatedResume.city = city;
    updatedResume.state = state;
    updatedResume.country = country;
    updatedResume.age = age;
    updatedResume.phone = phone;
    updatedResume.address = address;
    updatedResume.website = website;
    updatedResume.skills = skills;
    updatedResume.edu = edu;
    updatedResume.emp = emp;
    updatedResume.pro = pro;

    const resumeCollection = await resume();
    const updateInfo = await resumeCollection.updateOne(
        { _id: ObjectId(resumeId) },
        { $set: updatedResume }
    );
    if (updateInfo.modifiedCounut === 0) {
        throw "Error: Updating resume failed";
    }

    return true;
}

const deleteResume = async (resumeId) => {
    resumeId = helpers.checkId(resumeId);
    const resumeCollection = await resume();
    const deletionInfo = await resumeCollection.deleteOne({
        _id: ObjectId(resumeId),
    });
    if (deletionInfo.deletedCount === 0) {
        throw `Deleting resume with id of ${resumeId} failed`;
    }
    return true;
}

module.exports = {
    createResume,
    getAllresumes,
    getResumeById,
    deleteResume,
    updateResume,
    getResumeByUserId,
    getResumesByApplicantId
}