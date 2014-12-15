// Nook Harquail
// 

var express = require("express");
var logfmt = require("logfmt");
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded() ); // to support URL-encoded bodies
var http = require('http'); //the variable doesn't necessarily have to be named http
app.use(logfmt.requestLogger());

//the number of hue lights
var NUM_LIGHTS = 15;

//the ip address of the hue basestation.  dalights.cs.dartmouth.edu
var options = {
  host: '129.170.212.42',
  port: 80,
  path: '/api/newdeveloper/groups/0/action',
  method: 'PUT'
};



function lightsWithData(data){
	var request = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	    console.log('BODY: ' + chunk);
	  });
	});
	request.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	request.write(JSON.stringify(data));
	request.end();
}

app.post('/', function(req,res){
	
   var text = req.body.text;
   var token = req.body.token;
   var responded = false;
  
  if(token == process.env.SLACK_TOKEN){
    
    var affiliations = ['student','alum','faculty','other'];
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
         
  if(email == undefined){
  		res.send('/chimp FirstName LastName name@email.com affiliation.  Everything but email is optional.  Possible affiliations: student, faculty, alum, other');	
  }else{
        res.send(subscribeToMailchimp(firstName, lastName, email, affiliation));
  }
  
	
});


function subscribeToMailchimp(firstName, lastName, emailIn, affiliation){

    try {
        var api = new MailChimpAPI(process.env.MAILCHIMP_KEY, { version : '2.0' });
    } catch (error) {
        console.log(error.message);
    }
    
    var mailchimpRequest = {
        id: '7041ef63c4',
        email: { email: emailIn},
        double_optin: false,
        merge_vars: {
            EMAIL: emailIn,
            FNAME: firstName,
            LNAME: lastName
        }
    };
    
    api.call('lists', 'subscribe', mailchimpRequest, function (error, data) {
        if (error)
            console.log(error.message);
        else
            console.log(JSON.stringify(data)); // Do something with your data!
    });

    return (' name: ' + firstName + '|' + lastName + ' email: ' + emailIn + ' affiliation: ' +affiliation );


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
