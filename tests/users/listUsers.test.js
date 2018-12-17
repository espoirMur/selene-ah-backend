import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import url from '../../server/index';
import userFactory from '../mocks/factories/userFactory';
import models from '../../server/models';
import UserController from '../../server/controllers/userController';


const user = userFactory.build({
  password: 'daniel.shotonwa12'
});


chai.use(chaiHttp);

const { User } = models;
let token;
describe('######### List Users', () => {
  before( async ()=>{
    await chai.request(url)
    .post('/api/v1/auth/signup')
    .send(user)
    .then(res => {
      token = res.body.token;
    });
  });

  it('should list all users if user is authenticated', async ()=> {
    await chai.request(url)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.users).to.be.an('Array');
        expect(res.body.msg).to.be.equal('User returned successfully');
      });
  });

  it('should give error is Token is not supplied', ()=> {
    chai.request(url)
      .get('/api/v1/users')
      .then((res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body.msg).to.be
          .equals('Authentication failed: Please supply a valid token.');
      });
  });

  it('should give error if Token is Invalid',  async ()=> {
    await chai.request(url)
      .get('/api/v1/users')
      .set('Authorization', 'Bearer invalidTOKEN')
      .then(res => {
        expect(res).to.have.status(401);
        expect(res.body).to.be.an('object');
        expect(res.body.msg).to.be
          .equals('Authentication failed: Please supply a valid token.');

      });
  });

  it('fake test: should return 500 error', async () => {
    const req= {};
    const res = {};
    const next = sinon.stub();

    sinon.stub(User, 'findAll').throws();
    await UserController.getAllUsers(req, res, next);
    expect(next.called).to.be.true;
    sinon.restore();
  });
});
