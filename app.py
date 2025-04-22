from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

tasks = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    task = request.json.get('task')
    if task:
        new_task = {"id": len(tasks) + 1, "task": task, "done": False}
        tasks.append(new_task)
        return jsonify(new_task), 201
    return jsonify({"error": "Task is required"}), 400

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task['id'] != task_id]
    return jsonify({"message": "Task deleted"}), 200

@app.route('/tasks/<int:task_id>/toggle', methods=['PUT'])
def toggle_task(task_id):
    for task in tasks:
        if task['id'] == task_id:
            task['done'] = not task['done']
            return jsonify(task), 200
    return jsonify({"error": "Task not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)