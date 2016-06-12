#!/Users/rowland/.envs/crud-api/bin/python

from flask import Flask, jsonify, abort, make_response, request, url_for
from flask_httpauth import HTTPBasicAuth

auth = HTTPBasicAuth()
app = Flask(__name__, static_url_path="")

tasks = [
    {"id": 1,
     "title": 'amazing architecture',
     "description": 'REST is a great web service architecture for our progress',
     "done": False
     },
    {"id": 2,
     "title": 'Andela',
     "description": 'Andela is an awesome place to be at all time',
     "done": False
     },
    {"id": 3,
     "title": 'Programming',
     "description": 'Programming is a very interesting way of solving problems bedelving human existence',
     "done": False
     }
]


# Definition for helper function to get the uri of each task
def make_uri(task):
    new_task = {}
    for field in task:
        if field == 'id':
            new_task['uri'] = url_for('get_task', task_id=task['id'], _external=True)
        else:
            new_task[field] = task[field]
    return new_task


# Getting password and authenticating routs
users = {
    'Rowland': 'ALMIGHTY',
    'Ekemezie': 'Igwebuike'
}


@auth.get_password
def get_password(username):
    print 'Got here man'
    for user in users:
        if username == user:
            return users.get(username)
    return None


@app.route('/crud-api/api/v1/tasks', methods=['GET'])
@auth.login_required
def get_tasks():
    return jsonify({'tasks': [make_uri(task) for task in tasks]})


@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Not authorized'}), 401)


@app.route('/crud-api/api/v1/tasks/<int:task_id>', methods=['GET'])
@auth.login_required
def get_task(task_id):
    task = [task for task in tasks if task['id'] == task_id]
    if len(task) == 0:
        abort(404)
    return jsonify({'task': task[0]})


@app.route('/crud-api/api/v1/tasks', methods=['POST'])
@auth.login_required
def create_task():
    if not request.json or 'title' not in request.json:
        abort(400)
    task = {
        "id": tasks[-1]['id'] + 1,
        "title": request.json['title'],
        "description": request.json.get('description', ''),
        "done": False
    }
    tasks.append(task)
    return jsonify({'task': task}), 201


@app.route('/crud-api/api/v1/tasks/<int:task_id>', methods=['PUT'])
@auth.login_required
def update_task(task_id):
    task = [task for task in tasks if task['id'] == task_id]
    if len(task) == 0 or not request.json:
        abort(400)
    if 'title' in request.json and type(request.json['title']) != unicode:
        abort(400)
    if 'description' in request.json and type(request.json['description']) is not unicode:
        abort(400)
    if 'done' in request.json and type(request.json['done']) is not bool:
        abort(400)
    task[0]['title'] = request.json.get('title', task[0]['title'])
    task[0]['description'] = request.json.get('description', task[0]['description'])
    task[0]['done'] = request.json.get('done', task[0]['done'])
    return jsonify({'task': task})


@app.route('/crud-api/api/v1/tasks/<int:task_id>', methods=['DELETE'])
@auth.login_required
def delete_task(task_id):
    task = [task for task in tasks if task['id'] == task_id]
    if len(task) == 0:
        abort(400)
    tasks.remove(task[0])
    return jsonify({'task': True})


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


if __name__ == "__main__":
    app.run(debug=True)
