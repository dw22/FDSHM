service = require('../service/service');
var item = {
    // '/api/item/collection' GET
    collection: function(req, res) {
        service.item.collection(req.query).then(function(results) {
            var items = [];
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                items.push({
                    image: object.get('imgPaths'),
                    price: object.get('price'),
                    name: object.get('name'),
                    location: object.get('location'),
                    publisher_id: object.get('publisher_id'),
                    publisher_name: object.get('publisher_name'),
                    pubTimeStamp: object.get('pubTimeStamp')
                })
            }
            res.send(items);
            res.end();
        });
    },

    // '/api/item/publish' POST
    publish: function(req, res) {
        console.log(req.body);
        if (req.session.login && req.body.name && req.body.detail && req.body.price && req.body.tel && req.body.category && req.body.imgPaths.length > 0) {
            req.body.publisher_id = req.session.userid;
            req.body.publisher_name = req.session.name
            service.item.publish(req.body).then(function(result) {
                console.log(result);
                res.send({
                    success: true,
                    //id: result.id
                })
            })
        } else {
            res.send({
                success: false,
            })
        }

    },
    // '/api/item/get/' GET
    get: function(req, res) {
        if (req.query.id) {
            service.item.get(req.query.id).then(function(result) {
                var item = result[0];
                res.send({
                    images: item.get('imgPaths'),
                    name: item.get('name'),
                    category: item.get('category'),
                    tel: item.get('tel'),
                    location: item.get('location'),
                    price: item.get('price'),
                    detail: item.get('detail').split('\n'),
                    qq: item.get('qq'),
                    wechat: item.get('wechat'),
                    stuNo: item.get('stuNo'),
                    pubTime: item.createdAt.toLocaleDateString() + '  ' + item.createdAt.toLocaleTimeString()
                })
            });
        } else {
            res.send({
                success: false
            });
        }
    },
    // '/api/item/equal_to' POST
    equalTo: function(req, res) {
        if (req.body) {
            service.item.equalTo(req.body).then(function(result) {
                res.send(result)
            })
        } else {
            res.send({
                success: false
            })
        }
    },
    update: function(req, res) {
        if (req.session.login && req.body.itemTimeStamp && req.body.params.name && req.body.params.detail && req.body.params.price && req.body.params.tel && req.body.params.category) {
            service.item.get(req.body.itemTimeStamp).then(function(result) {
                var publisher_id = result[0].get('publisher_id');
                var objectId = result[0].id;
                if (req.session.userid == publisher_id) {
                    console.log('认证成功，修改！');
                    service.item.update(objectId, req.body.params, req.body.itemTimeStamp).then(function(result) {
                        console.log(result);
                        res.send({
                            success: true
                        })
                    }, function(err) {
                        console.log(err);
                    });
                } else {
                    res.send({
                        success: false
                    })
                }
            })
        } else {
            res.send({
                success: false
            })
        }
    }
};

var user = {
    signup: function(req, res) {
        service.user.signup(req.body.username, req.body.email, req.body.password, req.body.name).then(function(result) {
            if (result) {
                res.send({
                    success: true
                });
            }
        }, function(err) {
            console.log(err);
            res.send({
                success: false
            });
        })
    },
    login: function(req, res) {
        service.user.login(req.body.username, req.body.password).then(function(result) {
            console.log(result);
            //service.user.login('starkwang', '123456').then(function(result) {
            req.session.regenerate(function() {
                req.session.login = true;
                req.session.name = result.attributes.name;
                req.session.email = result.attributes.email;
                req.session.userid = result.attributes.timeStamp;
                res.send({
                    success: true
                });
            });

        }, function(err) {
            res.send({
                success: false
            });
        })
    },
    logout: function(req, res) {
        res.clearCookie('connect.sid');
        res.send({
            success: true
        })
    },
    getItem: function(req, res) {

    },
    myItem: function(req, res) {
        console.log(req.body);
        if (req.session.login) {
            var query = {
                publisher_id: req.session.userid
            };
            var config = {
                start: req.body.start,
                amount: req.body.amount
            }
            service.item.equalTo(query, config).then(function(results) {

                var items = [];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    items.push({
                        image: object.get('imgPaths'),
                        price: object.get('price'),
                        name: object.get('name'),
                        location: object.get('location'),
                        publisher_id: object.get('publisher_id'),
                        publisher_name: object.get('publisher_name'),
                        pubTimeStamp: object.get('pubTimeStamp')
                    })
                }
                res.send(items.reverse());
                res.end();
            })
        } else {
            res.send({
                success: false
            })
        }
    }
};

module.exports = {
    item: item,
    user: user
}