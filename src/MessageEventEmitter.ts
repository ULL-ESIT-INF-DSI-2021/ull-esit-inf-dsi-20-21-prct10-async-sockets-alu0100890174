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