import React from 'react'

export default function Todogift({ todo, toggleComplete, handleDelete, handleEdit,}) {
    const [newIdea] = React.useState(todo.title);
    const [newLocation] = React.useState(todo.location);
  return (
    <div>




            <ul className="idea-list">
                <li className="idea">
                <label className="giftChecked">
                <input type="checkbox" defaultChecked={todo.bought} onClick={() => toggleComplete(todo)} /> Bought</label>
                <p className="title">{todo.idea}</p>
                <p className="location">{todo.location}</p>
                <button className="dlgedit" onClick={() => handleEdit(todo, newIdea, newLocation, )}>Edit</button>
                <button className="dlgdelete" onClick={() => handleDelete(todo.id)}>Delete</button>
              </li></ul>
    </div>
  )
}
