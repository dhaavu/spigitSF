var axios =  require("axios");
var express = require("express");
var app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", async function (req, res) {
  
  try
  {
      // get the auth token from Spigit - valid only for 10 minutes 

        var url = "https://cummins.spigit.com/oauth/token";
        var response= {}; 
       
        var responseToken = await axios({
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }, 
            params: {
            "grant_type": "authorization_code",
            "code": "9asQjX9U",
            "client_id": "NS7LzwGQ9P7c",
            "client_secret": "rn3w4D71saq45IWOYSWTYtITFSitxVTvxpCJ9JutmOw4Dbg4",
            }, 
            url
        });

        response.accessToken = responseToken.data.access_token; 
        
        // Get the List of Ideas 

        url = "https://cummins.spigit.com/api/v1/communities/629/ideas"; 
        var ideaList = await axios({
            url, 
            headers:{
                "Content-Type": "application/x-www-form-urlencoded", 
                "Authorization": "Bearer "+ response.accessToken
            }, 
            params: {
                "limit": 100
            }
        })

        response.ideaList = ideaList.data; 

       
        // for each idea in the list get the stats and details of the idea
        var ideaList = []; 
        response.ideaList.final = []; 
       // response.ideaList.content.forEach(async (element, index) => {
        for (const element of response.ideaList.content) {
          //  console.log("Idea: "); 
          //  console.log(element); 
            var idea= {}; 
            idea.id = element.id; 
            idea.title = element.title; 
            idea.creatorDisplayName = element.creator_display_name; 
            idea.totatVotes = element.total_votes; 
            idea.createdDate = element.created_date; 
            idea.url = "https://cummins.spigit.com/itinnovation374/Page/ViewIdea?ideaid=" + element.id; 
           
            // Get idea details 

            var ideaDetails = await axios({
                "url": "https://cummins.spigit.com/api/v1/ideas/" + idea.id, 
                "method": "GET", 
                "headers": {
                    "authorization" : "Bearer " + response.accessToken
                }   
            })
            
            // console.log("Details *****************"); 
            // console.log(ideaDetails); 
            // console.log("*******************"); 

            
            idea.content = ideaDetails.data.content; 
            
            // get Idea Stats 

            var ideaStats = await axios({
                "url": "https://cummins.spigit.com/api/v1/ideas/"+ idea.id + "/stats",
                "method": "GET", 
                "headers": {
                    "authorization": "Bearer " + response.accessToken
                } 
            }); 

            // console.log("Stats *****************"); 
            // console.log(ideaStats); 
            // console.log("*******************");

            idea.category = ideaStats.data.category_name; 
            idea.stage = ideaStats.data.stage_name; 
            //idea.commemnts = ideaStats.data.comment_thread_num; 
            var ideaComments = await axios({
                "url": "https://cummins.spigit.com/api/v1/ideas/" + idea.id + "/comments?offset=0&sort=CREATED_DATE&answer_status=all",
                "method": "GET", 
                "headers": {
                    "authorization": "Bearer " + response.accessToken
                } 
            }); 
            console.log(ideaComments.data.total_count); 
            idea.comments = ideaComments.data.total_count; 

            response.ideaList.final.push(idea); 

          //  console.log(index + " | " + idea.id + " | " + idea.title); 

        }
       // console.log(response.ideaList.final); 
   } 
   catch(e){
       //console.log(e); 
       res.render("home", {response: e});
   } 
   finally{

   }
  
   //console.log(JSON.stringify(response))
  res.render("home", {response: response});
});
app.listen(process.env.PORT || 4000, function (err) {
  console.log("server started on port 4000");
});
