import React from 'react';

export default function Todo({
  todo,
  toggleComplete,
  handleDelete,
  handleEdit,
}) {
  const [newName] = React.useState(todo.name);
  const [newMonth] = React.useState(todo.month);
  const [newDay] = React.useState(todo.day);
  const months = [
    'Month',
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

  return (
    <div>
      <ul className="person-list">
        <li data-id="Gq0CWVBSguA5x4tljhBk" className="person">
          <p className="name">{todo.name}</p>
          <p className="dob">
            {months[todo.month]} {todo.day}
          </p>
          <button
            className="edit"
            onClick={() => handleEdit(todo, newName, newMonth, newDay)}
          >
            Edit
          </button>
          <button className="delete" onClick={() => handleDelete(todo.id)}>
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
}
