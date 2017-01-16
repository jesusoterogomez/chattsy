var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];
var server = http;
var mongodb = require('mongodb');

var mongourl = '...';
, MongoClient = mongodb.MongoClient

app.use(express.cookieParser());
app.use(express.session({secret: 'test'}));

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.sendFile('index.html')
})

http.listen(app.get('port'), function() {
    console.log('listening on '+ app.get('port'));
});

io.on('connection', function(socket) {
    console.log('user '+socket.id+' connected');

    /*USER REGISTER*/
    socket.on('user register', function(data){

        var doc = {
            uid: data.uid,
            name: data.name,
            email: data.email,
            pw: data.pw
        };

        dbinsert('users',doc);
    });

    /*USER LOGIN*/

    socket.on('user login', function(data){
        console.log(data);

        MongoClient.connect(mongourl, function(err, db) {

            var collection = db.collection('users')
            var query = '';
            query = {uid:data.uid, pw:data.pw};

            collection.findOne(query, function(err, doc) {
                if (err) {
                    return console.error(err)
                }
                else{
                    if(doc != null){
                        socket.emit('login result',{
                            uid:doc.uid,
                            name:doc.name,
                            email:doc.email,
                            logged:true});
                        console.log(doc.uid +' - connected');
                        socket.uid = doc.uid;
                        addUser(doc.uid,doc.name,socket.id, 'online');

                        io.emit('userlist update', { list: users });
                        return;
                    }
                    else{
                        socket.emit('login result',{
                            logged:false
                        })
                        return;
                    }

                }

            });



        });


    })


    socket.on('disconnect', function(){
        console.log('user '+socket.id+' disconnected');

        for (var i = 0; i < users.length; i++) {
            if(users[i]._s == socket.id){
                users.splice(i,1);
                io.emit('remove user', socket.uid);
            }
        };
    });

    socket.on('status change',function(data){
        for (var i = 0; i < users.length; i++) {
            if(users[i]._s == socket.id){
                users[i].status = data.status;
                io.emit('status change',{
                    uid: data.uid,
                    status: data.status
                });
            }
        };

    });

    socket.on('chat message', function(data){
        console.log('message: ' + data.uid);
        // io.emit('chat message', data.message);
        io.emit('chat message', {
            uid: data.uid,
            name: data.name,
            message: data.message
        });
    });
});


function addUser(userid, username, socket, status){
    var newuser = {};
    newuser['_s'] = socket;
    newuser['uid'] = userid;
    newuser['name'] = username;
    newuser['status'] = status;
    users.push(newuser);

}
function dbexists(col,query){
    console.log("run exists");
    var results = [];
    var mongourl = '...';
    var mongodb = require('mongodb')
    , MongoClient = mongodb.MongoClient

    MongoClient.connect(mongourl, function(err, db) {

        var collection = db.collection(col)


        collection.findOne(query, function(err, doc) {
            http.emit('login result',doc);
            return;
        });
    })


}


// Currently unused.
function dbquery(col,query){
    var results = [];
    var mongourl = '{redacted}';
    var mongodb = require('mongodb')
    , MongoClient = mongodb.MongoClient

    MongoClient.connect(mongourl, function(err, db) {

        var collection = db.collection(col)
        collection.find(query).toArray(function(err, docs) {
            if (err) {
                return console.error(err)
            }
            docs.forEach(function(doc) {
                // console.log('found document: ', doc)
                // results.push(doc);
            })
            // return results;
        })
    })


}

function dbinsert(col, doc){

    MongoClient.connect(mongourl, function(err, db) {

        var collection = db.collection(col)

        collection.insert([doc], function(err,
            docs) {
            if (err) {
                return console.error(err)
            }

        })
    })

}
