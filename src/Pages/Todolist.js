import React from 'react'
import Todo from "./Todo";
import {firestore} from "../firebase";
import {   
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,} from "@firebase/firestore";


export default function Todolist() {
  const [dialogEditparson, setdialogEditparson] = React.useState(false); 
  const [editName, seteditName] = React.useState("0"); 
  const [editMonth, seteditMonth] = React.useState("0"); 
  const [editDay, seteditDay] = React.useState("0"); 
  const [targetID, settargetID] = React.useState("");
  const [todos, setTodos] = React.useState([]);

  React.useEffect(() => {
    const q = query(collection(firestore, "People"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });
    return () => unsub();
  }, []);

  const handleEdit = async (todo, name, month, day) => {
    setdialogEditparson(!dialogEditparson);
    settargetID(todo.id);
    seteditName(todo.name);
    seteditMonth(todo.month);
    seteditDay(todo.day);
  };
  const nameEdites = async (e) =>{
    await updateDoc(doc(firestore, "People", targetID), { name: editName, month: editMonth, day: editDay },setdialogEditparson(!dialogEditparson));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(firestore, "People", id));
  };
  return (
    <div className="App">
      <div className="todo_container">
        {todos.map((todo) => (
          <Todo
            key={todo.id}
            todo={todo}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ))}
      </div>

      {dialogEditparson && (
    <div >
       <section className="overlay active" onClick={()=>setdialogEditparson(!dialogEditparson)}>
       </section>
       <section className="overlays active">
      <dialog className="active">
        <h2>Edit {editName}</h2>
        <p>
          <label >Name:</label>
          <input 
          type="text" 
          value={editName}
          onChange={e => seteditName(e.target.value)} 
          placeholder="person's name"/>
        </p>
        <p>
          <label >Birth Month:</label>
          <input 
          type="number"
          value={editMonth}
          onChange={e => seteditMonth(e.target.value)}  
          min="1" max="12" />
        </p>
        <p>
          <label >Birth Day:</label>
          <input 
          type="number"
          value={editDay}
          onChange={e => seteditDay(e.target.value)} 
          min="1" max="31" />
        </p>
        <p>
          <button onClick={()=> setdialogEditparson(!dialogEditparson)}>Cancel</button>
          <button className="editPerson" onClick={nameEdites}>Save</button>
        </p>
      </dialog>
      </section>
    </div>
    )}
    </div>
  )
}
