import React from "react";
import Todolist from './Todolist';
import Todogiftlist from "./Todogiftlist";
import { firestore } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddTodo() {
  const [name, setName] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [day, setDay] = React.useState("");
  const [idea, setIdea] = React.useState("");
  const [location, setLocation] = React.useState("");

///Add Parson
  const handleSubmitParson = async (e) => {
    e.preventDefault();
    if (name !== "" && month !== "" && day !== "") {
      await addDoc(collection(firestore, "People"), {
        name,
        day,
        month
      },setdialogAddparson(!dialogAddparson));
      setName("");
      setDay("");
      setMonth("");
    }
  };

  ///Add Gift
  const handleSubmitGift = async (e) => {
    e.preventDefault();
    if (idea !== "" && location !== "") {
      await addDoc(collection(firestore, "Gift-Ideas"), {
        idea,
        location,
        bought: false,
      },setdialogAddgift(!dialogAddgift));
      setIdea("");
      setLocation("");
    }
  };
  const [dialogAddparson, setdialogAddparson] = React.useState(false); 
  const [dialogAddgift, setdialogAddgift] = React.useState(false); 
  return (
    <div>
<main>
      <section className="people">
        <h2>People <button onClick={() => setdialogAddparson(!dialogAddparson)}>Add Person</button></h2>
        <Todolist/>
      </section>
      <section className="ideas">
        <h2>Ideas <button onClick={() => setdialogAddgift(!dialogAddgift)}>Add Idea</button></h2>
        <Todogiftlist/>
      </section>
    </main>

    {dialogAddparson && (
    <section className="overlay active">
      <dialog  className="dialog active">
        <h2>Add Person</h2>
        <p>
          <label>Name:</label>
          <input
            type="text"
          placeholder="person's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
        </p>
        <p>
          <label>Birth Month:</label>
          <input
            type="number"
            value={month}
          onChange={(e) => setMonth(e.target.value)}
            min="1"
            max="12"
      
          />
        </p>
        <p>
          <label >Birth Day:</label>
          <input
           type="number" 
           value={day}
          onChange={(e) => setDay(e.target.value)}
           min="1" max="31"  />
        </p>
        <p>
          <button onClick={() => setdialogAddparson(!dialogAddparson)}>Cancel</button>
          <button onClick={handleSubmitParson}>Save</button>
        </p>
      </dialog>
      </section>)}


      {dialogAddgift && (
    <section className="overlay active">
      <dialog className="active">
        <h2>Add Gift Idea</h2>
        <p>
          <label>Title:</label>
          <input
            type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
            placeholder="describe the gift"
          />
        </p>
        <p>
          <label >Location:</label>
          <input
            type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
            placeholder="store or website"
          />
        </p>
        <p>
          <button  onClick={() => setdialogAddgift(!dialogAddgift)}>Cancel</button>
          <button  onClick={handleSubmitGift}>Save</button>
        </p>
      </dialog>
    </section>
    )}
    
    </div>
  );
}