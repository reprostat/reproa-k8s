const statusBar = document.getElementsByTagName('status-bar')[0];

const body = document.body;
const projectForm = document.getElementById('projectForm')
const uploadForm = document.getElementById('uploadForm');
const clearProjectBtn = document.getElementById('clearProjectBtn');
const processFilesBtn = document.getElementById('processFilesBtn');
const spinner = document.getElementById('spinner');

// Sets or reloads variables
let currentPath = '';
const currentProject = new Proxy({name: ""},{
  set(target, propery, value) {
    if (typeof value == "string") {
      target[propery] = value;

      currentPath = value;

      // Save it in cache
      sessionStorage.setItem("currentProject", value);

      projectForm.setField("projectName", value);

      if (! value.length) { 
        statusBar.setStatus('info', `No project is specified`);
        fetchFolderContents("");
        return true 
      }

      uploadForm.form.elements['submitBtn'].disabled = false;
      statusBar.setStatus('info', `Current project: ${value}`);
      
      const fetchMakeDir = fetch(`/api/storage/mkdir/${value}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(response => {
          // Optionally refresh the page to reflect the results
          console.log(response.message);
          clearProjectBtn.disabled = false;

          return fetchFolderContents(value);
        })
        .catch(error => {
          console.error("Error occurred during fetch",error);

          return false;
        });    
      return fetchMakeDir;  
    } else {
      console.error("Error occurred",error);

      return false;
    };
  }
});

if (sessionStorage.getItem('currentProject')) {
  currentProject.name = sessionStorage.getItem('currentProject');
}

projectForm.form.addEventListener('submit', event => {
  event.preventDefault(); // Prevent the default form submission

  currentProject.name = event.currentTarget.projectName.value; 
});

uploadForm.form.addEventListener('submit', uploadFolders, false)

function uploadFolders(event) {
  event.preventDefault(); // Prevent the default form submission

  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  const formData = new FormData(this)

  const promises = [];

  for (const fieldToSend of uploadForm.fields) {
    const dataToSend = new FormData()
    for (const f of formData.getAll(fieldToSend)) { dataToSend.append("files",f) };

    promises.push(fetch(`/api/storage/upload/${currentProject.name}/${fieldToSend.slice("files[]".length)}`, {
      method: 'POST',
      body: dataToSend
    })
    .then(response => response.json().then(data => {      
      console.log(`Success uploading folder: ${data.message}`, data.files);
      return {
        status: response.status,
        reponse: data
      };
    }))
    .catch(error => {
      console.error('Error uploading folder:', error);
      return {
        status: response.status,
        reponse: error
      };
    }));
  };

  Promise.all(promises)
    .then((responses) => {
      for (const resp of responses) { console.log(resp.status, resp.reponse) };

      clearProjectBtn.disabled = false;
      processFilesBtn.disabled = false;

      spinner.style.display = 'none';
      body.classList.remove('blurred');

      fetchFolderContents(currentProject.name);
    });
};

// Function to fetch and display files and folders
function fetchFolderContents(path) {
  fetch(`/api/storage/files/${path}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return false;
      } else {
        displayFiles(data);
        return true;
      }
    });
}

// Function to display files and folders in the list
function displayFiles(items) {
  if (items.length && currentProject.name) {
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
  sessionStorage.setItem('currentPath', currentPath);
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

clearProjectBtn.addEventListener('click', function () {
  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  // Send a request to trigger file processing
  fetch(`/api/storage/clear/${currentProject.name}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      statusBar.setStatus('success', data.message)

      spinner.style.display = 'none';
      body.classList.remove('blurred');

      currentProject.name = "";

      clearProjectBtn.disabled = true;
      processFilesBtn.disabled = true;
    })
    .catch(error => {
      console.error('Error clearing storage:', error);

      spinner.style.display = 'none';
      body.classList.remove('blurred');
    });
});

processFilesBtn.addEventListener('click', function () {
  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  // Send a request to trigger file processing
  fetch(`/api/processor/process-data/${currentProject.name}`, {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => {
      statusBar.setStatus('success', `${data.message} Results are available at ${data.file}`)

      spinner.style.display = 'none';
      body.classList.remove('blurred');

      fetchFolderContents(currentProject.name);
    })
    .catch(error => {
      console.error('Error processing files:', error);

      spinner.style.display = 'none';
      body.classList.remove('blurred');
    });
});
// Initial load of root folder
fetchFolderContents(currentPath);