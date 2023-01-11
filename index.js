const todoColumn = document.querySelector("#tasks #todo");
const inProgressColumn = document.querySelector("#tasks #in-progress");
const doneColumn = document.querySelector("#tasks #done");
let selectedTaskElement;
let selectedTask;
let tasks;
const taskIdPrefix = "task-";

function createTaskElement(id, title, description) {
	const newTaskElement = document.createElement("div");
	const newTaskTitle = document.createElement("p");
	const newTaskDesc = document.createElement("p");
	const newTaskTime = document.createElement("p");

	newTaskElement.id = taskIdPrefix + id;
	newTaskElement.classList.add("border", "rounded", "p-3");
	newTaskTitle.innerHTML = title;
	newTaskTitle.classList.add("fw-bold");
	newTaskDesc.innerHTML = description;
	newTaskTime.innerHTML = new Date().toDateString();
	newTaskTime.classList.add("fw-light", "m-0");
	
	newTaskElement.appendChild(newTaskTitle);
	newTaskElement.appendChild(newTaskDesc);
	newTaskElement.appendChild(newTaskTime);

	return newTaskElement;
}

function moveToInProgress() {
	if (selectedTaskElement && todoColumn.contains(selectedTaskElement)) {
		fetch(`http://localhost:3000/tasks/${selectedTaskElement.id.slice(taskIdPrefix.length)}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					"id": selectedTaskElement.id,
					"title": selectedTask.title,
					"description": selectedTask.description,
					"isInProgress": true,
					"completed": false
				})

			}).then(() => {
				todoColumn.removeChild(selectedTaskElement);
				inProgressColumn.appendChild(selectedTaskElement);
				selectedTaskElement.classList.toggle("selected");
				selectedTaskElement = null;
			});
	}
}

function moveToDone() {
	if (selectedTaskElement && inProgressColumn.contains(selectedTaskElement)) {
		fetch(`http://localhost:3000/tasks/${selectedTaskElement.id.slice(taskIdPrefix.length)}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					"id": selectedTaskElement.id,
					"title": selectedTask.title,
					"description": selectedTask.description,
					"isInProgress": false,
					"completed": true
				})

			}).then(() => {		
				inProgressColumn.removeChild(selectedTaskElement);
				doneColumn.appendChild(selectedTaskElement);
				selectedTaskElement.classList.toggle("selected");
				selectedTaskElement.classList.add("done");
				selectedTaskElement = null;
			});
	}
}


fetch("http://localhost:3000/tasks")
	.then((response) => response.json())
	.then((tasks) => {
		for (task of tasks) {
			const newTaskElement = createTaskElement(task.id, task.title, task.description);
			if (task.isInProgress) {
				inProgressColumn.appendChild(newTaskElement);
			} else if (task.completed) {
				newTaskElement.classList.add("done");
				doneColumn.appendChild(newTaskElement);
			} else {
				todoColumn.appendChild(newTaskElement);
			}
		}
	});

document.querySelector("form").addEventListener("submit", (event) => {
	event.preventDefault();

	const form = event.target;
	if (!form.querySelector("input").value || !form.querySelector("textarea").value) {
		return;
	}
	
	fetch("http://localhost:3000/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"title": form.querySelector("input").value,
				"description": form.querySelector("textarea").value,
				"isInProgress": false,
				"completed": false
			})
		}).then((response) => response.json())
		.then((newTask) => {

			const newTaskElement = createTaskElement(
				newTask.id,
				form.querySelector("input").value,
				form.querySelector("textarea").value
			);
		
			todoColumn.appendChild(newTaskElement);
		});
});

document.querySelectorAll("#todo, #in-progress").forEach(column => {
	column.addEventListener("click", (event) => {
		let currentTaskElement = event.target.closest(`[id^=${taskIdPrefix}]`);

		if (!selectedTaskElement) {
			selectedTaskElement = currentTaskElement;
			selectedTaskElement?.classList.toggle("selected");
			fetch(`http://localhost:3000/tasks/${selectedTaskElement.id.slice(taskIdPrefix.length)}`)
				.then((response) => response.json())
				.then((task) => {
					selectedTask = task;
				});

		} else if (selectedTaskElement === currentTaskElement) {
			selectedTaskElement = null;
			currentTaskElement.classList.toggle("selected");

		} else {
			selectedTaskElement.classList.toggle("selected");
			selectedTaskElement = currentTaskElement;
			currentTaskElement.classList.toggle("selected");
			fetch(`http://localhost:3000/tasks/${selectedTaskElement.id.slice(taskIdPrefix.length)}`)
				.then((response) => response.json())
				.then((task) => {
					selectedTask = task;
				});
		}
	})
})
