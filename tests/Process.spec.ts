import 'mocha';
import {expect} from 'chai';
import {Note} from '../src/Notes/Note';
import {ProcessNote} from '../src/Notes/ProcessNote';
const fs = require('fs');

describe('Testing "ProcessNote Class"', () => {
    const newNote = new Note('Buenos días', 'Hola mundo!', 'green');
    const newProcessNote = new ProcessNote('Eduardo', newNote);
    const newNote1 = new Note('Buenos días', 'Hola mundo!');
    const newProcessNote1 = new ProcessNote('Eduardo', newNote);

    it('newProcessNote is an instance of ProcessNote Class', () => {
        expect(newProcessNote).to.be.instanceOf(ProcessNote);
    });
    it('NewProcess is created successfully', () => {
        expect(new ProcessNote('Eduardo', newNote)).not.to.be.null;
    });
    it('newProcessNote is an instance of ProcessNote Class', () => {
        expect(newProcessNote1).to.be.instanceOf(ProcessNote);
    });
    it('NewProcess is created successfully', () => {
        expect(new ProcessNote('Eduardo', newNote1)).not.to.be.null;
    });
    it('add method works successfully', () => {
        expect(newProcessNote.add()).not.to.be.null;
    });
    it('modify method works successfully', () => {
        expect(newProcessNote.modify()).not.to.be.null;
    });
    it('read method works successfully', () => {
        expect(newProcessNote.read('Eduardo', 'Buenos días')).not.to.be.null;
    });
    it('list method works successfully', () => {
        expect(newProcessNote.list('Eduardo')).not.to.be.null;
    });
    it('remove method works successfully', () => {
        expect(newProcessNote.remove()).not.to.be.null;
    });
    it('removeUser method works successfully', () => {
        expect(newProcessNote.removeUser()).not.to.be.null;
    });
});