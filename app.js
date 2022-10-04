const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

var items = [];
var workItems = [];
var paraName;
var day;
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine","ejs");

mongoose.connect("mongodb+srv://admin-aaditya:Test123@cluster0.mucxjxy.mongodb.net/toDoListDB");

const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item",itemsSchema);

const one = new Item({
    name:"Welcome to your toDoList!",
})
const two = new Item({
    name:"Hit the + button to add a new item!",
})
const three = new Item({
    name:"<-- Hit this to delete an item",
})

const defaultItems = [one,two,three];

const listSchema = {
    name : String,
    items : [itemsSchema],
}

const List =  mongoose.model("List",listSchema);

app.get("/",function(req,res){
    var date = new Date();
    var options = {
        "weekday":"long",
        "day":"numeric",
        "month":"long",
        "year":"numeric",
    }
    day = date.toLocaleDateString("en-US",options);
    //finding all the items
    Item.find({},function(err,foundItems){
        //add the default items only when the array is empty to avoid repetition
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log("Error has occured");
                }
                else{
                    console.log("Added Default items");
                }
            });
            res.redirect("/");
        }

        if(err){
            console.log("Error");
        }
        else{
            // console.log(foundItems);
            res.render("list",{
                listTitle : day,
                newListItems: foundItems,
            })
            console.log("Successfully printed the items");

        }
    })
    
})

app.post("/",function(req,res){
    console.log(req.body);
    const toDo = req.body.newItem;
    const listName = req.body.list;
    const toDoItem = new Item({
        name:toDo,
    });
    console.log(day[0]);
    if(listName[0]===day[0]){
        toDoItem.save();
        items.push(toDo);
        
        res.redirect("/");
    } else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(toDoItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    
})

app.post("/delete",function(req,res){
    console.log(req.body.checkbox);
    const removeToDo = req.body.checkbox;
    const listName = req.body.listName;
    if(listName[0]===day[0]){
        Item.findByIdAndRemove(removeToDo,function(err){
            if(err){
                console.log("could not delete todo!");
            }
            else{
                console.log("Successfully deleted todo!");
                res.redirect("/");
            }
        })

    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{ _id:removeToDo }}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
    
})
    

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItems: workItems});
})


app.get("/:paraName",function(req,res){
    
    const listName = _.capitalize(req.params.paraName);
    List.findOne({name:listName},function(err,results){
        if(!err){
            if(!results){
                //create the list
                const list = new List({ 
                    name:listName,
                    items : defaultItems,   
                });
                list.save();    
                res.redirect("/" + listName);

                console.log("doesnt exist");
            }
            else{
                //show the existing list!
                console.log("exist!");  
                res.render("list",{
                    listTitle:results.name,
                    newListItems:results.items,
                })
            }
        }
        
    });
    

    

})

app.get("/about",function(req,res){
    res.render("about");
})


let port = process.env.PORT;
if(port==NULL || port==""){
    port == 3000;
}
app.listen(port,function(){
    console.log("Server is up and running at port 3000");
})