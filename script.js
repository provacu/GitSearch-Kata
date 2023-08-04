const resultsArea = document.querySelector(".results");
const searchArea = document.querySelector("#search-box");
const optGroupResults = document.querySelector(".autocomplete");
const optContainer = document.querySelector(".autocomplete__list");
const searchForm = document.querySelector('.app__search-form');

searchForm.addEventListener('submit', function(e) {
  e.preventDefault();
});

let textInput;
let arrOptions = [];

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timer);
    timer = setTimeout(fnCall, debounceTime);
  };
};

function createOptionElement(elem) {
  const option = document.createElement("option");
  option.dataset.name = elem.name;
  option.dataset.owner = elem.owner;
  option.dataset.stars = elem.stars;
  option.textContent = elem.name;
  return option;
}

function createOptions(arr) {
  if (optContainer.children.length === 0) {
    for (let i = 0; i < 5; i++) {
      optContainer.appendChild(createOptionElement(arr[i]));
    }
  } else {
    for (let i = 0; i < 5; i++) {
      optContainer.replaceChild(createOptionElement(arr[i]), optContainer.childNodes[i]);
    }
  }
}

function getRequest(text) {
  fetch(`https://api.github.com/search/repositories?q=${text}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })
    .then((response) => response.json())
    .then((parsedResponse) => {
      arrOptions = [];
      for (let elem of parsedResponse.items) {
        let repository = {};
        repository.name = elem.name;
        repository.stars = elem.stargazers_count;
        repository.owner = elem.owner.login;
        arrOptions.unshift(repository);
        optGroupResults.style.display = "block";
      }
      createOptions(arrOptions);
    });
}

let debGetRequest = debounce(getRequest, 400);

function createTemplateResult(element) {
  const fragment = document.createDocumentFragment();
  const repository = document.createElement("div");
  repository.classList.add("results__item");
  const nameRepository = document.createElement("p");
  nameRepository.textContent = `Name: ${element.dataset.name}`;
  const ownerRepository = document.createElement("p");
  ownerRepository.textContent = `Owner: ${element.dataset.owner}`;
  const starsRepository = document.createElement("p");
  starsRepository.textContent = `Stars: ${element.dataset.stars}`;
  const deleteButton = document.createElement('div');
  deleteButton.classList.add("results__delete-btn");
  deleteButton.onclick = function () {
    resultsArea.removeChild(repository);
  };
  repository.appendChild(nameRepository);
  repository.appendChild(ownerRepository);
  repository.appendChild(starsRepository);
  repository.appendChild(deleteButton);
  fragment.appendChild(repository);
  return fragment;
}

searchArea.addEventListener("keyup", (e) => {
  textInput = e.target.value;
  debGetRequest(textInput);
});

optGroupResults.addEventListener("click", (e) => {
  let target = e.target;
  let arrRepositories = Array.from(resultsArea.children);
  arrRepositories.push(createTemplateResult(target));

  arrRepositories.forEach((elem) => {
    if (resultsArea.children.length < 3) {
      resultsArea.appendChild(elem);
    }
  });
  searchArea.value = "";
  optGroupResults.style.display = "none";
});
