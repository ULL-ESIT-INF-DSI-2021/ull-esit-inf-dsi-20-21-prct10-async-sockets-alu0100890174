# Práctica 10 - Cliente y servidor para una aplicación de procesamiento de notas de texto

## 1. Introducción:

En el siguiente informe documentaremos la práctica número 10 dedicada al desarrollo de un sistema de cliente-servidor con el uso del ```módulo net de Node.js```. 

Para ello utilizaremos la funcionalidad ya desarrollada en la [Práctica 8 - Aplicación de procesamiento de notas de texto](https://ull-esit-inf-dsi-2021.github.io/prct08-filesystem-notes-app/) siguiente el modelo de creación de Notas. De modo que un usuario puede crear, eliminar, modificar y ver sus propias notas a través del uso de una aplicación cliente exclusivamente. Esta aplicación se comunica con una aplicación servidora a través de un socket con la dirección de un puerto como enlace.

De forma complementaria seguiremos usando los módulos de desarrollo: `yargs` o `chalk` para la visualización y ejecución de nuestro programa.

Tambíen seguiremos avanzando en el desarrollo de cubrimiento, testing y seguridad del código usando `Github Actions`, `Coveralls` y `Sonar Cloud`. Seguimos utilizando documentación generada por `Typedoc` y comprobando el correcto funcionamiento por medio de las metodologías de desarrollo TDD usando `Mocha`y `Chai`.


## 2. Objetivos:

1. Acepte la asignación de GitHub Classroom asociada a esta práctica. [Mi repositorio](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174)
2. Familiarícese con el módulo [net de Node.js](https://nodejs.org/dist/latest-v16.x/docs/api/net.html).
3. Familiarícese con la clase [EventEmitter](https://nodejs.org/dist/latest-v16.x/docs/api/events.html#events_class_eventemitter) del módulo Events de Node.js.
4. En esta práctica tendrá que volver a utilizar los paquetes [yargs](https://www.npmjs.com/package/yargs) y [chalk](https://www.npmjs.com/package/chalk), de un modo similar al empleado en la Práctica 8.


## 3. Desarrollo:

### Requisitos:

   * La aplicación de notas deberá permitir que múltiples usuarios interactúen con ella.

   * Una nota estará formada, como mínimo, por un título, un cuerpo y un color (rojo, verde, azul o amarillo).

   * Cada usuario tendrá su propia lista de notas, con la que podrá llevar a cabo las siguientes operaciones:
      1. Añadir una nota. ```(add)```
      2. Modificar una nota. ```(modify)```
      3. Eliminar una nota. ```(remove)```
      4. Listar notas. ```(list)```
      5. Leer una nota. ```(read)```

   * Mensajes informativos en verde.

   * Mensajes de error en rojo.

   * Servidor encargado de guardar/cargas las notas en formato JSON.

   * El usuario solo puede acceder a la BBDD de Notas a través de la aplicación ```client```.

### Implementación

Para el desarrollo del servidor y cliente utilizaremos la clase ```Note``` y ```ProcessNote``` desarolladas en la [Práctica 8](https://ull-esit-inf-dsi-2021.github.io/ull-esit-inf-dsi-20-21-prct08-filesystem-notes-app-alu0100890174/) para la implementación y gestión de las operaciones correspondientes.

Por otro lado he decidido implementar una aplicación para el lado ```Servidor```y otra para el ```Cliente```. Además por recomendación del profesor y para controlar la fragmentación de los mensajes por paquetes en la comunicación por ```sockets``` se ha desarrollado la clase ```MessajeEventEmitter```.

#### Aplicación Servidor

```ts
import {MessageEventEmitter} from '../MessageEventEmitter';
import * as net from 'net';
import {Note} from '../Note/Note';
import {ProcessNote} from '../Note/ProcessNote';
import chalk = require('chalk');
import fs = require('fs');

/**
 *  ResponseType . Tipo de dato para la respuesta del servidor.
 */
export type ResponseType = {
    type: 'add' | 'modify' | 'remove' | 'user-remove' | 'read' | 'list' | 'error';
    success: boolean;
    notes?: Note[];
}

function main(): void {
    /**
     * Creamos la conexión del servidor
     */
    const server = net.createServer((connection) => {
        console.log(chalk.green('\nA client has connected.'));
        const message = new MessageEventEmitter(connection, "server");
        message.on('request', (argv) => {
            let response: ResponseType = {
                type: 'error',
                success: false,
            };
            /**
             *  Procesamos el tipo de petición del servidor.
             */
            switch (argv.type) {
                case 'add':
                    if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' && typeof argv.color === 'string') {
                        const newNote = new Note(argv.title, argv.body, argv.color);
                        const newProcessNote = new ProcessNote(argv.user, newNote);
                        let exist: boolean = newProcessNote.add()  
                        if (exist) {
                            response = {
                                type: 'add',
                                success: true,
                                notes: [newNote],
                            };
                        } else {
                            response = {
                                type: 'add',
                                success: false,
                                notes: [newNote],
                            };
                        }
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
                        let newNote = new Note('', '');
                        let newProcessNote = new ProcessNote(argv.user, newNote);
                        newProcessNote.list(argv.user);        
                        response = {
                            type: 'list',
                            success: true,
                            notes: newProcessNote.ListNotes,
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
                    console.log(`\nClient ` + chalk.magenta(`${response.type}`) + ` request:  ` + chalk.green(`Acepted.`));
                } else {
                    console.log(`\nClient ` + chalk.magenta(`${response.type}`) + ` request:  ` + chalk.red(`Declined.`));
                }
            });
        });

        /**
         * Evento "close" . Se emite cuando el cliente se desconecta del servidor.
         */
        connection.on('close', () => {
            console.log(chalk.green('\nA client has disconnected.'));
        })
    /**
     * Servidor abierto a la escucha en el puerto 60300.
     */
    }).listen(60300, () => {
        console.log(chalk.magenta('Waiting for clients to connect.'));
    })
}

main();
```


#### Aplicación Cliente

```ts
#!/usr/bin/env node
import {MessageEventEmitter} from '../MessageEventEmitter';
import * as net from 'net';
import chalk = require('chalk');
import yargs = require('yargs');

/**
 *  ResponseType . Tipo de dato para la petición del cliente.
 */
export type RequestType = {
    type: 'add' | 'modify' | 'remove' | 'user-remove' | 'read' | 'list';
    user?: string;
    title?: string;
    body?: string;
    color?: string;
}

function main(): void {
    /** 
     * Comprobamos parametros de la petición cliente.
     */
    if (process.argv.length < 3) {
        console.log('A parameter is missing.');
    } else {
        /**
         * Creamos conexión con el servidor en el puerto 60300.
         */
        const client = net.connect({port: 60300});
        const message = new MessageEventEmitter(client, "client");
        message.on('response', (argv) => {
            /**
             * Procesamos la respuesta del servidor.
             */
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
```


#### Clase MessageEventEmitter

```ts
#!/usr/bin/env node
import {EventEmitter} from 'events';

/**
 * MessageEventEmitter . Clase dedicada a la comunicación entre el 
 * Servidor y el Cliente, resuelve el problema de los mensajes por trazas.
 * Emite un evento de tipo para:
 *    * 'request'  => mensaje para comunicarse con el servidor.
 *    * 'response' => mensaje para comunicarse con el cliente.
 */
export class MessageEventEmitter extends EventEmitter {
  /**
   * @param connection objeto de tipo EventEmitter 
   * @param srcMessage "server" / "client"
   */
  constructor(connection: EventEmitter, srcMessage: string) {
    super();

    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;

      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        if (srcMessage == "server"){
          this.emit('request', JSON.parse(message));
        } else if (srcMessage == "client") {
          this.emit('response', JSON.parse(message));
        } else {
          this.emit('error', JSON.parse(message));
        }
        messageLimit = wholeData.indexOf('\n');
      }
    });
  }
}
```

#### Tests Realizados

**Código**

```ts
import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitter} from '../src/MessageEventEmitter';
import {Note} from '../src/Note/Note';
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
```

**Resultados**

```bash
  MessageEventEmitter
    ✓ Should emit a message event once it gets a complete message (Client)
    ✓ Should emit a message event once it gets a complete message (Server)

  Testing "Note Class"
    ✓ NewNote is created successfully
    ✓ NewNote is created successfully
    ✓ NewNote is created successfully
    ✓ Note is an instance of Note Class
    ✓ Note Title parameter is "Buenos días".
    ✓ Note Body parameter is "Hola mundo!".
    ✓ Note Color parameter is "green".
    ✓ Note Color type parameter is "green".
    ✓ Note Color parameter is "green".
    ✓ Note Color type parameter is "green".

  Testing "ProcessNote Class"
    ✓ newProcessNote is an instance of ProcessNote Class
    ✓ NewProcess is created successfully
    ✓ newProcessNote is an instance of ProcessNote Class
    ✓ NewProcess is created successfully
    ✓ add method works successfully
    ✓ modify method works successfully
    ✓ read method works successfully
    ✓ list method works successfully
    ✓ remove method works successfully
    ✓ removeUser method works successfully


  22 passing (72ms)

-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |      96 |    77.78 |     100 |   95.71 |                   
 src                     |   93.75 |       75 |     100 |   93.75 |                   
  MessageEventEmitter.ts |   93.75 |       75 |     100 |   93.75 | 32                
 src/Note                |   96.61 |    78.26 |     100 |    96.3 |                   
  Note.ts                |     100 |      100 |     100 |     100 |                   
  ProcessNote.ts         |   94.59 |    68.75 |     100 |   94.44 | 31,103            
-------------------------|---------|----------|---------|---------|-------------------
```

#### Terminal

* Add

***Server***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Server/Server.jsWaiting for clients to connect.

A client has connected.

Client add request:  Acepted.

A client has disconnected.
```

***Client***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Client/Client.js add -u "Yoda" -t "StarWars2" -b "May the force be with you" -c "green"

New note added.
^C
```

* Modify

***Server***
```bash
A client has connected.

Client modify request:  Acepted.

A client has disconnected.
```

***Client***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Client/Client.js modify -u "Yoda" -t "StarWars2" -b "May the force be with you and me" -c "green"

The note has been modify successfuly
^C
```

* Read

***Server***
```bash
A client has connected.

Client read request:  Acepted.

A client has disconnected.
```

***Client***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Client/Client.js read -u "Yoda" -t "StarWars2"

StarWars2 
May the force be with you and me
^C
```

* List

***Server***
```bash
A client has connected.

Client list request:  Acepted.

A client has disconnected.
```

***Client***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Client/Client.js list -u "Yoda"

User notes list: 


StarWars1 
May the force be with you

StarWars2 
May the force be with you and me
^C
```

* Remove

***Server***
```bash
A client has connected.

Client remove request:  Acepted.

A client has disconnected.
```

***Client***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Client/Client.js remove -u "Yoda" -t "StarWars2"

Note removed.
^C
```

* User-Remove

***Server***
```bash
A client has connected.

Client user-remove request:  Acepted.

A client has disconnected.
```

***Client***
```bash
[~/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0100890174(main)]$ node dist/Client/Client.js user-remove -u "Yoda"

User-u notes removed.
^C
```

### Conclusiones

En esta práctica hemos continuado con la temática de funciones asincronas propia de la API de Node.js en este caso haciendo uso de su módulo ```net``` y la clase ```EventEmitter``` del módulo de ```Events```, los cuales nos han permitido hacer conexiones entre dos aplicaciones independientes a través de sockets desarrollando la famosa conexión ```cliente-servidor```. 

El desarrollo de esta práctica por ende se ha centrado en este tipo de conexión en comprender como funciona el transito de datos entre cliente y servidor, hemos aprendido como un servidor a través de la ocupación de un puerto; que no es más que una ranuda designada por el ordenador para transmitir o recibir datos net, es capaz de sincrónizarse y permanecer a la escucha de otros clientes para recibir o emitir información.

La información en el paquete net se transmite en formato de buffer de bits, por lo que es sencillo pasar esta información a cadena de caracteres y a su vez a partir de aquí procesando de forma inteligente modificar el tratado de las cadenas para representar objetos([JSON](https://es.wikipedia.org/wiki/JSON#:~:text=JSON%20(acr%C3%B3nimo%20de%20JavaScript%20Object,para%20el%20intercambio%20de%20datos.)).

Aprender el uso de  sockets con JSON que es de los formatos más utilizados para representar objetos y ```JavaScript``` de los lenguajes más usados actualmente resulta sin duda muy útil de cada al desarrollo de aplicaciones.