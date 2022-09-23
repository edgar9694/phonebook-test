const strRegex =  /^[a-zA-Z\s]*$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

const addContactBtn = document.querySelector('.contactButton__add');
const updateContactBtn = document.querySelector('.contactButton__update');
const deleteContactBtn = document.querySelector('.contactButton__delete');
const saveContactBtn = document.querySelector('.contactForm__button');
const closeModalBtn = document.querySelector('.contactForm__closeBtn');
const contactList = document.querySelector('.contactList');
const contacts = document.querySelectorAll('.contactList__item');
const emptyMsg = document.querySelector('.contactList__empty'); 
const contactForm = document.querySelector('.contactForm');
const fullscreenDiv = document.querySelector('.contactModal__fullScreen');
const headerModal =  document.querySelector('.contactForm__head');
const db = window.localStorage


let fullName = phone = email = '';

class Contact {

    constructor(id, fullName, phone, email){
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
    }

    static getContacts(){
        let contacts;
        if(localStorage.getItem('contacts') == null){
            contacts = [];
        } else {
            contacts = JSON.parse(localStorage.getItem('contacts'));
            contacts.sort((a,b) =>a.fullName.localeCompare(b.fullName))
        }
        return contacts; 
    }

    static addContact(contact){
        let contacts = Contact.getContacts();
        contacts.push(contact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    static deleteContact(id){
        const contacts = Contact.getContacts();
        let index = contacts.indexOf(contacts.find(c => c.id))
        contacts.splice(index, 1);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        UI.showContactList();
    }

    static updateContact(item){
        const contacts = Contact.getContacts();
        let contact = contacts.find(c => c.id == item.id);
        contact.fullName = item.fullName;
        contact.phone = item.phone;
        contact.email = item.email; 
        localStorage.setItem('contacts', JSON.stringify(contacts));
        contactList.innerHTML = "";
        UI.showContactList();
    }
}


class UI {
    static showContactList(){
        const contacts = Contact.getContacts();
        if(contacts.length > 0){
            contactList.innerHTML = ''
            contacts.forEach(contact => UI.addToContactList(contact));
            emptyMsg.style.display = 'none';
        } else {
            emptyMsg.style.display = 'block'
        }
    }

    static addToContactList(contact){
        const listElement = document.createElement('li');
        listElement.classList.add('contactList__item')
        listElement.setAttribute('data-id', contact.id);
        listElement.innerHTML = `
        <p class="contactList__text">
            <span class="contactList__fullName">
                ${contact.fullName}
            </span>
            <span class="contactList__phone">
                ${contact.phone}
            </span>
            <span class="contactList__email">
                ${contact.email}
            </span>
        </p>
        `;
        contactList.appendChild(listElement);
        emptyMsg.style.display = 'none'
    }

    static showModalData(id){
        const contacts = Contact.getContacts();
        const contactSelected = contacts.find(c => c.id == id);
        updateContactBtn.dataset.id = id;
        deleteContactBtn.dataset.id = id;
        if(contactSelected){
            contactForm.contactForm__fullName.value = contactSelected.fullName;
            contactForm.contactForm__phone.value = contactSelected.phone;
            contactForm.contactForm__email.value = contactSelected.email;
        }

    }

    static showModal(){
        contactForm.style.display = "block";
        fullscreenDiv.style.display = "block";
    }

    static closeModal(){
        contactForm.style.display = "none";
        fullscreenDiv.style.display = "none";
    }

}

function eventListeners() {

    saveContactBtn.addEventListener('click', (event) => {
        event.preventDefault();
        let isFormValid = validateForm();
        if(!isFormValid){
            contactForm.querySelectorAll('.contactForm__message').forEach(msg => {
                setTimeout(() => {
                    msg.classList.remove('contactForm__message--invalid');
                }, 1500);
            });
        } else {
            const contacts = Contact.getContacts();
            let lastItemContact = (contacts.length > 0) ? contacts.length : 0;
            lastItemContact++;
            const newContact = new Contact(lastItemContact, fullName, phone, email);
            Contact.addContact(newContact)
            UI.closeModal();
            UI.showContactList();
            contactForm.reset();
        }
        
    });

    updateContactBtn.addEventListener('click', (event) => {
        event.preventDefault();
        let id = event.target.dataset.id;
        let isFormValid = validateForm();
        if(!isFormValid){
            contactForm.querySelectorAll('.contactForm__message').forEach(msg => {
                setTimeout(() => {
                    msg.classList.remove('contactForm__message--invalid');
                }, 1500);
            });
        } else {
            const setContact = new Contact(id, fullName, phone, email);
            Contact.updateContact(setContact)
            UI.closeModal();
            UI.addToContactList(newContact);
            contactForm.reset();
        }
    });

    deleteContactBtn.addEventListener('click', (event) => {
        let element = event.target
        let contactId = element.dataset.id;
        if(contactId){
            Contact.deleteContact(event.target.dataset.id);
        }

    });

    addContactBtn.addEventListener('click', () => {
        document.querySelector('.contactForm__title').innerHTML = "Add contact";
        headerModal.classList.remove('contactForm__head--update');
        headerModal.classList.add('contactForm__head--add');
        updateContactBtn.style.display = 'none';
        deleteContactBtn.style.display = 'none';
        saveContactBtn.style.display = 'block';
        UI.showModal();
    });
    closeModalBtn.addEventListener('click', () => {
        UI.closeModal();
    });


    contactList.addEventListener('click', (event) => {
        let elementList = event.target.closest('.contactList__item')
        if(elementList){
            headerModal.classList.remove('contactForm__head--add');
            headerModal.classList.add('contactForm__head--update');
            document.querySelector('.contactForm__title').innerHTML = "Edit contact";
            updateContactBtn.style.display = 'inline-block';
            deleteContactBtn.style.display = 'inline-block';
            saveContactBtn.style.display = 'none';
            let contactID = elementList.dataset.id;
            UI.showModal();
            UI.showModalData(contactID);
        }

    });
}

function validateForm() {
    let inputValidStatus = [];
    if(contactForm.contactForm__fullName.value.trim().length == 0){
        let formControl = document.querySelector('.contactForm__fullNameMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'This field is required'
        inputValidStatus[0] = false;
    } else if(!strRegex.test(contactForm.contactForm__fullName.value)){
        let formControl = document.querySelector('.contactForm__fullNameMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'This field only accepts letters'
        inputValidStatus[0] = false;
    } else {
        fullName = contactForm.contactForm__fullName.value;
        inputValidStatus[0] = true;
    }

    if(contactForm.contactForm__phone.value.trim().length == 0){
        let formControl = document.querySelector('.contactForm__phoneMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'This field is required'
        inputValidStatus[2] = false;
    } else if(contactForm.contactForm__phone.value.trim().length < 10 ){
        let formControl = document.querySelector('.contactForm__phoneMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'Numbers should have at least 10 digits'
        inputValidStatus[2] = false;
    }  else if(!phoneRegex.test(contactForm.contactForm__phone.value)){
        let formControl = document.querySelector('.contactForm__phoneMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'Wrong number format'
        inputValidStatus[2] = false;
    } else {
        phone = contactForm.contactForm__phone.value;
        inputValidStatus[2] = true;
    }


    if(contactForm.contactForm__email.value.trim().length == 0){
        let formControl = document.querySelector('.contactForm__emailMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'This field is required'
        inputValidStatus[1] = false;
    } else if(!emailRegex.test(contactForm.contactForm__email.value)){
        let formControl = document.querySelector('.contactForm__emailMessage')
        addMessageInput(formControl);
        formControl.innerHTML = 'Wrong email format'
        inputValidStatus[1] = false;
    } else {
        email = contactForm.contactForm__email.value;
        inputValidStatus[1] = true;
    }

    return inputValidStatus.includes(false) ? false : true;

}

function addMessageInput(inputMsgBox) {
    inputMsgBox.classList.add('contactForm__message--invalid');

}

// DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
    UI.showContactList();
    eventListeners();
});
