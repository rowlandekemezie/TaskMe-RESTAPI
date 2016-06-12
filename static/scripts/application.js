'use strict';

function TasksViewModel() {
    var self = this;
    self.username = 'Rowland',
        self.password = 'ALMIGHTY',
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

    self.tasks([
        {
            title: ko.observable('title #1'),
            description: ko.observable('description #1'),
            done: ko.observable(false)
        },
        {
            title: ko.observable('title #2'),
            description: ko.observable('description #2'),
            done: ko.observable(true)
        }
    ]);

    self.beginAdd = function () {
        alert("Add");
    };
    self.beginEdit = function (task) {
        alert("Edit: " + task.title());
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

    self.ajax(self.uri, 'GET').then(function (data) {
        console.log(self.uri, 'this is the data from the server')
        for (var i = 0; i < data.tasks.length; i++) {
            self.tasks.push({
                uri: ko.observable(data.tasks[i].uri),
                title: ko.observable(data.tasks[i].title),
                description: ko.observable(data.tasks[i].description),
                done: ko.observable(data.tasks[i].done)
            })
        }
    })
}
ko.applyBindings(new TasksViewModel(), $('#main')[0]);