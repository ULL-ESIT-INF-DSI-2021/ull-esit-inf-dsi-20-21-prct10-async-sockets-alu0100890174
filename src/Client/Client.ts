#!/usr/bin/env node
import {MessageEventEmitter} from '../MessageEventEmitter';
import * as net from 'net';
import chalk = require('chalk');
import yargs = require('yargs');

export type RequestType = {
    type: 'add' | 'modify' | 'remove' | 'user-remove' | 'read' | 'list';
    user?: string;
    title?: string;
    body?: string;
    color?: string;
}

function main(): void {
    if (process.argv.length < 3) {
        console.log('A parameter is missing.');
    } else {
        const client = net.connect({port: 60300});
        const message = new MessageEventEmitter(client, "client");
        message.on('response', (argv) => {
            switch (argv.type) {
                case 'add':
                    if (argv.success == true){
                    console.log(chalk.green(`\nNew note added.`));
                    } else {
                        console.log(chalk.red(
                            '\nERROR. That note already exist.\n' +
                            'Yo can modify it using the command: --m | --modify .'));
                    }
                    break;
                case 'modify':
                    if (argv.success == true){
                        console.log(chalk.green(
                            '\nThe note has been modify successfuly'));
                    } else {
                        console.log(chalk.red(
                            '\nERROR. The note you are trying to edit doesn\'t exist.'));
                        console.log(chalk.green(
                            '\nYou created a new one instead.'));
                    }
                    break;     
                case 'remove':
                    if (argv.success == true){
                        console.log(chalk.green(`\nNote removed.`));
                    } else {
                        console.log(chalk.red(
                            '\nERROR. The note you are trying to remove doesn\'t exist.\n' + 
                            'Yo can add it using the command: --a | --add .'));
                    }
                    break;
                case 'user-remove':
                    if (argv.success == true){
                        console.log(chalk.green(`\nUser${process.argv[3]} notes removed.`));
                    } else {
                        console.log(chalk.red(
                            '\nERROR. The note you are trying to remove doesn\'t exist.\n' + 
                            'Yo can add it using the command: --a | --add .'));
                    }
                    break;
                case 'list':   
                    if (argv.success == true){
                        console.log(chalk.green(`\nUser notes list: \n`));
                        argv.notes.forEach((note) => {
                            console.log('\n' + chalk.keyword('white').bgKeyword(note.color)(note.title + ' ') + '\n' + 
                            chalk.keyword(note.color).bgKeyword('white')(note.body));
                        })
                    } else {
                        console.log(chalk.red(
                            '\nERROR. The user doesn\'t have notes.\n' + 
                            'Yo can add it using the command: --a | --add .'));
                    }
                    break;
                case 'read':   
                    if (argv.success == true){
                        console.log('\n' + chalk.keyword('white').bgKeyword(argv.notes[0].color)(argv.notes[0].title + ' ') + '\n' + 
                        chalk.keyword(argv.notes[0].color).bgKeyword('white')(argv.notes[0].body));
                    } else {
                        console.log(chalk.red(
                            '\nThat note doesn\'t exist.'));
                    }
                    break;
                default:
                    console.log(chalk.red("ERROR. That option doesn\'t exist."));
                    break;
            }
        });

        /**
         * Comando add
         */
        yargs.command({
            command: 'add',
            describe: 'Add a new note',
            builder: {
                user: {
                    describe: 'User name',
                    demandOption: true,
                    type: 'string',
                    alias: 'u',
                },
                title: {
                    describe: 'Note title',
                    demandOption: true,
                    type: 'string',
                    alias: 't',
                },
                body: {
                    describe: 'Body content',
                    demandOption: true,
                    type: 'string',
                    alias: 'b',
                },
                color: {
                    describe: 'Note Color',
                    demandOption: true,
                    type: 'string',
                    alias: 'c',
                },
            },
            handler(argv) {
                if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' && typeof argv.color === 'string') {
                    const request: RequestType = {
                        type: 'add',
                        user: argv.user,
                        title: argv.title,
                        body: argv.body,
                        color: argv.color,
                    };
                    let stringRequest: string = JSON.stringify(request) + '\n';
                    client.write(stringRequest);
                } else {
                    console.log(chalk.red("ERROR. Missing parameter."));
                }
            },
        });

        /**
         * Comando modify
         */
        yargs.command({
            command: 'modify',
            describe: 'Modify a note',
            builder: {
                user: {
                    describe: 'User name',
                    demandOption: true,
                    type: 'string',
                    alias: 'u',
                },
                title: {
                    describe: 'Note title',
                    demandOption: true,
                    type: 'string',
                    alias: 't',
                },
                body: {
                    describe: 'Body content',
                    demandOption: false,
                    type: 'string',
                    alias: 'b',
                },
                color: {
                    describe: 'Note Color',
                    demandOption: false,
                    type: 'string',
                    alias: 'c',
                },
            },
            handler(argv) {
                if (typeof argv.user === 'string' && typeof argv.title === 'string') {
                    let request: RequestType = { type: 'modify' }
                    if (typeof argv.body === 'string' && typeof argv.color === 'string') {
                        request = {
                            type: 'modify',
                            user: argv.user,
                            title: argv.title,
                            body: argv.body,
                            color: argv.color,
                        };
                    } else if (typeof argv.body === 'string') {
                        request = {
                            type: 'modify',
                            user: argv.user,
                            title: argv.title,
                            body: argv.body,
                        };
                    } else if (typeof argv.color === 'string') {
                        request = {
                            type: 'modify',
                            user: argv.user,
                            title: argv.title,
                            color: argv.color,
                        };
                    }
                    let stringRequest: string = JSON.stringify(request) + '\n';
                    client.write(stringRequest);    
                } else {
                    console.log(chalk.red("ERROR. Missing parameter."));
                }
            },
        });

        /**
         * Comando remove
         */
        yargs.command({
            command: 'remove',
            describe: 'Remove a note',
            builder: {
                user: {
                    describe: 'User name',
                    demandOption: true,
                    type: 'string',
                    alias: 'u',
                },
                title: {
                    describe: 'Note title',
                    demandOption: true,
                    type: 'string',
                    alias: 't',
                },
            },
            handler(argv) {
                if (typeof argv.user === 'string' && typeof argv.title === 'string') {
                    const request: RequestType = {
                        type: 'remove',
                        user: argv.user,
                        title: argv.title,
                    };
                    let stringRequest: string = JSON.stringify(request) + '\n';
                    client.write(stringRequest);    
                } else {
                console.log(chalk.red("ERROR. Missing parameter."));
                }
            },
        });

        /**
         * Comando User Remove
         */
        yargs.command({
            command: 'user-remove',
            describe: 'Remove info about an user',
            builder: {
                user: {
                    describe: 'User name',
                    demandOption: true,
                    type: 'string',
                    alias: 'u',
                },
            },
            handler(argv) {
                if (typeof argv.user === 'string') {
                    const request: RequestType = {
                        type: 'user-remove',
                        user: argv.user,
                    };
                    let stringRequest: string = JSON.stringify(request) + '\n';
                    client.write(stringRequest); 
                } else {
                console.log(chalk.red("ERROR. Missing parameter."));
                }
            },
        });

        /**
         * Comando Listar
         */
        yargs.command({
            command: 'list',
            describe: 'List notes from an user',
            builder: {
                user: {
                    describe: 'User name',
                    demandOption: true,
                    type: 'string',
                    alias: 'u',
                },
            },
            handler(argv) {
                if (typeof argv.user === 'string') {
                    const request: RequestType = {
                        type: 'list',
                        user: argv.user,
                    };
                    let stringRequest: string = JSON.stringify(request) + '\n';
                    client.write(stringRequest); 
                } else {
                console.log(chalk.red("ERROR. Missing parameter."));
                }
            },
        });

        /**
         * Comando Leer nota
         */
        yargs.command({
            command: 'read',
            describe: 'Read a note',
            builder: {
                user: {
                    describe: 'User name',
                    demandOption: true,
                    type: 'string',
                    alias: 'u',
                },
                title: {
                    describe: 'Note title',
                    demandOption: true,
                    type: 'string',
                    alias: 't',
                },
            },
            handler(argv) {
                if (typeof argv.user === 'string' && typeof argv.title === 'string') {
                    const request: RequestType = {
                        type: 'read',
                        user: argv.user,
                        title: argv.title,
                    };
                    let stringRequest: string = JSON.stringify(request) + '\n';
                    client.write(stringRequest); 
                } else {
                console.log(chalk.red("ERROR. Missing parameter."));
                }
            },
        });
    }

    yargs.parse();
}

main();