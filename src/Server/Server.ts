#!/usr/bin/env node
import {MessageEventEmitter} from '../MessageEventEmitter';
import * as net from 'net';
import {Note} from '../Notes/Note';
import {ProcessNote} from '../Notes/ProcessNote';
const chalk = require('chalk');
const fs = require('fs');

type ResponseType = {
    type: 'add' | 'modify' | 'remove' | 'user-remove' | 'read' | 'list' | 'error';
    success: boolean;
    notes?: Note[];
}

const server = net.createServer((connection) => {
    console.log('A client has connected.');
    const message = new MessageEventEmitter(connection);
    message.on('request', (argv) => {
        let response: ResponseType;
        switch (argv.type) {
            case 'add':
                if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' && typeof argv.color === 'string') {
                    const newNote = new Note(argv.title, argv.body, argv.color);
                    const newProcessNote = new ProcessNote(argv.user, newNote);
                    newProcessNote.add()  
                    response = {
                        type: 'add',
                        success: true,
                        notes: [newNote],
                    };
                } else {
                    response = {
                        type: 'add',
                        success: false,
                        notes: [],
                    };
                    console.log(chalk.red("ERROR. Missing parameter from client."));
                }
                break;
            case 'modify':
                if (typeof argv.user === 'string' && typeof argv.title === 'string') {
                    let stackNote = JSON.parse(fs.readFileSync(`./Notes/${argv.user}/${argv.title}.json`,'utf8'));
                    if ( typeof argv.body === 'string') {
                        stackNote.body = argv.body;
                    }
                    if ( typeof argv.color === 'string') {
                        stackNote.color = argv.color;
                    } 
                    const newNote = new Note(argv.title, stackNote.body, stackNote.color);
                    const newProcessNote = new ProcessNote(argv.user, newNote);
                    newProcessNote.modify();  
                    response = {
                        type: 'modify',
                        success: true,
                        notes: [newNote],
                    };
                } else {
                    response = {
                        type: 'modify',
                        success: false,
                        notes: [],
                    };
                    console.log(chalk.red("ERROR. Missing parameter from client."));
                }
                break;
            case 'remove':
                if (typeof argv.user === 'string' && typeof argv.title === 'string') {
                    const newNote = new Note(argv.title, argv.body);
                    const newProcessNote = new ProcessNote(argv.user, newNote);
                    newProcessNote.remove();
                    response = {
                        type: 'remove',
                        success: true,
                        notes: [newNote],
                    };
                } else {
                    response = {
                        type: 'remove',
                        success: false,
                        notes: []
                    };
                    console.log(chalk.red("ERROR. Missing parameter from client."));
                }  
                break;  
            case 'user-remove':
                if (typeof argv.user === 'string') {
                    const newNote = new Note('', '');
                    const newProcessNote = new ProcessNote(argv.user, newNote);
                    newProcessNote.removeUser();
                    response = {
                        type: 'user-remove',
                        success: true,
                        notes: [],
                    };
                } else {
                    response = {
                        type: 'user-remove',
                        success: false,
                        notes: [],
                    };
                    console.log(chalk.red("ERROR. Missing parameter from client."));
                }  
                break;     
            case 'list':
                if (typeof argv.user === 'string') {
                    const newNote = new Note('', '');
                    const newProcessNote = new ProcessNote(argv.user, newNote);
                    newProcessNote.list(argv.user);        
                    response = {
                        type: 'list',
                        success: true,
                        notes: [],
                    };
                } else {
                    response = {
                        type: 'list',
                        success: false,
                        notes: [],
                    };
                    console.log(chalk.red("ERROR. Missing parameter from client."));
                }  
                break; 
            case 'read':
                if (typeof argv.user === 'string' && typeof argv.title === 'string') {
                    const newNote = new Note(argv.title, '');
                    const newProcessNote = new ProcessNote(argv.user, newNote);
                    newProcessNote.read(argv.user, argv.title);       
                    response = {
                        type: 'read',
                        success: true,
                        notes: [newNote],
                    };
                } else {
                    response = {
                        type: 'read',
                        success: false,
                        notes: [],
                    };
                    console.log(chalk.red("ERROR. Missing parameter from client."));
                }  
                break;
            default:
                console.log(chalk.red("ERROR. Wrong option from client."));
                response = {
                    type: 'error',
                    success: true,
                    notes: [],
                };
                break;
        }
        let stringResponse: string = JSON.stringify(response) + '\n';
        connection.write(stringResponse, () => {
            if (response.success) {
                console.log(chalk.green(`Client ${response.type} request,  acepted.`));
            } else {
                console.log(chalk.green(`Client ${response.type} request,  declined.`));
            }
        })
    });

    message.on('close', () => {
        console.log('A client has disconnected.')
    })
}).listen(60300, () => {
    console.log('Waiting for clients to connect.');
})

