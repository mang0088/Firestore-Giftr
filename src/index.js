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
  deleteDoc,
  updateDoc,
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
let selectedGiftId = null;
let saveBtnPerson = document.getElementById('btnSavePerson');
saveBtnPerson.classList.add('addPerson');
let saveBtnIdea = document.getElementById('btnSaveIdea');
saveBtnIdea.classList.add('editIdea');

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
    .querySelector('.person-list')
    .addEventListener('click', handleSelectPerson);

  document
    .querySelector('.idea-list')
    .addEventListener('click', handleSelectGift);

  loadInitialData();

  //TODO: add the `onSnapshot` listener
});

function loadInitialData() {
  //load the people collection and display
  getPeople();

  getIdeas();
}

async function getPeople() {
  const querySnapshot = await getDocs(collection(db, 'people'));
  querySnapshot.forEach((doc) => {
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
              <button class="edit">Edit</button>
              <button class="delete">Delete</button>
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
    <button class="edit">Edit</button>
    <button class="delete">Delete</button>
  </li>`;
  //add to people array
  people.push(person);
}

async function handleSelectPerson(ev) {
  //ev.target; - could be the button OR anything in the ul.
  const li = ev.target.closest('.person'); //see if there is a parent <li class="person">
  // console.log(`${li.getAttribute('data-id')} was clicked`);
  const id = li ? li.getAttribute('data-id') : null; // if li exists then the user clicked inside an <li>

  const collectionRef = collection(db, 'people');
  const docRef = doc(collectionRef, id);
  const docSnap = await getDoc(docRef);

  //then run a query where the `person-id` property matches the reference for the person
  const dldocs = query(
    collection(db, 'gift-ideas'),
    where('person-id', '==', docRef)
  );
  const dlquerySnapshot = await getDocs(dldocs);

  //select the first person from the list of people
  selectedPersonId = buildPeople(people);
  saveBtnPerson.className = 'editPerson';
  if (id) {
    //user clicked inside li
    selectedPersonId = id;
    //did they click the li content OR an edit button OR a delete button?
    if (ev.target.classList.contains('edit')) {
      saveBtnPerson.className = 'editPerson';

      document.querySelector('.overlay').classList.add('active');
      document.getElementById('dlgPerson').classList.add('active');

      if (saveBtnPerson.classList.contains('editPerson')) {
        document.querySelector(`#dlgPerson > h2`).innerHTML = `Edit ${
          docSnap.data().name
        }`;
        document.getElementById('name').value = docSnap.data().name;
        document.getElementById('month').value = docSnap.data()['birth-month'];
        document.getElementById('day').value = docSnap.data()['birth-day'];
      }
    } else if (ev.target.classList.contains('delete')) {
      // deletePerson(id, docSnap.data().name);

      let confirmDelete = window.confirm(
        `Delete ${docSnap.data().name} person and it's Gifts?`
      );
      if (confirmDelete) {
        //delete steps
        await deleteDoc(doc(db, 'people', id));

        dlquerySnapshot.forEach((dldoc) => {
          let dlid = dldoc.id;
          deleteDoc(doc(db, 'gift-ideas', dlid));
          console.log(`${docSnap.data().name} has id: ${dlid}`);
        });
        alert(`${docSnap.data().name} data removed successfully`);

        location.reload();
      } else if (ev.target.classList.contains('edit')) {
        console.log('delete idea');
      } else {
        console.log('Cancel');
      }
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

async function handleSelectGift(ev) {
  //ev.target; - could be the button OR anything in the ul.
  const li = ev.target.closest('.idea'); //see if there is a parent <li class="person">
  // console.log(`${li.getAttribute('data-id')} was clicked`);
  const id = li ? li.getAttribute('data-id') : null; // if li exists then the user clicked inside an <li>

  const collectionRef = collection(db, 'gift-ideas');
  const docRef = doc(collectionRef, id);
  const docSnap = await getDoc(docRef);

  saveBtnIdea.className = 'editIdea';
  if (id) {
    if (ev.target.classList.contains('dlgedit')) {
      saveBtnPerson.className = 'editIdea';
      selectedGiftId = id;

      document.querySelector('.overlay').classList.add('active');
      document.getElementById('dlgIdea').classList.add('active');

      if (saveBtnPerson.classList.contains('editIdea')) {
        document.querySelector(`#dlgIdea > h2`).innerHTML = `Edit ${
          docSnap.data().idea
        }`;
        document.getElementById('title').value = docSnap.data().idea;
        document.getElementById('location').value = docSnap.data().location;
      }
    } else if (ev.target.classList.contains('dlgdelete')) {
      // deletePerson(id, docSnap.data().name);
      console.log('in gift delete');
      let confirmDelete = window.confirm(`Delete ${docSnap.data().idea} Gift?`);
      if (confirmDelete) {
        //delete steps
        await deleteDoc(doc(db, 'gift-ideas', id));

        alert(`${docSnap.data().idea} data removed successfully`);

        location.reload();
      }
      //  else if (ev.target.id === `chk-${id}.checked`) {
      //   console.log('Bought');
      //   let bought = document.querySelector('.giftChecked');
      //   const boughtIdea = {
      //     idea,
      //     bought,
      //     location,
      //     'person-id': personRef,
      //   };
      //   if (bought.checked) {
      //     bought = 'true';
      //   } else {
      //     bought = 'false';
      //   }
      //   await updateDoc(doc(db, 'gift-ideas', id), boughtIdea);
      // }
      else {
        console.log('Cancel');
      }
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
    const data = doc.data();
    const id = doc.id;

    ideas.push({
      id,
      idea: data.idea,
      location: data.location,
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
                <label class="giftChecked" for="chk-${idea.id}"
                  ><input type="checkbox" id="chk-${idea.id}" ${
          idea.bought ? 'checked' : ''
        } /> Bought</label
                >
                <p class="title">${idea.idea}</p>
                <p class="location">${idea.location}</p>
                <button class="dlgedit">Edit</button>
                <button class="dlgdelete">Delete</button>
              </li>`;
      })
      .join('');
  } else {
    ul.innerHTML =
      '<li class="idea"><p></p><p>No Gift Ideas for selected person.</p></li>'; //clear in case there are no records to shows
  }
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
  if (saveBtnPerson.classList.contains('addPerson')) {
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
      saveBtnPerson.classList.remove('addPerson');
    } catch (err) {
      console.error('Error adding document: ', err);
      //do you want to stay on the dialog?
      //display a mesage to the user about the problem
    }
  }
  if (saveBtnPerson.classList.contains('editPerson')) {
    try {
      await updateDoc(doc(db, 'people', selectedPersonId), person);
      document.getElementById('name').value = '';
      document.getElementById('month').value = '';
      document.getElementById('day').value = '';
      //2. hide the dialog and the overlay by clicking on overlay
      document.querySelector('.overlay').click();

      showPerson(person);
      location.reload();
    } catch (err) {
      console.error('Error adding document: ', err);
    }
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
    saveBtnIdea.classList.remove('editIdea');
  } catch (err) {
    console.error('Error adding document: ', err);
    //do you want to stay on the dialog?
    //display a mesage to the user about the problem
  }
  if (saveBtnIdea.classList.contains('editIdea')) {
    try {
      await updateDoc(doc(db, 'gift-ideas', selectedGiftId), pidea);
      document.getElementById('title').value = '';
      document.getElementById('location').value = '';

      //2. hide the dialog and the overlay by clicking on overlay
      document.querySelector('.overlay').click();
      location.reload();
    } catch (err) {
      console.error('Error adding document: ', err);
    }
  }
  //TODO: update this function to work as an UPDATE method too
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
  saveBtnPerson.className = 'addPerson';
  saveBtnIdea.className = 'editIdea';
  document.querySelector('.overlay').classList.add('active');
  const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  document.getElementById(id).classList.add('active');
}
