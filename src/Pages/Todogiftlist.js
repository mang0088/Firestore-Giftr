import React from 'react';
import Todogift from './Todogift';
import {firestore} from "../firebase";
import {   
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,} from "@firebase/firestore";

export default function Todogiftlist() {
const [dialogEditgift, setdialogEditgift] = React.useState(false); 
const [editIdea, seteditIdea] = React.useState(""); 
const [editlocation, seteditLocation] = React.useState(""); 
const [targetID, settargetID] = React.useState("");
const [todos, setTodos] = React.useState([]);

React.useEffect(() => {
    const q = query(collection(firestore, "Gift-Ideas"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });
    return () => unsub();
  }, []);

  const handleEdit = async (todo, idea, location) => {
    setdialogEditgift(!dialogEditgift);
    settargetID(todo.id);
    seteditIdea(todo.idea);
    seteditLocation(todo.location);
  };

  const giftEdites = async (e) =>{
    await updateDoc(doc(firestore, "Gift-Ideas", targetID), { idea: editIdea, location: editlocation },setdialogEditgift(!dialogEditgift));
  };
  const toggleComplete = async (todo) => {
    await updateDoc(doc(firestore, "Gift-Ideas", todo.id), { bought: !todo.bought });
  };
  const handleDelete = async (id) => {
    await deleteDoc(doc(firestore, "Gift-Ideas", id));
  };
  return (
    <div className="App">
        <div className="todo_container">
        {todos.map((todo) => (
          <Todogift
            key={todo.id}
            todo={todo}
            toggleComplete={toggleComplete}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ))}
      </div>

      {dialogEditgift && (
    <div >
       <section className="overlay active" onClick={()=>setdialogEditgift(!dialogEditgift)}>
       </section>
       <section className="overlays active">
      <dialog className="active">
        <h2>Edit {editIdea}</h2>
        <p>
          <label >Title:</label>
          <input 
          type="text" 
          value={editIdea}
          onChange={e => seteditIdea(e.target.value)} 
          placeholder="describe the gift"/>
        </p>
        <p>
          <label >Location:</label>
          <input 
          type="text"
          value={editlocation}
          onChange={e => seteditLocation(e.target.value)}  
           />
        </p>
        <p>
          <button onClick={()=> setdialogEditgift(!dialogEditgift)}>Cancel</button>
          <button className="editPerson" onClick={giftEdites}>Save</button>
        </p>
      </dialog>
      </section>
    </div>
    )}

    </div>
  )
}
