var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');

var should = chai.should();
var app = server.app;
var storage = server.storage;

chai.use(chaiHttp);

beforeEach(function() {
  storage.setId = 4;
  storage.items = [
    { id: 1, name: 'Broad beans' },
    { id: 2, name: 'Tomatoes' },
    { id: 3, name: 'Peppers' }
  ]
});

describe('Shopping List', function() {
    it('should list items on GET', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('id');
                res.body[0].should.have.property('name');
                res.body[0].id.should.be.a('number');
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                res.body[2].name.should.equal('Peppers');
                done();
            });
    });

    it('should add an item on POST', function(done) {
        chai.request(app)
            .post('/items')
            .send({
                'name': 'Kale'
            })
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('id');
                res.body.name.should.be.a('string');
                res.body.id.should.be.a('number');
                res.body.name.should.equal('Kale');
                storage.items.should.be.a('array');
                storage.items.should.have.length(4);
                storage.items[3].should.be.a('object');
                storage.items[3].should.have.property('id');
                storage.items[3].should.have.property('name');
                storage.items[3].id.should.be.a('number');
                storage.items[3].name.should.be.a('string');
                storage.items[3].name.should.equal('Kale');
                done();
            });
    });

    it('should edit an item on put', function(done) {
        chai.request(app)
            .put('/items/2')
            .send({
                'name': 'Pizza',
                'id': '2'
            })
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('id');
                res.body.name.should.be.a('string');
                res.body.id.should.be.a('number');
                res.body.name.should.equal('Pizza');
                storage.items.should.have.length(3);
                storage.items[1].should.be.a('object');
                storage.items[1].should.have.property('id');
                storage.items[1].should.have.property('name');
                storage.items[1].id.should.be.a('number');
                storage.items[1].name.should.be.a('string');
                storage.items[1].name.should.equal('Pizza');
                done();
            });
    });
    it('should delete an item on delete', function(done) {
        chai.request(app)
            .delete('/items/1')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('id');
                res.body.name.should.be.a('string');
                res.body.id.should.be.a('number');
                storage.items[0].should.be.a('object');
                storage.items[0].should.have.property('id');
                storage.items[0].should.have.property('name');
                storage.items[0].id.should.be.a('number');
                storage.items[0].name.should.be.a('string');
                done();
            });
    });


    it('should return a 404 when empty body sent for post', function(done) {
        chai.request(app)
            .post('/items/5')
            .send('')
            .end(function(err, res) {
                res.should.have.status(404);
                done();
            });
    });

    it('should return a 404 when empty body sent for put', function(done) {
        chai.request(app)
            .put('/items/5')
            .send('')
            .end(function(err, res) {
                res.should.have.status(404);
                done();
            });
    });

    it('should create a new item when put is called on a nonexistent id', function(done) {
        chai.request(app)
            .put('/items/900')
            .send({
                'name': 'soup',
                'id': '900'
            })
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                //check to be sure new item exists
                res.body.should.have.property('name');
                res.body.should.have.property('id');
                res.body.name.should.be.a('string');
                res.body.id.should.be.a('number');
                storage.items[3].should.be.a('object');
                res.body.should.have.property('id');
                // console.log(storage.items[3]);
                done();
            })
    });

    it('should return status 404 if the params.id and body.id don\'t match in a put', function(done) {
        chai.request(app)
            .post('/items/2')
            .send({
                'name': 'cake',
                'id': '1'
            })
            .end(function(err, res) {
                res.should.have.status(404);
                done();
            })
    });

    it('should return a 404 when user tries to delete an item that doesn\'t exist', function(done) {
        chai.request(app)
            .delete('/items/999')
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                done();
            });
    });

 it('should return a 400 when user tries to post an id that already exists', function(){
        chai.request(app)
            .post('/items')
            .send({'name': 'Broad beans', 'id': '1'})
            .end(function(err, res){
                res.should.have.status(400);
            });
    });
});