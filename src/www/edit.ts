export async function editHTML() {
  return /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style>
body {
font-family: Arial, sans-serif;
}
.toolbar {
display: flex;
justify-content: space-between;
background-color: #f1f1f1;
padding: 10px;
}
.toolbar button {
margin-right: 5px;
}
.editor {
margin-top: 10px;
}
</style>
</head>
<body>
<div class="toolbar">
<button onclick="create()">Create</button>
<button onclick="read()">Read</button>
<button onclick="update()">Update</button>
<button onclick="deleteItem()">Delete</button>
<button onclick="save()">Save</button>
</div>
<div class="editor" contenteditable="true">
<p>Edit this text...</p>
</div>

<script>
function create() {
const editor = document.querySelector('.editor');
editor.innerHTML = '<p>New content...</p>';
}

function read() {
const editor = document.querySelector('.editor');
alert(editor.innerHTML);
}

function update() {
const editor = document.querySelector('.editor');
editor.innerHTML = '<p>Updated content...</p>';
}

function deleteItem() {
const editor = document.querySelector('.editor');
editor.innerHTML = '';
}

async function save() {
const editor = document.querySelector('.editor');
const content = editor.innerText;
const path = window.location.pathname.split('/edit/')[1];
if (path) {
try {
const response = await fetch('/' + path, {
method: 'POST',
headers: {
'Content-Type': 'text/plain'
},
body: content
});
if (response.ok) {
alert('Content saved successfully!');
//reload page
window.location.reload();
} else {
console.error('Failed to save content:', response.statusText);
}
} catch (error) {
console.error('Error saving content:', error);
}
}
}

window.onload = async function() {
const path = window.location.pathname.split('/edit/')[1];
if (path) {
try {
const response = await fetch('/' + path);
if (response.ok) {
const content = await response.text();
const editor = document.querySelector('.editor');
editor.innerText = content;
} else {
console.error('Failed to fetch resource:', response.statusText);
}
} catch (error) {
console.error('Error fetching resource:', error);
}
}
}
</script>
</body>
</html>
`;
}
