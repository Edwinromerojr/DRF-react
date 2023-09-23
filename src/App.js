import React, { useState, useEffect } from 'react';

import { MdDelete } from 'react-icons/md'
import './App.css';

function App() {
  const [todoList, setTodoList] = useState([]);
  const [activeItem, setActiveItem] = useState({
    id: null,
    title: '',
    completed: false,
  });
  const [editing, setEditing] = useState(false);

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    console.log('Fetching....');
    fetch('http://127.0.0.1:8000/api/task-list/')
      .then((response) => response.json())
      .then((data) => setTodoList(data));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveItem({
      ...activeItem,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('ITEM:', activeItem);

    const csrftoken = getCookie('csrftoken');

    let url = 'http://127.0.0.1:8000/api/task-create/';

    if (editing === true) {
      url = `http://127.0.0.1:8000/api/task-update/${activeItem.id}/`;
      setEditing(false);
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(activeItem),
    })
      .then((response) => {
        fetchTasks();
        setActiveItem({
          id: null,
          title: '',
          completed: false,
        });
      })
      .catch(function (error) {
        console.log('ERROR:', error);
      });
  };

  const startEdit = (task) => {
    setActiveItem(task);
    setEditing(true);
  };

  const deleteItem = (task) => {
    const csrftoken = getCookie('csrftoken');

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    })
      .then((response) => {
        fetchTasks();
      });
  };

  const strikeUnstrike = (task) => {
    task.completed = !task.completed;
    const csrftoken = getCookie('csrftoken');
    const url = `http://127.0.0.1:8000/api/task-update/${task.id}/`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({ title: task.title, completed: task.completed }),
    })
      .then(() => {
        fetchTasks();
      });

    console.log('TASK:', task.completed);
  };

  return (
    <div className="container">
      <div id="task-container">
        <div id="form-wrapper">
          <form onSubmit={handleSubmit} id="form">
            <div className="flex-wrapper">
              <div style={{ flex: 6 }}>
                <input
                  onChange={handleChange}
                  className="form-control"
                  id="title"
                  value={activeItem.title}
                  type="text"
                  name="title"
                  placeholder="Add task"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="submit"
                  id="submit"
                  className="btn"
                  name="Add"
                />
              </div>
            </div>
          </form>
        </div>
        <div id="list-wrapper">
          {todoList.map((task, index) => (
            <div key={index} className="task-wrapper flex-wrapper">
              <div
                onClick={() => strikeUnstrike(task)}
                style={{ flex: 7 }}
              >
                {task.completed === false ? (
                  <span>{task.title}</span>
                ) : (
                  <strike>{task.title}</strike>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => startEdit(task)}
                  className="btn btn-sm btn-secondary"
                >
                  Edit
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => deleteItem(task)}
                  className="btn btn-sm btn-danger"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
