const express = require("express");
const { user } = require("../config/mongoCollections");
const router = express.Router();
const data = require("../data");
const helpers = require("../helper/helpers");
const userData = data.users;
const appData = data.applications;
const jobData=data.jobposts;
const resumeData = data.resumes;

router
  .route("/jobmarket")
  .get(async (req, res) => {
    if (req.session.userType === true) {
      if (req.session.basicInfo === true) {
        try {
          let array = await jobData.getAllJobPost();

          req.session.searchArray = array;
          return res.render("jobMarket", {
            title: "Homepage",
            isHomepage: true,
            isApplicant: true,
            jobs: req.session.searchArray ,
          });
        } catch (error) {
          return res.render("jobMarket", {
            title: "Homepage",
            isHomepage: true,
            isApplicant: true,
            error: error,
          });
        }

      } else {
        res.render("applicantBasicInfo", {
          title: "Applicant Basic Info",
        });
      }
    } else {
      return res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
  })
  .post(async (req, res) => {
    if (req.session.userType === true) {
      if (req.session.basicInfo === true) {
        if (req.body.formid == "jobmarket-form") {
          try {
            req.session.searchinput = req.body.input;
            req.session.searchtype = req.body.type;
            helpers.checkEmpty(req.session.searchinput, "searchInput");
            helpers.checkEmpty(req.session.searchtype, "searchType");
            let array = await jobData.findjobs(
              req.session.searchinput,
              req.session.searchtype
            );
            req.session.searchArray = array;

        const resu = await resumeData.getResumesByApplicantId(req.session.userId);

         res.render("jobMarket",{
           jobs:req.session.searchArray,
           title: "Job Market",
         time: new Date().toUTCString(),
         isHomepage: true,
         isApplicant: true, 
         resumes: resu
         });
         for(let i =0;i<resu.length;i++){
          console.log(resu[i].resumeName);
         }
         console.log(req.session.searchArray)
        }catch (error) {
          res.render("jobMarket",{jobs:req.session.searchArray,title: "Homepage",
          time: new Date().toUTCString(),
          isHomepage: true,
          isApplicant: true,
          error:error}) 
        }
       }
       else if(req.body.formid=="jobpost-form"){
        try{
         let resume = await resumeData.getResumeByUserId(req.session.userId);
         console.log(resume)
         let array = await appData.createApplication(req.body.posterid,req.session.userId,resume._id.toString(),req.body.jobid);
         res.render("jobMarket",{jobs:req.session.searchArray,title: "Homepage",
          time: new Date().toUTCString(),
          isHomepage: true,
          isApplicant: true}) 
         console.log(req.body);
        }catch (error) {
          res.render("jobMarket",{jobs:req.session.searchArray,title: "Homepage",
          time: new Date().toUTCString(),
          isHomepage: true,
          isApplicant: true,
          error:error}) 
        }
       }
       else if(req.body.formid=="sort-form"){
        if(!req.session.searchArray ||!req.body.sorted){
          res.redirect("/applicant/jobmarket");
        }
        else{
        if(req.body.sorted=="LowHigh"){
        req.session.searchArray=helpers.sortedbysalrayformlowtohigh(req.session.searchArray);
        console.log(req.session.searchArray)
        res.render("jobMarket",{jobs:req.session.searchArray,title: "Homepage",
        time: new Date().toUTCString(),
        isHomepage: true,
        isApplicant: true});
        }
        else if(req.body.sorted=="HighLow"){
        req.session.searchArray=helpers.sortedbysalrayformhightolow(req.session.searchArray);
        console.log(req.session.searchArray)
        res.render("jobMarket",{jobs:req.session.searchArray,title: "Homepage",
        time: new Date().toUTCString(),
        isHomepage: true,
        isApplicant: true});
        }
      }
       }
    } else {
      res.render("applicantBasicInfo", {
        title: "Applicant Basic Info",
      });
    }
  } else {
    return res.status(403).render("forbiddenAccess", {
      title: "Forbidden Access",
      error: "Error: 403, You are NOT logged in yet!",
    });
  }
})
router
  .route("/addBasicInfo")
  .get(async (req, res) => {
    if (req.session.userType == true || req.session.userType == null) {
      res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
    if (req.session.basicInfo ==true) {
      res.redirect("/");
    }
  })
  .post(async (req, res) => {
    if (req.session.userType == false || req.session.userType == null) {
      res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
    if (req.session.basicInfo == true) {
      res.redirect("/");
    }
    try {
      let firstname = req.body.firstnameInput;
      let lastname = req.body.lastnameInput;
      let gender = req.body.genderInput;
      let age = req.body.ageInput;
      let city = req.body.cityInput;
      let state = req.body.stateInput;
      let country = req.body.countryInput;
      let phone = req.body.phoneInput;
      helpers.checkName(firstname);
      helpers.checkName(lastname);
      helpers.checkGender(gender);
      helpers.checkAge(age);
      helpers.checkPlace(city);
      helpers.checkPlace(state);
      helpers.checkPlace(country);
      helpers.checkPhone(phone);
    } catch (error) {
      return res.status(403).render("applicantBasicInfo", {
        title: "Applicant Basic Info",
        error: error,
      });
    }
    try {
      let firstname = req.body.firstnameInput;
      let lastname = req.body.lastnameInput;
      let gender = req.body.genderInput;
      let age = req.body.ageInput;
      let city = req.body.cityInput;
      let state = req.body.stateInput;
      let country = req.body.countryInput;
      let phone = req.body.phoneInput;
    
      const addInfo = await userData.addBasicInfo(
        req.session.userId,
        firstname,
        lastname,
        gender,
        age,
        city,
        state,
        country,
        phone
      );

      if (addInfo) {
        req.session.basicInfo = addInfo.basicInfo;
        res.redirect("/");
      } else {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      return res.status(403).render("applicantBasicInfo", {
        title: "Applicant Basic Info",
        error: error,
      });
    }
  });

  router.route("/profile").get(async (req, res) => {
    if (req.session.userType === true) {
      if (req.session.basicInfo === true) {
        let array=[];
        let user = await userData.getUserById(req.session.userId);
        user.Type="applicant"
        if (user.gender === 0) {
          user.gender = 'Male'
        }
        else if (user.gender === 1){
          user.gender = 'Female'
        }
        else {
          user.gender = 'Not to tell'
        }
        array.push(user);
        console.log(user)
        res.render("applicantProfile",{
          isHomepage: true,
          isApplicant: true,
          user:array,
          title: "profile",
        }) 
      } else {
        res.render("applicantBasicInfo", {
          title: "Applicant Basic Info",
        });
      }
    } else {
      return res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
  })
  router.route("/updateInfo").get(async (req, res) => {
    if (req.session.userType === true) {
      if (req.session.basicInfo === true) {
        let user = await userData.getUserById(req.session.userId);
        res.render("updateInfo",{
          isHomepage: true,
          isApplicant: true,
          user:user,
          title:"updateinfo"
        }) 
      } else {
        res.render("applicantBasicInfo", {
          title: "Applicant Basic Info",
        });
      }
    } else {
      return res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
  })
  .post(async (req, res) => {
    if (req.session.userType === true) {
      if (req.session.basicInfo === true) {
        try {
        let firstname = req.body.firstnameInput;
        let lastname = req.body.lastnameInput;
        let gender = req.body.genderInput;
        let age = req.body.ageInput;
        let city = req.body.cityInput;
        let state = req.body.stateInput;
        let country = req.body.countryInput;
        let phone = req.body.phoneInput;
        helpers.checkName(firstname);
        helpers.checkName(lastname);
        helpers.checkPlace(city);
        helpers.checkPlace(state);
        helpers.checkPlace(country);
        helpers.checkPhone(phone);
        helpers.checkAge(age);  
        const addInfo = await userData.addBasicInfo(
          req.session.userId,
          firstname,
          lastname,
          gender,
          age,
          city,
          state,
          country,
          phone
        );
        
        if (addInfo) {
          req.session.basicInfo = addInfo.basicInfo;
          res.redirect("/applicant/profile");
        } else {
          return res.status(500).json({ error: "Internal Server Error" });
        }
      }catch(e){
        let user = await userData.getUserById(req.session.userId);
        console.log(user)
        res.render("updateInfo",{
          error:e,
          isHomepage:true,
          isApplicant:true,
          user:user,
          title:"updateinfo"});
      }
      } else {
        res.render("applicantBasicInfo", {
          title: "Applicant Basic Info",
        });
      }
    } else {
      return res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
  })

router
  .route("/createResume")
  .get(async (req, res) => {
    if (req.session.userType != true) {
      return res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
    if (req.session.basicInfo != true) {
      res.render("applicantBasicInfo", {
        title: "Applicant Basic Info",
      });
    }
    res.render("createResume", {
      title: "Create Resume",
      isHomepage: true,
      isApplicant: true,
    });
  })
  .post(async (req, res) => {
    if (req.session.userType != true) {
      return res.status(403).render("forbiddenAccess", {
        title: "Forbidden Access",
        error: "Error: 403, You are NOT logged in yet!",
      });
    }
    if (req.session.basicInfo != true) {
      res.render("applicantBasicInfo", {
        title: "Applicant Basic Info",
      });
    }
    try {
      let resumeName = req.body.resumeNameInput;
      let firstname = req.body.firstnameInput;
      let lastname = req.body.lastnameInput;
      let email = req.body.emailInput;
      let gender = req.body.genderInput;
      let city = req.body.cityInput;
      let state = req.body.stateInput;
      let country = req.body.countryInput;
      let age = req.body.ageInput;
      let phone = req.body.phoneInput;
      let address = req.body.addrInput;
      let website = req.body.websiteInput;
      let skills = req.body.skills;
      let edu = req.body.Edu;
      let emp = req.body.Emp;
      let pro = req.body.Pro;

      helpers.checkEmpty(resumeName, "resumeName");
      helpers.checkName(firstname);
      helpers.checkName(lastname);
      helpers.checkUserEmail(email);
      helpers.checkGender(gender);
    
      helpers.checkPlace(city);
      helpers.checkPlace(state);
      helpers.checkPlace(country);

      helpers.checkAge(age);
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

      console.log(pro);
      pro.forEach(element => {
        helpers.checkEmpty(element.titleInput, "titleInput");
        helpers.checkEmpty(element.roleInput, "roleInput");
        helpers.checkEmpty(element.descriptionInput, "descriptionInput");
      });

      const createInfo = await resumeData.createResume(
        req.session.userId,
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
      );

    if (createInfo) {
      res.redirect("/applicant/reviewResumes");
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (e) {
    res.render("createResume", {
      isHomepage: true,
      isApplicant: true, 
      error: e });
  }
});

router.route("/updatePassword").get(async (req, res) => {
  if (req.session.userType === true) {
    if (req.session.basicInfo === true) {
      return res.render("updatePassword", {
        title: "Homepage",
        time: new Date().toUTCString(),
        isHomepage: true,
        isApplicant: true,
        title: "Update password"
      });
    } else {
      res.render("applicantBasicInfo", {
        title: "Applicant Basic Info",
      });
    }
  } else {
    return res.status(403).render("forbiddenAccess", {
      title: "Forbidden Access",
      error: "Error: 403, You are NOT logged in yet!",
    });
  }
})
.post(async (req, res) => {
  try {
  helpers.checkPassword(req.body.NewpasswordInput);
  helpers.checkPassword(req.body.passwordInputFirst);
  helpers.checkPassword(req.body.passwordInputSecond);
  const updatepassword = await userData.UpdatePassword(req.body.passwordInputFirst,req.body.passwordInputSecond,req.body.NewpasswordInput,req.session.userId)
  res.redirect("/applicant/profile");
  }catch(error){
    return res.render("updatePassword", {
      title: "Homepage",
      time: new Date().toUTCString(),
      isHomepage: true,
      isApplicant: true,
      error:error,
      title: "User profile"
    });
  }
})

router.route("/applied").get(async (req, res) => {
  if (req.session.userType != true) {
    return res.status(403).render("forbiddenAccess", {
      title: "Forbidden Access",
      error: "Error: 403, You are NOT logged in yet!",
    });
  }
  if (req.session.basicInfo != true) {
    res.render("applicantBasicInfo", {
      title: "Applicant Basic Info",
    });
  }
  try {
    let applied = await appData.getAllApplied(req.session.userId);
    if (!applied) { return res.status(500).json({ error: "Internal Server Error" }); }
    res.render("applied", {
      title: "Applied Jobs",
      isHomepage: true,
      isApplicant: true,
      applications: applied
    });
  } catch (e) {
    res.render("applied", {
      error: e,
      title: "Applied Jobs",
      isHomepage: true,
      isApplicant: true,
    });
  }
});

router.route("/reviewResumes").get(async (req, res) => {
  if (req.session.userType != true) {
    return res.status(403).render("forbiddenAccess", {
      title: "Forbidden Access",
      error: "Error: 403, You are NOT logged in yet!",
    });
  }
  if (req.session.basicInfo != true) {
    res.render("applicantBasicInfo", {
      title: "Applicant Basic Info",
    });
  }
  try {
    let resumes = await resumeData.getAllresumes(req.session.userId);
    console.log(resumes);
    if (!resumes) { return res.status(500).json({ error: "Internal Server Error" }); }
    res.render("reviewResumes", {
      title: "Review Resumes",
      isHomepage: true,
      isApplicant: true,
      resumes: resumes,
    });
  } catch (error) {
    res.render("reviewResumes", { error: e });
  }
});

router.route("/readResume/:id").get(async (req, res) => {
  if (req.session.userType != true) {
    return res.status(403).render("forbiddenAccess", {
      title: "Forbidden Access",
      error: "Error: 403, You are NOT logged in yet!",
    });
  }
  if (req.session.basicInfo != true) {
    res.render("applicantBasicInfo", {
      title: "Applicant Basic Info",
    });
  }
  try {
    let resume = await resumeData.getResumeById(req.params.id);
    if (!resume) { return res.status(500).json({ error: "Internal Server Error" }); }
    console.log(resume);
    res.render("reviewOneResume", {
      title: "Review Resumes",
      isHomepage: true,
      isApplicant: true,
      resume: resume,
    });
  } catch (error) {
    res.render("reviewResumes", { error: error });
  }
});

router.route("/deleteResume/:id").get(async (req, res) => {
  if (req.session.userType != true) {
    return res.status(403).render("forbiddenAccess", {
      title: "Forbidden Access",
      error: "Error: 403, You are NOT logged in yet!",
    });
  }
  if (req.session.basicInfo != true) {
    res.render("applicantBasicInfo", {
      title: "Applicant Basic Info",
    });
  }
  try {
    let result = await resumeData.deleteResume(req.params.id);
    console.log(result);
    if (!result) { return res.status(500).json({ error: "Internal Server Error" }); }
    res.redirect("/applicant/reviewResumes");
  } catch (e) {
    res.redirect("/applicant/reviewResumes");
  }
});



module.exports = router;
