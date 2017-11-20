let settings = require('./settings'),
  MWBot = require("mwbot"),
  fs = require('fs'),
  path = require('path');

let server_api,
  files_list_data,
  files_list = [],
  objects_for_update = {},
  batchJobs = {};

function getFileContent(file_path) {
  let file_content = fs.readFileSync(file_path, 'utf-8');
  return file_content;
}

function getFileNameFromPath(file_path) {
  let file_path_parts = file_path.split('/');
  let file_name = file_path_parts.pop();
  file_name = file_name
    .replace(" - ", ":")
    .replace(".html", "")
    .replace(".mw", "")
    .replace(".md", "")
    .replace(".mediawiki", "");
  return file_name;
}

files_list_data = getFileContent('./updateArticlesList.txt');
files_list = files_list_data.split('\n');

for (let i = 0; i < files_list.length; i++) {
  if (files_list[i]) {
    let x = getFileNameFromPath(files_list[i]);
    let y = getFileContent(files_list[i]);
    objects_for_update[x] = y;
  }
}

batchJobs = {
  edit: objects_for_update
};

switch (process.argv[2]) {
  case '--dev':
    server_api = settings.server_dev_api;
    break;
  case '--test':
    server_api = settings.server_test_api;
    break;
  case '--prod':
    server_api = settings.server_prod_api;
    break;
  default:
    server_api = settings.server_dev_api;
    break;
}
let bot = new MWBot({
  apiUrl: server_api
});

bot.login({
  username: settings.bot_user,
  password: settings.bot_password
}).then((response) => {
  bot.getEditToken().then((response) => {

    bot.batch(batchJobs, 'update').then((response) => {
      // Success 
    }).catch((err) => {
      // Error 
    });

  }).catch((err) => {
    console.log(err);
  });
}).catch((err) => {
  console.log(err);
});