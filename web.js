// Nook Harquail
// 

var express = require("express");
var logfmt = require("logfmt");
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var app = express();
var bodyParser = require('body-parser')
  app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({ extended: true }) ); // to support URL-encoded bodies
var http = require('http'); //the variable doesn't necessarily have to be named http
app.use(logfmt.requestLogger());

var affiliations = ['student','alum','faculty','other'];

app.post('/', function(req,res){
	
  var text = req.body.text;
  var token = req.body.token;
  var responded = false;
  
  if(token == process.env.SLACK_TOKEN){
    
    var textArray = text.split(" ");
    var startLength = textArray.length;
    var firstName;
    var lastName;
    var email;
    var affiliation;
    
    var potentialAffiliation = textArray.pop();
    
    //if it is not an affiliation, assume the last element was an email
    if (affiliations.indexOf(potentialAffiliation) == -1){
      email = potentialAffiliation
    }
    else{
      affiliation = potentialAffiliation
      email = textArray.pop();
    }
    
    lastName = textArray.pop();
    
    //if there is anything left, concat it to create the first name
    if(textArray.length > 0){
      firstName = '';
      for (var i = 0; i < textArray.length; ++i) {
        firstName = firstName + ' ' +  textArray[i];
      }   
    }
    else{
      firstName = lastName;
      lastName = undefined;
         
    }
  }
         
  if(email == ''){
    res.send('/chimp FirstName LastName name@email.com affiliation.  Everything but email is optional.  Possible affiliations: student, faculty, alum, other');	
  }else{
    subscribeToMailchimp(firstName, lastName, email, affiliation,res);
  }
  
	
});


function subscribeToMailchimp(firstName, lastName, emailIn, affiliation,res){
  try {
    var api = new MailChimpAPI(process.env.MAILCHIMP_KEY, { version : '2.0' });
  } catch (error) {
    console.log(error.message);
  }
  var apiAffiliation = "Students";
  switch (affiliation){
    //var affiliations = ['student','alum','faculty','other'];
  case  affiliations[0]:
    //student
    apiAffiliation = "Students"
    break;
  case  affiliations[1]:
    //alum
    apiAffiliation = "Alumni"
    break;
  case  affiliations[2]:
    //faculty
    apiAffiliation = "Faculty/Staff"
    break;
  case  affiliations[3]:
    //other
    apiAffiliation = "Other"
    break;
            
  }
    
    
  var mailchimpRequest = {
    id: '7041ef63c4',
    email: { email: emailIn},
    double_optin: false,
    merge_vars: {
      EMAIL: emailIn,
      FNAME: firstName,
      LNAME: lastName,
      groupings:[ {id: '11485', groups: [apiAffiliation] }]
    }
  };

  if(!firstName){
    firstName = '';
  }
  if(!lastName){
    lastName = '';
  }
  api.call('lists', 'subscribe', mailchimpRequest, function (error, data) {
    if (error){
      res.send(error.message);
    }
    else{
      res.send('Subscribed ' + firstName + '|' + lastName + ' {' + emailIn +'} ' +' in group: ' +apiAffiliation );
    }
  });
}

//removes the last item from an array and returns it
function lastItemByRemovingFromArray(ray){
  var index = textArray.length - 1;
  var last_element = ray[index];
  ray = ray.splice(index, 1);
  return last_element;
}

app.get('/', function(req, res) {
  res.send('Hello World!');
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
