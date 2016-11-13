import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if(Meteor.isServer) {
  Meteor.publish('tasks', function tasksPublication () {
    return Tasks.find();
  });
}

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);

    if(!this.userId) {
      throw new Meteor.error('not-authorized');
    }

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'tasks.remove'(taskId) {
    check(taskId, String);
    Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    Tasks.update(taskId, { $set:{ checked: setChecked } });
  }
});
