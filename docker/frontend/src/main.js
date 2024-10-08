const fileBrowser = document.getElementsByTagName('file-browser')[0];
const statusBar = document.getElementsByTagName('status-bar')[0];

const body = document.body;
const projectForm = document.getElementById('projectForm')
const uploadForm = document.getElementById('uploadForm');
const clearProjectBtn = document.getElementById('clearProjectBtn');
const processFilesBtn = document.getElementById('processFilesBtn');
const spinner = document.getElementById('spinner');

// Sets or reloads variables
const currentProject = new Proxy({name: ""},{
  set(target, propery, value) {
    if (typeof value == "string") {
      target[propery] = value;

      fileBrowser.currentPath = value;

      // Save it in cache
      sessionStorage.setItem("currentProject", value);

      projectForm.setField("projectName", value);

      if (! value.length) { 
        statusBar.setStatus('info', `No project is specified`);
        uploadForm.form.elements['submitBtn'].disabled = true;
        fileBrowser.fetchFolderContents("");
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

          return fileBrowser.fetchFolderContents(value);
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
  event.preventDefault();

  currentProject.name = event.currentTarget.projectName.value; 
});

uploadForm.form.addEventListener('submit', event => {
  event.preventDefault();

  // Show spinner and add blur effect
  spinner.style.display = 'block';
  body.classList.add('blurred');

  const promises = [];

  for (const fieldToSend of uploadForm.fields) {
    const dataToSend = new FormData()
    for (const f of uploadForm.getField(fieldToSend)) { dataToSend.append("files",f) };

    promises.push(fetch(`/api/storage/upload/${currentProject.name}/${fieldToSend}`, {
      method: 'POST',
      body: dataToSend
    })
    .then(response => response.json().then(data => {      
      console.log(data.message, data.files);
      return {
        status: response.status,
        field: fieldToSend,
        response: data.message
      };
    }))
    .catch(error => {
      console.error('Error uploading folder:', error);
      return {
        status: response.status,
        field: fieldToSend,
        response: error // TODO: extract message
      };
    }));
  };

  Promise.all(promises)
    .then(responses => {
      let status = [];
      let message = [];
      for (const resp of responses) { 
        if (resp.status == 200) { status.push("success") } else { status.push("error") };
        message.push(resp.field + ": " + resp.response);
      };
      statusBar.setStatus(status, message);

      clearProjectBtn.disabled = false;
      processFilesBtn.disabled = false;

      spinner.style.display = 'none';
      body.classList.remove('blurred');

      fileBrowser.fetchFolderContents(currentProject.name);
    });
});

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

      fileBrowser.fetchFolderContents(currentProject.name);
    })
    .catch(error => {
      console.error('Error processing files:', error);

      spinner.style.display = 'none';
      body.classList.remove('blurred');
    });
});
// Initial load of root folder
fileBrowser.fetchFolderContents();