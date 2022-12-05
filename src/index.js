import { initializeApp } from 'firebase/app';
import {
  GithubAuthProvider,
  getAuth,
  TwitterAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB6djWhodEqw8crZZt85Ig1I2caq2bVBtA',
  authDomain: 'mad9135-hybrid-1-d294b.firebaseapp.com',
  projectId: 'mad9135-hybrid-1-d294b',
  storageBucket: 'mad9135-hybrid-1-d294b.appspot.com',
  messagingSenderId: '114567409114',
  appId: '1:114567409114:web:8a3f98390259b728e2a4e3',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// get a reference to the database
const db = getFirestore(app);

///Github Signin
const GithubSignin = document.getElementById('GithubSignin');
GithubSignin.onclick = function () {
  const provider = new GithubAuthProvider();
  try {
    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
      const usersColRef = collection(db, 'users');
      setDoc(
        doc(usersColRef, user.uid),
        {
          _id: user.uid,
          displayName: user.displayName,
          email: user.email,
        },
        { merge: true }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

///Twitter SignIn
const TwitterSignin = document.getElementById('TwitterSignin');
TwitterSignin.onclick = function () {
  const provider = new TwitterAuthProvider();
  try {
    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
      const usersColRef = collection(db, 'users');
      setDoc(
        doc(usersColRef, user.uid),
        {
          _id: user.uid,
          displayName: user.displayName,
          email: user.email,
        },
        { merge: true }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

///User Auth check
var Userclass = document.getElementsByClassName('Userclass');
var NoUserclass = document.getElementsByClassName('NoUserclass');
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    getPeople();
    getIdeas();
    document.getElementById('usernames').innerHTML = currentUser.displayName;
    sessionStorage.setItem('AuthUserID', currentUser.uid);
    ////User element Display
    for (var i = 0; i < Userclass.length; i++) {
      Userclass[i].style.display = 'block';
    }
    ///No user element
    for (var i = 0; i < NoUserclass.length; i++) {
      NoUserclass[i].style.display = 'none';
    }
  } else {
    sessionStorage.removeItem('AuthUserID');
    ////User element Display
    for (var i = 0; i < Userclass.length; i++) {
      Userclass[i].style.display = 'none';
    }
    ///No user element
    for (var i = 0; i < NoUserclass.length; i++) {
      NoUserclass[i].style.display = 'block';
    }
  }
});

///Logout User
const logouts = document.getElementById('logouts');

logouts.onclick = function () {
  signOut(auth);
};

///////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
/////////////////////////People List Add///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
let selectedPersonId = null;
let selectedGiftId = null;
let saveBtnPerson = document.getElementById('btnSavePerson');
saveBtnPerson.classList.add('addPerson');
let saveBtnIdea = document.getElementById('btnSaveIdea');
saveBtnIdea.classList.add('addIdea');

document.getElementById('btnAddPerson').addEventListener('click', showOverlay);
document
  .getElementById('btnCancelPerson')
  .addEventListener('click', hideOverlay);
document.getElementById('btnSavePerson').addEventListener('click', savePerson);

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
    owner: sessionStorage.getItem('AuthUserID'),
  };
  if (saveBtnPerson.classList.contains('addPerson')) {
    try {
      const docRef = await addDoc(collection(db, 'People'), person);
      console.log('Document written with ID: ', docRef.id);
      //1. clear the form fields
      document.getElementById('name').value = '';
      document.getElementById('month').value = '';
      document.getElementById('day').value = '';
      //2. hide the dialog and the overlay by clicking on overlay
      document.querySelector('.overlay').click();
      //3. TODO: display a message to the user about success
      alert('Add people Sucess');
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
      await updateDoc(doc(db, 'People', selectedPersonId), person);
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
}

function showPerson(person) {
  const ul = document.querySelector('ul.person-list');
  const dob = `${months[person['birth-month'] - 1]} ${person['birth-day']}`;
  ul.innerHTML += `<li id="${person.id}" class="person">
      <p class="name">${person.name}</p>
      <p class="dob">${dob}</p>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </li>`;
  //add to people array
  people.push(person);
}

////////////////////////////////////////////////////////////////////////////
/////////////////////////People List Show///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
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

async function getPeople() {
  const querySnapshot = await getDocs(collection(db, 'People'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    people.push({ id, ...data });
  });
  buildPeople(people);
}

function buildPeople(people) {
  var data_filter_People = people.filter(
    (element) => element.owner == sessionStorage.getItem('AuthUserID')
  );
  //build the HTML
  const ul = document.querySelector('ul.person-list');
  //replace the old ul contents with the new.
  ul.innerHTML = data_filter_People
    .map((person) => {
      const dob = `${months[person['birth-month'] - 1]} ${person['birth-day']}`;
      // console.log(`show ${person.id}`);
      //Use the number of the birth-month less 1 as the index for the months array
      return `<li id="${person.id}" class="person">
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

////////////////////////////////////////////////////////////////////////////
/////////////////////////Pepole List Edit///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
const peopleList = document.querySelector('#personListsID');
peopleList.addEventListener('click', async function (e) {
  if (e.target.className === 'edit') {
    const pepoleID = e.target.closest('li').id;
    const collectionRef = collection(db, 'People');
    const docRef = doc(collectionRef, pepoleID);
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data().name);
    selectedPersonId = pepoleID;
    saveBtnPerson.classList.remove('addPerson');
    saveBtnPerson.classList.add('editPerson');
    document.getElementById('name').value = docSnap.data().name;
    document.getElementById('month').value = docSnap.data()['birth-month'];
    document.getElementById('day').value = docSnap.data()['birth-day'];
    showOverlayedit('peopleEdit');
  } else if (e.target.className === 'delete') {
    let pepoleID = e.target.closest('li').id;
    await deleteDoc(doc(db, 'People', pepoleID));
    relodlocation();
  }
});

///////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
/////////////////////////Idea List add///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
document.getElementById('btnAddIdea').addEventListener('click', showOverlay);
document.getElementById('btnCancelIdea').addEventListener('click', hideOverlay);
document.getElementById('btnSaveIdea').addEventListener('click', saveIdea);

async function saveIdea() {
  //take the information from the dialog, save as an object, push to firestore
  let idea = document.getElementById('title').value;
  let location = document.getElementById('location').value;
  if (!title || !location) return; //form needs more info
  const pidea = {
    idea,
    location,
    person_id: sessionStorage.getItem('AuthUserID'),
  };
  if (saveBtnIdea.classList.contains('addIdea')) {
    try {
      const docRef = await addDoc(collection(db, 'gift-ideas'), pidea);
      console.log('Document written with ID: ', docRef.id);
      //1. clear the form fields
      document.getElementById('title').value = '';
      document.getElementById('location').value = '';
      //2. hide the dialog and the overlay by clicking on overlay
      document.querySelector('.overlay').click();
      //3. TODO: display a message to the user about success

      //4. ADD the new HTML to the <ul> using the new object
      saveBtnIdea.classList.remove('addIdea');
    } catch (err) {
      console.error('Error adding document: ', err);
    }
  }
  if (saveBtnIdea.classList.contains('editIdea')) {
    try {
      await updateDoc(doc(db, 'gift-ideas', selectedGiftId), pidea);
      document.getElementById('title').value = '';
      document.getElementById('location').value = '';
      //2. hide the dialog and the overlay by clicking on overlay
      document.querySelector('.overlay').click();
      relodlocation();
    } catch (err) {
      console.error('Error adding document: ', err);
    }
  }
}

////////////////////////////////////////////////////////////////////////////
/////////////////////////Idea List Show///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
const ideas = [];
async function getIdeas() {
  const querySnapshot = await getDocs(collection(db, 'gift-ideas'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    ideas.push({ id, ...data });
  });
  buildIdeas(ideas);
}

function buildIdeas(ideas) {
  const ul = document.querySelector('.idea-list');
  console.log(ideas);
  if (ideas.length) {
    ul.innerHTML = ideas
      .map((idea) => {
        // console.log(`show ${idea.id}`);
        return `<li class="idea" id="${idea.id}">
              <label class="giftChecked">
              <input type="checkbox"  />
               Bought
              </label>
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
}

////////////////////////////////////////////////////////////////////////////
/////////////////////////Idea List Edit///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
const idealeList = document.querySelector('#IdeaListsID');
idealeList.addEventListener('click', async function (e) {
  if (e.target.className === 'dlgedit') {
    const ideaID = e.target.closest('li').id;
    const collectionRef = collection(db, 'gift-ideas');
    const docRef = doc(collectionRef, ideaID);
    const docSnap = await getDoc(docRef);

    if (docSnap.data().person_id == sessionStorage.getItem('AuthUserID')) {
      console.log(docSnap.data().person_id);
      selectedGiftId = ideaID;
      saveBtnIdea.classList.remove('addIdea');
      saveBtnIdea.classList.add('editIdea');
      document.getElementById('title').value = docSnap.data().idea;
      document.getElementById('location').value = docSnap.data().location;
      showOverlayedit('ideaEdit');
    } else {
      alert('You are not edit permission this idea');
    }
  } else if (e.target.className === 'dlgdelete') {
    const ideaID = e.target.closest('li').id;
    const collectionRef = collection(db, 'gift-ideas');
    const docRef = doc(collectionRef, ideaID);
    const docSnap = await getDoc(docRef);
    if (docSnap.data().person_id == sessionStorage.getItem('AuthUserID')) {
      let ideaID = e.target.closest('li').id;
      await deleteDoc(doc(db, 'gift-ideas', ideaID));
      relodlocation();
    }
  }
});

///Location relod
function relodlocation() {
  location.reload();
}

////Over Popup Close
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

////Over Popup Open
function showOverlay(ev) {
  ev.preventDefault();
  saveBtnPerson.className = 'addPerson';
  saveBtnIdea.className = 'addIdea';
  document.querySelector('.overlay').classList.add('active');
  const id = ev.target.id === 'btnAddPerson' ? 'dlgPerson' : 'dlgIdea';
  document.getElementById(id).classList.add('active');
}

function showOverlayedit(edititem) {
  document.querySelector('.overlay').classList.add('active');
  if (edititem == 'ideaEdit') {
    document.getElementById('dlgIdea').classList.add('active');
  } else {
    document.getElementById('dlgPerson').classList.add('active');
  }
}
