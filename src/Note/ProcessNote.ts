#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
import {Note} from './Note';

/**
 * ProcessNote . Clase que expande Note, implementa un identificador para el usuario 
 * de cada nota y las funcionalidades que permitirán al mismo crear, guardar y editarlas.
 */
export class ProcessNote<N extends Note> {
    /**
     * 
     * @param user Nombre del usuario propietario de la nota
     * @param Note Objeto que contiene una nota {Titulo, Cuerpo y Color}
     */

    public ListNotes: Note[];
    constructor(private user: string, private Note: N){
        this.ListNotes = [];
    }

    /**
     * Permite crear y almacenar la nota de un usuario en formato JSON.
     */
    add(): boolean {
        this.chechUser(this.user, true);
        if(this.checkNote(this.user, this.Note.title) == false) {
            this.write();
            return true;
        }
            return false; 
    }

    /**
     * Permite eliminar una nota de un usuario de la base de datos JSON.
     */
    remove() {
        if(this.checkNote(this.user, this.Note.title) == true) {
            fs.rmSync(`./Notes/${this.user}/${this.Note.title}.json`);
        }
    }

    /**
     * Permite eliminar toda la información almacenada de un usuario de la base de datos.
     */
    public removeUser() {
        if(this.chechUser(this.user) == true) {
            fs.rmSync(`./Notes/${this.user}`, {recursive: true});
        }
    }

    /**
     * Permite modificar una nota de un usuario de la base de datos en formato JSON.
     */
    modify() {
        this.write();
    }

    /**
     * Permite mostrar todas las notas de un usuario.
     */    
    list(user: string) {
        fs.readdirSync(`./Notes/${user}`).forEach((notes) => {
            this.read(user, notes.slice(0, notes.length - 5));
        })
    }

    /**
     * read . Permite a un usuario leer una nota de la base de datos siempre y cuando exista.
     * @param user Usuario que quiere leer una nota
     * @param title Título de la nota que desea leer
     */
    read(user: string, title: string) {
        if(this.checkNote(user, title) == true) {
            let stackNote = JSON.parse(fs.readFileSync(`./Notes/${user}/${title}.json`,'utf8'));
            this.Note.title = stackNote.title;
            this.Note.body = stackNote.body;
            this.Note.color = stackNote.color;
            this.Note.colorType = stackNote.colorType;
            let newNote = new Note(stackNote.title, stackNote.body, stackNote.color);
            this.ListNotes.push(newNote);
        }
    }

    /**
     * write . Metodo privado que permite escribir una nota en la base de datos.
     */
    private write() {
        let json = JSON.stringify(this.Note);
        fs.writeFileSync(`Notes/${this.user}/${this.Note.title}.json`, json);
    }

    /**
     *  checkUser . Comprueba si existe información de un usuario en la base de datos.
     * @param user Usuario que se quiere comprobar
     * @param crear Booleano para crear nuevo directorio en caso de no existir.
     * @returns 
     */
    private chechUser(user: string, crear?: boolean): boolean{
        if((fs.existsSync(`./Notes/${user}`) == false) && (crear == true)) {
            fs.mkdirSync(`./Notes/${user}`, {recursive: true});
        } else if (fs.existsSync(`./Notes/${user}`) == false) {
            return false;
        }
        return true;
    }

    /**
     * checkNote . Comprueba si existe una nota en la base de datos.
     * @param user Usuario que busca la existencia de una nota en la base de datos.
     * @param title Título de la nota que se quiere comprobar
     * @returns 
     */
    private checkNote(user: string, title: string): boolean {
        if(fs.existsSync(`./Notes/${user}/${title}.json`) == false) {
            return false;
        } else {
            return true;
        }
    }
}