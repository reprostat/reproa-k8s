const body = document.body;
const statusBar = document.getElementById('statusBar');
const statusTxt = statusBar.getElementsByTagName('p')[0]
const uploadWorkflowForm = document.forms['uploadWorkflowForm'];
const uploadDataForm = document.forms['uploadDataForm'];
const clearProjectBtn = document.getElementById('clearProjectBtn');
const processFilesBtn = document.getElementById('processFilesBtn');
const spinner = document.getElementById('spinner');

// Sets or reloads variables
let currentPath = '';
let currentProject = '';
if (sessionStorage.getItem('currentProject')){
  currentProject = sessionStorage.getItem('currentProject');
}
if (sessionStorage.getItem('statusBar')) {
  let sb = JSON.parse(sessionStorage.getItem('statusBar'));
  statusMessage(sb.type, sb.message)
}

function statusMessage(type, message) {
  statusBar.className = `status ${type}`;
  statusTxt.innerHTML = `<strong>${type}</strong> - ${message}`;
  sessionStorage.setItem('statusBar',JSON.stringify({type: type, message: message}))
}

document.forms['createProject'].addEventListener('submit', event => {
  event.preventDefault(); // Prevent the default form submission

  currentProject = event.currentTarget.projectTxt.value;
  // Save if cache
  sessionStorage.setItem('currentProject',currentProject);

  uploadWorkflowForm.elements['uploadBtn'].disabled = false;
  uploadDataForm.elements['uploadBtn'].disabled = false;

  statusMessage('info',`Current project: ${currentProject}`);
});

uploadWorkflowForm.addEventListener('submit', uploadFolder, false)
uploadDataForm.addEventListener('submit', uploadFolder, false)

function uploadFolder(event) {
  event.preventDefault(); // Prevent the default form submission

  let type = /(?<=upload).*(?=Form)/.exec(event.currentTarget.id)

  const formData = new FormData(this);

  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  fetch(`/api/storage/upload/${currentProject}/${type}`, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {      
    console.log(data.message, data.files);

    spinner.style.display = 'none';
    body.classList.remove('blurred');

    window.location.reload(); // Reload to show updated file list

    clearProjectBtn.disabled = false;
    processFilesBtn.disabled = false;

    statusMessage('success', `${type}: ${data.message}`);
  })
  .catch(error => {
    console.error('Error uploading folder:', error);

    spinner.style.display = 'none';
    body.classList.remove('blurred');
  });
};

// Function to fetch and display files and folders
function fetchFolderContents(path) {
  fetch(`/api/storage/files/${path}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        displayFiles(data);
      }
    });
}

// Function to display files and folders in the list
function displayFiles(items) {  
  if (items.length && currentProject) {
    clearProjectBtn.disabled = false;
    processFilesBtn.disabled = false;
  }

  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    
    if (item.type === 'folder') {
      li.classList.add('folder');
      li.addEventListener('click', () => navigateToFolder(item.name));
    } else {
      li.classList.add('file');
      li.addEventListener('click', () => downloadFile(item.name));
    }

    fileList.appendChild(li);
  });

  updateBreadcrumb();
}

// Function to navigate into a folder
function navigateToFolder(folderName) {
  currentPath += (currentPath ? '/' : '') + folderName;
  fetchFolderContents(currentPath);
}

// Function to go back in the breadcrumb
function navigateToPath(pathIndex) {
  const pathArray = currentPath.split('/');
  currentPath = pathArray.slice(0, pathIndex + 1).join('/');
  sessionStorage.setItem('currentPath',currentPath);
  fetchFolderContents(currentPath);
}

// Function to update breadcrumb navigation
function updateBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.innerHTML = '';

  // Prefix
  const span = document.createElement('span');
  span.textContent = 'Path';
  span.classList.add('breadcrumb-item');
  breadcrumb.appendChild(span);

  const pathArray = currentPath.split('/');
  pathArray.forEach((dir, index) => {
    const span = document.createElement('span');
    span.textContent = dir || 'storage';
    span.classList.add('breadcrumb-item');
    span.addEventListener('click', () => navigateToPath(index));
    breadcrumb.appendChild(span);
  });
}

// Function to download a file
function downloadFile(fileName) {
  const downloadUrl = `/api/storage/download/${currentPath ? currentPath + '/' : ''}${fileName}`;
  window.location.href = downloadUrl;
}

clearProjectBtn.addEventListener('click', function() {
  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  // Send a request to trigger file processing
  fetch(`/api/storage/clear/${currentProject}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    statusMessage('success',data.message)

    spinner.style.display = 'none';
    body.classList.remove('blurred');

    // Optionally refresh the page to reflect the results
    window.location.reload();

    clearProjectBtn.disabled = true;
    processFilesBtn.disabled = true;      
  })
  .catch(error => {
    console.error('Error clearing storage:', error);

    spinner.style.display = 'none';
    body.classList.remove('blurred');
  });
});

processFilesBtn.addEventListener('click', function() {
  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  // Send a request to trigger file processing
  fetch(`/api/processor/process-data/${currentProject}`, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    statusMessage('success',`${data.message} Results are available at ${data.file}`)

    spinner.style.display = 'none';
    body.classList.remove('blurred');

    // Optionally refresh the page to reflect the results
    window.location.reload();
  })
  .catch(error => {
    console.error('Error processing files:', error);

    spinner.style.display = 'none';
    body.classList.remove('blurred');
  });
});
// Initial load of root folder
fetchFolderContents('');