const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://shubham:test123@cluster0.hsnfi.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});


const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Check for date upwards",
});

const item2 = new Item({
  name: "Add thing below",
});

const item3 = new Item({
  name: "check the check box",
});

const defaultItems = [item1, item2, item3];


// list schema
const listSchema = {
  name: String,
  items: [itemsSchema],
}

const List = mongoose.model("List", listSchema);
app.get("/", (req, res)=> {
  Item.find({}, (err, foundItems)=>{
    // here we get array so length can be measured
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err)=> {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully inserted");
        }
      });
      res.redirect("/");
    } else{
      res.render("list", { listTitle: "TODAY", newItem: foundItems});
    }
  });
});

app.get("/:customListName", (req, res)=>{
  const customListName = _.capitalize(req.params.customListName); // if our route is home page then params gives home
  // here we get object
  List.findOne({name:customListName}, (err,foundList)=>{
    if(!err){
      if(!foundList){
        // create an new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", { listTitle: foundList.name, newItem: foundList.items});
      }
    }else{
      console.log(err);
    }
  });
});

app.post("/", (req, res)=> {
  const itemName = req.body.tasks;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if(listName === "TODAY"){
  item.save();  // Mongoose short-cut to save item document in our database
  res.redirect("/");
  }else{
    List.findOne({name:listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

// delete post request response
app.post("/delete", (req, res)=>{
  const removeElemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "TODAY"){
    Item.findByIdAndRemove(removeElemID,(err)=>{
      if(!err){
        console.log("deleted Succesfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:removeElemID}}}, (err,foundList)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", (req, res)=> {
  res.render("list", { listTitle: "Work List", newItem: foundItems});
});

app.listen(3000, ()=> {
  console.log("server is ready");
});
