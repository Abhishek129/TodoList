const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash')

app.set('view engine', "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-abhishek:Test123@cluster0.d7v2nrv.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist !"
})

const item2 = new Item({
    name: "Hit the + button to add new Item."
})

const item3 = new Item({
    name: "<-- Hit this to delete an Item."
})
const defaultItems = [item1, item2, item3];

app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved item to default DB.");
                }
            })
            res.redirect("/");
        } else {
            res.render("list", { ListTitle: "Today", newListItems: foundItems });
        }
    });
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { ListTitle: foundList.name, newListItems: foundList.items });
            }
        }
    })

})
app.post('/', function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})

app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log("Error : Not deleted")
            } else {
                res.redirect("/");
            }
        });

    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }
});

app.get('/work', function (req, res) {
    res.render("list", { ListTitle: "Work List", newListItems: workItems });
});

app.post('/work', function (req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully.");
})