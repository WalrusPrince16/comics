// * DOM

const
    $nav = $('#nav'),
    $navList = $('#nav__box'),
    $episodeBox = $('#episode__box'),
    $users = $('.options button'),
    $toggleMenus = $('#toggle'),
    $titleContent = $('#titleContent'),
    $pics = $('.authors__pic');

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
    $(".author button").click(function() {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#episode__box").offset().top
        }, 1500);
    });

    $users.on('click', highlightSelection);

    $nav.on('click', () => navState(false, false, true, true));

    $toggleMenus.on('click', () => {
        $toggleMenus.toggleClass('on');
        $toggleMenus.class().contains('on') ? navState(true, true) : navState(false, false);
    });

    $pics.click(changeOnPicClick);

    window.addEventListener('scroll', updateTitleOnScroll);

    document.getElementById("creeperGoToFirstEpisode").addEventListener("click", () => changeEpisode(epData.firstCreeperEp, true));
    document.getElementById("creeperGoToLastEpisode").addEventListener("click", () => changeEpisode(epData.creeperEpsLength, true));
    document.getElementById("dofGoToFirstEpisode").addEventListener("click", () => changeEpisode(epData.firstDofEp, true));
    document.getElementById("dofGoToLastEpisode").addEventListener("click", () => changeEpisode(`${epData.dofEpsLength}a`, true));
    document.getElementById("creeperGoToLatestStory").addEventListener("click", () => addStory('creeper1s', false));
}

// * Navigation Functions

function navState(titleElem, navElem, navListToggle=false, navTextToggle=false) {
    console.log(`Called: Move Title: ${titleElem} Move Nav: ${navElem} Toggle Text: ${navTextToggle}`);
    (titleElem) ? $titleContent.addClass('move') : $titleContent.removeClass('move');
    (navElem) ? $nav.addClass('move') : $nav.removeClass('move');
    if (navListToggle) $navList.toggleClass('nav__box--open');
    if (navTextToggle) window.setTimeout(() => ($nav.text() === "BROWSE") ? $nav.text("BACK") : $nav.text("BROWSE"), 300);
}

function addStory(story, openedFromNav=false) {
    (openedFromNav) ? navState(false, false, true, true) : navState(false, false);
    $episodeBox.html("").append($(/*html*/`<div id="${story}" class="episode episode--story"></div>`).html(epData[story].textContent));
}

function createContentHeading(season) {
    let $seasonHeadingUL = $(/*html*/`<ul class="nav-list__ul ${epData[season].author}"></ul>`).html(/*html*/`<li class="nav-list__ul-head flex justify-between items-center pt-4 border-b">${epData[season].title} <i class="nav__arrow fas fa-arrow-circle-down"></i></li>`);
    $seasonHeadingUL.on('click', function() { $(this).children().each( function() { $(this).toggleClass('on') } ) });
    if ($seasonHeadingUL.hasClass('creeper')) $seasonHeadingUL.addClass('on');
    return $seasonHeadingUL;
}

function createEpisodeInNav(episode, media) {
    let $li = $(/*html*/`<li id="${episode}" class="nav-list__li"></li>`).text(epData[episode].title);
    if (media) {
        $li.on('click', () => addStory($li.attr('id'), true));
    } else {
        $li.on('click', changeEpisode);
    }
    return $li;
}

function appendContentNav($ul, content) {
    let seasonNumber = epData[content].seasonNum;
    for (const episode in epData) {
        if (seasonNumber == epData[episode].season) {
            let mediaTypeStory = (seasonNumber.includes('s')) ? true : false;
            let $li = createEpisodeInNav(episode, mediaTypeStory);
            $ul.append($li);
        }
    }
}

function makeTableOfContents() {
    $("#nav-list").html("");
    // * Creates a ul for each season and appends each episode to that ul as a li
    for (const content in epData) {
        // ! Collections are denoted with {string}SE{num}
        if (content.includes("SE")) {
            let $contentUL = createContentHeading(content);
            $("#nav-list").append($contentUL);        
            appendContentNav($contentUL, content);
        } 
    }
}

function changeOnPicClick(e) {
    let author = e.target.id.split('-')[0];
    (epData.activeAuthor < epData.authors.length - 1) ? epData.activeAuthor++: epData.activeAuthor = 0;
    $pics.each(function() { ($(this).attr("id").includes(author)) ? $(this).addClass('authors__pic--on') : $(this).removeClass('authors__pic--on') });
    let accessEp = epData[`${author}EpsLength`];
    if (author === 'dof') accessEp = accessEp + 'a';
    changeEpisode(accessEp, true);
}

function highlightSelection(e) {
    $users.each(function() { $(this).attr('id') === e.target.id || $(this).hasClass(e.target.id) ? $(this).addClass('on') : $(this).removeClass('on') });
    $('.nav-list__ul').each(function() { $(this).attr('id') === e.target.id || $(this).hasClass(e.target.id) ? $(this).addClass('on') : $(this).removeClass('on') });
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
    return $(/*html*/`<button class="next sm:col-span-1 md:col-span-2 text-center w-full p-8 border">Next Episode</button>`);
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

function createLastEpButton($nextEpButton) {
    $nextEpButton.text("Browse").on('click', () => navState(true, false, true, true));
}

function nextEpisode(ep) {
    // Creates the button that will load the next episode
    ep = ep.toString();
    let $nextEpButton = createNextEpButton();
    let currentSeriesData = calcCurrentSeries(ep);
    let lastEpisodeButton = (currentSeriesData.arr.indexOf(ep) + 1 === currentSeriesData.len) ? true : false;

    if (lastEpisodeButton) {
        createLastEpButton($nextEpButton);
    } else {
        $nextEpButton.attr("id", getNextEpNumber(ep, currentSeriesData.arr, currentSeriesData.len)); 
        $nextEpButton.on('click', appendEp);
    };
    
    $(".episode:last-child").append($nextEpButton)
}

// * Full Screen Function

function fullScreen(e) {
    $("#fullScreenBox").html(`<img class="w-4/5 h-4/5 border" src="${e.target.src}"><div id="close" class="top-0 right-0 p-4 text-5xl absolute"><i class="fas fa-times"></i></div>`)
        .toggleClass('on')
        .on('click', () => {
            $("#fullScreenBox").html("").removeClass('on');
        });
}

// * Episode Functions

function initChangeEpisode(firstLoad, append) {
    updateTitleOnScroll();
    navState(false, false, !firstLoad, (!firstLoad) ? true : false);
    if (!append) $episodeBox.html("");
}

function createEpisodeDiv(id) {
    return $(`<div id="${id}" class="episode grid sm:grid-cols-1 md:grid-cols-2 gap-10">`);
}

function createEpisodeSlide(ep, i) {
    return $(/*html*/
        `<div class="slide border rounded-xl">
            <img src="./imgs/ep${ep}/slide${i}.PNG" class="slide__img w-full h-auto"/>
        </div>`).on('click', fullScreen);
}

function addSlideToDOM(episode, ep) {
    $episodeBox.append(episode);
    nextEpisode(ep);
}

function changeEpisode(e, firstLoad = false, append = false) {
    initChangeEpisode(firstLoad, append);
    let ep = (e.target) ? e.target.id : e;
    let $episode = createEpisodeDiv(ep);

    if (epData[ep].slides === 3) $episode.addClass('odd');

    for (let i = 1; i <= epData[ep].slides; i++) {
        let $slide = createEpisodeSlide(ep, i);
        $episode.append($slide);
    }

    addSlideToDOM($episode, ep);
}

// * Init

init();