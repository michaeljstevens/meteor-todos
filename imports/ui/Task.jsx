import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Tasks } from '../api/tasks.js';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import { createContainer } from 'meteor/react-meteor-data';
import Task1 from './Task.jsx';

// Task component - represents a single todo item
class Task extends Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderTasks = this.renderTasks.bind(this);
  }

  toggleChecked() {
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
  }

  handleSubmit(event) {
    event.preventDefault();
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Meteor.call('tasks.insert', text, this.props.task);

    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    let that = this;
    return filteredTasks.map((task) => {
      if(task.parent && task.parent._id === that.props.task._id) {
        const currentUserId = that.props.currentUser && that.props.currentUser._id;
        const showPrivateButton = task.owner === currentUserId;

        return(
          <Task1
            parent={that.props.task._id}
            key={task._id}
            task={task}
            showPrivateButton={showPrivateButton}
            />
        );
      } else {
        return null;
      }
    });
  }

  render() {

    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
    });


    return (
      <li className={taskClassName}>
        <button className='delete' onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>
        <input
          type='checkbox'
          readOnly
          checked={this.props.task.checked}
          onClick={this.toggleChecked.bind(this)}
          />

        {this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.text}
        </span>

        {this.props.currentUser ? <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
          <input
            type="text"
            ref="textInput"
            placeholder="Type to add new tasks"
          />
        </form> : ''}

        {this.renderTasks()}
      </li>
    );
  }
}

Task.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  task: PropTypes.object.isRequired,
  showPrivateButton: React.PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    currentUser: Meteor.user(),
  };
}, Task);
