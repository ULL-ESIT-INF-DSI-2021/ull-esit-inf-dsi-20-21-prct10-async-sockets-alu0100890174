import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitter} from '../src/MessageEventEmitter';
import {Note} from '../src/Notes/Note';
import {RequestType} from '../src/Client/Client';
import {ResponseType} from '../src/Server/Server';

describe('MessageEventEmitter', () => {
    it('Should emit a message event once it gets a complete message (Client)', (done) => {
      const socket = new EventEmitter();
      const client = new MessageEventEmitter(socket, "client");
      const newNote = new Note('StarWars', 'May the force be with you', 'green');
      const newResponse: ResponseType = {
        'type': 'add', 
        'success': true, 
        'notes': [newNote]
      }
      client.on('response', (message) => {
        expect(message).to.be.eql(newResponse);
        done();
      });
  
      socket.emit('data', '{"type": "add", "success": true');
      socket.emit('data', `, "notes": [${JSON.stringify(newNote)}]}`);
      socket.emit('data', '\n');
      socket.emit('end');
    });

    it('Should emit a message event once it gets a complete message (Server)', (done) => {
        const socket = new EventEmitter();
        const server = new MessageEventEmitter(socket, "server");
        const newRequest: RequestType = {
            'type': 'add', 
            'user':  'Yoda', 
            'title': 'StarWars', 
            'body': 'May the force be with you', 
            'color': 'green'
        }
        server.on('request', (message) => {
          expect(message).to.be.eql(newRequest);
          done();
        });
    
        socket.emit('data', '{"type": "add", "user": "Yoda"');
        socket.emit('data', ', "title": "StarWars"');
        socket.emit('data', ', "body": "May the force be with you"');   
        socket.emit('data', ', "color": "green"}');              
        socket.emit('data', '\n');
        socket.emit('end');
      });
  });