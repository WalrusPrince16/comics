// * DOM

const
    nav = document.getElementById('nav'),
    navList = document.getElementById('nav__box'),
    episodeBox = document.getElementById('episode__box'),
    users = document.querySelectorAll('.options button'),
    toggleMenus = document.getElementById('toggle'),
    titleContent = document.getElementById('titleContent'),
    pics = document.querySelectorAll('.authors__pic');

// * Import Data

import epData from './data.js';

// * Init Functions

function init() {
    // * Takes an episode in the format of epData[episode]
    // Optional Arguments of first page load, and append episode
    changeEpisode(epData.creeperEpsLength, true);
    // * Generates a title for smaller screens
    generateTitle();
    updateTitleOnScroll();
    makeTableOfContents();
    addEventsListeners();
}

function generateTitle() {
    let numOfEp = document.getElementById('title');
    let titleOfEp = document.getElementById('titleSubtext');
    let episodeTitle = epData[epData.creeperEps.length - 1].title.split(':');
    if (numOfEp.innerText) return;
    numOfEp.innerText = episodeTitle[0];
    titleOfEp.innerText = episodeTitle[1];
}

function addEventsListeners() {
    users.forEach((user) => user.addEventListener('click', highlightSelection));

    nav.addEventListener('click', () => {
        navState(false, false, true, true);
    });

    toggleMenus.addEventListener('click', () => {
        toggleMenus.classList.toggle('on');
        toggleMenus.classList.contains('on') ? navState(true, true) : navState(false, false);
    });

    pics.forEach(pic => pic.addEventListener('click', changeOnPicClick));

    window.addEventListener('scroll', updateTitleOnScroll);

    document.getElementById("creeperGoToFirstEpisode").addEventListener("click", () => changeEpisode(epData.firstCreeperEp, true));
    document.getElementById("creeperGoToLastEpisode").addEventListener("click", () => changeEpisode(epData.creeperEpsLength, true));
    document.getElementById("dofGoToFirstEpisode").addEventListener("click", () => changeEpisode(epData.firstDofEp, true));
    document.getElementById("dofGoToLastEpisode").addEventListener("click", () => changeEpisode(`${epData.dofEpsLength}a`, true));
    document.getElementById("creeperGoToLatestStory").addEventListener("click", () => addStory('creeper1s', false));
}

// * Navigation Functions

function navState(titleElem, navElem, navListToggle=false, navTextToggle=false) {
    (titleElem) ? titleContent.classList.add('move') : titleContent.classList.remove('move');
    (navElem) ? nav.classList.add('move') : nav.classList.remove('move');
    if (navListToggle) navList.classList.toggle('nav__box--open');
    if (navTextToggle) window.setTimeout(() => (nav.innerText === "BROWSE") ? nav.innerText = "BACK" : nav.innerText = "BROWSE", 300);
}

function addStory(story, navCall=true) {
    (navCall) ? navState(false, false, true, true) : navState(false, false, false, false);
    episodeBox.innerHTML = "";
    let storyContentElem = document.createElement('div');
    storyContentElem.classList = 'episode episode--story';
    storyContentElem.innerText = epData[story].textContent;
    storyContentElem.id = story;
    episodeBox.appendChild(storyContentElem);
}

function createContentHeading(season) {
    let seasonHeadingUL = document.createElement('ul');
    seasonHeadingUL.classList = `nav-list__ul ${epData[season].author}`;
    seasonHeadingUL.innerHTML = /*html*/ `<li class="nav-list__ul-head flex justify-between items-center pt-4 border-b">${epData[season].title} <i class="nav__arrow fas fa-arrow-circle-down"></i></li>`;
    seasonHeadingUL.onclick = () => [].slice.call(seasonHeadingUL.children).forEach(li => li.classList.toggle('on'));
    if (seasonHeadingUL.classList.contains('creeper')) seasonHeadingUL.classList.add('on');
    return seasonHeadingUL;
}

function createEpisodeInNav(episode, media) {
    let li = document.createElement('li');
    li.innerText = `${epData[episode].title}`;
    li.classList = 'pl-8 py-4 border-b nav-list__li text-2xl';
    li.id = `${episode}`;
    if (media) {
        li.addEventListener('click', () => addStory(li.id));
    } else {
        li.addEventListener('click', changeEpisode);
    }
    return li;
}

function appendContentNav(ul, content) {
    let seasonNumber = epData[content].seasonNum;
    for (const episode in epData) {
        if (seasonNumber == epData[episode].season) {
            let mediaTypeStory = (seasonNumber.includes('s')) ? true : false;
            let li = createEpisodeInNav(episode, mediaTypeStory);
            ul.appendChild(li);
        }
    }
}

function makeTableOfContents() {
    let navList = document.getElementById('nav-list');
    navList.innerHTML = "";
    // * Creates a ul for each season and appends each episode to that ul as a li
    for (const content in epData) {
        // ! Collections are denoted with {string}SE{num}
        if (content.includes("SE")) {
            let contentUL = createContentHeading(content);
            navList.appendChild(contentUL);        
            appendContentNav(contentUL, content);
        } 
    }
}

function changeOnPicClick(e) { 
    let author = e.target.id.split('-')[0];
    (epData.activeAuthor < epData.authors.length - 1) ? epData.activeAuthor++: epData.activeAuthor = 0;
    pics.forEach(pic => (pic.id.includes(author)) ? pic.classList.add('authors__pic--on') : pic.classList.remove('authors__pic--on'));
    let accessEp = epData[`${author}EpsLength`];
    if (author === 'dof') accessEp = accessEp + 'a';
    changeEpisode(accessEp, true);
}

function highlightSelection(e) {
    [users, document.querySelectorAll('.nav-list__ul')].forEach(elem =>{
        elem.forEach(element=>{
            (element.id === e.target.id || element.classList.contains(e.target.id)) ? element.classList.add('on') : element.classList.remove('on')
        })
    })
}

// * Scroll Function

function updateTitleOnScroll() {
    function updateTitleText(id) {
        let episodeData = epData[id].title;
        let epNumAndTitle = episodeData.split(':');
        let numOfEp = document.getElementById('title');
        let titleOfEp = document.getElementById('titleSubtext');
        numOfEp.innerText = epNumAndTitle[0];
        titleOfEp.innerText = epNumAndTitle[1];
    };

    let episodes = document.querySelectorAll('.episode');

    episodes.forEach(
        function checkVisible(elm) {
            var rect = elm.getBoundingClientRect();
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            if (!(rect.bottom < 0 || rect.top - viewHeight >= 0)) updateTitleText(elm.id);
        }
    )
}

// * Next Episode Button

function createNextEpButton() {
    let nextEpButton = document.createElement("button");
    nextEpButton.innerText = "Next Episode";
    nextEpButton.classList = "next sm:col-span-1 md:col-span-2 text-center w-full p-8 border";
    return nextEpButton;
}

function calcCurrentSeries(ep) {
    let currentSeriesLength = 0;
    let episodeArr;

    if (ep.includes('a')) {
        currentSeriesLength += epData.dofEpsLength;
        episodeArr = epData.dofEps;
    } else {
        currentSeriesLength += epData.creeperEpsLength;
        episodeArr = epData.creeperEps;
    }

    return {
        len: currentSeriesLength,
        arr: episodeArr
    };
}

function getNextEpNumber(ep, arr, length) {
    // Get the next Episode's ID
    let indexOfCurrentEp = arr.indexOf(ep);
    if (indexOfCurrentEp <= length) return arr[indexOfCurrentEp + 1];
}

function appendEp(e) {
    changeEpisode(e, true, true);
    this.parentElement.removeChild(this);
}

function createLastEpButton(nextEpButton) {
    nextEpButton.innerText = "Browse";
    nextEpButton.addEventListener('click', () => navState(true, false, true, true));
}

function nextEpisode(ep) {
    // Creates the button that will load the next episode
    ep = ep.toString();
    let nextEpButton = createNextEpButton();
    let currentSeriesData = calcCurrentSeries(ep);

    let lastEpisodeButton = (currentSeriesData.arr.indexOf(ep) + 1 === currentSeriesData.len) ? true : false;

    if (lastEpisodeButton) {
        createLastEpButton(nextEpButton);
    } else {
        nextEpButton.id = getNextEpNumber(ep, currentSeriesData.arr, currentSeriesData.len);
        nextEpButton.addEventListener('click', appendEp);
    }

    episodeBox.lastChild.appendChild(nextEpButton);
}

// * Full Screen Function

function fullScreen(e) {
    const fullScreenBox = document.getElementById('fullScreenBox');
    const fullScreenImg = /*html*/ `<img class="sm:w-full w-2/5 h-auto border" src="${e.target.src}">`;
    const fullScreenClose = /*html*/ `<div id="close" class="top-0 right-0 p-8 text-5xl absolute"><i class="fas fa-times"></i></div>`;
    fullScreenBox.innerHTML = fullScreenImg + fullScreenClose;
    fullScreenBox.classList.toggle('on');
    fullScreenBox.addEventListener('click', () => {
        fullScreenBox.innerHTML = "";
        fullScreenBox.classList.remove('on');
    });
}

// * Episode Functions

function initChangeEpisode(firstLoad, append) {
    updateTitleOnScroll();
    navState(false, false, !firstLoad, (!firstLoad) ? true : false);
    if (!append) episodeBox.innerHTML = "";
}

function createEpisodeDiv(id) {
    let episode = document.createElement('div');
    episode.classList = "episode grid sm:grid-cols-1 md:grid-cols-2 gap-10 mb-10";
    episode.id = id;
    return episode;
}

function createEpisodeSlide(ep, i) {
    let slide = document.createElement('div');
    slide.classList = "slide border rounded-xl";
    let imgLink = `./imgs/ep${ep}/slide${i}.PNG`;
    let img = /*html*/ `<img class="slide__img w-full h-auto" src="${imgLink}">`;
    slide.innerHTML = img;
    slide.onclick = fullScreen;
    return slide;
}

function addSlideToDOM(episode, ep) {
    episodeBox.append(episode);
    nextEpisode(ep);
}

function changeEpisode(e, firstLoad = false, append = false) {
    initChangeEpisode(firstLoad, append);
    let ep = (e.target) ? e.target.id : e;
    let episode = createEpisodeDiv(ep);

    if (epData[ep].slides === 3) episode.classList.add('odd');

    for (let i = 1; i <= epData[ep].slides; i++) {
        let slide = createEpisodeSlide(ep, i);
        episode.appendChild(slide);
    }

    addSlideToDOM(episode, ep);
}

// * Init

init();