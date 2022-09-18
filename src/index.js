import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  orderBy,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB6djWhodEqw8crZZt85Ig1I2caq2bVBtA',
  authDomain: 'mad9135-hybrid-1-d294b.firebaseapp.com',
  projectId: 'mad9135-hybrid-1-d294b',
  storageBucket: 'mad9135-hybrid-1-d294b.appspot.com',
  messagingSenderId: '114567409114',
  appId: '1:114567409114:web:8a3f98390259b728e2a4e3',
};
//TODO: replace this config object with your own

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// get a reference to the database
const db = getFirestore(app);
const people = [];

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
let selectedPersonId = null;
// let updateElemId = null;
// let deletePersonId = null;

document.addEventListener('DOMContentLoaded', () => {
  //set up the dom events
  document
    .getElementById('btnCancelPerson')
    .addEventListener('click', hideOverlay);
  document
    .getElementById('btnCancelIdea')
    .addEventListener('click', hideOverlay);
  document.querySelector('.overlay').addEventListener('click', hideOverlay);

  document
    .getElementById('btnAddPerson')
    .addEventListener('click', showOverlay);
  document.getElementById('btnAddIdea').addEventListener('click', showOverlay);

  document
    .getElementById('btnSavePerson')
    .addEventListener('click', savePerson);
  document.getElementById('btnSaveIdea').addEventListener('click', saveIdea);

  document
    .querySelector('.idea-list')
    .addEventListener('click', handleSelectPerson);

  // document
  //   .querySelector('.person-list')
  //   .addEventListener('click', handleSelectIdea);

  // document
  //   .querySelector('.deleteBtn')
  //   .addEventListener('click', deleteSelected);

  loadInitialData();

  //TODO: add the `onSnapshot` listener
});

function loadInitialData() {
  //load the people collection and display
  getPeople();
  //select the first person on the list
  //load the gift-ideas collection and display
  getIdeas();
  handleClick();
}

async function getPeople() {
  //call this from DOMContentLoaded init function
  //the db variable is the one created by the getFirestore(app) call.
  const querySnapshot = await getDocs(collection(db, 'people'));
  querySnapshot.forEach((doc) => {
    //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    //every `doc` object has a doc() method that gives you a JS object with all the properties
    const data = doc.data();
    const id = doc.id;
    people.push({ id, ...data });
  });
  //select the first person from the list of people
  selectedPersonId = buildPeople(people);
  //select the matching <li> by clicking on a list item
  let li = document.querySelector(`[data-id="${selectedPersonId}"]`);
  // console.log(li);
  li.click();
}

function buildPeople(people) {
  //build the HTML
  const ul = document.querySelector('ul.person-list');
  //replace the old ul contents with the new.
  ul.innerHTML = people
    .map((person) => {
      const dob = `${months[person['birth-month'] - 1]} ${person['birth-day']}`;
      // console.log(`show ${person.id}`);
      //Use the number of the birth-month less 1 as the index for the months array
      return `<li data-id="${person.id}" class="person">
              <p class="name">${person.name}</p>
              <p class="dob">${dob}</p>
              <button class="editBtn">Edit</button>
              <button class="deleteBtn">Delete</button>
            </li>`;
    })
    .join('');
  // return the first person's id
  let selected = people[0].id;
  // console.log(selected);
  return selected;
}

function showPerson(person) {
  //add the newly created person OR update if person exists
  const ul = document.querySelector('ul.person-list');
  const dob = `${months[person['birth-month'] - 1]} ${person['birth-day']}`;
  ul.innerHTML += `<li data-id="${person.id}" class="person">
    <p class="name">${person.name}</p>
    <p class="dob">${dob}</p>
    <button class="editBtn">Edit</button>
    <button class="deleteBtn">Delete</button>
  </li>`;
  //add to people array
  people.push(person);
}

function handleSelectPerson(ev) {
  //ev.target; - could be the button OR anything in the ul.
  const li = ev.target.closest('.person'); //see if there is a parent <li class="person">
  // console.log(`${li.getAttribute('data-id')} was clicked`);
  const id = li ? li.getAttribute('data-id') : null; // if li exists then the user clicked inside an <li>

  // const personRef = doc(collection(db, 'people'), id);
  // const docs = query(
  //   collection(db, 'gift-ideas'),
  //   where('person-id', '==', personRef)
  // );
  // const querySnapshot = await getDocs(docs);

  if (id) {
    //user clicked inside li
    selectedPersonId = id;
    //did they click the li content OR an edit button OR a delete button?
    if (ev.target.classList.contains('editBtn')) {
      editPerson(id, querySnapshot.data);
      //EDIT the doc using the id to get a docRef
      //show the dialog form to EDIT the doc (same form as ADD)
      //Load all the Person document details into the form from docRef
    } else if (ev.target.classList.contains('deleteBtn')) {
      deletePerson(id, querySnapshot.data().name);
      //DELETE the doc using the id to get a docRef
      //do a confirmation before deleting
    } else {
      //content inside the <li> but NOT a <button> was clicked
      //remove any previously selected styles
      document.querySelector('li.selected')?.classList.remove('selected');
      //Highlight the newly selected person
      li.classList.add('selected');
      //and load all the gift idea documents for that person
      getIdeas(id);
    }
  } else {
    //clicked a button not inside <li class="person">
    //Show the dialog form to ADD the doc (same form as EDIT)
    //showOverlay function can be called from here or with the click listener in DOMContentLoaded, not both
  }
}

async function getIdeas(id) {
  //get an actual reference to the person document
  const personRef = doc(collection(db, 'people'), id);
  //then run a query where the `person-id` property matches the reference for the person
  const docs = query(
    collection(db, 'gift-ideas'),
    where('person-id', '==', personRef)
  );
  const querySnapshot = await getDocs(docs);
  const ideas = [];
  querySnapshot.forEach((doc) => {
    //every `doc` object has a `id` property that holds the `_id` value from Firestore.
    //every `doc` object has a doc() method that gives you a JS object with all the properties
    const data = doc.data();
    const id = doc.id;
    //person_id is a reference type
    //we want the actual id string in our object use id to get the _id
    // console.log(data['person-id']);
    ideas.push({
      id,
      idea: data.idea,
      location: data.location,
      bought: data.bought,
      person_id: data['person-id'].id,
      person_ref: data['person-id'],
    });
  });
  //now build the HTML from the ideas array
  buildIdeas(ideas);
}

function buildIdeas(ideas) {
  const ul = document.querySelector('.idea-list');
  if (ideas.length) {
    ul.innerHTML = ideas
      .map((idea) => {
        // console.log(`show ${idea.id}`);
        return `<li class="idea" data-id="${idea.id}">
                <label for="chk-${idea.id}"
                  ><input type="checkbox" id="chk-${idea.id}" /> Bought</label
                >
                <p class="title">${idea.idea}</p>
                <p class="location">${idea.location}</p>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
              </li>`;
      })
      .join('');

    ideas.forEach((idea) => {
      let ideaChecked = document.getElementById(`chk-${idea.id}`);
      if (
        idea.bought
          ? (ideaChecked.checked = true)
          : (ideaChecked.checked = false)
      );
      ideaChecked.addEventListener('change', giftBought);
    });
  } else {
    ul.innerHTML =
      '<li class="idea"><p></p><p>No Gift Ideas for selected person.</p></li>'; //clear in case there are no records to shows
  }

  // let selectedIdeas = idea[0].id;
  // console.log(selected);
  // return selectedIdeas;
  //add listener for 'change' or 'input' event on EVERY checkbox '.idea [type="checkbox"]'
  // which will call a function to update the `bought` value for the document
}

async function savePerson() {
  //take the information from the dialog, save as an object, push to firestore
  let name = document.getElementById('name').value;
  let month = document.getElementById('month').value;
  let day = document.getElementById('day').value;
  if (!name || !month || !day) return; //form needs more info
  const person = {
    name,
    'birth-month': month,
    'birth-day': day,
  };
  try {
    const docRef = await addDoc(collection(db, 'people'), person);
    console.log('Document written with ID: ', docRef.id);
    //1. clear the form fields
    document.getElementById('name').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
    //2. hide the dialog and the overlay by clicking on overlay
    document.querySelector('.overlay').click();
    //3. TODO: display a message to the user about success

    person.id = docRef.id;
    //4. ADD the new HTML to the <ul> using the new object
    showPerson(person);
  } catch (err) {
    console.error('Error adding document: ', err);
    //do you want to stay on the dialog?
    //display a mesage to the user about the problem
  }
  //TODO: update this function to work as an UPDATE method too
}

async function saveIdea() {
  //take the information from the dialog, save as an object, push to firestore
  let idea = document.getElementById('title').value;
  let location = document.getElementById('location').value;
  if (!title || !location) return; //form needs more info
  //a new idea needs a reference to the person
  const personRef = doc(db, `/people/${selectedPersonId}`);
  const pidea = {
    idea,
    location,
    'person-id': personRef,
  };

  try {
    const docRef = await addDoc(collection(db, 'gift-ideas'), pidea);
    console.log('Document written with ID: ', docRef.id);
    pidea.id = docRef.id;
    //1. clear the form fields
    document.getElementById('title').value = '';
    document.getElementById('location').value = '';
    //2. hide the dialog and the overlay by clicking on overlay
    document.querySelector('.overlay').click();
    //3. TODO: display a message to the user about success

    //4. ADD the new HTML to the <ul> using the new object
    //just recall the method to show all ideas for the selected person
    getIdeas(selectedPersonId);
  } catch (err) {
    console.error('Error adding document: ', err);
    //do you want to stay on the dialog?
    //display a mesage to the user about the problem
  }
  //TODO: update this function to work as an UPDATE method too
}

function handleClick(ev) {
  //ev.target;
  const li = ev.target.closest('.person'); //see if there is a parent <li class="thing">
  const id = li ? li.id : null; // if li exists then the user clicked inside an <li>

  if (id) {
    //user clicked inside li
    //did they click the li content OR an edit button OR a delete button?
    if (ev.target.classList.has('edit')) {
      //EDIT the doc using the id to get a docRef
      //show the dialog form to EDIT the doc (same form as ADD)
      //Load all the Thing document details into the form from docRef
    } else if (ev.target.classList.has('delete')) {
      //DELETE the doc using the id to get a docRef
      //do a confirmation before deleting
    } else {
      //content inside the <li> but NOT a <button> was clicked
      //Are you just selecting a Thing for a purpose?
    }
  } else {
    //clicked a button not inside <li class="thing">
    //Show the dialog form to ADD the doc (same form as EDIT)
  }
}

async function editPerson(id, person) {
  showOverlay(id, true, person);
}

async function deletePerson(id, name) {
  hideOverlay(id, true, name);
}

function hideOverlay(ev) {
  ev.preventDefault();
  if (
    !ev.target.classList.contains('overlay') &&
    ev.target.id != 'btnCancelIdea' &&
    ev.target.id != 'btnCancelPerson'
  )
    return;

  document.querySelector('.overlay').classList.remove('active');
  document
    .querySelectorAll('.overlay dialog')
    .forEach((dialog) => dialog.classList.remove('active'));
}
function showOverlay(ev) {
  ev.preventDefault();
  document.querySelector('.overlay').classList.add('active');
  const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  document.getElementById(id).classList.add('active');
}
