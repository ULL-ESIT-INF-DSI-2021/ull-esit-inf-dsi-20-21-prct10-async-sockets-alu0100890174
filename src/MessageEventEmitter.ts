#!/usr/bin/env node
import {EventEmitter} from 'events';

export class MessageEventEmitter extends EventEmitter {
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