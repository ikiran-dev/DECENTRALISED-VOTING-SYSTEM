window.onload = function () {
  render();
};
function render() {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "recaptcha-container"
  );
  recaptchaVerifier.render();
}

/* var aadhaar_no_phone_no = {
  360611993348: "6363053425",
}; */
if (document.cookie == "login") {
  window.location.href = "voting.html";
} else {
  function phoneAuth() {
    document.getElementById("first").style.display = "none";
    document.getElementById("second").style.display = "block";

    //get the number

    var num = document.getElementById("number").value;
    var aadhaarValue = num;
    fetch("json/registration.json")
      .then((response) => response.json())
      .then((data) => {
        // Find the object with the matching Aadhaar number
        const matchingData = data.find((obj) => obj.aadhaar === aadhaarValue);

        if (matchingData) {
          // Display the mobile number for the matching object
          const number = matchingData.number;
          console.log(number);
          var phoneNumber = "+91" + number;
          //phone number authentication function of firebase
          //it takes two parameter first one is number,,,second one is recaptcha
          console.log(phoneNumber);
          firebase
            .auth()
            .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then(function (confirmationResult) {
              //s is in lowercase
              window.confirmationResult = confirmationResult;
              coderesult = confirmationResult;
              console.log(coderesult);
              alert("Message sent");
            })
            .catch(function (error) {
              alert(error.message);
            });
        } else {
          // Display an error message if no matching object was found
          alert("Aadhaar number not found");
        }
      })
      .catch((error) => {
        // Display an error message if there was a problem reading the file
        resultDiv.innerText = "Error reading data file";
      });
  }

  function createCookie(value, minutes) {
    if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + minutes * 60 * 1000);
      var expires = "; expires=" + date.toGMTString();
    } else {
      var expires = "";
    }
    document.cookie = value + expires + "; path=/";
  }
  function codeverify() {
    var code = document.getElementById("verificationCode").value;
    coderesult
      .confirm(code)
      .then(function (result) {
        window.location.href = "voting.html";
        createCookie("login", 2);
        var user = result.user;
        console.log(user);
      })
      .catch(function (error) {
        alert(error.message);
      });
  }
  var input = document.getElementById("first");
  input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("send").click();
    }
  });
  var input = document.getElementById("second");
  input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("verify").click();
    }
  });
}
