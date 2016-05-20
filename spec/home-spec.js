var request = require('request');
var app = require("../app.js")

describe("home", function(){

 it("should respond with hello world", function(done) {
   request.get("http://localhost:3000/", function(error, response, body){
     expect(response.statusCode).toEqual(200);
     done();
   });
  });

});
