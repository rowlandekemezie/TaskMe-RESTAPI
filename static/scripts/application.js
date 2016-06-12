'use strict';

function TasksViewModel() {
    var self = this;
    self.username = '',
        self.password = '',
        self.uri = 'http://localhost:5000/crud-api/api/v1/tasks',
        self.tasks = ko.observableArray();

    self.ajax = function (uri, method, data) {
        var request = {
            url: uri,
            type: method,
            contentType: "application/json",
            accepts: "application/json",
            cache: false,
            dataType: 'json',
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization",
                    "Basic " + btoa(self.username + ":" + self.password));
            },
            error: function (jqXHR) {
                console.log("ajax error " + jqXHR.status);
            }
        };
        return $.ajax(request);
    };


    self.beginAdd = function () {
        $('#add').modal('show');
    };

    self.beginEdit = function (task) {
        editTaskViewModel.setTask(task);
        $('#edit').modal('show')
    };
    self.remove = function (task) {
        alert("Remove: " + task.title());
    };
    self.markInProgress = function (task) {
        task.done(false);
    };
    self.markDone = function (task) {
        task.done(true);
    };
    self.beginLogin = function () {
        $('#login').modal('show');
    };
    self.login = function (username, password) {
        self.username = username;
        self.password = password;
        self.ajax(self.uri, 'GET').then(function (data) {
            for (var i = 0; i < data.tasks.length; i++) {
                self.tasks.push({
                    uri: ko.observable(data.tasks[i].uri),
                    title: ko.observable(data.tasks[i].title),
                    description: ko.observable(data.tasks[i].description),
                    done: ko.observable(data.tasks[i].done)
                });
            }
        }, function (jqXHR) {
            if (jqXHR.status == 403)
                setTimeout(self.beginLogin, 500);
        });
    };

    self.beginLogin();

    // The post request to resource
    self.add = function (data) {
        self.ajax(self.uri, 'POST', data).then(function (data) {
            self.tasks.push({
                uri: ko.observable(data.tasks.uri),
                title: ko.observable(data.tasks.title),
                description: ko.observable(data.tasks.description),
                done: ko.observable(data.tasks.done)
            })

        })
    };

    // Update function
    self.updateTask = function (task, newTask) {
        var i = self.tasks.indexOf(task);
        self.tasks()[i].uri(newTask.uri);
        self.tasks()[i].title(newTask.title);
        self.tasks()[i].description(newTask.description);
        self.tasks()[i].done(newTask.done);
    };

    // The update request route
    self.edit = function (task, data) {
        self.ajax(task.uri(), 'PUT', data).then(function (data) {
            self.updateTask(task, data.tasks)
        })
    };

    // The delete task route
    self.remove = function (task) {
        self.ajax(task.uri(), 'DELETE').then(function () {
            self.tasks.remove(task);
        });
    };

    // Progress indicators
    self.markInProgress = function (task) {
        self.ajax(task.uri(), 'PUT', {done: false}).then(function (res) {
            self.updateTask(task, res.task);
        });
    };

    self.markDone = function (task) {
        self.ajax(task.uri(), 'PUT', {done: true}).then(function (res) {
            self.updateTask(task, res.task);
        });
    }
}

// Add task class
function AddTaskViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();

    self.addTask = function () {
        $('#add').modal('hide');
        tasksViewModel.add({
            title: self.title(),
            description: self.description()
        });
        self.title("");
        self.description("");
    }
}

// Edit task class
function EditTaskViewModel() {
    var self = this;
    self.title = ko.observable();
    self.description = ko.observable();
    self.done = ko.observable();

    self.setTask = function (task) {
        self.task = task;
        self.title(task.title());
        self.description(task.description());
        self.done(task.done());
        $('edit').modal('show');
    };
    self.editTask = function () {
        $('#edit').modal('hide');
        tasksViewModel.edit(self.task, {
            title: self.title(),
            description: self.description(),
            done: self.done()
        });
    }
}
// Authenttication class
function LoginViewModel() {
    var self = this;
    self.username = ko.observable();
    self.password = ko.observable();

    self.login = function () {
        $('#login').modal('hide');
        tasksViewModel.login(self.username(), self.password());
    }
}
var tasksViewModel = new TasksViewModel();
var loginViewModel = new LoginViewModel();
var addTaskViewModel = new AddTaskViewModel();
var editTaskViewModel = new EditTaskViewModel();
ko.applyBindings(tasksViewModel, $('#main')[0]);
ko.applyBindings(loginViewModel, $('#login')[0]);
ko.applyBindings(addTaskViewModel, $('#add')[0]);
ko.applyBindings(editTaskViewModel, $('#edit')[0]);

